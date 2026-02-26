
import sys
import pyttsx3
import os
import argparse

def generate_audio_file(text, output_path, voice_id=None):
    """
    Generate audio file using pyttsx3 in a standalone process.
    """
    try:
        engine = pyttsx3.init()
        
        # Configure Voice
        voices = engine.getProperty('voices')
        if voice_id == "energetic" and len(voices) > 1:
            engine.setProperty('voice', voices[1].id)
        elif len(voices) > 0:
            engine.setProperty('voice', voices[0].id)
            
        engine.setProperty('rate', 160)
        
        # Save
        engine.save_to_file(text, output_path)
        engine.runAndWait()
        
        print(f"SUCCESS: {output_path}")
        
    except Exception as e:
        print(f"ERROR: {e}")
        sys.exit(1)

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--text", required=True)
    parser.add_argument("--output", required=True)
    parser.add_argument("--voice", default="neutral")
    args = parser.parse_args()
    
    generate_audio_file(args.text, args.output, args.voice)
