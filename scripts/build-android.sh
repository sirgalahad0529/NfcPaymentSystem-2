#!/bin/bash
# This script builds the Android APK locally

echo "Building Android APK..."

# Step 1: Install dependencies
echo "Installing dependencies..."
npm install

# Step 2: Generate Android project
echo "Generating Android project..."
expo prebuild -p android

# Step 3: Navigate to Android directory
echo "Navigating to Android directory..."
cd android

# Step 4: Build the APK
echo "Building APK..."
./gradlew assembleRelease

# Step 5: Check if build was successful
if [ -f "app/build/outputs/apk/release/app-release.apk" ]; then
  echo "Build successful! APK is available at:"
  echo "app/build/outputs/apk/release/app-release.apk"
  
  # Copy APK to parent directory for easier access
  cp app/build/outputs/apk/release/app-release.apk ../NFC-Payment-System.apk
  echo "APK copied to NFC-Payment-System.apk in the project root directory"
else
  echo "Build failed. Check the logs for more information."
fi