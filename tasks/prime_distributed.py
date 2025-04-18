import socket
import time
from multiprocessing import Process

WORKER_PORTS = [9201, 9202, 9203, 9204]
WORKER_HOST = 'localhost'

def chunk_range(n, parts):
    chunk_size = n // parts
    return [(i * chunk_size + 1, (i + 1) * chunk_size if i != parts - 1 else n) for i in range(parts)]

def is_prime(n):
    if n <= 1:
        return False
    if n <= 3:
        return True
    if n % 2 == 0 or n % 3 == 0:
        return False
    i = 5
    while i * i <= n:
        if n % i == 0 or n % (i + 2) == 0:
            return False
        i += 6
    return True

def generate_primes(start, end):
    return [i for i in range(start, end + 1) if is_prime(i)]

def run_prime_worker(port):
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        s.bind((WORKER_HOST, port))
        s.listen()
        print(f"[Prime Worker {port}] Ready.")

        conn, _ = s.accept()
        with conn:
            print(f"[Prime Worker {port}] Connected.")
            data = conn.recv(1024).decode()
            start, end = map(int, data.split(","))
            primes = generate_primes(start, end)
            conn.sendall(",".join(map(str, primes)).encode())
        print(f"[Prime Worker {port}] Done.")

def start_workers():
    processes = []
    for port in WORKER_PORTS:
        p = Process(target=run_prime_worker, args=(port,))
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

def process_prime_generation(limit):
    ranges = chunk_range(limit, len(WORKER_PORTS))
    workers = start_workers()
    time.sleep(0.5)

    result = []
    for (start, end), port in zip(ranges, WORKER_PORTS):
        result.extend(send_to_worker(port, start, end))

    for p in workers:
        p.join()

    return sorted(result)

def process_prime_check(n):
    return is_prime(n)
