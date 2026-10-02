import { useQuery } from '@tanstack/react-query';
import apiClient from '@services/api/client';
import { ENDPOINTS } from '@services/api/endpoints';

export interface DashboardStats {
  mealsThisMonth: number;
  mealsThisWeek: number;
  totalSpend: number;
  todayMenuItems: number;
}

export interface DashboardOrderItem {
  id: string;
  mealType: string;
  mealName: string;
  dateKey: string;
  office: string;
  price: number;
  checkedIn: boolean;
  status: string;
}

export interface DashboardTodayItem {
  id: string;
  meal: string;
  name: string;
  checkedIn: boolean;
  office: string;
}

export interface DashboardData {
  stats: DashboardStats;
  today: {
    date: string;
    booked: DashboardTodayItem[];
    cancelled: number;
    checkedIn: number;
  };
  nextPickup: DashboardOrderItem | null;
  upcoming: DashboardOrderItem[];
}

export function useDashboard() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const { data } = await apiClient.get<{ success: boolean; data: DashboardData }>(
        ENDPOINTS.DASHBOARD,
      );
      return data.data;
    },
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}
