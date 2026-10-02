// Environment variable setup for Jest
// Provides values that babel-plugin-module:react-native-dotenv
// would normally inline at build time.
var env = process.env;
if (!env.API_BASE_URL) {
  env.API_BASE_URL = 'http://localhost:4000/api/v1';
}
if (!env.API_TIMEOUT) {
  env.API_TIMEOUT = '30000';
}
