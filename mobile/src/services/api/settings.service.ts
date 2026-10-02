import apiClient from '@services/api/client';
import { ENDPOINTS } from '@services/api/endpoints';
import { AppSettings } from '@/types/settings.types';

export const settingsService = {
  async getSettings(): Promise<AppSettings> {
    console.log('[SettingsService] Fetching settings from', ENDPOINTS.SETTINGS.DETAIL);
    const { data } = await apiClient.get<AppSettings>(
      ENDPOINTS.SETTINGS.DETAIL,
    );
    console.log('[SettingsService] Settings fetched successfully:', data);
    return data;
  },

  async updateSettings(settings: AppSettings): Promise<AppSettings> {
    console.log('[SettingsService] Posting settings to', ENDPOINTS.SETTINGS.DETAIL);
    console.log('[SettingsService] Payload:', JSON.stringify(settings, null, 2));
    const { data } = await apiClient.post<AppSettings>(
      ENDPOINTS.SETTINGS.DETAIL,
      settings,
    );
    console.log('[SettingsService] Settings updated successfully:', data);
    return data;
  },
};
