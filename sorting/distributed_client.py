#!/usr/bin/env python3

import requests
import time
import json
import sys
import random
from typing import List, Dict

def generate_random_list(size: int, min_val: int = 1, max_val: int = 1000) -> List[int]:
    """Generate a random list of integers"""
    return [random.randint(min_val, max_val) for _ in range(size)]

def sort_list(numbers: List[int], coordinator_url: str = "http://localhost:5001") -> Dict:
    """Send a list to the coordinator for distributed sorting"""
    print(f"\nSending list with {len(numbers)} items to the coordinator...")
    
    start_time = time.time()
    try:
        response = requests.post(f"{coordinator_url}/sort", json={"data": numbers}, timeout=30)
        end_time = time.time()
        
        if response.status_code == 200:
            result = response.json()
            sorted_data = result["sorted_data"]
            server_time = result.get("time_taken", "N/A")
            server_id = result.get("server_id", "N/A")
            distributed = result.get("distributed", False)
            
            print("\nResult:")
            if distributed:
                print("List was distributed across multiple servers for sorting")
            else:
                print("List was sorted locally on the coordinator")
                
            print(f"Time taken by server: {server_time:.6f} seconds")
            print(f"Total time (including network): {end_time - start_time:.6f} seconds")
            
            # Verify the list is sorted
            is_sorted = all(sorted_data[i] <= sorted_data[i+1] for i in range(len(sorted_data)-1))
            print(f"Correctly sorted: {is_sorted}")
            
            # Print the sorted list
            print(f"Sorted list: {sorted_data}")
            
            return result
        else:
            print(f"Error from server: {response.status_code} - {response.text}")
            return {"error": response.text}
    except Exception as e:
        print(f"Error connecting to coordinator: {e}")
        print("Make sure the coordinator is running with './distributed_manager.sh start coordinator'")
        return {"error": str(e)}

def get_user_input() -> List[int]:
    """Get a list of numbers from the user"""
    while True:
        try:
            input_str = input("\nEnter numbers separated by spaces (or 'q' to quit): ")
            
            if input_str.lower() == 'q':
                return None
                
            # Parse the input string to get a list of integers
            numbers = [int(x) for x in input_str.split()]
            return numbers
        except ValueError:
            print("Invalid input. Please enter numbers separated by spaces.")

def check_system_status(coordinator_url: str = "http://localhost:5001") -> bool:
    """Check if the coordinator is running and get system status"""
    try:
        response = requests.get(f"{coordinator_url}/health", timeout=2)
        if response.status_code == 200:
            status = response.json()
            print("\nSystem Status:")
            print(f"Coordinator is running on server {status['server_id']}")
            
            active_workers = status.get("active_workers", [])
            if active_workers:
                print(f"Active worker servers: {', '.join(map(str, active_workers))}")
            else:
                print("No active worker servers found!")
                print("Start workers with './distributed_manager.sh start worker <id>'")
            
            return True
        else:
            print(f"Coordinator returned status code {response.status_code}")
            return False
    except Exception as e:
        print(f"Cannot connect to coordinator: {e}")
        print("Make sure the coordinator is running with './distributed_manager.sh start coordinator'")
        return False

if __name__ == "__main__":
    print("Distributed Merge Sort Client")
    print("=============================")
    print("This client connects to the distributed merge sort system")
    print("Make sure the servers are running with './distributed_manager.sh start'")
    
    coordinator_url = "http://localhost:5001"
    
    # Check system status
    check_system_status(coordinator_url)
    
    # Process command-line arguments
    if len(sys.argv) > 1:
        # Check if the first argument is "random" for generating random lists
        if sys.argv[1].lower() == "random" and len(sys.argv) > 2:
            try:
                size = int(sys.argv[2])
                min_val = int(sys.argv[3]) if len(sys.argv) > 3 else 1
                max_val = int(sys.argv[4]) if len(sys.argv) > 4 else 1000
                
                print(f"\nGenerating random list of {size} numbers between {min_val} and {max_val}...")
                numbers = generate_random_list(size, min_val, max_val)
                sort_list(numbers, coordinator_url)
                sys.exit(0)
            except ValueError:
                print("Invalid arguments for random list generation")
                print("Usage: ./distributed_client.py random <size> [min_val] [max_val]")
                sys.exit(1)
        # Otherwise, treat all arguments as numbers to sort
        else:
            try:
                numbers = [int(arg) for arg in sys.argv[1:]]
                print(f"\nSorting list: {numbers}")
                sort_list(numbers, coordinator_url)
                sys.exit(0)
            except ValueError:
                print("Invalid arguments. Please provide numbers to sort or use 'random'")
                print("Usage: ./distributed_client.py 9 8 7 6 5 ...")
                print("   or: ./distributed_client.py random <size> [min_val] [max_val]")
                sys.exit(1)
    
    # Interactive mode
    while True:
        # Check if user wants to use a random list
        random_choice = input("\nGenerate a random list? (y/n/q to quit): ").lower()
        
        if random_choice == 'q':
            print("\nGoodbye!")
            break
            
        if random_choice == 'y':
            try:
                size = int(input("Enter list size: "))
                min_val = int(input("Enter minimum value (default 1): ") or "1")
                max_val = int(input("Enter maximum value (default 1000): ") or "1000")
                
                numbers = generate_random_list(size, min_val, max_val)
            except ValueError:
                print("Invalid input. Using default values.")
                numbers = generate_random_list(100, 1, 1000)
        else:
            # Get list from user input
            numbers = get_user_input()
            
        if numbers is None:
            print("\nGoodbye!")
            break
            
        if not numbers:
            print("Empty list provided. Please enter some numbers.")
            continue
            
        # Send list for sorting
        sort_list(numbers, coordinator_url)
        
        # Check if user wants to continue
        cont = input("\nDo you want to sort another list? (y/n): ").lower()
        if cont != 'y':
            print("\nGoodbye!")
            break 