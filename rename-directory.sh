#!/bin/bash

# Get the current directory name
CURRENT_DIR=$(basename "$(pwd)")

# Check if the current directory is 127.0.0.1_8081
if [ "$CURRENT_DIR" = "127.0.0.1_8081" ]; then
    # Move up one directory
    cd ..
    
    # Rename the directory
    mv "127.0.0.1_8081" "MDTSTech.store"
    
    # Move back into the renamed directory
    cd "MDTSTech.store"
    
    echo "Directory successfully renamed from 127.0.0.1_8081 to MDTSTech.store"
else
    echo "Current directory is not 127.0.0.1_8081, it is $CURRENT_DIR"
fi
