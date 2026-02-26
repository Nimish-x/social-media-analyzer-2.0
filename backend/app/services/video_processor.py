"""
Video Processor Service
Extracts and compresses frames from video files for AI analysis.
"""

import cv2
import base64
import tempfile
import os
from io import BytesIO
from PIL import Image
from typing import List, Tuple


def extract_frames(
    video_path: str,
    interval_seconds: float = 1.0,
    max_frames: int = 3,  # REDUCED: Only 3 frames for hook detection (0s, 1s, 2s)
    max_width: int = 480
) -> List[Tuple[float, str]]:
    """
    Extract frames from a video at specified intervals.
    
    Args:
        video_path: Path to the video file
        interval_seconds: Time between frame captures (default: 1 second)
        max_frames: Maximum number of frames to extract (default: 30)
        max_width: Maximum width for compression (default: 480px)
    
    Returns:
        List of tuples: (timestamp_seconds, base64_encoded_image)
    """
    frames = []
    cap = cv2.VideoCapture(video_path)
    
    if not cap.isOpened():
        raise ValueError(f"Could not open video file: {video_path}")
    
    fps = cap.get(cv2.CAP_PROP_FPS)
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    duration = total_frames / fps if fps > 0 else 0
    
    print(f"DEBUG: Processing video. FPS: {fps}, Total Frames: {total_frames}, Duration: {duration:.2f}s")
    
    if fps <= 0:
        # Fallback to a default FPS if it can't be detected
        fps = 30.0
        print(f"DEBUG: FPS not detected, falling back to {fps}")
        
    frame_interval = max(1, int(fps * interval_seconds))
    current_frame = 0
    extracted_count = 0
    
    while cap.isOpened() and extracted_count < max_frames:
        ret, frame = cap.read()
        if not ret:
            break
        
        if current_frame % frame_interval == 0:
            timestamp = current_frame / fps
            try:
                compressed_b64 = compress_frame(frame, max_width)
                frames.append((timestamp, compressed_b64))
                extracted_count += 1
            except Exception as e:
                print(f"DEBUG: Error compressing frame {current_frame}: {e}")
        
        current_frame += 1
    
    print(f"DEBUG: Extracted {len(frames)} frames")
    cap.release()
    return frames


def compress_frame(frame, max_width: int = 480) -> str:
    """
    Compress a video frame and convert to base64.
    
    Args:
        frame: OpenCV frame (numpy array)
        max_width: Maximum width for resizing
    
    Returns:
        Base64 encoded JPEG image string
    """
    height, width = frame.shape[:2]
    
    if width > max_width:
        scale = max_width / width
        new_width = max_width
        new_height = int(height * scale)
        frame = cv2.resize(frame, (new_width, new_height), interpolation=cv2.INTER_AREA)
    
    # Convert BGR to RGB
    frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    
    # Convert to PIL Image and compress as JPEG
    pil_image = Image.fromarray(frame_rgb)
    buffer = BytesIO()
    pil_image.save(buffer, format="JPEG", quality=70)
    buffer.seek(0)
    
    # Encode to base64
    b64_string = base64.b64encode(buffer.read()).decode("utf-8")
    return b64_string


def save_temp_video(video_bytes: bytes, suffix: str = ".mp4") -> str:
    """
    Save uploaded video bytes to a temporary file.
    
    Args:
        video_bytes: Raw video file bytes
        suffix: File extension (default: .mp4)
    
    Returns:
        Path to the temporary file
    """
    temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=suffix)
    temp_file.write(video_bytes)
    temp_file.close()
    return temp_file.name


def cleanup_temp_file(file_path: str) -> None:
    """Remove a temporary file if it exists."""
    try:
        if os.path.exists(file_path):
            os.remove(file_path)
    except Exception:
        pass  # Ignore cleanup errors
