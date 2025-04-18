import socket
import time
from multiprocessing import Process

WORKER_PORTS = [9101, 9102, 9103, 9104]
WORKER_HOST = 'localhost'

def chunk_range(n, parts):
    chunk_size = n // parts
    return [(i * chunk_size + 1, (i + 1) * chunk_size if i != parts - 1 else n) for i in range(parts)]

def fibonacci_range(start, end):
    fibs = [0, 1]
    for i in range(2, end + 1):
        fibs.append(fibs[-1] + fibs[-2])
    return fibs[start:end+1] if start > 0 else fibs[:end+1]

def run_fibonacci_worker(port):
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        s.bind((WORKER_HOST, port))
        s.listen()
        print(f"[Fibonacci Worker {port}] Ready.")

        conn, _ = s.accept()
        with conn:
            print(f"[Fibonacci Worker {port}] Connected.")
            data = conn.recv(1024).decode()
            start, end = map(int, data.split(","))
            series = fibonacci_range(start, end)
            conn.sendall(",".join(map(str, series)).encode())
        print(f"[Fibonacci Worker {port}] Done.")

def start_workers():
    processes = []
    for port in WORKER_PORTS:
        p = Process(target=run_fibonacci_worker, args=(port,))
        p.start()
        processes.append(p)
    return processes

def send_to_worker(port, start, end):
    try:
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            s.connect((WORKER_HOST, port))
            s.sendall(f"{start},{end}".encode())
            data = s.recv(4096).decode()
            return list(map(int, data.split(",")))
    except Exception as e:
        print(f"[Master] Error on worker {port}: {e}")
        return []

def process_fibonacci(n):
    ranges = chunk_range(n, len(WORKER_PORTS))
    workers = start_workers()
    time.sleep(0.5)

    result = []
    for (start, end), port in zip(ranges, WORKER_PORTS):
        result.extend(send_to_worker(port, start, end))

    for p in workers:
        p.join()

    return result