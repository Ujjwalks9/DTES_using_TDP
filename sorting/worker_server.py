from flask import Flask, request, jsonify
import time
import sys
import logging

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
SERVER_ID = 2  # Default to worker server 2
SERVER_HOST = "0.0.0.0"  # Listen on all interfaces
SERVER_PORT = 5002  # Default port

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

@app.route('/sort', methods=['POST'])
def sort_endpoint():
    """API endpoint to sort an array using merge sort"""
    try:
        data = request.json.get('data', [])
        logger.info(f"Worker {SERVER_ID} received sort request with {len(data)} items")
        
        if not isinstance(data, list):
            return jsonify({"error": "Invalid data format. Expected a list."}), 400
        
        start_time = time.time()
        sorted_data = merge_sort(data)
        end_time = time.time()
        
        logger.info(f"Worker {SERVER_ID} completed sorting in {end_time - start_time:.4f} seconds")
        
        return jsonify({
            "sorted_data": sorted_data,
            "time_taken": end_time - start_time,
            "server_id": SERVER_ID
        })
    except Exception as e:
        logger.error(f"Error processing sort request: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "server_id": SERVER_ID,
        "host": SERVER_HOST,
        "port": SERVER_PORT,
        "role": "worker"
    })

if __name__ == '__main__':
    # Set server ID if provided
    if len(sys.argv) > 1:
        try:
            SERVER_ID = int(sys.argv[1])
            SERVER_PORT = 5000 + SERVER_ID  # Server 2 -> 5002, Server 3 -> 5003, etc.
        except ValueError:
            logger.error("Server ID must be an integer")
            sys.exit(1)
    
    logger.info(f"Starting worker server {SERVER_ID} on {SERVER_HOST}:{SERVER_PORT}")
    
    try:
        # Run Flask app
        app.run(host=SERVER_HOST, port=SERVER_PORT, debug=False)
    except Exception as e:
        logger.error(f"Failed to start server: {str(e)}")
        sys.exit(1) 