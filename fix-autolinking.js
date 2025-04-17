const fs = require('fs');
const path = require('path');

// Path to the problematic file
const filePath = 'node_modules/expo-modules-autolinking/scripts/android/autolinking_implementation.gradle';

try {
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Fix the "No such property: url" error
    const fixed = content.replace(
      'entry.url', 
      '(entry.containsKey("url") ? entry.url : entry.key)'
    );
    
    fs.writeFileSync(filePath, fixed);
    console.log('Successfully fixed autolinking implementation file');
  } else {
    console.log('Autolinking file not found. Skipping fix.');
  }
} catch (err) {
  console.error('Error fixing autolinking:', err);
}