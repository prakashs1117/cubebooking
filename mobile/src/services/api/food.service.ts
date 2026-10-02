import apiClient from './client';
import { ENDPOINTS } from './endpoints';
import type { OfficeId, MealType } from '@data/mockFood';

// ── Response shapes from the backend ─────────────────────────────────────────

export type ApiMealRates = { Breakfast: number; Lunch: number; Dinner: number };

export interface ApiMeal {
  _id: string;
  name: string;
  dishes: string;
  kcal: number | null;
  price: number;
  tags: string[];
  mealType: MealType;
  isNonVeg: boolean;
  isAvailable: boolean;
  dateKey: string;
}

export interface ApiMenuSlot {
  mealType: MealType;
  time: string;
  options: ApiMeal[];
}

export type ApiOrderStatus = 'pending' | 'confirmed' | 'cancelled';

export interface ApiFoodFeedback {
  overallRating: number;
  taste: number;
  portionSize: number;
  value: number;
  tags: string[];
  comment?: string;
  submittedAt: string;
}

export interface FoodFeedbackPayload {
  overallRating: number;
  taste: number;
  portionSize: number;
  value: number;
  tags: string[];
  comment?: string;
}

export interface ApiFoodOrder {
  _id: string;
  userId: string;
  mealId: string | ApiMeal;
  mealName: string;
  mealType: MealType;
  price: number;
  dateKey: string;
  office: OfficeId;
  status: ApiOrderStatus;
  checkedIn: boolean;
  rating?: number;
  feedback?: ApiFoodFeedback;
  createdAt: string;
  updatedAt: string;
}

export interface ApiPickupPass {
  token: string;
  orderId: string;
  mealName: string;
  mealType: MealType;
  dateKey: string;
  office: OfficeId;
  checkedIn: boolean;
  employeeName: string | null;
}

export interface ApiDish {
  _id: string;
  name: string;
}

// ── Payloads ──────────────────────────────────────────────────────────────────

export interface CreateMealPayload {
  name: string;
  dishes: string;
  kcal?: number | null;
  mealType: MealType;
  tags: string[];
  isNonVeg: boolean;
  dateKey: string;
}

export interface PlaceOrderPayload {
  mealId: string;
  dateKey: string;
  mealType: MealType;
  office: OfficeId;
}

export interface BulkOrderPayload {
  orders: PlaceOrderPayload[];
}

// ── Service functions ─────────────────────────────────────────────────────────

