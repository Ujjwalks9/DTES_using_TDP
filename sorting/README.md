# Distributed Merge Sort System

This project implements a distributed merge sort algorithm using multiple servers. One server acts as a coordinator that distributes sorting tasks to worker servers, then merges the results.

## System Architecture

- **Coordinator Server**: Receives sort requests, divides the list into chunks, distributes to workers, and merges results
- **Worker Servers**: Each worker receives a chunk of the list, sorts it, and returns the sorted result
- **Mesh Network**: All servers communicate directly with each other

## Setup

1. Install required dependencies:
   ```
   pip3 install -r requirements.txt
   ```

2. Make sure all scripts are executable:
   ```
   chmod +x distributed_manager.sh distributed_client.py
   ```

## Running the System

### Starting the Servers

The easiest way to start the entire system:

```bash
./distributed_manager.sh start
```

This will start one coordinator server (on port 5001) and four worker servers (on ports 5002-5005).

You can also start individual components:

```bash
# Start just the coordinator
./distributed_manager.sh start coordinator

# Start a specific worker
./distributed_manager.sh start worker 2  # Start worker 2 (on port 5002)
```

### Checking Status

To see which servers are running:

```bash
./distributed_manager.sh status
```

## Sorting Lists

### Running the Client

There are three ways to use the distributed sorting system:

1. **Interactive Mode**:
   ```bash
   ./distributed_client.py
   ```
   This starts an interactive session where you can:
   - Generate random lists of your chosen size
   - Enter lists manually

2. **Sorting Specific Numbers**:
   ```bash
   ./distributed_client.py 9 8 7 6 5 4 3 2 1
   ```
   Directly provide the numbers you want to sort as command-line arguments.

3. **Random List Generation**:
   ```bash
   ./distributed_client.py random 1000
   ```
   Generate and sort a random list of 1000 numbers.

   You can also specify the range:
   ```bash
   ./distributed_client.py random 500 1 100
   ```
   This generates 500 random numbers between 1 and 100.

### Understanding the Output

The client will show:
- Whether your list was sorted locally or distributed across servers
- The time taken for sorting
- The total time including network communication
- The sorted list

For large lists (>=50 items), the system will automatically distribute the sorting task across available worker servers, providing better performance.

### Testing the System

You can quickly test if the system is working:

```bash
./distributed_manager.sh test
```

### Stopping the System

To stop all servers:

```bash
./distributed_manager.sh stop
```

Or stop individual components:

```bash
# Stop just the coordinator
./distributed_manager.sh stop coordinator

# Stop a specific worker
./distributed_manager.sh stop worker 2
```

## How It Works

1. When a sort request is received:
   - For small lists (<50 items), the coordinator sorts locally
   - For larger lists, the coordinator checks for available worker servers

2. Distribution Process:
   - The list is divided into chunks based on the number of available workers
   - Each chunk is sent to a worker server for sorting
   - If a worker is unavailable, the chunk is sorted locally
   - All sorted chunks are merged back together

3. Fault Tolerance:
   - If no workers are available, sorting happens locally
   - If a worker fails during sorting, its chunk is sorted locally as fallback

## Optimizing Performance

For best performance:
- Start all 5 servers (1 coordinator + 4 workers)
- Use lists of at least several hundred items to benefit from parallelization
- The system automatically determines when distribution is beneficial

## Troubleshooting

If you're having issues:

1. Check if servers are running:
   ```bash
   ./distributed_manager.sh status
   ```

2. If servers are already running but unresponsive, restart them:
   ```bash
   ./distributed_manager.sh restart
   ```

3. Look at the logs for detailed error information:
   ```bash
   cat coordinator.log  # For coordinator errors
   cat worker2.log      # For worker errors
   ``` 