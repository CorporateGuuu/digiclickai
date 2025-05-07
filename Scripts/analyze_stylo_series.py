from PIL import Image
import os
import sys

def analyze_image(image_path):
    """Analyze the image and print basic information."""
    try:
        # Open the image
        img = Image.open(image_path)
        
        # Get basic information
        print(f"Image: {os.path.basename(image_path)}")
        print(f"Format: {img.format}")
        print(f"Size: {img.size}")
        print(f"Mode: {img.mode}")
        
        # Get color information
        colors = img.getcolors(maxcolors=10000)
        if colors:
            # Sort colors by frequency (most common first)
            colors.sort(reverse=True)
            print(f"Most common colors (frequency, (R,G,B,A)):")
            for i, (count, color) in enumerate(colors[:5]):
                print(f"  {i+1}. Count: {count}, Color: {color}")
        
        # Save a thumbnail for easier viewing
        base_name = os.path.splitext(os.path.basename(image_path))[0]
        thumbnail_path = f"{base_name}_thumbnail.png"
        img_copy = img.copy()
        img_copy.thumbnail((200, 200))
        img_copy.save(thumbnail_path)
        print(f"Saved thumbnail to {thumbnail_path}")
        
        return True
    except Exception as e:
        print(f"Error analyzing image {image_path}: {str(e)}")
        return False

def main():
    image_path = "./127.0.0.1_8081/Stylo Series.png"
    
    if not os.path.exists(image_path):
        print(f"Image not found: {image_path}")
        return
    
    analyze_image(image_path)
    
    # Based on the Stylo Series, create folders for LG Stylo models
    # Since we can't easily extract text from the images without OCR
    folders = [
        "Stylo Series",
        "Stylo Series/Stylo 6",
        "Stylo Series/Stylo 5",
        "Stylo Series/Stylo 5 Plus",
        "Stylo Series/Stylo 4",
        "Stylo Series/Stylo 4 Plus",
        "Stylo Series/Stylo 3",
        "Stylo Series/Stylo 3 Plus",
        "Stylo Series/Stylo 2",
        "Stylo Series/Stylo 2 Plus",
        "Stylo Series/Stylo"
    ]
    
    print("\nCreating folders for LG Stylo Series:")
    for folder in folders:
        try:
            if not os.path.exists(folder):
                os.makedirs(folder)
                print(f"  - Created folder: {folder}")
            else:
                print(f"  - Folder already exists: {folder}")
        except Exception as e:
            print(f"  - Error creating folder '{folder}': {str(e)}")

if __name__ == "__main__":
    main()
