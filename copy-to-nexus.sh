#!/bin/bash

# Define source and destination directories
SOURCE_DIR="$(pwd)"
DEST_DIR="$HOME/Desktop/Nexus Tech Hub"

# Check if destination directory exists
if [ ! -d "$DEST_DIR" ]; then
    echo "Error: Destination directory '$DEST_DIR' does not exist."
    exit 1
fi

# Create a timestamp for the backup
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="$DEST_DIR/mdtstech-store_$TIMESTAMP"

# Create the backup directory
mkdir -p "$BACKUP_DIR"

# Copy all files and directories, excluding node_modules, .git, and .next
echo "Copying files from $SOURCE_DIR to $BACKUP_DIR..."
rsync -av --progress "$SOURCE_DIR/" "$BACKUP_DIR/" \
    --exclude node_modules \
    --exclude .git \
    --exclude .next \
    --exclude .netlify

echo "Copy completed to $BACKUP_DIR"
