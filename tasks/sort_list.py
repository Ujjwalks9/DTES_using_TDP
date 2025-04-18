import socket
import json
import time
from multiprocessing import Process

WORKER_PORTS = [6001, 6002, 6003, 6004]
WORKER_HOST = 'localhost'

def split_list(data, parts):
    k = len(data) // parts
    return [data[i * k: (i + 1) * k if i != parts - 1 else len(data)] for i in range(parts)]

def run_sort_worker(port):
    """Worker handles one sorting task and then exits (frees port)."""
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)  # ✅ Allow port reuse
        s.bind((WORKER_HOST, port))
        s.listen()
        print(f"[Worker {port}] Ready to sort.")

        conn, addr = s.accept()
        with conn:
            print(f"[Worker {port}] Connected to master.")
            data = conn.recv(10**6).decode()
            numbers = json.loads(data)
            sorted_numbers = sorted(numbers)
            conn.sendall(json.dumps(sorted_numbers).encode())
        
        print(f"[Worker {port}] Task complete. Shutting down.")

def start_workers():
    processes = []
    for port in WORKER_PORTS:
        p = Process(target=run_sort_worker, args=(port,))
        p.start()
        processes.append(p)
    return processes

def send_to_worker(port, numbers):
    try:
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            s.connect((WORKER_HOST, port))
            s.sendall(json.dumps(numbers).encode())
            data = s.recv(10**6).decode()
            return json.loads(data)
    except Exception as e:
        print(f"[Master] Error on worker {port}: {e}")
        return []

def merge_sorted_lists(sorted_chunks):
    result = []
    pointers = [0] * len(sorted_chunks)

    while True:
        current_vals = []
        for i, chunk in enumerate(sorted_chunks):
            if pointers[i] < len(chunk):
                current_vals.append((chunk[pointers[i]], i))
        if not current_vals:
            break

        min_val, min_idx = min(current_vals)
        result.append(min_val)
        pointers[min_idx] += 1

    return result

def process_sorting(numbers):
    chunks = split_list(numbers, len(WORKER_PORTS))
    processes = start_workers()
    time.sleep(1)  # Give time for workers to start

    results = []
    for chunk, port in zip(chunks, WORKER_PORTS):
        result = send_to_worker(port, chunk)
        results.append(result)

    # ✅ Wait for all worker processes to complete and free ports
    for p in processes:
        p.join()

    final_sorted = merge_sorted_lists(results)
    return {
        "ascending": final_sorted,
        "descending": list(reversed(final_sorted))
    }
