from flask import Flask, request, jsonify
import socket
import threading
import json
import time
import sys
import logging
import requests

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

app = Flask(__name__)

# Configuration for the server
SERVER_ID = 1  # Default to server 1
SERVER_HOST = "0.0.0.0"  # Listen on all interfaces
SERVER_PORT = 5001  # Default port

# Worker server configuration
WORKER_SERVERS = [
    {"id": 2, "host": "localhost", "port": 5002},
    {"id": 3, "host": "localhost", "port": 5003},
    {"id": 4, "host": "localhost", "port": 5004},
    {"id": 5, "host": "localhost", "port": 5005}
]

def is_worker_server_running(server):
    """Check if a worker server is running"""
    try:
        response = requests.get(f"http://{server['host']}:{server['port']}/health", timeout=1)
        return response.status_code == 200
    except:
        return False

def get_active_workers():
    """Get a list of active worker servers"""
    active_workers = []
    for server in WORKER_SERVERS:
        if is_worker_server_running(server):
            active_workers.append(server)
            logger.info(f"Worker server {server['id']} is active")
        else:
            logger.info(f"Worker server {server['id']} is not responding")
    return active_workers

def send_sort_request(server, data):
    """Send a sorting request to a worker server"""
    try:
        logger.info(f"Sending chunk of {len(data)} items to worker {server['id']}")
        response = requests.post(
            f"http://{server['host']}:{server['port']}/sort",
            json={"data": data},
            timeout=10
        )
        if response.status_code == 200:
            result = response.json()
            logger.info(f"Received sorted chunk from worker {server['id']}")
            return result["sorted_data"]
        else:
            logger.error(f"Error from worker {server['id']}: {response.status_code}")
            # Fall back to local sorting
            return sorted(data)
    except Exception as e:
        logger.error(f"Exception when sending to worker {server['id']}: {str(e)}")
        # Fall back to local sorting
        return sorted(data)

def merge(left, right):
    """Merge two sorted arrays"""
    result = []
    i = j = 0
    
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            result.append(left[i])
            i += 1
        else:
            result.append(right[j])
            j += 1
    
    result.extend(left[i:])
    result.extend(right[j:])
    return result

def merge_sort(data):
    """Regular merge sort implementation for local sorting"""
    if len(data) <= 1:
        return data
    
    mid = len(data) // 2
    left = merge_sort(data[:mid])
    right = merge_sort(data[mid:])
    
    return merge(left, right)

def distributed_sort(data):
    """Sort the data by distributing it to worker servers"""
    active_workers = get_active_workers()
    
    if not active_workers:
        logger.warning("No active worker servers found. Sorting locally.")
        return merge_sort(data)
    
    # Determine chunk size
    num_workers = len(active_workers)
    chunk_size = len(data) // num_workers
    
    if chunk_size < 10:
        # If the chunks are too small, just sort locally
        logger.info("Data too small for distribution, sorting locally")
        return merge_sort(data)
    
    # Split data into chunks
    chunks = []
    for i in range(0, len(data), chunk_size):
        end = min(i + chunk_size, len(data))
        chunks.append(data[i:end])
    
    # Make sure we don't have more chunks than workers
    while len(chunks) > num_workers:
        chunks[-2].extend(chunks[-1])
        chunks.pop()
    
    logger.info(f"Distributing sort across {len(chunks)} worker servers")
    
    # Send each chunk to a worker and collect results
    sorted_chunks = []
    for i, chunk in enumerate(chunks):
        server = active_workers[i % len(active_workers)]
        sorted_chunk = send_sort_request(server, chunk)
        sorted_chunks.append(sorted_chunk)
    
    # Merge the sorted chunks
    result = sorted_chunks[0]
    for chunk in sorted_chunks[1:]:
        result = merge(result, chunk)
    
    return result

@app.route('/sort', methods=['POST'])
def sort_endpoint():
    """API endpoint to sort an array using distributed merge sort"""
    try:
        data = request.json.get('data', [])
        logger.info(f"Received sort request with {len(data)} items")
        
        if not isinstance(data, list):
            return jsonify({"error": "Invalid data format. Expected a list."}), 400
        
        start_time = time.time()
        
        # If the list is small, just sort locally
        if len(data) < 50:
            logger.info("Small list, sorting locally")
            sorted_data = merge_sort(data)
        else:
            logger.info("Using distributed sort")
            sorted_data = distributed_sort(data)
        
        end_time = time.time()
        
        logger.info(f"Sorting completed in {end_time - start_time:.4f} seconds")
        
        return jsonify({
            "sorted_data": sorted_data,
            "time_taken": end_time - start_time,
            "server_id": SERVER_ID,
            "distributed": len(data) >= 50
        })
    except Exception as e:
        logger.error(f"Error processing sort request: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    active_workers = [w["id"] for w in get_active_workers()]
    
    return jsonify({
        "status": "healthy",
        "server_id": SERVER_ID,
        "host": SERVER_HOST,
        "port": SERVER_PORT,
        "role": "coordinator",
        "active_workers": active_workers
    })

if __name__ == '__main__':
    # Set server ID if provided
    if len(sys.argv) > 1:
        try:
            SERVER_ID = int(sys.argv[1])
            SERVER_PORT = 5000 + SERVER_ID  # Server 1 -> 5001, Server 2 -> 5002, etc.
        except ValueError:
            logger.error("Server ID must be an integer")
            sys.exit(1)
    
    logger.info(f"Starting coordinator server {SERVER_ID} on {SERVER_HOST}:{SERVER_PORT}")
    
    try:
        # Run Flask app
        app.run(host=SERVER_HOST, port=SERVER_PORT, debug=False)
    except Exception as e:
        logger.error(f"Failed to start server: {str(e)}")
        sys.exit(1) 