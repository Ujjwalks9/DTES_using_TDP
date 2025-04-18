# from flask import Flask, request, jsonify
# from multiprocessing import Process
# from collections import Counter
# import socket
# import json
# import time

# app = Flask(__name__)


# WORKER_PORTS = [5001, 5002, 5003, 5004]
# WORKER_HOST = 'localhost'


# #worker part
# def run_worker(port):
#     with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
#         s.bind((WORKER_HOST, port))
#         s.listen()
#         print(f"[Worker {port}] Ready.")

#         conn, addr = s.accept()
#         with conn:
#             print(f"[Worker {port}] Connected to Master.")
#             data = conn.recv(4096).decode()
#             if not data:
#                 return

#             words = data.lower().split()
#             freq = dict(Counter(words))
#             response = json.dumps(freq)
#             conn.sendall(response.encode())


# #master part

# def split_text(text, n):
#     words = text.split()
#     k = len(words) // n
#     chunks = []
#     for i in range(n):
#         start = i * k
#         end = (i + 1) * k if i != n - 1 else len(words)
#         chunks.append(' '.join(words[start:end]))
#     return chunks


# def start_workers():
#     processes = []
#     for port in WORKER_PORTS:
#         p = Process(target=run_worker, args=(port,))
#         p.start()
#         processes.append(p)
#     return processes


# def send_to_worker(port, text):
#     try:
#         with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
#             s.connect((WORKER_HOST, port))
#             s.sendall(text.encode())
#             data = s.recv(4096).decode()
#             return json.loads(data)
#     except Exception as e:
#         print(f"[Master] Error talking to worker {port}: {e}")
#         return {}


# def merge_frequencies(results):
#     combined = {}
#     for freq in results:
#         for word, count in freq.items():
#             combined[word] = combined.get(word, 0) + count
#     return combined




# #routing 
# @app.route('/api/word_freq', methods=['POST'])
# def handle_submit():
#     content = request.get_json()
#     text = content.get('text', '')
#     if not text.strip():
#         return jsonify({"error": "Empty input"}), 400


#     parts = split_text(text, 4)


#     worker_processes = start_workers()
#     time.sleep(1)  

#     results = []
#     for part, port in zip(parts, WORKER_PORTS):
#         result = send_to_worker(port, part)
#         results.append(result)


#     final_freq = merge_frequencies(results)

#     for p in worker_processes:
#         p.join()

#     sorted_freq = dict(sorted(final_freq.items(), key=lambda item: item[1], reverse=True))
#     return jsonify({"word_frequencies": sorted_freq})



# if __name__ == '__main__':
#     app.run(port=5000)

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
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.bind((WORKER_HOST, port))
        s.listen()
        print(f"[Worker {port}] Ready.")

        conn, addr = s.accept()
        with conn:
            print(f"[Worker {port}] Connected to Master.")
            data = conn.recv(4096).decode()
            if not data:
                return
            words = data.lower().split()
            freq = dict(Counter(words))
            conn.sendall(json.dumps(freq).encode())

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
    time.sleep(1)  # Let workers boot

    results = []
    for part, port in zip(parts, WORKER_PORTS):
        result = send_to_worker(port, part)
        results.append(result)

    for p in worker_processes:
        p.join()

    final_freq = merge_frequencies(results)
    return dict(sorted(final_freq.items(), key=lambda item: item[1], reverse=True))
