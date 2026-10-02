import { useQuery } from '@tanstack/react-query';
import officeService, { ApiOffice } from '@services/api/office.service';

export const officeKeys = {
  all:     ['offices'] as const,
  nearby:  (lat: number, lng: number) => ['offices', 'nearby', lat, lng] as const,
};

export function useOffices() {
  return useQuery({
    queryKey: officeKeys.all,
    queryFn: officeService.getAll,
    staleTime: 10 * 60_000, // offices rarely change
  });
}

export function useNearestOffice(lat: number | null, lng: number | null) {
  return useQuery({
    queryKey: officeKeys.nearby(lat ?? 0, lng ?? 0),
    queryFn: () => officeService.getNearest(lat!, lng!),
    enabled: lat !== null && lng !== null,
    staleTime: 5 * 60_000,
  });
}
