import os
import sys
try:
    import pytesseract
    from PIL import Image
except ImportError:
    print("Required libraries not found. Installing...")
    os.system("pip3 install pytesseract pillow")
    import pytesseract
    from PIL import Image

def extract_text_from_image(image_path):
    """Extract text from an image using OCR."""
    try:
        print(f"Processing image: {image_path}")
        img = Image.open(image_path)
        text = pytesseract.image_to_string(img)
        return text
    except Exception as e:
        print(f"Error processing {image_path}: {str(e)}")
        return ""

def create_folders_from_categories(text, base_dir="."):
    """Create folders based on category names extracted from text."""
    # Split text into lines and filter out empty lines
    lines = [line.strip() for line in text.split('\n') if line.strip()]
    
    # Print all lines for debugging
    print("Extracted lines:")
    for line in lines:
        print(f"  - {line}")
    
    # Create folders
    folders_created = []
    for line in lines:
        # Skip lines that are likely not category names
        if len(line) < 3 or any(char in line for char in ".,:/\\"):
            continue
        
        folder_path = os.path.join(base_dir, line)
        try:
            if not os.path.exists(folder_path):
                os.makedirs(folder_path)
                print(f"Created folder: {folder_path}")
                folders_created.append(line)
            else:
                print(f"Folder already exists: {folder_path}")
                folders_created.append(line)
        except Exception as e:
            print(f"Error creating folder '{line}': {str(e)}")
    
    return folders_created

def main():
    # Paths to the category images
    category1_path = "./127.0.0.1_8081/Category 1.png"
    category2_path = "./127.0.0.1_8081/Category 2.png"
    
    # Check if tesseract is installed
    try:
        pytesseract.get_tesseract_version()
    except Exception as e:
        print("Error: Tesseract OCR is not installed or not in PATH.")
        print("Please install Tesseract OCR and make sure it's in your PATH.")
        print("On macOS, you can install it with: brew install tesseract")
        return
    
    # Extract text from Category 1 image
    print("\nProcessing Category 1 image...")
    category1_text = extract_text_from_image(category1_path)
    print("\nExtracted text from Category 1:")
    print(category1_text)
    
    # Extract text from Category 2 image
    print("\nProcessing Category 2 image...")
    category2_text = extract_text_from_image(category2_path)
    print("\nExtracted text from Category 2:")
    print(category2_text)
    
    # Create folders based on extracted categories
    print("\nCreating folders from Category 1...")
    folders1 = create_folders_from_categories(category1_text)
    
    print("\nCreating folders from Category 2...")
    folders2 = create_folders_from_categories(category2_text)
    
    # Summary
    all_folders = folders1 + folders2
    print(f"\nCreated {len(all_folders)} folders based on categories:")
    for folder in all_folders:
        print(f"  - {folder}")

if __name__ == "__main__":
    main()
