import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import foodApi, { ApiFoodOrder, BulkOrderPayload, PlaceOrderPayload, CreateMealPayload, ApiMealRates } from '@services/api/food.service';
import type { MealType } from '@data/mockFood';
import type { ApiDish } from '@services/api/food.service';

// ── Query keys ────────────────────────────────────────────────────────────────

export const foodKeys = {
  all:          ['food'] as const,
  menu:         () => [...foodKeys.all, 'menu'] as const,
  meals:        (type?: MealType) => [...foodKeys.all, 'meals', type ?? 'all'] as const,
  mealsByDate:  (dateKey: string) => [...foodKeys.all, 'mealsByDate', dateKey] as const,
  orders:       () => [...foodKeys.all, 'orders'] as const,
  ordersList:   (status?: string) => [...foodKeys.orders(), status ?? 'all'] as const,
  orderDate:    (dateKey: string) => [...foodKeys.orders(), 'date', dateKey] as const,
  pass:         (orderId: string) => [...foodKeys.all, 'pass', orderId] as const,
  allMeals:     (type?: MealType) => [...foodKeys.all, 'allMeals', type ?? 'all'] as const,
  dishes:       (search?: string) => [...foodKeys.all, 'dishes', search ?? ''] as const,
  mealRates:    () => [...foodKeys.all, 'mealRates'] as const,
};

// ── Queries ───────────────────────────────────────────────────────────────────

/** Grouped menu: Breakfast → Lunch → Dinner with options and time windows */
export function useFoodMenu() {
  return useQuery({
    queryKey: foodKeys.menu(),
    queryFn:  foodApi.getMenu,
    staleTime: 5 * 60_000, // menu changes rarely
  });
}

/** Flat meal list, optionally filtered by meal type */
export function useMeals(mealType?: MealType) {
  return useQuery({
    queryKey: foodKeys.meals(mealType),
    queryFn:  () => foodApi.getMeals(mealType),
    staleTime: 5 * 60_000,
  });
}

/** All orders for the current user — polls every 30s to catch vendor check-ins */
export function useMyOrders(status?: 'pending' | 'confirmed' | 'cancelled') {
  return useQuery({
    queryKey: foodKeys.ordersList(status),
    queryFn:  () => foodApi.getMyOrders(status),
    staleTime: 30_000,
    refetchInterval: 30_000,
  });
}

/** Orders for a specific calendar date */
export function useOrdersByDate(dateKey: string) {
  return useQuery({
    queryKey: foodKeys.orderDate(dateKey),
    queryFn:  () => foodApi.getOrdersByDate(dateKey),
    staleTime: 30_000,
  });
}

/** Pickup pass / QR token for one order */
export function usePickupPass(orderId: string, enabled = true) {
  return useQuery({
    queryKey: foodKeys.pass(orderId),
    queryFn:  () => foodApi.getPickupPass(orderId),
    enabled:  !!orderId && enabled,
    staleTime: 2 * 60_000,
  });
}

// ── Mutations ─────────────────────────────────────────────────────────────────

/** Place a single order */
export function usePlaceOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: PlaceOrderPayload) => foodApi.placeOrder(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: foodKeys.orders() });
    },
  });
}

/**
 * Bulk order checkout — confirms the entire cart in one call.
 * Returns { placed, failed, total }.
 */
export function usePlaceBulkOrders() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: BulkOrderPayload) => foodApi.placeBulkOrders(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: foodKeys.orders() });
    },
  });
}

/** Cancel an order — optimistically removes it from the list */
export function useCancelOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (orderId: string) => foodApi.cancelOrder(orderId),
    onMutate: async (orderId: string) => {
      await qc.cancelQueries({ queryKey: foodKeys.orders() });
      const snap = qc.getQueriesData<ApiFoodOrder[]>({ queryKey: foodKeys.orders() });
      qc.setQueriesData<ApiFoodOrder[]>({ queryKey: foodKeys.orders() }, old =>
        old?.map(o => o._id === orderId ? { ...o, status: 'cancelled' as const } : o)
      );
      return { snap };
    },
    onError: (_err, _id, ctx: any) => {
      ctx?.snap?.forEach(([key, data]: any) => qc.setQueryData(key, data));
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: foodKeys.orders() });
    },
  });
}

/** Rate a past meal (1–5 stars) — optimistically updates the order */
export function useRateOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ orderId, rating }: { orderId: string; rating: number }) =>
      foodApi.rateOrder(orderId, rating),
    onMutate: async ({ orderId, rating }) => {
      await qc.cancelQueries({ queryKey: foodKeys.orders() });
      const snap = qc.getQueriesData<ApiFoodOrder[]>({ queryKey: foodKeys.orders() });
      qc.setQueriesData<ApiFoodOrder[]>({ queryKey: foodKeys.orders() }, old =>
        old?.map(o => o._id === orderId ? { ...o, rating } : o)
      );
      return { snap };
    },
    onError: (_err, _vars, ctx: any) => {
      ctx?.snap?.forEach(([key, data]: any) => qc.setQueryData(key, data));
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: foodKeys.orders() });
    },
  });
}

