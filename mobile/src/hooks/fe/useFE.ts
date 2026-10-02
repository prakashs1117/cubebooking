import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { feGetDailyPrompt, feListPrompts, feGetConfig, feCreatePracticeSession, feListPracticeSessions, type CreatePracticeSessionPayload, type FESessionKind } from '@services/fe/feApi';
import { DEFAULT_FEATURE_FLAGS, TIER_ENTITLEMENTS, type FEConfig } from '@demand/shared/fe';

/** Safe local default so UI can gate before /fe/config resolves or offline. */
const DEFAULT_CONFIG: FEConfig = {
  features: DEFAULT_FEATURE_FLAGS,
  entitlements: TIER_ENTITLEMENTS,
};

/** Backend feature flags + tier entitlements (cached, with a local fallback). */
export function useFeConfig() {
  const query = useQuery({
    queryKey: ['fe', 'config'],
    queryFn: feGetConfig,
    staleTime: 10 * 60 * 1000,
  });
  return { ...query, config: query.data ?? DEFAULT_CONFIG };
}

/** Today's daily speaking prompt. */
export function useFeDailyPrompt() {
  return useQuery({
    queryKey: ['fe', 'prompts', 'daily'],
    queryFn: feGetDailyPrompt,
    staleTime: 30 * 60 * 1000,
  });
}

/** Active prompts, optionally filtered by type. */
export function useFePrompts(type?: string) {
  return useQuery({
    queryKey: ['fe', 'prompts', type ?? 'all'],
    queryFn: () => feListPrompts(type),
    staleTime: 30 * 60 * 1000,
  });
}

/** Create a practice session after drill completion. Invalidates the sessions list. */
export function useCreatePracticeSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreatePracticeSessionPayload) => feCreatePracticeSession(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fe', 'practice', 'sessions'] });
    },
  });
}

/** List completed practice sessions, optionally filtered by kind. */
export function usePracticeSessions(kind?: FESessionKind, limit = 20, skip = 0) {
  return useQuery({
    queryKey: ['fe', 'practice', 'sessions', kind ?? 'all', limit, skip],
    queryFn: () => feListPracticeSessions(kind, limit, skip),
    staleTime: 5 * 60 * 1000,
  });
}
