import os
import sys
try:
    from PIL import Image
    import pytesseract
except ImportError:
    print("Required libraries not found. Installing...")
    os.system("pip3 install pillow pytesseract")
    try:
        from PIL import Image
        import pytesseract
    except ImportError:
        print("Failed to import required libraries even after installation.")
        print("Please install Tesseract OCR and the Python libraries manually:")
        print("1. Install Tesseract OCR: brew install tesseract")
        print("2. Install Python libraries: pip3 install pillow pytesseract")
        sys.exit(1)

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

def create_folders_from_text(text):
    """Create folders based on text extracted from the image."""
    # Split text into lines and filter out empty lines
    lines = [line.strip() for line in text.split('\n') if line.strip()]
    
    print("Extracted lines:")
    for line in lines:
        print(f"  - {line}")
    
    # Create folders
    folders_created = []
    for line in lines:
        # Skip lines that are likely not folder names
        if len(line) < 2 or any(char in line for char in ".,:/\\"):
            continue
        
        # Clean up the folder name
        folder_name = line.strip()
        
        try:
            if not os.path.exists(folder_name):
                os.makedirs(folder_name)
                print(f"Created folder: {folder_name}")
                folders_created.append(folder_name)
            else:
                print(f"Folder already exists: {folder_name}")
                folders_created.append(folder_name)
        except Exception as e:
            print(f"Error creating folder '{folder_name}': {str(e)}")
    
    return folders_created

def main():
    # Path to the G8X image
    image_path = "./127.0.0.1_8081/G8X.png"
    
    # Check if tesseract is installed
    try:
        pytesseract.get_tesseract_version()
        print("Tesseract OCR is installed.")
    except Exception as e:
        print("Error: Tesseract OCR is not installed or not in PATH.")
        print("Please install Tesseract OCR and make sure it's in your PATH.")
        print("On macOS, you can install it with: brew install tesseract")
        return
    
    # Extract text from the image
    print("\nExtracting text from image...")
    text = extract_text_from_image(image_path)
    
    if not text:
        print("No text was extracted from the image.")
        return
    
    print("\nExtracted text:")
    print(text)
    
    # Create folders based on extracted text
    print("\nCreating folders...")
    folders = create_folders_from_text(text)
    
    # Summary
    print(f"\nCreated {len(folders)} folders based on the image:")
    for folder in folders:
        print(f"  - {folder}")

if __name__ == "__main__":
    main()
