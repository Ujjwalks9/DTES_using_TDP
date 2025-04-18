import socket
import sys
import json

def is_prime(n):
    if n < 2:
        return False
    if n in (2, 3):
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
    return [num for num in range(start, end + 1) if is_prime(num)]

def start_worker(port):
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.bind(('localhost', port))
        s.listen(1)
        print(f"Worker listening on port {port}...")

        while True:
            conn, addr = s.accept()
            with conn:
                data = conn.recv(1024).decode()
                task = json.loads(data)
                start = task["start"]
                end = task["end"]

                primes = generate_primes(start, end)
                result = {
                    "status": "success",
                    "worker": f"worker_{port}",
                    "primes": primes
                }
                conn.sendall(json.dumps(result).encode())

if __name__ == "__main__":
    port = int(sys.argv[1])
    start_worker(port)