export const foodApi = {
  /** Grouped menu: [{ mealType, time, options[] }] */
  getMenu: async (): Promise<ApiMenuSlot[]> => {
    const { data } = await apiClient.get<{ success: boolean; data: ApiMenuSlot[] }>(
      ENDPOINTS.FOOD.MENU
    );
    return data.data;
  },

  /** Flat meal list, optional mealType filter */
  getMeals: async (mealType?: MealType): Promise<ApiMeal[]> => {
    const { data } = await apiClient.get<{ success: boolean; data: ApiMeal[] }>(
      ENDPOINTS.FOOD.MEALS,
      mealType ? { params: { mealType } } : undefined
    );
    return data.data;
  },

  /** All orders for the current user, optional status filter */
  getMyOrders: async (status?: ApiOrderStatus): Promise<ApiFoodOrder[]> => {
    const { data } = await apiClient.get<{ success: boolean; data: ApiFoodOrder[] }>(
      ENDPOINTS.FOOD.ORDERS,
      status ? { params: { status } } : undefined
    );
    return data.data;
  },

  /** Orders for a specific date */
  getOrdersByDate: async (dateKey: string): Promise<ApiFoodOrder[]> => {
    const { data } = await apiClient.get<{ success: boolean; data: ApiFoodOrder[] }>(
      ENDPOINTS.FOOD.ORDERS_BY_DATE(dateKey)
    );
    return data.data;
  },

  /** Place a single order */
  placeOrder: async (payload: PlaceOrderPayload): Promise<ApiFoodOrder> => {
    const { data } = await apiClient.post<{ success: boolean; data: ApiFoodOrder }>(
      ENDPOINTS.FOOD.ORDERS,
      payload
    );
    return data.data;
  },

  /** Place multiple orders (cart checkout) */
  placeBulkOrders: async (
    payload: BulkOrderPayload
  ): Promise<{ placed: ApiFoodOrder[]; failed: string[]; total: number }> => {
    const { data } = await apiClient.post<{
      success: boolean;
      data: { placed: ApiFoodOrder[]; failed: string[]; total: number };
    }>(ENDPOINTS.FOOD.ORDERS_BULK, payload);
    return data.data;
  },

  /** Cancel an order */
  cancelOrder: async (orderId: string): Promise<ApiFoodOrder> => {
    const { data } = await apiClient.patch<{ success: boolean; data: ApiFoodOrder }>(
      ENDPOINTS.FOOD.ORDER_CANCEL(orderId)
    );
    return data.data;
  },

  /** Rate a past meal (1–5 stars) */
  rateOrder: async (orderId: string, rating: number): Promise<ApiFoodOrder> => {
    const { data } = await apiClient.patch<{ success: boolean; data: ApiFoodOrder }>(
      ENDPOINTS.FOOD.ORDER_RATE(orderId),
      { rating }
    );
    return data.data;
  },

  /** Submit detailed food feedback for a past order */
  submitFoodFeedback: async (orderId: string, payload: FoodFeedbackPayload): Promise<ApiFoodOrder> => {
    const { data } = await apiClient.post<{ success: boolean; data: ApiFoodOrder }>(
      ENDPOINTS.FOOD.ORDER_FEEDBACK(orderId),
      payload,
    );
    return data.data;
  },

  /** Get pickup QR pass for an order */
  getPickupPass: async (orderId: string): Promise<ApiPickupPass> => {
    const { data } = await apiClient.get<{ success: boolean; data: ApiPickupPass }>(
      ENDPOINTS.FOOD.ORDER_PASS(orderId)
    );
    return data.data;
  },

  /** Vendor: check in an employee (marks order as collected) */
  checkIn: async (orderId: string): Promise<ApiFoodOrder> => {
    const { data } = await apiClient.patch<{ success: boolean; data: ApiFoodOrder }>(
      ENDPOINTS.FOOD.ORDER_CHECKIN(orderId)
    );
    return data.data;
  },

  /** Vendor: all meals for a specific date (including unavailable) */
  getMealsByDate: async (dateKey: string): Promise<ApiMeal[]> => {
    const { data } = await apiClient.get<{ success: boolean; data: ApiMeal[] }>(
      ENDPOINTS.FOOD.MEALS_BY_DATE(dateKey),
      { params: { all: 'true' } }
    );
    return data.data;
  },

  /** Vendor: all meals including unavailable, for the Manage Menu tab */
  getAllMeals: async (mealType?: MealType): Promise<ApiMeal[]> => {
    const { data } = await apiClient.get<{ success: boolean; data: ApiMeal[] }>(
      ENDPOINTS.FOOD.MEALS_ALL,
      mealType ? { params: { mealType } } : undefined
    );
    return data.data;
  },

  /** Vendor: create a new meal */
  createMeal: async (payload: CreateMealPayload): Promise<ApiMeal> => {
    const { data } = await apiClient.post<{ success: boolean; data: ApiMeal }>(
      ENDPOINTS.FOOD.MEAL_CREATE,
      payload
    );
    return data.data;
  },

  /** Vendor: update a meal's fields */
  updateMeal: async (mealId: string, payload: Partial<Omit<CreateMealPayload, 'dateKey'>>): Promise<ApiMeal> => {
    const { data } = await apiClient.patch<{ success: boolean; data: ApiMeal }>(
      `/food/meals/${mealId}`,
      payload
    );
    return data.data;
  },

  /** Vendor: delete a meal */
  deleteMeal: async (mealId: string): Promise<void> => {
    await apiClient.delete(`/food/meals/${mealId}`);
  },

  /** Vendor: toggle isAvailable on a meal */
  toggleMealAvailability: async (mealId: string): Promise<ApiMeal> => {
    const { data } = await apiClient.patch<{ success: boolean; data: ApiMeal }>(
      ENDPOINTS.FOOD.MEAL_TOGGLE_AVAILABILITY(mealId)
    );
    return data.data;
  },

  /** Get standard meal rates (all roles) */
  getMealRates: async (): Promise<ApiMealRates> => {
    const { data } = await apiClient.get<{ success: boolean; data: ApiMealRates }>(
      ENDPOINTS.FOOD.MEAL_RATES
    );
    return data.data;
  },

  /** Set standard meal rates (super_admin only) */
  setMealRates: async (rates: ApiMealRates): Promise<ApiMealRates> => {
    const { data } = await apiClient.put<{ success: boolean; data: ApiMealRates }>(
      ENDPOINTS.FOOD.MEAL_RATES,
      rates
    );
    return data.data;
  },

  /** Get dish library, optional search */
  getDishes: async (search?: string): Promise<ApiDish[]> => {
    const { data } = await apiClient.get<{ success: boolean; data: ApiDish[] }>(
      ENDPOINTS.FOOD.DISHES,
      search ? { params: { search } } : undefined
    );
    return data.data;
  },

  /** Create a dish (idempotent by name — returns existing if already present) */
  createDish: async (name: string): Promise<ApiDish> => {
    const { data } = await apiClient.post<{ success: boolean; data: ApiDish }>(
      ENDPOINTS.FOOD.DISHES,
      { name }
    );
    return data.data;
  },

  /** Seed default menu (dev/admin only — no-op if already seeded) */
  seedMeals: async () => {
    const { data } = await apiClient.post<{ success: boolean; message: string; count: number }>(
      ENDPOINTS.FOOD.SEED
    );
    return data;
  },
};

export default foodApi;
