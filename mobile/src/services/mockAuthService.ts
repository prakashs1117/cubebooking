/**
 * Mock Authentication Service
 * Simulates API calls based on the Event Management System API documentation
 */

// Mock user database
const MOCK_USERS = [
  {
    id: 'user_001',
    email: 'admin@example.com',
    username: 'admin',
    password: 'admin',
    role: 'ADMIN',
    createdAt: new Date().toISOString(),
  },
];

// Simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Generate mock JWT token
const generateMockToken = (userId: string): string => {
  return `mock_token_${userId}_${Date.now()}`;
};

/**
 * Mock Login API
 * Based on: POST /auth/login
 */
export const mockLogin = async (email: string, password: string) => {
  await delay(1000); // Simulate network delay

  // Find user
  const user = MOCK_USERS.find(u => u.email === email || u.username === email);

  if (!user) {
    throw new Error('Invalid email or password');
  }

  if (user.password !== password) {
    throw new Error('Invalid email or password');
  }

  // Return mock response matching API spec
  return {
    accessToken: generateMockToken(user.id),
    refreshToken: generateMockToken(`refresh_${user.id}`),
    expiresIn: 900, // 15 minutes
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
    },
  };
};

/**
 * Mock Registration API
 * Based on: POST /auth/register/verify
 */
export const mockRegister = async (
  email: string,
  username: string,
  password: string,
) => {
  await delay(1500); // Simulate network delay

  // Check if user already exists
  const existingUser = MOCK_USERS.find(
    u => u.email === email || u.username === username,
  );

  if (existingUser) {
    throw new Error('Email or username already registered');
  }

  // Create new user
  const newUser = {
    id: `user_${Date.now()}`,
    email,
    username,
    password,
    role: 'USER' as const,
    createdAt: new Date().toISOString(),
  };

  MOCK_USERS.push(newUser);

  // Return mock response matching API spec
  return {
    message: 'Account created successfully',
    user: {
      id: newUser.id,
      email: newUser.email,
      username: newUser.username,
      role: newUser.role,
      createdAt: newUser.createdAt,
    },
  };
};

/**
 * Mock Token Refresh API
 * Based on: POST /auth/refresh
 */
export const mockRefreshToken = async (refreshToken: string) => {
  await delay(500);

  // Extract user ID from refresh token
  const match = refreshToken.match(/refresh_user_(\d+)/);
  if (!match) {
    throw new Error('Invalid or expired refresh token');
  }

  return {
    accessToken: generateMockToken(match[1]),
    refreshToken: generateMockToken(`refresh_${match[1]}`),
    expiresIn: 900,
  };
};
