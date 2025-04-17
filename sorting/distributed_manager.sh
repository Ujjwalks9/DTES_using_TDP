#!/bin/bash

# Script to manage the distributed sorting system

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

function start_coordinator() {
    echo -e "${YELLOW}Starting coordinator server...${NC}"
    
    # Check if the coordinator is already running
    if ps aux | grep -v grep | grep -q "python3 distributed_server.py 1"; then
        echo -e "${GREEN}Coordinator is already running!${NC}"
        return 0
    fi
    
    # Start the coordinator in the background
    nohup python3 distributed_server.py 1 > coordinator.log 2>&1 &
    coordinator_pid=$!
    
    # Save the PID
    echo "$coordinator_pid" > coordinator.pid
    
    echo -e "${GREEN}Coordinator started with PID $coordinator_pid${NC}"
    echo "Log file: coordinator.log"
    
    # Give it a moment to start up
    sleep 2
    
    # Check if it's actually running
    if ps -p $coordinator_pid > /dev/null; then
        echo -e "${GREEN}Coordinator is running!${NC}"
        return 0
    else
        echo -e "${RED}Failed to start coordinator. Check coordinator.log for details.${NC}"
        return 1
    fi
}

function start_worker() {
    worker_id=$1
    
    echo -e "${YELLOW}Starting worker server $worker_id...${NC}"
    
    # Check if the worker is already running
    if ps aux | grep -v grep | grep -q "python3 worker_server.py $worker_id"; then
        echo -e "${GREEN}Worker $worker_id is already running!${NC}"
        return 0
    fi
    
    # Start the worker in the background
    nohup python3 worker_server.py $worker_id > worker$worker_id.log 2>&1 &
    worker_pid=$!
    
    # Save the PID
    echo "$worker_pid" > worker$worker_id.pid
    
    echo -e "${GREEN}Worker $worker_id started with PID $worker_pid${NC}"
    echo "Log file: worker$worker_id.log"
    
    # Give it a moment to start up
    sleep 1
    
    # Check if it's actually running
    if ps -p $worker_pid > /dev/null; then
        echo -e "${GREEN}Worker $worker_id is running!${NC}"
        return 0
    else
        echo -e "${RED}Failed to start worker $worker_id. Check worker$worker_id.log for details.${NC}"
        return 1
    fi
}

function start_all() {
    echo -e "${YELLOW}Starting the entire distributed sorting system...${NC}"
    
    # Start coordinator
    start_coordinator
    
    # Start workers
    for worker_id in 2 3 4 5; do
        start_worker $worker_id
    done
    
    echo -e "${GREEN}All servers started. Use ./distributed_client.py to test the system.${NC}"
}

function stop_server() {
    server_type=$1
    server_id=$2
    pid_file=""
    
    if [ "$server_type" == "coordinator" ]; then
        pid_file="coordinator.pid"
        pattern="python3 distributed_server.py 1"
    else
        pid_file="worker$server_id.pid"
        pattern="python3 worker_server.py $server_id"
    fi
    
    echo -e "${YELLOW}Stopping $server_type $server_id...${NC}"
    
    # Check if PID file exists
    if [ -f "$pid_file" ]; then
        server_pid=$(cat "$pid_file")
        
        # Check if the process is running
        if ps -p $server_pid > /dev/null; then
            # Kill the process
            kill $server_pid
            echo -e "${GREEN}$server_type $server_id (PID $server_pid) stopped.${NC}"
            rm "$pid_file"
            return 0
        else
            echo -e "${YELLOW}$server_type $server_id (PID $server_pid) is not running.${NC}"
            rm "$pid_file"
            return 1
        fi
    else
        # Try to find the process by grep
        pid=$(ps aux | grep -v grep | grep "$pattern" | awk '{print $2}')
        
        if [ -n "$pid" ]; then
            kill $pid
            echo -e "${GREEN}$server_type $server_id (PID $pid) stopped.${NC}"
            return 0
        else
            echo -e "${YELLOW}$server_type $server_id is not running.${NC}"
            return 1
        fi
    fi
}

function stop_all() {
    echo -e "${YELLOW}Stopping the entire distributed sorting system...${NC}"
    
    # Stop coordinator
    stop_server "coordinator" 1
    
    # Stop workers
    for worker_id in 2 3 4 5; do
        stop_server "worker" $worker_id
    done
    
    echo -e "${GREEN}All servers stopped.${NC}"
}

