import socket
import json
from multiprocessing import Process
import numpy as np
from PIL import Image
import time
import os

WORKER_PORTS = [8001, 8002, 8003, 8004]
WORKER_HOST = "localhost"

def split_image_rows(img_array, parts):
    h = img_array.shape[0]
    step = h // parts
    return [img_array[i * step: (i + 1) * step if i != parts - 1 else h] for i in range(parts)]

def run_worker(port):
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        s.bind((WORKER_HOST, port))
        s.listen()
        print(f"[Worker {port}] Ready.")

        conn, _ = s.accept()
        with conn:
            print(f"[Worker {port}] Connected.")
            data = b''
            while True:
                chunk = conn.recv(4096)
                if not chunk:
                    break
                data += chunk

            flat = json.loads(data.decode())
            arr = np.array(flat["array"]).reshape(flat["shape"])

            gray = np.mean(arr, axis=2).astype(np.uint8)
            gray_rgb = np.stack((gray,) * 3, axis=-1)

            encoded = {
                "array": gray_rgb.tolist(),
                "shape": gray_rgb.shape
            }
            conn.sendall(json.dumps(encoded).encode())
        print(f"[Worker {port}] Exiting.")

def start_workers():
    processes = []
    for port in WORKER_PORTS:
        p = Process(target=run_worker, args=(port,))
        p.start()
        processes.append(p)
    return processes

def send_to_worker(port, chunk):
    try:
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            s.connect((WORKER_HOST, port))
            encoded = {
                "array": chunk.tolist(),
                "shape": chunk.shape
            }
            s.sendall(json.dumps(encoded).encode())

            data = b''
            while True:
                chunk = s.recv(4096)
                if not chunk:
                    break
                data += chunk

            flat = json.loads(data.decode())
            return np.array(flat["array"]).reshape(flat["shape"])
    except Exception as e:
        print(f"[Master] Error on worker {port}: {e}")
        return np.zeros_like(chunk)

def merge_chunks(chunks):
    return np.vstack(chunks)

def process_image(image_path):
    img = Image.open(image_path).convert("RGB")
    img_array = np.array(img)

    chunks = split_image_rows(img_array, len(WORKER_PORTS))
    workers = start_workers()
    time.sleep(1)  # Allow workers to start

    results = []
    for chunk, port in zip(chunks, WORKER_PORTS):
        results.append(send_to_worker(port, chunk))

    for p in workers:
        p.join()

    final_img = Image.fromarray(merge_chunks(results))
    output_path = "uploads/grayscale_output.png"
    final_img.save(output_path)
    return output_path