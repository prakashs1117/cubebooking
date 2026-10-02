const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const path = require('path');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const defaultConfig = getDefaultConfig(__dirname);

const config = {
  resolver: {
    // Extend default asset extensions to include JSON
    assetExts: [...defaultConfig.resolver.assetExts, 'json'],
    // Enable package exports support so Metro handles React 19's nested exports format
    unstable_enablePackageExports: true,
    // Pin React and React Native to mobile's own node_modules to avoid
    // conflicts with the root node_modules (which has React 18)
    extraNodeModules: {
      react: path.resolve(__dirname, 'node_modules/react'),
      'react-native': path.resolve(__dirname, 'node_modules/react-native'),
    },
  },
  // Only watch the mobile project, not the monorepo root
  watchFolders: [path.resolve(__dirname, '../packages/shared')],
};

module.exports = mergeConfig(defaultConfig, config);
