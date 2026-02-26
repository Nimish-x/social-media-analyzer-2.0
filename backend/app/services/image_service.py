import os
from fastapi import UploadFile
from PIL import Image, ImageEnhance
import io
import uuid

# Define upload directory relative to backend app
UPLOAD_DIR = os.path.join("app", "uploads", "optimized")

# Ensure directory exists
os.makedirs(UPLOAD_DIR, exist_ok=True)

def optimize_image(upload_file: UploadFile) -> str:
    """
    Optimize an uploaded image for Instagram (4:5 aspect ratio).
    
    Steps:
    1. Read bytes
    2. Convert to RGB
    3. Resize/Crop to 1080x1350
    4. Enhance brightness/contrast slightly
    5. Save as high-quality JPEG
    """
    try:
        # Read image
        contents = upload_file.file.read()
        image = Image.open(io.BytesIO(contents))
        upload_file.file.seek(0)  # Reset cursor if needed later
        
        # Convert to RGB (handle PNG/RGBA)
        if image.mode != "RGB":
            image = image.convert("RGB")
            
        # Target Dimensions
        TARGET_WIDTH = 1080
        TARGET_HEIGHT = 1350
        
        # Resize logic (Cover)
        img_ratio = image.width / image.height
        target_ratio = TARGET_WIDTH / TARGET_HEIGHT
        
        if img_ratio > target_ratio:
            # Image is wider than target
            new_height = TARGET_HEIGHT
            new_width = int(new_height * img_ratio)
        else:
            # Image is taller than target
            new_width = TARGET_WIDTH
            new_height = int(new_width / img_ratio)
            
        resized_img = image.resize((new_width, new_height), Image.Resampling.LANCZOS)
        
        # Center Crop
        left = (new_width - TARGET_WIDTH) / 2
        top = (new_height - TARGET_HEIGHT) / 2
        right = (new_width + TARGET_WIDTH) / 2
        bottom = (new_height + TARGET_HEIGHT) / 2
        
        final_img = resized_img.crop((left, top, right, bottom))
        
        # Enhance
        enhancer = ImageEnhance.Contrast(final_img)
        final_img = enhancer.enhance(1.05) # 5% boost
        
        enhancer = ImageEnhance.Brightness(final_img)
        final_img = enhancer.enhance(1.02) # 2% boost
        
        # Generate filename
        filename = f"{uuid.uuid4()}.jpg"
        file_path = os.path.join(UPLOAD_DIR, filename)
        
        # Save
        final_img.save(file_path, "JPEG", quality=90)
        
        return file_path.replace("\\", "/") # Return standard path
        
    except Exception as e:
        raise Exception(f"Image optimization failed: {str(e)}")
