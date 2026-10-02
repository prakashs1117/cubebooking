export type MealType = 'Breakfast' | 'Lunch' | 'Dinner';
export type OrderStatus = 'upcoming' | 'today' | 'past' | 'cancelled';
export type OfficeId = string; // dynamic — values come from backend /offices

export interface FoodOption {
  id: string;
  name: string;
  dishes: string;
  kcal: number;
  tags: string[];
  price: number;
  isNonVeg: boolean;
}

export interface MealSlot {
  mealType: MealType;
  time: string;
  options: FoodOption[];
}

export interface FoodOrder {
  id: string;
  dayOffset: number;   // +1 = tomorrow, +2, +3; 0 = today; -1 = yesterday
  meal: MealType;
  option: string;      // option name
  price: number;
  status: OrderStatus;
  office: OfficeId;
  checkedIn?: boolean;
  rating?: number;     // 1-5 after meal
}

export type CartEntry = {
  dayOffset: number;
  meal: MealType;
  option: FoodOption;
};

// ── Menu (exact from design) ──────────────────────────────────────────────────

export const FOOD_MENU: MealSlot[] = [
  {
    mealType: 'Breakfast',
    time: '8:00 – 9:30 AM',
    options: [
      {
        id: 'bf',
        name: 'Breakfast of the day',
        dishes: 'Masala dosa, sambar, coconut chutney, filter coffee',
        kcal: 420,
        tags: ['Veg', 'Contains dairy'],
        price: 40,
        isNonVeg: false,
      },
    ],
  },
  {
    mealType: 'Lunch',
    time: '12:30 – 2:00 PM',
    options: [
      {
        id: 'l-sv',
        name: 'South Indian Veg',
        dishes: 'Bisi bele bath, curd rice, papad, payasam',
        kcal: 610,
        tags: ['Veg', 'Gluten-free'],
        price: 90,
        isNonVeg: false,
      },
      {
        id: 'l-nv',
        name: 'North Indian Veg',
        dishes: 'Paneer butter masala, dal tadka, jeera rice, roti',
        kcal: 690,
        tags: ['Veg', 'Contains dairy'],
        price: 90,
        isNonVeg: false,
      },
      {
        id: 'l-nonv',
        name: 'Non-Veg',
        dishes: 'Chicken chettinad, ghee rice, raita, gulab jamun',
        kcal: 760,
        tags: ['Non-veg', 'Contains nuts'],
        price: 120,
        isNonVeg: true,
      },
    ],
  },
  {
    mealType: 'Dinner',
    time: '7:00 – 8:30 PM',
    options: [
      {
        id: 'd-sv',
        name: 'South Indian Veg',
        dishes: 'Lemon rice, avial, rasam, appalam',
        kcal: 540,
        tags: ['Veg', 'Gluten-free'],
        price: 90,
        isNonVeg: false,
      },
      {
        id: 'd-nv',
        name: 'North Indian Veg',
        dishes: 'Rajma masala, aloo gobi, phulka, jeera rice',
        kcal: 620,
        tags: ['Veg'],
        price: 90,
        isNonVeg: false,
      },
      {
        id: 'd-nonv',
        name: 'Non-Veg',
        dishes: 'Egg curry, chapati, steamed rice, salad',
        kcal: 640,
        tags: ['Non-veg', 'Contains egg'],
        price: 120,
        isNonVeg: true,
      },
    ],
  },
];

export const OFFICES: { id: OfficeId; label: string; address: string }[] = [
  { id: 'MGCC', label: 'MGCC', address: 'MG Road, Bengaluru' },
  { id: 'Embassy', label: 'Embassy', address: 'Embassy Golf Links, Bengaluru' },
];

// ── Date helpers ───────────────────────────────────────────────────────────────

/** Current hour (0-23) */
export function currentHour(): number {
  return new Date().getHours();
}

/**
 * Returns true if the 6 PM booking window for "tomorrow" has passed,
 * meaning day-offset=1 is now locked.
 */
export function isPast6PM(): boolean {
  return currentHour() >= 18;
}

/** Day display label for a given offset from today */
export function dayOffsetLabel(offset: number): string {
  const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return DAYS[d.getDay()];
}

/** Date number (e.g. 14) for a given offset */
export function dayOffsetDate(offset: number): number {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.getDate();
}

/** Month abbreviation (e.g. "Sep") for a given offset */
export function dayOffsetMonth(offset: number): string {
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return MONTHS[d.getMonth()];
}

/** Human-readable date label for an order (e.g. "Mon, Sep 15") */
export function orderDateLabel(offset: number): string {
  if (offset === 0) return 'Today';
  if (offset === -1) return 'Yesterday';
  const d = new Date();
  d.setDate(d.getDate() + offset);
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  // Only call it "Tomorrow" if the next calendar day is actually a weekday
  if (offset === 1 && d.getDay() !== 0 && d.getDay() !== 6) return 'Tomorrow';
  return `${DAYS[d.getDay()]}, ${MONTHS[d.getMonth()]} ${d.getDate()}`;
}

/** Cutoff text for a booking day — cutoff is always the previous calendar day at 6 PM */
export function cutoffLabel(offset: number): string {
  const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  if (offset === 1) return 'Cutoff: Today 6:00 PM';
  const prevDay = new Date();
  prevDay.setDate(prevDay.getDate() + offset - 1);
  return `Cutoff: ${DAYS[prevDay.getDay()]} 6:00 PM`;
}

// ── Seed orders ────────────────────────────────────────────────────────────────

export const MOCK_FOOD_ORDERS: FoodOrder[] = [
  // Past orders (for rating)
  { id: 'o1', dayOffset: 0, meal: 'Lunch', option: 'South Indian Veg', price: 90, status: 'today', office: 'MGCC' },
  { id: 'o2', dayOffset: -1, meal: 'Lunch', option: 'Non-Veg', price: 120, status: 'past', office: 'MGCC', rating: undefined },
  { id: 'o3', dayOffset: -1, meal: 'Breakfast', option: 'Breakfast of the day', price: 40, status: 'past', office: 'MGCC', rating: 4 },
  // Upcoming orders
  { id: 'o4', dayOffset: 2, meal: 'Lunch', option: 'North Indian Veg', price: 90, status: 'upcoming', office: 'MGCC' },
  { id: 'o5', dayOffset: 3, meal: 'Dinner', option: 'South Indian Veg', price: 90, status: 'upcoming', office: 'MGCC' },
];
