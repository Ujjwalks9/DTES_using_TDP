import socket
import json
import time
from multiprocessing import Process
import numpy as np

WORKER_PORTS = [7001, 7002, 7003, 7004]
WORKER_HOST = "localhost"

def run_matrix_worker(port):
    """Worker handles one matrix multiplication chunk and exits (frees port)."""
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)  # ✅ Allow port reuse
        s.bind((WORKER_HOST, port))
        s.listen()
        print(f"[Matrix Worker {port}] Listening...")

        conn, _ = s.accept()
        with conn:
            print(f"[Matrix Worker {port}] Connected to master.")
            data = conn.recv(10**6).decode()
            payload = json.loads(data)
            a_chunk = np.array(payload['matrix_chunk'])
            b = np.array(payload['matrix_b'])

            result_chunk = a_chunk @ b
            conn.sendall(json.dumps(result_chunk.tolist()).encode())

        print(f"[Matrix Worker {port}] Task complete. Exiting.")

def start_workers():
    processes = []
    for port in WORKER_PORTS:
        p = Process(target=run_matrix_worker, args=(port,))
        p.start()
        processes.append(p)
    return processes

def send_to_worker(port, chunk, matrix_b):
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.connect((WORKER_HOST, port))
        payload = {"matrix_chunk": chunk, "matrix_b": matrix_b}
        s.sendall(json.dumps(payload).encode())
        result = s.recv(10**6).decode()
        return json.loads(result)

def split_matrix(matrix, parts):
    k = len(matrix) // parts
    return [matrix[i * k:(i + 1) * k if i != parts - 1 else len(matrix)] for i in range(parts)]

def multiply_distributed(matrix_a, matrix_b):
    matrix_a = np.array(matrix_a)
    matrix_b = np.array(matrix_b)

    chunks = split_matrix(matrix_a.tolist(), len(WORKER_PORTS))
    workers = start_workers()
    time.sleep(1)  # Let workers boot up

    results = []
    for chunk, port in zip(chunks, WORKER_PORTS):
        result = send_to_worker(port, chunk, matrix_b.tolist())
        results.append(result)

    for p in workers:
        p.join()  # ✅ Ensure cleanup

    return sum(results, [])  # Merged matrix rows
