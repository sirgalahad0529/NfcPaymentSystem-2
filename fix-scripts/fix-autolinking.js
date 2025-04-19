const fs = require('fs');
const path = require('path');

// Path to the problematic autolinking file
const autolinkingFilePath = 'node_modules/expo-modules-autolinking/scripts/android/autolinking_implementation.gradle';
// Path to android/settings.gradle
const androidSettingsGradlePath = 'android/settings.gradle';

function fixAutolinkingImplementation() {
  try {
    if (fs.existsSync(autolinkingFilePath)) {
      let content = fs.readFileSync(autolinkingFilePath, 'utf8');
      
      // Fix the "No such property: url" error
      const fixed = content.replace(
        'entry.url', 
        '(entry.containsKey("url") ? entry.url : entry.key)'
      );
      
      fs.writeFileSync(autolinkingFilePath, fixed);
      console.log('Successfully fixed autolinking implementation file');
    } else {
      console.log('Autolinking file not found. Skipping fix.');
    }
  } catch (err) {
    console.error('Error fixing autolinking:', err);
  }
}

function fixNfcManagerIncludes() {
  try {
    if (fs.existsSync(androidSettingsGradlePath)) {
      let settingsContent = fs.readFileSync(androidSettingsGradlePath, 'utf8');
      
      // Check if the fix has already been applied
      if (settingsContent.includes('// NFC Manager Manual Include')) {
        console.log('android/settings.gradle has already been fixed for NFC Manager. Skipping.');
        return;
      }
      
      // Add manual include for NFC Manager if needed
      settingsContent += `\n// NFC Manager Manual Include
include ':react-native-nfc-manager'
project(':react-native-nfc-manager').projectDir = new File(rootProject.projectDir, '../node_modules/react-native-nfc-manager/android')
`;
      
      fs.writeFileSync(androidSettingsGradlePath, settingsContent, 'utf8');
      console.log('Fixed android/settings.gradle for NFC Manager.');
    } else {
      console.log('android/settings.gradle not found. Skipping NFC Manager fixes.');
    }
  } catch (err) {
    console.error('Error fixing NFC Manager settings:', err);
  }
}

// Main execution
fixAutolinkingImplementation();
fixNfcManagerIncludes();