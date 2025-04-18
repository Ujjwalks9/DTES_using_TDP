import socket
import time
from multiprocessing import Process
import math

WORKER_PORTS = [9001, 9002, 9003, 9004]
WORKER_HOST = 'localhost'

# Use math.prod for faster factorial multiplication

def chunk_range(n, workers):
    chunk_size = n // workers
    ranges = []
    for i in range(workers):
        start = i * chunk_size + 1
        end = (i + 1) * chunk_size if i != workers - 1 else n
        ranges.append((start, end))
    return ranges

def factorial_range(start, end):
    return math.prod(range(start, end + 1))

def run_factorial_worker(port):
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        s.bind((WORKER_HOST, port))
        s.listen()
        print(f"[Factorial Worker {port}] Ready.")

        conn, _ = s.accept()
        with conn:
            print(f"[Factorial Worker {port}] Connected.")
            data = conn.recv(1024).decode()
            start, end = map(int, data.split(","))
            partial_result = factorial_range(start, end)
            conn.sendall(str(partial_result).encode())
        print(f"[Factorial Worker {port}] Done.")

def start_workers():
    processes = []
    for port in WORKER_PORTS:
        p = Process(target=run_factorial_worker, args=(port,))
        p.start()
        processes.append(p)
    return processes

def send_to_worker(port, start, end):
    try:
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            s.connect((WORKER_HOST, port))
            s.sendall(f"{start},{end}".encode())
            data = s.recv(4096).decode()
            return int(data)
    except Exception as e:
        print(f"[Master] Error on worker {port}: {e}")
        return 1

def process_factorial(n):
    ranges = chunk_range(n, len(WORKER_PORTS))
    workers = start_workers()
    time.sleep(0.5)  # Slightly reduce wait

    partials = []
    for (start, end), port in zip(ranges, WORKER_PORTS):
        partials.append(send_to_worker(port, start, end))

    for p in workers:
        p.join()

    result = math.prod(partials)
    return str(result)