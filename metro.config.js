// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('@expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Exclude duplicate package.json files that are causing Haste module naming collision
config.resolver.blockList = [
  /mobile-app-final7\/package\.json$/,
  /mobile-app-final\d*\//,
  /mobile-app-simple\//,
  /mobile-app-eas-build\//,
  /mobile-app-v5\//,
  /complete-app\//,
  /final-app\//,
  /extracted\//,
];

// Remove all console statements except errors in production
config.transformer.minifierConfig = {
  compress: {
    drop_console: true,
    pure_funcs: ['console.info', 'console.log', 'console.debug', 'console.warn'],
  },
};

module.exports = config;