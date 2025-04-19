// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('@expo/metro-config');

const config = getDefaultConfig(__dirname);

// Remove all console statements except errors in production
config.transformer.minifierConfig = {
  compress: {
    drop_console: true,
    pure_funcs: ['console.info', 'console.log', 'console.debug', 'console.warn'],
  },
};

module.exports = config;