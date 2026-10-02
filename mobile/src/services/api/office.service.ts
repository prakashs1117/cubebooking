import apiClient from './client';
import { ENDPOINTS } from './endpoints';

export interface ApiOffice {
  id: string;
  label: string;
  fullName: string;
  address: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  latitude: number;
  longitude: number;
  isActive: boolean;
  distanceKm?: number; // present on nearby response
}

const officeService = {
  getAll: async (): Promise<ApiOffice[]> => {
    const { data } = await apiClient.get<{ success: boolean; data: ApiOffice[] }>(
      ENDPOINTS.OFFICES.LIST,
    );
    return data.data;
  },

  getNearest: async (lat: number, lng: number): Promise<ApiOffice | null> => {
    const { data } = await apiClient.get<{ success: boolean; data: ApiOffice | null }>(
      ENDPOINTS.OFFICES.NEARBY(lat, lng),
    );
    return data.data;
  },
};

export default officeService;
