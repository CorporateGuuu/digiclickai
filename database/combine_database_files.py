#!/usr/bin/env python3
"""
Script to combine database files from New Database and Product Database folders.
This script processes Excel files and CSV files, combines them, and creates a unified dataset.
"""

import os
import sys
import pandas as pd
import glob
import json
from datetime import datetime

# Define paths
NEW_DB_DIR = "New Database"
PRODUCT_DB_DIR = "Product Database"
OUTPUT_DIR = "database/data/combined"

# Create output directory if it doesn't exist
os.makedirs(OUTPUT_DIR, exist_ok=True)

def log_message(message):
    """Log a message with timestamp"""
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    print(f"[{timestamp}] {message}")

def process_excel_files(directory):
    """Process all Excel files in a directory and return a combined DataFrame"""
    log_message(f"Processing Excel files in {directory}...")
    
    # Get all Excel files
    excel_files = glob.glob(os.path.join(directory, "*.xlsx"))
    
    if not excel_files:
        log_message(f"No Excel files found in {directory}")
        return None
    
    # Initialize an empty list to store DataFrames
    dfs = []
    
    # Process each Excel file
    for file_path in excel_files:
        file_name = os.path.basename(file_path)
        log_message(f"Processing {file_name}...")
        
        try:
            # Read Excel file
            df = pd.read_excel(file_path)
            
            # Add source file information
            df['source_file'] = file_name
            
            # Append to list
            dfs.append(df)
            
            log_message(f"Successfully processed {file_name} with {len(df)} rows")
        except Exception as e:
            log_message(f"Error processing {file_name}: {str(e)}")
    
    # Combine all DataFrames
    if dfs:
        combined_df = pd.concat(dfs, ignore_index=True)
        log_message(f"Combined {len(dfs)} Excel files with a total of {len(combined_df)} rows")
        return combined_df
    else:
        log_message("No valid Excel files to combine")
        return None

def process_csv_files(directory):
    """Process all CSV files in a directory and return a combined DataFrame"""
    log_message(f"Processing CSV files in {directory}...")
    
    # Get all CSV files
    csv_files = glob.glob(os.path.join(directory, "*.csv"))
    
    if not csv_files:
        log_message(f"No CSV files found in {directory}")
        return None
    
    # Initialize an empty list to store DataFrames
    dfs = []
    
    # Process each CSV file
    for file_path in csv_files:
        file_name = os.path.basename(file_path)
        log_message(f"Processing {file_name}...")
        
        try:
            # Read CSV file
            df = pd.read_csv(file_path)
            
            # Add source file information
            df['source_file'] = file_name
            
            # Append to list
            dfs.append(df)
            
            log_message(f"Successfully processed {file_name} with {len(df)} rows")
        except Exception as e:
            log_message(f"Error processing {file_name}: {str(e)}")
    
    # Combine all DataFrames
    if dfs:
        combined_df = pd.concat(dfs, ignore_index=True)
        log_message(f"Combined {len(dfs)} CSV files with a total of {len(combined_df)} rows")
        return combined_df
    else:
        log_message("No valid CSV files to combine")
        return None

def normalize_column_names(df):
    """Normalize column names (lowercase, replace spaces with underscores)"""
    if df is None:
        return None
    
    df.columns = [col.lower().replace(' ', '_').replace('-', '_') for col in df.columns]
    return df

def main():
    """Main function to combine database files"""
    log_message("Starting database file combination process...")
    
    # Process New Database Excel files
    new_db_df = process_excel_files(NEW_DB_DIR)
    new_db_df = normalize_column_names(new_db_df)
    
    # Process Product Database Excel files
    product_db_excel_df = process_excel_files(PRODUCT_DB_DIR)
    product_db_excel_df = normalize_column_names(product_db_excel_df)
    
    # Process Product Database CSV files
    product_db_csv_df = process_csv_files(PRODUCT_DB_DIR)
    product_db_csv_df = normalize_column_names(product_db_csv_df)
    
    # Save combined files
    if new_db_df is not None:
        new_db_df.to_csv(os.path.join(OUTPUT_DIR, "new_database_combined.csv"), index=False)
        log_message(f"Saved combined New Database to {os.path.join(OUTPUT_DIR, 'new_database_combined.csv')}")
    
    if product_db_excel_df is not None:
        product_db_excel_df.to_csv(os.path.join(OUTPUT_DIR, "product_database_excel_combined.csv"), index=False)
        log_message(f"Saved combined Product Database Excel to {os.path.join(OUTPUT_DIR, 'product_database_excel_combined.csv')}")
    
    if product_db_csv_df is not None:
        product_db_csv_df.to_csv(os.path.join(OUTPUT_DIR, "product_database_csv_combined.csv"), index=False)
        log_message(f"Saved combined Product Database CSV to {os.path.join(OUTPUT_DIR, 'product_database_csv_combined.csv')}")
    
    # Create a unified dataset
    dfs_to_combine = []
    if new_db_df is not None:
        dfs_to_combine.append(new_db_df)
    if product_db_excel_df is not None:
        dfs_to_combine.append(product_db_excel_df)
    if product_db_csv_df is not None:
        dfs_to_combine.append(product_db_csv_df)
    
    if dfs_to_combine:
        # Find common columns
        common_columns = set(dfs_to_combine[0].columns)
        for df in dfs_to_combine[1:]:
            common_columns = common_columns.intersection(set(df.columns))
        
        # Filter DataFrames to only include common columns
        filtered_dfs = []
        for df in dfs_to_combine:
            filtered_dfs.append(df[list(common_columns)])
        
        # Combine filtered DataFrames
        unified_df = pd.concat(filtered_dfs, ignore_index=True)
        
        # Remove duplicates
        unified_df = unified_df.drop_duplicates()
        
        # Save unified dataset
        unified_df.to_csv(os.path.join(OUTPUT_DIR, "unified_database.csv"), index=False)
        log_message(f"Saved unified database to {os.path.join(OUTPUT_DIR, 'unified_database.csv')} with {len(unified_df)} rows")
        
        # Create metadata file
        metadata = {
            "created_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "total_records": len(unified_df),
            "common_columns": list(common_columns),
            "source_files": {
                "new_database": len(glob.glob(os.path.join(NEW_DB_DIR, "*.xlsx"))) if new_db_df is not None else 0,
                "product_database_excel": len(glob.glob(os.path.join(PRODUCT_DB_DIR, "*.xlsx"))) if product_db_excel_df is not None else 0,
                "product_database_csv": len(glob.glob(os.path.join(PRODUCT_DB_DIR, "*.csv"))) if product_db_csv_df is not None else 0
            }
        }
        
        with open(os.path.join(OUTPUT_DIR, "metadata.json"), "w") as f:
            json.dump(metadata, f, indent=2)
        
        log_message(f"Saved metadata to {os.path.join(OUTPUT_DIR, 'metadata.json')}")
    else:
        log_message("No data to combine")
    
    log_message("Database file combination process completed")

if __name__ == "__main__":
    main()
