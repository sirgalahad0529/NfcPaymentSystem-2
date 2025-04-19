#!/bin/bash

# Script to build and package the NFC Payment System v1.1.0
# This version includes enhanced API configuration and offline functionality

# Set variables
APP_NAME="nfc-payment-system"
VERSION="1.1.0"
DATE=$(date +"%Y%m%d")
PACKAGE_NAME="${APP_NAME}-${VERSION}-${DATE}"
EXPORT_DIR=".."

# Color codes for console output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Building NFC Payment System Package v${VERSION} ===${NC}"
echo -e "${YELLOW}Package Name: ${PACKAGE_NAME}${NC}"

# Create package directory structure
echo -e "${GREEN}Creating temporary directory structure...${NC}"
mkdir -p temp_package

# Copy essential files
echo -e "${GREEN}Copying project files...${NC}"
cp -r src temp_package/
cp -r assets temp_package/
cp App.js temp_package/
cp app.json temp_package/
cp package.json temp_package/
cp eas.json temp_package/
cp README.md temp_package/
cp EXPORT_INSTRUCTIONS.md temp_package/
cp API_CONFIG_README.md temp_package/
cp CHANGELOG.md temp_package/

# Include Android-specific files
if [ -d "android" ]; then
  echo -e "${GREEN}Including Android configuration...${NC}"
  cp -r android temp_package/
fi

# Create the archive
echo -e "${GREEN}Creating ZIP archive...${NC}"
cd temp_package
zip -r ${EXPORT_DIR}/${PACKAGE_NAME}.zip ./*
cd ..

# Cleanup
echo -e "${GREEN}Cleaning up temporary files...${NC}"
rm -rf temp_package

# Final message
echo -e "${BLUE}=== Package created successfully! ===${NC}"
echo -e "${YELLOW}Package location: ${EXPORT_DIR}/${PACKAGE_NAME}.zip${NC}"
echo -e "${GREEN}This package includes:${NC}"
echo -e "- API configuration capability in settings"
echo -e "- Enhanced offline mode for areas with erratic connectivity"
echo -e "- Improved error handling and network detection"
echo -e "- Better documentation and code comments"