function status() {
    echo -e "${YELLOW}Checking status of the distributed sorting system...${NC}"
    
    # Check coordinator status
    if ps aux | grep -v grep | grep -q "python3 distributed_server.py 1"; then
        coordinator_pid=$(ps aux | grep -v grep | grep "python3 distributed_server.py 1" | awk '{print $2}')
        echo -e "${GREEN}Coordinator is running with PID $coordinator_pid${NC}"
    else
        echo -e "${RED}Coordinator is not running${NC}"
    fi
    
    # Check workers status
    for worker_id in 2 3 4 5; do
        if ps aux | grep -v grep | grep -q "python3 worker_server.py $worker_id"; then
            worker_pid=$(ps aux | grep -v grep | grep "python3 worker_server.py $worker_id" | awk '{print $2}')
            echo -e "${GREEN}Worker $worker_id is running with PID $worker_pid${NC}"
        else
            echo -e "${RED}Worker $worker_id is not running${NC}"
        fi
    done
    
    # Test coordinator's health endpoint to get active workers
    if ps aux | grep -v grep | grep -q "python3 distributed_server.py 1"; then
        echo -e "\n${YELLOW}Testing coordinator health...${NC}"
        curl -s http://localhost:5001/health | python3 -m json.tool
    fi
}

function test_system() {
    echo -e "${YELLOW}Testing the distributed sorting system...${NC}"
    
    # Generate a test list
    test_list=$(python3 -c "import random; print(' '.join(str(random.randint(1, 1000)) for _ in range(100)))")
    
    echo "Test list with 100 random numbers generated"
    echo -e "${YELLOW}Sending test list to coordinator...${NC}"
    
    # Send the list to the coordinator
    curl -s -X POST -H "Content-Type: application/json" -d "{\"data\": [$test_list]}" http://localhost:5001/sort | python3 -m json.tool
}

# Check command line arguments
if [ $# -lt 1 ]; then
    echo -e "${YELLOW}Usage: $0 {start|stop|restart|status|test}${NC}"
    echo "  start   - Start the entire system or a specific server"
    echo "  stop    - Stop the entire system or a specific server"
    echo "  restart - Restart the entire system or a specific server"
    echo "  status  - Check the status of all servers"
    echo "  test    - Test the distributed sorting system"
    echo ""
    echo "Additional commands:"
    echo "  $0 start coordinator - Start the coordinator server"
    echo "  $0 start worker N    - Start worker server N (2-5)"
    echo "  $0 stop coordinator  - Stop the coordinator server"
    echo "  $0 stop worker N     - Stop worker server N (2-5)"
    exit 1
fi

command="$1"

case "$command" in
    start)
        if [ $# -eq 1 ]; then
            start_all
        elif [ $# -eq 2 ] && [ "$2" == "coordinator" ]; then
            start_coordinator
        elif [ $# -eq 3 ] && [ "$2" == "worker" ]; then
            start_worker $3
        else
            echo -e "${RED}Invalid arguments for start command${NC}"
            exit 1
        fi
        ;;
    stop)
        if [ $# -eq 1 ]; then
            stop_all
        elif [ $# -eq 2 ] && [ "$2" == "coordinator" ]; then
            stop_server "coordinator" 1
        elif [ $# -eq 3 ] && [ "$2" == "worker" ]; then
            stop_server "worker" $3
        else
            echo -e "${RED}Invalid arguments for stop command${NC}"
            exit 1
        fi
        ;;
    restart)
        if [ $# -eq 1 ]; then
            stop_all
            sleep 2
            start_all
        elif [ $# -eq 2 ] && [ "$2" == "coordinator" ]; then
            stop_server "coordinator" 1
            sleep 2
            start_coordinator
        elif [ $# -eq 3 ] && [ "$2" == "worker" ]; then
            stop_server "worker" $3
            sleep 2
            start_worker $3
        else
            echo -e "${RED}Invalid arguments for restart command${NC}"
            exit 1
        fi
        ;;
    status)
        status
        ;;
    test)
        test_system
        ;;
    *)
        echo -e "${RED}Unknown command: $command${NC}"
        echo -e "${YELLOW}Usage: $0 {start|stop|restart|status|test}${NC}"
        exit 1
        ;;
esac

exit 0 