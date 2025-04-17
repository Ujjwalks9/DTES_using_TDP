#!/bin/bash

# Script to manage the sort server

function start_server() {
    server_id="${1:-1}"  # Default to server 1 if not specified
    
    echo "Starting sort server $server_id..."
    
    # Check if the server is already running
    if ps aux | grep -v grep | grep -q "python3 run_server.py $server_id"; then
        echo "Server $server_id is already running!"
        return 0
    fi
    
    # Start the server in the background
    nohup python3 run_server.py "$server_id" > "server$server_id.log" 2>&1 &
    server_pid=$!
    
    # Save the PID
    echo "$server_pid" > "server$server_id.pid"
    
    echo "Server $server_id started with PID $server_pid"
    echo "Log file: server$server_id.log"
    
    # Give it a moment to start up
    sleep 2
    
    # Check if it's actually running
    if ps -p $server_pid > /dev/null; then
        echo "Server $server_id is running!"
        return 0
    else
        echo "Failed to start server $server_id. Check server$server_id.log for details."
        return 1
    fi
}

function stop_server() {
    server_id="${1:-1}"  # Default to server 1 if not specified
    
    echo "Stopping sort server $server_id..."
    
    # Check if PID file exists
    if [ -f "server$server_id.pid" ]; then
        server_pid=$(cat "server$server_id.pid")
        
        # Check if the process is running
        if ps -p $server_pid > /dev/null; then
            # Kill the process
            kill $server_pid
            echo "Server $server_id (PID $server_pid) stopped."
            rm "server$server_id.pid"
            return 0
        else
            echo "Server $server_id (PID $server_pid) is not running."
            rm "server$server_id.pid"
            return 1
        fi
    else
        # Try to find the process by grep
        pid=$(ps aux | grep -v grep | grep "python3 run_server.py $server_id" | awk '{print $2}')
        
        if [ -n "$pid" ]; then
            kill $pid
            echo "Server $server_id (PID $pid) stopped."
            return 0
        else
            echo "Server $server_id is not running."
            return 1
        fi
    fi
}

function status() {
    server_id="${1:-1}"  # Default to server 1 if not specified
    
    echo "Checking status of sort server $server_id..."
    
    # Check if PID file exists
    if [ -f "server$server_id.pid" ]; then
        server_pid=$(cat "server$server_id.pid")
        
        # Check if the process is running
        if ps -p $server_pid > /dev/null; then
            echo "Server $server_id is running with PID $server_pid"
            return 0
        else
            echo "Server $server_id is not running (stale PID file found)"
            return 1
        fi
    else
        # Try to find the process by grep
        pid=$(ps aux | grep -v grep | grep "python3 run_server.py $server_id" | awk '{print $2}')
        
        if [ -n "$pid" ]; then
            echo "Server $server_id is running with PID $pid"
            return 0
        else
            echo "Server $server_id is not running."
            return 1
        fi
    fi
}

function test_server() {
    server_id="${1:-1}"  # Default to server 1 if not specified
    
    echo "Testing sort server $server_id..."
    
    # Run the test client
    python3 test_client.py $server_id
}

# Check command line arguments
if [ $# -lt 1 ]; then
    echo "Usage: $0 {start|stop|restart|status|test} [server_id]"
    exit 1
fi

command="$1"
server_id="${2:-1}"  # Default to server 1 if not specified

case "$command" in
    start)
        start_server "$server_id"
        ;;
    stop)
        stop_server "$server_id"
        ;;
    restart)
        stop_server "$server_id"
        sleep 1
        start_server "$server_id"
        ;;
    status)
        status "$server_id"
        ;;
    test)
        test_server "$server_id"
        ;;
    *)
        echo "Unknown command: $command"
        echo "Usage: $0 {start|stop|restart|status|test} [server_id]"
        exit 1
        ;;
esac

exit 0 