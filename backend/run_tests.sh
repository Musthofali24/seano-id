#!/bin/bash

# Script untuk menjalankan tests
# Usage: ./run_tests.sh [test_file] [test_function]

set -e

echo "Setting up test environment..."

# Install test dependencies jika belum ada
echo "Installing test dependencies..."
pip install -r requirements-test.txt

# Set environment variables untuk testing
export TESTING=1
export PYTHONPATH="${PYTHONPATH}:$(pwd)"

echo "Running tests..."

if [ $# -eq 0 ]; then
    # Run all tests
    echo "Running all tests..."
    python -m pytest tests/ -v
elif [ $# -eq 1 ]; then
    # Run specific test file
    echo "Running tests in $1..."
    python -m pytest tests/$1 -v
elif [ $# -eq 2 ]; then
    # Run specific test function in specific file
    echo "Running $2 in $1..."
    python -m pytest tests/$1::$2 -v
else
    echo "Usage: $0 [test_file] [test_function]"
    echo "Examples:"
    echo "  $0                          # Run all tests"
    echo "  $0 test_vehicle.py          # Run all vehicle tests"
    echo "  $0 test_vehicle.py test_create_vehicle  # Run specific test"
    exit 1
fi

echo "Tests completed!"