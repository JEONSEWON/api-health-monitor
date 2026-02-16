#!/usr/bin/env python3
"""
Generate favicons and app icons from the logo
"""
from PIL import Image
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

# Favicon sizes
sizes = {
    'favicon-16x16.png': 16,
    'favicon-32x32.png': 32,
    'favicon-96x96.png': 96,
    'apple-touch-icon.png': 180,
    'android-chrome-192x192.png': 192,
    'android-chrome-512x512.png': 512,
}

# Generate all sizes
for filename, size in sizes.items():
    resized = img.resize((size, size), Image.Resampling.LANCZOS)
    output_path = os.path.join(output_dir, filename)
    resized.save(output_path, 'PNG', optimize=True)
    print(f"✓ Generated {filename} ({size}x{size})")

# Generate ICO file (multi-size)
ico_img = img.resize((32, 32), Image.Resampling.LANCZOS)
ico_path = os.path.join(output_dir, 'favicon.ico')
ico_img.save(ico_path, format='ICO', sizes=[(16, 16), (32, 32), (48, 48)])
print(f"✓ Generated favicon.ico (multi-size)")

print("\n✅ All favicons generated successfully!")
print(f"📁 Output directory: {output_dir}")
