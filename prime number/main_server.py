import socket
import json
import math
import time

WORKER_PORTS = [9001, 9002, 9003, 9004]

def send_subtask(port, subrange):
    try:
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            s.settimeout(3)  # timeout in case worker doesn't respond
            s.connect(('localhost', port))
            s.sendall(json.dumps(subrange).encode())
            data = s.recv(4096).decode()
            return json.loads(data)
    except Exception as e:
        return {
            "status": "error",
            "worker": f"worker_{port}",
            "message": str(e),
            "primes": [],
            "range": subrange
        }

def divide_range(start, end, n_parts):
    step = math.ceil((end - start + 1) / n_parts)
    subranges = []
    for i in range(n_parts):
        sub_start = start + i * step
        sub_end = min(sub_start + step - 1, end)
        subranges.append((sub_start, sub_end))
    return subranges

def divide_and_send(start, end):
    subranges = divide_range(start, end, len(WORKER_PORTS))
    all_primes = []
    failed_subranges = []
    worker_status = {}
    successful_workers = []

    print("🔄 Distributing initial subtasks...\n")

    # 1st pass: distribute subtasks to all workers
    for i, port in enumerate(WORKER_PORTS):
        sub_start, sub_end = subranges[i]
        subtask = {
            "task": "prime",
            "start": sub_start,
            "end": sub_end
        }

        print(f"Sending range {sub_start}-{sub_end} to worker on port {port}")
        response = send_subtask(port, subtask)

        if response["status"] == "success":
            all_primes.extend(response["primes"])
            worker_status[response["worker"]] = "done"
            successful_workers.append(port)
        else:
            print(f"⚠️ Worker on port {port} failed: {response['message']}")
            worker_status[response["worker"]] = f"failed"
            failed_subranges.append((sub_start, sub_end))

    # 2nd pass: redistribute failed ranges
    if failed_subranges and successful_workers:
        print("\n♻️ Redistributing failed ranges to working servers...\n")
        # Redistribute failed ranges among working workers
        redist_subtasks = []
        for sub_start, sub_end in failed_subranges:
            sub_divs = divide_range(sub_start, sub_end, len(successful_workers))
            redist_subtasks.extend(sub_divs)

        for i, (sub_start, sub_end) in enumerate(redist_subtasks):
            port = successful_workers[i % len(successful_workers)]
            subtask = {
                "task": "prime",
                "start": sub_start,
                "end": sub_end
            }

            print(f"Resending range {sub_start}-{sub_end} to worker on port {port}")
            response = send_subtask(port, subtask)

            if response["status"] == "success":
                all_primes.extend(response["primes"])
            else:
                print(f"❌ Failed again on port {port}: {response['message']}")

    return {
        "status": "success",
        "primes": sorted(all_primes),
        "workers": worker_status
    }

if __name__ == "__main__":
    START = 1
    END = 100

    final_result = divide_and_send(START, END)
    print("\n✅ Final Result:")
    print(json.dumps(final_result, indent=2))
