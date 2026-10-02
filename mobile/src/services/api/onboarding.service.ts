import apiClient from '@services/api/client';
import { ENDPOINTS } from '@services/api/endpoints';

export interface OnboardingScreen {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  iconName: string;
  backgroundColor: string;
}

export interface OnboardingData {
  skip: string;
  next: string;
  getStarted: string;
  screens: OnboardingScreen[];
}

export interface OnboardingAPIResponse {
  en: OnboardingData;
  fr: OnboardingData;
  ar: OnboardingData;
}

/**
 * Fetch the first-launch guide content from the backend.
 * Public endpoint — no auth required.
 * Falls back to local JSON in FirstLaunchCarousel if this throws.
 */
export const getOnboardingData = async (): Promise<OnboardingAPIResponse> => {
  const { data } = await apiClient.get<OnboardingAPIResponse>(
    ENDPOINTS.ONBOARDING.GUIDE,
  );
  return data;
};

export default { getOnboardingData };
