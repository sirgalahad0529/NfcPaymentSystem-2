#!/bin/bash
# This script optimizes image assets for Android performance
# Requires ImageMagick to be installed

echo "Optimizing image assets for Android..."

# Create directory for optimized assets if it doesn't exist
mkdir -p optimized_assets

# Generate icon in various sizes
echo "Generating icons..."
convert -background none -size 1024x1024 assets/icon.svg optimized_assets/icon-1024.png
convert -background none -size 512x512 assets/icon.svg optimized_assets/icon-512.png
convert -background none -size 192x192 assets/icon.svg optimized_assets/icon-192.png
convert -background none -size 144x144 assets/icon.svg optimized_assets/icon-144.png
convert -background none -size 96x96 assets/icon.svg optimized_assets/icon-96.png
convert -background none -size 72x72 assets/icon.svg optimized_assets/icon-72.png
convert -background none -size 48x48 assets/icon.svg optimized_assets/icon-48.png

# Generate adaptive icon
echo "Generating adaptive icons..."
convert -background none -size 1024x1024 assets/adaptive-icon.svg optimized_assets/adaptive-icon-1024.png
convert -background none -size 512x512 assets/adaptive-icon.svg optimized_assets/adaptive-icon-512.png

# Generate splash screen
echo "Generating splash screen..."
convert -background none -size 1242x2436 assets/splash.svg optimized_assets/splash.png

# Generate favicon
echo "Generating favicon..."
convert -background none -size 196x196 assets/icon.svg optimized_assets/favicon.png

# Optimize all PNGs for Android
echo "Optimizing PNGs..."
for file in optimized_assets/*.png; do
  echo "Optimizing $file..."
  pngquant --force --quality=65-80 --strip --output "$file" "$file"
done

echo "Done! Optimized assets are available in the optimized_assets directory."
echo "Copy these files to your assets directory before building your app."