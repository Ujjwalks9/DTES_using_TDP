
# ⚡ ComputeX

**ComputeX** is a high-performance, distributed compute engine built to solve complex computational problems **fast**, **scalably**, and **modularly**. From matrix multiplication and large-scale sorting to word frequency analysis, image processing, and prime number operations — ComputeX distributes the workload across multiple worker nodes using **TCP sockets** and a **Flask-based API**, paired with a sleek **React frontend**.

---

## Key Features

- **High-Speed Problem Solving**  
  Parallelized execution of compute-heavy tasks using multiprocessing and distributed data splits.

- **Distributed Architecture**  
  Worker nodes run in parallel over TCP, ideal for handling large datasets and high throughput tasks.

- **Modular + Extensible Design**  
  Plug-and-play architecture to easily add new task modules (Fibonacci, AI inference, file compression, etc).

- **Fault Tolerance (Resilient by Design)**  
  Automatically detects and redistributes tasks if a worker crashes — no need for manual restarts.

- **Lightweight Deployment (No Broker)**  
  Zero-dependency communication between master and workers — no Kafka, RabbitMQ, or Celery required.

- **RESTful Flask API**  
  Clean, scalable REST endpoints for all task types — easily consumable by any client or frontend.

- **Responsive Web Interface (React)**  
  Interactive React frontend with task configuration, real-time output, file upload, and result visualization.

- **Market-Ready Architecture**  
  Designed to align with current tech trends like:
  - Distributed computing for edge/cloud tasks
  - AI/ML backend extensions
  - Serverless microservices
  - Scalable compute APIs (internal tooling, dev platforms, etc.)

---

✅ Ideal for:

- Data engineering experiments
- Educational visualization of distributed systems
- Cloud-native compute backend prototypes
- Real-time task execution tools
- Hackathons, college projects, and system design showcases

---

## **DEMO VIDEO**




https://github.com/user-attachments/assets/2991ad90-1bd2-4e8c-97c2-d817d9d5b198


## Technology Stack

- **Python 3.11+**
- **Flask (REST API)**
- **React.js (Frontend)**
- **TCP Sockets (Distributed Workers)**
- **Multiprocessing**
- **Pillow, pandas, numpy, python-docx** for task-specific processing

---

## Architecture Overview

```
               [ User Frontend (React) ]
                        │
                 [ Flask API Server ]
                        │
     ┌───────────┬───────────┬───────────┐
     │           │           │           │
 [Worker 1]  [Worker 2]  [Worker 3]  ... [Worker N]
     │           │           │           │
     -------------------------------------
                        ↓
             Aggregated Task Result
```

---

## Project Structure

```
ComputeX/
├── app.py
├── routes.py
├── uploads/
├── tasks/
│   ├── word_freq.py
│   ├── sort_list.py
│   ├── matrix_multiply.py
│   ├── image_grayscale.py
│   ├── factorial_distributed.py
│   ├── fibonacci_distributed.py
│   └── prime_distributed.py
├── utils/
├── frontend/
│   └── src/components/
├── requirements.txt
├── Dockerfile
├── docker-compose.yml
└── README.md
```

---

## Supported Tasks

| Task                  | Description                          | Input Format           |
|-----------------------|--------------------------------------|------------------------|
| Word Frequency        | Counts word occurrences              | .txt, .csv, .docx      |
| Sort List             | Sorts large numeric datasets         | .csv, .txt             |
| Matrix Multiplication | Multiplies two matrices              | JSON array             |
| Image Grayscale       | Converts image to grayscale          | .jpg, .png             |
| Factorial Generator   | Computes factorials                  | Integer input          |
| Fibonacci Generator   | Generates Fibonacci sequence         | Integer input          |
| Prime Checker         | Checks if a number is prime          | Integer input          |
| Prime Generator       | Generates primes ≤ N                 | Integer input          |

---

## Installation

### Backend Setup (Python + Flask)

```bash
git clone https://github.com/your-org/distributed-task-system.git
cd distributed-task-system

python3 -m venv .venv
source .venv/bin/activate

pip install -r requirements.txt
python app.py
```

### Frontend Setup (React)

```bash
cd frontend
npm install
npm run dev
```

---

## Running Workers

Each task file includes a worker that can be launched independently:

```bash
python -c "from tasks.sort_list import run_sort_worker; run_sort_worker(6001)"
```

Or run from a main block:

```python
if __name__ == "__main__":
    run_worker(6001)
```

---

## API Examples

### Matrix Multiplication

**POST** `/multiply`

```json
{
  "matrixA": [[1, 2], [3, 4]],
  "matrixB": [[5, 6], [7, 8]]
}
```

### Word Frequency

**POST** `/api/process`  
Upload file (`.txt`, `.docx`, or `.csv`) as `multipart/form-data` with key `file`.

---

## Docker Support

Build and run containers using Docker Compose:

```bash
docker-compose build
docker-compose up
```

---

## Adding a New Task

1. Create a new Python file under `tasks/`
2. Define `run_worker`, `send_to_worker`, and task-specific logic
3. Add an API route in `routes.py`
4. Update frontend if required

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Commit changes and push: `git push origin feat/your-feature`
4. Open a pull request for review

---

## License

MIT License  
© 2025 Ujjwal Kumar Singh and contributors

---
