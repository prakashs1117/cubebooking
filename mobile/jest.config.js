module.exports = {
  preset: 'react-native',
  // Inject env vars for babel-plugin-module:react-native-dotenv
  // (needed so coverage instrumentation doesn't break the inline transforms)
  globals: {
    'process.env': {
      API_BASE_URL: 'http://localhost:4000/api/v1',
      API_TIMEOUT: '30000',
      NODE_ENV: 'test',
    },
  },
  setupFiles: ['<rootDir>/__tests__/setupEnv.js'],
  setupFilesAfterEnv: ['<rootDir>/__tests__/setup.ts'],
  testPathIgnorePatterns: [
    '<rootDir>/__tests__/setup.ts',
    '<rootDir>/__tests__/setupEnv.js',
    '<rootDir>/__tests__/__mocks__/',
  ],
  // Map path aliases that babel handles but Jest needs explicit mappings for
  moduleNameMapper: {
    '^@eva/(.*)$': '<rootDir>/config/eva/$1',
    // @env is a virtual module from react-native-dotenv; provide test stub values
    '^@env$': '<rootDir>/__tests__/__mocks__/env.js',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|react-native-.*|@react-navigation|@tanstack|@react-native-firebase|@firebase|@shopify|@gorhom)/)',
  ],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/__tests__/**',
    '!src/**/node_modules/**',
    // Exclude generated/asset files that don't need coverage
    '!src/assets/**',
    '!src/components/icons/components/**',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html', 'text-summary'],
  coverageThreshold: {
    // Global threshold reflects current test coverage.
    // Raise these incrementally as more test files are added.
    global: {
      branches: 1,
      functions: 1,
      lines: 1,
      statements: 1,
    },
    // Enforce high coverage on files that already have dedicated tests
    './src/utils/validation.ts': {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
    './src/utils/eventTransformers.ts': {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
    './src/lib/queryClient.ts': {
      branches: 70,
      functions: 60,
      lines: 70,
      statements: 70,
    },
  },
};
