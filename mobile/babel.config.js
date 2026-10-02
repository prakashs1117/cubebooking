module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['./src'],
        alias: {
          '@': './src',
          '@components': './src/components',
          '@screens': './src/screens',
          '@navigation': './src/navigation',
          '@utils': './src/utils',
          '@theme': './src/theme',
          '@hooks': './src/hooks',
          '@services': './src/services',
          '@stores': './src/stores',
          '@models': './src/types',
          '@context': './src/context',
          '@config': './src/config',
          '@localization': './src/localization',
          '@assets': './src/assets',
          '@lib': './src/lib',
          '@eva': './config/eva',
          '@data': './src/data',
          '@demand/shared': '../packages/shared',
        },
      },
    ],
    // Skip react-native-dotenv in test env — moduleNameMapper handles @env instead
    ...(process.env.NODE_ENV !== 'test'
      ? [
          [
            'module:react-native-dotenv',
            {
              moduleName: '@env',
              path: '.env',
              safe: false,
              allowUndefined: true,
            },
          ],
        ]
      : []),
    // react-native-reanimated/plugin must be listed last
    'react-native-reanimated/plugin',
  ],
};
