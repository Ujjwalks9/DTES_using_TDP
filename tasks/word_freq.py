from multiprocessing import Process
from collections import Counter
import socket
import json
import time

WORKER_PORTS = [5001, 5002, 5003, 5004]
WORKER_HOST = 'localhost'

def split_text(text, n):
    words = text.split()
    k = len(words) // n
    return [' '.join(words[i * k: (i + 1) * k if i != n - 1 else len(words)]) for i in range(n)]

def run_worker(port):
    """Each worker runs once, processes one chunk, then exits."""
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)  # ✅ Reuse port if needed
        s.bind((WORKER_HOST, port))
        s.listen()
        print(f"[Word_Count Worker {port}] Ready for one task.")

        conn, addr = s.accept()
        with conn:
            print(f"[Word_Count Worker {port}] Connected to Master.")
            data = conn.recv(4096).decode()
            if not data:
                return
            words = data.lower().split()
            freq = dict(Counter(words))
            conn.sendall(json.dumps(freq).encode())

        print(f"[Word_Count Worker {port}] Task complete. Exiting.")

def start_workers():
    processes = []
    for port in WORKER_PORTS:
        p = Process(target=run_worker, args=(port,))
        p.start()
        processes.append(p)
    return processes

def send_to_worker(port, text):
    try:
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            s.connect((WORKER_HOST, port))
            s.sendall(text.encode())
            data = s.recv(4096).decode()
            return json.loads(data)
    except Exception as e:
        print(f"[Master] Error talking to worker {port}: {e}")
        return {}

def merge_frequencies(results):
    combined = {}
    for freq in results:
        for word, count in freq.items():
            combined[word] = combined.get(word, 0) + count
    return combined

def process_text_with_workers(text):
    parts = split_text(text, len(WORKER_PORTS))
    worker_processes = start_workers()
    time.sleep(1)  # Give workers a moment to boot up

    results = []
    for part, port in zip(parts, WORKER_PORTS):
        result = send_to_worker(port, part)
        results.append(result)

    # ✅ Wait for all workers to finish and free ports
    for p in worker_processes:
        p.join()

    final_freq = merge_frequencies(results)
    return dict(sorted(final_freq.items(), key=lambda item: item[1], reverse=True))