/** Next upcoming/today order — the one closest in time for a quick-access QR */
export function useNextMealPass() {
  const { data: orders = [], isLoading } = useQuery({
    queryKey: foodKeys.ordersList(),
    queryFn: () => foodApi.getMyOrders(),
    staleTime: 30_000,
    refetchInterval: 60_000,
  });

  const MEAL_ORDER = ['Breakfast', 'Lunch', 'Dinner'];

  // Today's date key
  const today = new Date();
  const todayKey = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;

  const next = orders
    .filter(o => o.status !== 'cancelled' && !o.checkedIn && o.dateKey >= todayKey)
    .sort((a, b) => {
      if (a.dateKey !== b.dateKey) return a.dateKey < b.dateKey ? -1 : 1;
      return MEAL_ORDER.indexOf(a.mealType) - MEAL_ORDER.indexOf(b.mealType);
    })[0] ?? null;

  return { next, isLoading };
}

/** Submit detailed food feedback for a past order */
export function useSubmitFoodFeedback() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ orderId, payload }: { orderId: string; payload: import('@services/api/food.service').FoodFeedbackPayload }) =>
      foodApi.submitFoodFeedback(orderId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: foodKeys.orders() });
    },
  });
}

/** Vendor: check in an employee */
export function useCheckIn() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (orderId: string) => foodApi.checkIn(orderId),
    onSuccess: (order) => {
      qc.invalidateQueries({ queryKey: foodKeys.pass(order._id) });
      qc.invalidateQueries({ queryKey: foodKeys.orders() });
    },
  });
}

/** Meals for a specific date — staleTime 0 so switching days or pulling to refresh always fetches fresh data */
export function useMealsByDate(dateKey: string) {
  return useQuery({
    queryKey: foodKeys.mealsByDate(dateKey),
    queryFn:  () => foodApi.getMealsByDate(dateKey),
    enabled:  !!dateKey,
    staleTime: 0,
  });
}

/** Vendor: all meals including unavailable, for manage menu view */
export function useAllMeals(mealType?: MealType) {
  return useQuery({
    queryKey: foodKeys.allMeals(mealType),
    queryFn:  () => foodApi.getAllMeals(mealType),
    staleTime: 60_000,
  });
}

/** Vendor: create a new meal for a specific date */
export function useCreateMeal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateMealPayload) => foodApi.createMeal(payload),
    onSuccess: (_data, payload) => {
      qc.invalidateQueries({ queryKey: foodKeys.mealsByDate(payload.dateKey) });
      qc.invalidateQueries({ queryKey: foodKeys.all });
    },
  });
}

/** Standard meal rates — { Breakfast, Lunch, Dinner } prices set by super admin */
export function useMealRates() {
  return useQuery({
    queryKey: foodKeys.mealRates(),
    queryFn:  foodApi.getMealRates,
    staleTime: 5 * 60_000,
  });
}

/** Super admin: update standard meal rates */
export function useSetMealRates() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (rates: ApiMealRates) => foodApi.setMealRates(rates),
    onSuccess: (updated) => {
      qc.setQueryData(foodKeys.mealRates(), updated);
    },
  });
}

/** Dish library — searchable list of known dishes */
export function useDishes(search?: string) {
  return useQuery({
    queryKey: foodKeys.dishes(search),
    queryFn:  () => foodApi.getDishes(search),
    staleTime: 5 * 60_000,
  });
}

/** Create a new dish (idempotent — returns existing if name already taken) */
export function useCreateDish() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => foodApi.createDish(name),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: foodKeys.dishes() });
    },
  });
}

/** Vendor: update a meal's fields */
export function useUpdateMeal(dateKey: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ mealId, payload }: { mealId: string; payload: Partial<Omit<CreateMealPayload, 'dateKey'>> }) =>
      foodApi.updateMeal(mealId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: foodKeys.mealsByDate(dateKey) });
    },
  });
}

/** Vendor: delete a meal */
export function useDeleteMeal(dateKey: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (mealId: string) => foodApi.deleteMeal(mealId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: foodKeys.mealsByDate(dateKey) });
    },
  });
}

/** Vendor: toggle isAvailable on a meal (optimistic) */
export function useToggleMealAvailability() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (mealId: string) => foodApi.toggleMealAvailability(mealId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: foodKeys.all });
    },
  });
}
