import { useQuery } from '@tanstack/react-query';
import { loadSDS, SafetyDataSheet } from '@services/api/atlasSDSService';

interface UseSDSOptions {
  materialNumber: string;
  system?: string;
  country?: string;
  language?: string;
  enabled?: boolean;
}

export function useSDS({
  materialNumber,
  system = 'NEX',
  country = 'EU',
  language = 'EN',
  enabled = true,
}: UseSDSOptions) {
  return useQuery<SafetyDataSheet, Error>({
    queryKey: ['sds', materialNumber, system, country, language],
    queryFn: () => loadSDS(materialNumber, system, country, language),
    enabled: enabled && !!materialNumber,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: 2,
  });
}
