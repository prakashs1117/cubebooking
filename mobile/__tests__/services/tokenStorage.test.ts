/**
 * Token Storage Service Tests
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { tokenStorage } from '@services/storage/tokenStorage';

const mockGet = AsyncStorage.getItem as jest.Mock;
const mockSet = AsyncStorage.setItem as jest.Mock;
const mockMultiSet = AsyncStorage.setMany as jest.Mock;
const mockMultiRemove = AsyncStorage.removeMany as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
});

describe('saveTokens', () => {
  it('calls multiSet with access and refresh tokens', async () => {
    mockMultiSet.mockResolvedValue(undefined);
    await tokenStorage.saveTokens('access-123', 'refresh-456');
    expect(mockMultiSet).toHaveBeenCalledWith({
      '@event_app_access_token': 'access-123',
      '@event_app_refresh_token': 'refresh-456',
    });
  });

  it('throws when multiSet fails', async () => {
    mockMultiSet.mockRejectedValue(new Error('Storage error'));
    await expect(tokenStorage.saveTokens('a', 'b')).rejects.toThrow(
      'Storage error',
    );
  });
});

describe('getAccessToken', () => {
  it('returns the stored access token', async () => {
    mockGet.mockResolvedValue('access-token');
    const token = await tokenStorage.getAccessToken();
    expect(token).toBe('access-token');
    expect(mockGet).toHaveBeenCalledWith('@event_app_access_token');
  });

  it('returns null on error', async () => {
    mockGet.mockRejectedValue(new Error('read error'));
    const token = await tokenStorage.getAccessToken();
    expect(token).toBeNull();
  });
});

describe('getRefreshToken', () => {
  it('returns the stored refresh token', async () => {
    mockGet.mockResolvedValue('refresh-token');
    const token = await tokenStorage.getRefreshToken();
    expect(token).toBe('refresh-token');
    expect(mockGet).toHaveBeenCalledWith('@event_app_refresh_token');
  });

  it('returns null on error', async () => {
    mockGet.mockRejectedValue(new Error('read error'));
    const token = await tokenStorage.getRefreshToken();
    expect(token).toBeNull();
  });
});

describe('saveUser', () => {
  it('saves serialized user data', async () => {
    mockSet.mockResolvedValue(undefined);
    const user = {
      id: 'u1',
      email: 'a@b.com',
      name: 'Alice',
      role: 'user' as const,
    };
    await tokenStorage.saveUser(user as any);
    expect(mockSet).toHaveBeenCalledWith(
      '@event_app_user',
      JSON.stringify(user),
    );
  });

  it('throws when setItem fails', async () => {
    mockSet.mockRejectedValue(new Error('write error'));
    await expect(tokenStorage.saveUser({} as any)).rejects.toThrow(
      'write error',
    );
  });
});

describe('getUser', () => {
  it('returns parsed user data', async () => {
    const user = { id: 'u1', email: 'a@b.com', name: 'Alice', role: 'user' };
    mockGet.mockResolvedValue(JSON.stringify(user));
    const result = await tokenStorage.getUser();
    expect(result).toEqual(user);
  });

  it('returns null when nothing stored', async () => {
    mockGet.mockResolvedValue(null);
    const result = await tokenStorage.getUser();
    expect(result).toBeNull();
  });

  it('returns null on error', async () => {
    mockGet.mockRejectedValue(new Error('read error'));
    const result = await tokenStorage.getUser();
    expect(result).toBeNull();
  });
});

describe('clearAuthData', () => {
  it('removes all auth keys', async () => {
    mockMultiRemove.mockResolvedValue(undefined);
    await tokenStorage.clearAuthData();
    expect(mockMultiRemove).toHaveBeenCalledWith([
      '@event_app_access_token',
      '@event_app_refresh_token',
      '@event_app_user',
    ]);
  });

  it('throws when multiRemove fails', async () => {
    mockMultiRemove.mockRejectedValue(new Error('remove error'));
    await expect(tokenStorage.clearAuthData()).rejects.toThrow('remove error');
  });
});

describe('isAuthenticated', () => {
  it('returns true when both tokens exist', async () => {
    mockGet
      .mockResolvedValueOnce('access-token')
      .mockResolvedValueOnce('refresh-token');
    const result = await tokenStorage.isAuthenticated();
    expect(result).toBe(true);
  });

  it('returns false when access token is missing', async () => {
    mockGet.mockResolvedValueOnce(null).mockResolvedValueOnce('refresh-token');
    const result = await tokenStorage.isAuthenticated();
    expect(result).toBe(false);
  });

  it('returns false when refresh token is missing', async () => {
    mockGet.mockResolvedValueOnce('access-token').mockResolvedValueOnce(null);
    const result = await tokenStorage.isAuthenticated();
    expect(result).toBe(false);
  });

  it('returns false on error', async () => {
    mockGet.mockRejectedValue(new Error('read error'));
    const result = await tokenStorage.isAuthenticated();
    expect(result).toBe(false);
  });
});
