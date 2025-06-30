const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Disable package.json exports resolution to fix Firebase import issues
config.resolver.unstable_enablePackageExports = false;

module.exports = config;