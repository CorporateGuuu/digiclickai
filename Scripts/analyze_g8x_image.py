from PIL import Image
import os

def analyze_image(image_path):
    """Analyze the image and print basic information."""
    try:
        # Open the image
        img = Image.open(image_path)
        
        # Get basic information
        print(f"Image format: {img.format}")
        print(f"Image size: {img.size}")
        print(f"Image mode: {img.mode}")
        
        # Get color information
        colors = img.getcolors(maxcolors=10000)
        if colors:
            # Sort colors by frequency (most common first)
            colors.sort(reverse=True)
            print(f"Most common colors (frequency, (R,G,B,A)):")
            for i, (count, color) in enumerate(colors[:10]):
                print(f"  {i+1}. Count: {count}, Color: {color}")
        
        # Save a thumbnail for easier viewing
        thumbnail_path = "g8x_thumbnail.png"
        img.thumbnail((200, 200))
        img.save(thumbnail_path)
        print(f"Saved thumbnail to {thumbnail_path}")
        
        return True
    except Exception as e:
        print(f"Error analyzing image: {str(e)}")
        return False

def main():
    image_path = "./127.0.0.1_8081/G8X.png"
    
    if not os.path.exists(image_path):
        print(f"Image not found: {image_path}")
        return
    
    print(f"Analyzing image: {image_path}")
    analyze_image(image_path)

if __name__ == "__main__":
    main()
