#!/usr/bin/env python3
"""
Script to convert Excel files to CSV format for database import.
This script processes Excel files from the New Database and Product Database folders,
converts them to CSV, and saves them in the database/data directory.
"""

import os
import sys
import pandas as pd
import glob
import re

# Define paths
NEW_DB_PATH = "New Database"
PRODUCT_DB_PATH = "Product Database"
OUTPUT_PATH = "database/data"

def sanitize_filename(filename):
    """Convert filename to a database-friendly format."""
    # Remove extension
    base = os.path.splitext(filename)[0]
    # Replace non-alphanumeric characters with underscores
    sanitized = re.sub(r'[^a-zA-Z0-9]', '_', base.lower())
    return sanitized

def convert_excel_to_csv(excel_path, output_dir):
    """Convert an Excel file to CSV format."""
    try:
        # Read the Excel file
        df = pd.read_excel(excel_path)
        
        # Create sanitized output filename
        filename = os.path.basename(excel_path)
        sanitized_name = sanitize_filename(filename)
        output_path = os.path.join(output_dir, f"{sanitized_name}.csv")
        
        # Save as CSV
        df.to_csv(output_path, index=False)
        print(f"Converted {filename} to {output_path}")
        return output_path
    except Exception as e:
        print(f"Error converting {excel_path}: {str(e)}")
        return None

def process_directory(directory_path, output_dir):
    """Process all Excel files in a directory."""
    # Ensure output directory exists
    os.makedirs(output_dir, exist_ok=True)
    
    # Find all Excel files
    excel_files = glob.glob(os.path.join(directory_path, "*.xlsx"))
    
    # Convert each file
    converted_files = []
    for excel_file in excel_files:
        output_path = convert_excel_to_csv(excel_file, output_dir)
        if output_path:
            converted_files.append(output_path)
    
    return converted_files

def main():
    """Main function to process Excel files."""
    print("Converting Excel files to CSV format...")
    
    # Process New Database folder
    print("\nProcessing New Database folder:")
    new_db_files = process_directory(NEW_DB_PATH, OUTPUT_PATH)
    
    # Process Product Database folder
    print("\nProcessing Product Database folder:")
    product_db_files = process_directory(PRODUCT_DB_PATH, OUTPUT_PATH)
    
    # Summary
    total_files = len(new_db_files) + len(product_db_files)
    print(f"\nConversion complete. Converted {total_files} files to CSV format.")
    print(f"CSV files are stored in: {OUTPUT_PATH}")

if __name__ == "__main__":
    main()
