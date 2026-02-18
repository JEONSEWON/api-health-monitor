#!/usr/bin/env python3
"""
Generate favicons from logo - VERSION 2 (Larger, more visible)
"""
from PIL import Image, ImageDraw
import os

# Source logo
source = "checkapi-logo.jpg"
output_dir = "../../frontend/public"

# Ensure output directory exists
os.makedirs(output_dir, exist_ok=True)

# Load and convert to RGBA
img = Image.open(source)
if img.mode != 'RGBA':
    img = img.convert('RGBA')

# Get the logo bounds (trim whitespace)
bbox = img.getbbox()
if bbox:
    img = img.crop(bbox)

print(f"Original size after crop: {img.size}")

# Favicon sizes - using LARGER logo (80% of canvas instead of 70%)
sizes = {
    'favicon-16x16.png': 16,
    'favicon-32x32.png': 32,
    'favicon-96x96.png': 96,
    'apple-touch-icon.png': 180,
    'android-chrome-192x192.png': 192,
    'android-chrome-512x512.png': 512,
}

# Generate all sizes with PADDING for visibility
for filename, size in sizes.items():
    # Create a new image with padding
    # Use 80% of canvas for logo (was 100% before, too tight)
    logo_size = int(size * 0.8)
    padding = (size - logo_size) // 2
    
    # Resize logo
    resized_logo = img.resize((logo_size, logo_size), Image.Resampling.LANCZOS)
    
    # Create canvas with white background
    canvas = Image.new('RGBA', (size, size), (255, 255, 255, 255))
    
    # Paste logo in center
    canvas.paste(resized_logo, (padding, padding), resized_logo)
    
    # Save
    output_path = os.path.join(output_dir, filename)
    canvas.save(output_path, 'PNG', optimize=True)
    print(f"✓ Generated {filename} ({size}x{size}) - logo at 80% with padding")

# Generate ICO file (multi-size)
ico_sizes = [(16, 16), (32, 32), (48, 48)]
ico_images = []

for ico_size in ico_sizes:
    size = ico_size[0]
    logo_size = int(size * 0.8)
    padding = (size - logo_size) // 2
    
    resized_logo = img.resize((logo_size, logo_size), Image.Resampling.LANCZOS)
    canvas = Image.new('RGBA', (size, size), (255, 255, 255, 255))
    canvas.paste(resized_logo, (padding, padding), resized_logo)
    ico_images.append(canvas)

ico_path = os.path.join(output_dir, 'favicon.ico')
ico_images[0].save(ico_path, format='ICO', sizes=ico_sizes, append_images=ico_images[1:])
print(f"✓ Generated favicon.ico (multi-size with 80% logo)")

print("\n✅ All favicons regenerated with LARGER, more visible logo!")
print(f"📁 Output directory: {output_dir}")
print("🔍 Logo now takes 80% of canvas with padding for better visibility")
