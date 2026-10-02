# React & React Native — Senior Developer Performance Reference

> 20-year practitioner guide: hooks, patterns, performance, architecture
> **Read this before implementing any new feature.**

---

## Table of Contents

1. [Core Hooks — Senior Usage](#1-core-hooks--senior-usage)
2. [Performance Hooks](#2-performance-hooks)
3. [Data Fetching & Caching](#3-data-fetching--caching)
4. [Lazy Loading & Code Splitting](#4-lazy-loading--code-splitting)
5. [Images, Placeholders & Media](#5-images-placeholders--media)
6. [State Architecture](#6-state-architecture)
7. [React Native Performance](#7-react-native-performance)
8. [FlatList & Virtualized Lists](#8-flatlist--virtualized-lists)
9. [React Native Images](#9-react-native-images)
10. [Animations & Gestures (RN)](#10-animations--gestures-rn)
11. [Architecture Patterns](#11-architecture-patterns)
12. [Production Audit Checklist](#12-production-audit-checklist)

---

## Core Philosophy

### 1. Measure Before Memoizing

Wrapping everything in `useMemo`/`useCallback` without profiling adds cognitive overhead with zero gain. Run the React DevTools Profiler, find the actual bottleneck, then fix it. Memoization is a fix for a measured problem, not a default pattern.

### 2. Server State is Not Global State

TanStack Query replaces 60–70% of what people put in Redux/Context. If you're storing API responses in a global store, you're maintaining a cache manually — and doing it worse. Server state (async, remote) belongs in TanStack Query. Client state (UI flags, form state) belongs in local state or a lightweight store.

### 3. Pre-call Strategy

Data should be in cache before the user consciously decides to navigate:

- **Web**: Prefetch on hover
- **React Native**: `InteractionManager.runAfterInteractions` after screen mount

### 4. Key Prop Hygiene

`key={index}` in dynamic lists causes React to reconcile incorrectly on reorder/delete. Always key by stable ID — this is a silent correctness **and** performance bug.

### 5. Effect Cleanup is Non-Negotiable

Every fetch, subscription, timer, and observer needs a cleanup return. In RN especially, missing cleanups cause memory leaks that accumulate across screen navigations.

---

## 1. Core Hooks — Senior Usage

### `useState` — Right pattern, right shape

Colocate related state. Never spread it across multiple atoms when a single object makes more sense — but don't over-merge either.

```ts
// ✓ Group related state
const [form, setForm] = useState({
  name: '',
  email: '',
  loading: false,
});

// ✓ Functional update for derived state
setForm(prev => ({ ...prev, name: val }));

// ✓ Lazy initializer — runs ONCE, not on every render
const [data] = useState(() => expensiveCompute());

// ✗ DON'T — 10 separate states for one form
const [name, setName] = useState('');
const [email, setEmail] = useState('');
const [loading, setLoading] = useState(false);
// Each can trigger its own re-render
```

> **Senior tip:** `useState(expensiveCompute())` — function is _called_ on every render. `useState(() => expensiveCompute())` — function runs only on mount. Always use the lazy form for computed initial state.

---

### `useEffect` — The most misused hook

Effects synchronize React with **external systems**. They are NOT event handlers, data transformers, or initializers.

```ts
// ✓ Always return cleanup — prevents memory leaks
useEffect(() => {
  const sub = eventBus.subscribe('event', handler);
  const timer = setInterval(tick, 1000);
  return () => {
    sub.unsubscribe();
    clearInterval(timer);
  };
}, [handler]); // stable ref via useCallback

// ✓ AbortController for fetch cancellation
useEffect(() => {
  const controller = new AbortController();
  fetch(`/api/users/${userId}`, { signal: controller.signal })
    .then(r => r.json())
    .then(setData)
    .catch(e => {
      if (e.name !== 'AbortError') setError(e);
    });
  return () => controller.abort(); // cancels on unmount OR dep change
}, [userId]);

// ✗ DON'T — derived state in an effect = double render
useEffect(() => {
  setFullName(`${firstName} ${lastName}`);
}, [firstName, lastName]);
// ✓ DO — compute during render
const fullName = `${firstName} ${lastName}`;
```

> **Rule:** If you can compute it during render — don't use `useEffect`. Derived state in effects = double render.

---

### `useReducer` — For complex state machines

Switch from `useState` to `useReducer` when state has 3+ fields that change together, or transitions have business rules.

```ts
type State = { loading: boolean; data: Data[] | null; error: string | null };
type Action =
  | { type: 'FETCH_START' }
  | { type: 'FETCH_SUCCESS'; payload: Data[] }
  | { type: 'FETCH_ERROR'; error: string };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'FETCH_START':
      return { ...state, loading: true, error: null };
    case 'FETCH_SUCCESS':
      return { loading: false, data: action.payload, error: null };
    case 'FETCH_ERROR':
      return { ...state, loading: false, error: action.error };
    default:
      return state;
  }
}

const [state, dispatch] = useReducer(reducer, {
  loading: false,
  data: null,
  error: null,
});
dispatch({ type: 'FETCH_START' }); // predictable, testable, type-safe
```

---

### `useRef` — Beyond DOM refs

`useRef` persists values across renders **without triggering re-renders**. It's a mutable box, not just a DOM handle.

```ts
// Store previous value
const prevCount = useRef(count);
useEffect(() => {
  prevCount.current = count;
});

// Store timer/interval IDs
const timerRef = useRef<ReturnType<typeof setTimeout>>();
const startTimer = () => {
  timerRef.current = setTimeout(doWork, 1000);
};
const cancel = () => clearTimeout(timerRef.current);

// Stable callback ref — avoids stale closures in event listeners
const onScrollRef = useRef(onScroll);
onScrollRef.current = onScroll; // update on every render

useEffect(() => {
  const handler = (e: Event) => onScrollRef.current(e);
  window.addEventListener('scroll', handler);
  return () => window.removeEventListener('scroll', handler);
}, []); // empty deps — never re-subscribes, always calls latest handler
```

---

### `useContext` — Without performance traps

Context re-renders **all consumers** when value changes. Split contexts by update frequency.

```ts
// ✓ Separate stable state (auth) from volatile state (theme)
const AuthCtx = createContext<AuthState | null>(null);
const ThemeCtx = createContext<Theme>('light');

// ✓ Memoize provider value to prevent unnecessary re-renders
function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const value = useMemo(() => ({ user, setUser }), [user]);
  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

// ✓ Typed custom hook — enforces usage inside provider
export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
```

> **Scale point:** Context with 3+ consumers OR high update frequency → migrate to Zustand/Jotai. Context is a dependency injection mechanism, not a state manager.

---

### `useLayoutEffect` vs `useEffect`

`useLayoutEffect` fires **synchronously** after DOM mutations, before paint. Use only for measurements/DOM reads that would cause a visual flash.

```ts
// ✓ Tooltip positioning — must measure BEFORE paint
useLayoutEffect(() => {
  const rect = triggerRef.current?.getBoundingClientRect();
  if (rect) {
    setPosition({
      top: rect.bottom + window.scrollY,
      left: rect.left + window.scrollX,
    });
  }
}, [isOpen]);
// Using useEffect here → tooltip flickers to wrong position first
```

> **Rule:** If removing `useLayoutEffect` causes a visual flash → keep it. Otherwise always prefer `useEffect`.

---

## 2. Performance Hooks

> **Measure first. Optimize second.** Profile with React DevTools before adding any memoization.

---

### `useMemo` — When it actually helps

```ts
// ✓ 1. Expensive computation
const sortedList = useMemo(() => bigList.slice().sort(compareFn), [bigList]);

// ✓ 2. Stable object reference for child props
const queryOptions = useMemo(
  () => ({
    endpoint: '/api/users',
    timeout: 5000,
  }),
  [],
); // new object every render → child always re-renders

// ✓ 3. Derived data from multiple sources
const orderTotal = useMemo(
  () => orders.reduce((acc, o) => acc + o.amount, 0),
  [orders],
);

// ✗ NOT worthwhile — simple string interpolation
const title = useMemo(() => `Hello ${name}`, [name]);

// ✗ NOT worthwhile — primitive values
const isValid = useMemo(() => email.includes('@'), [email]);

// ✗ NOT worthwhile — module-level constants
const config = useMemo(() => APP_CONFIG, []);
// Just use a module-level const instead
```

---

### `useCallback` — Stable function references

Only useful when passing to **memoized children** (`React.memo`) or as `useEffect` dependency.

```ts
// ✓ Child is React.memo — needs stable ref to skip re-render
const handleSubmit = useCallback(
  async (data: FormData) => {
    setLoading(true);
    try {
      await api.post('/submit', data);
      onSuccess();
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  },
  [onSuccess],
);

// ✓ Stable useEffect dependency — prevents infinite loop
const fetchData = useCallback(() => {
  return api.get(`/users/${userId}`);
}, [userId]);

useEffect(() => {
  fetchData().then(setUser);
}, [fetchData]); // fetchData is stable → effect runs only when userId changes
```

> **Golden rule:** `useCallback` + `React.memo` are a pair. One without the other is usually pointless.

---

### `React.memo` — Component memoization

```tsx
// ✓ Expensive child that re-renders with same props
const DataTable = React.memo(
  ({ rows, onSort }: DataTableProps) => {
    return <table>{rows.map(renderRow)}</table>;
  },
  // Custom comparator — return true to SKIP re-render
  (prevProps, nextProps) =>
    prevProps.rows === nextProps.rows && prevProps.onSort === nextProps.onSort,
);

// ✓ Always memoize the parent's props too
function Parent() {
  const rows = useMemo(() => processData(rawData), [rawData]);
  const onSort = useCallback((col: string) => setSort(col), []);
  return <DataTable rows={rows} onSort={onSort} />;
}
```

---

### `useDeferredValue` & `useTransition` — React 18+

```tsx
// useTransition — mark state updates as non-urgent
function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Result[]>([]);
  const [isPending, startTransition] = useTransition();

  const handleSearch = (q: string) => {
    setQuery(q); // urgent — input stays responsive immediately
    startTransition(() => {
      setResults(filterBigList(q)); // deferred — React can interrupt this
    });
  };

  return (
    <>
      <Input value={query} onChange={handleSearch} />
      {isPending && <Spinner />}
      <ResultList data={results} />
    </>
  );
}

// useDeferredValue — show stale UI while fresh content loads
function FilteredList({ query }: { query: string }) {
  const deferredQuery = useDeferredValue(query);
  const isStale = query !== deferredQuery;

  return (
    <div style={{ opacity: isStale ? 0.7 : 1, transition: 'opacity 0.2s' }}>
      <ExpensiveList filter={deferredQuery} />
    </div>
  );
}
```

---

## 3. Data Fetching & Caching

> **The cardinal sin:** Sequential waterfall requests. Fire all requests in parallel. Prefetch before the user asks. Cache aggressively.

---

### TanStack Query — The gold standard

#### Basic Query

```ts
const { data, isLoading, error, isFetching } = useQuery({
  queryKey: ['users', userId],
  queryFn: () => api.getUser(userId),
  staleTime: 5 * 60 * 1000, // treat as fresh for 5 mins
  gcTime: 10 * 60 * 1000, // keep in memory 10 mins after unmount
  retry: 2,
  retryDelay: attempt => Math.min(1000 * 2 ** attempt, 30000), // exponential backoff
  select: data => data.users, // transform without extra memo
  placeholderData: keepPreviousData, // no loading flash during pagination
  refetchOnWindowFocus: true,
});
```

#### Prefetch — Data Ready Before Navigation

```ts
const queryClient = useQueryClient();

// Prefetch on hover — data is in cache before the click lands
const prefetchUser = useCallback(
  (id: string) => {
    queryClient.prefetchQuery({
      queryKey: ['users', id],
      queryFn: () => api.getUser(id),
      staleTime: 60_000,
    });
  },
  [queryClient],
);

<UserCard
  onMouseEnter={() => prefetchUser(user.id)}
  onClick={() => navigate(`/users/${user.id}`)}
/>;
```

#### Infinite Scroll Query

```ts
const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
  useInfiniteQuery({
    queryKey: ['feed'],
    queryFn: ({ pageParam = 0 }) =>
      api.getFeed({ cursor: pageParam, limit: 20 }),
    getNextPageParam: lastPage => lastPage.nextCursor ?? undefined,
    initialPageParam: 0,
  });

const posts = data?.pages.flatMap(page => page.items) ?? [];
```

#### Optimistic Mutations

```ts
const updateUser = useMutation({
  mutationFn: (data: UserUpdate) => api.updateUser(data),

  onMutate: async newData => {
    await queryClient.cancelQueries({ queryKey: ['users', id] });
    const snapshot = queryClient.getQueryData<User>(['users', id]);
    queryClient.setQueryData(['users', id], (old: User) => ({
      ...old,
      ...newData,
    }));
    return { snapshot };
  },

  onError: (_err, _vars, context) => {
    queryClient.setQueryData(['users', id], context?.snapshot);
  },

  onSettled: () => {
    queryClient.invalidateQueries({ queryKey: ['users', id] });
  },
});
```

---

### Parallel & Dependent Queries

```ts
// Fire all at once — no waterfall
const [user, posts, followers] = useQueries({
  queries: [
    { queryKey: ['user', id], queryFn: () => getUser(id) },
    { queryKey: ['posts', id], queryFn: () => getPosts(id) },
    { queryKey: ['followers', id], queryFn: () => getFollowers(id) },
  ],
});

// Dependent query — waits for upstream data
const { data: org } = useQuery({
  queryKey: ['org', user.data?.orgId],
  queryFn: () => getOrg(user.data!.orgId),
  enabled: !!user.data?.orgId,
});
```

---

### Custom Fetch Hook — Full Pattern

```ts
type AsyncState<T> =
  | { status: 'idle'; data: null; error: null }
  | { status: 'loading'; data: null; error: null }
  | { status: 'success'; data: T; error: null }
  | { status: 'error'; data: null; error: string };

function useApi<T>(url: string | null): AsyncState<T> {
  const [state, dispatch] = useReducer(
    (_: AsyncState<T>, action: AsyncState<T>) => action,
    { status: 'idle', data: null, error: null },
  );

  useEffect(() => {
    if (!url) return;
    const controller = new AbortController();
    dispatch({ status: 'loading', data: null, error: null });

    fetch(url, { signal: controller.signal })
      .then(r => {
        if (!r.ok) throw new Error(r.statusText);
        return r.json();
      })
      .then((data: T) => dispatch({ status: 'success', data, error: null }))
      .catch(err => {
        if (err.name !== 'AbortError')
          dispatch({ status: 'error', data: null, error: err.message });
      });

    return () => controller.abort();
  }, [url]);

  return state;
}
```

---

## 4. Lazy Loading & Code Splitting

> Ship only what the user needs **right now**. Every KB saved = faster TTI.

---

### React.lazy + Suspense — Route-level splitting

```tsx
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Settings = lazy(() => import('./pages/Settings'));

function App() {
  return (
    <Suspense fallback={<AppShell loading />}>
      <Routes>
        <Route
          path="/dashboard"
          element={
            <Suspense fallback={<PageSkeleton />}>
              <Dashboard />
            </Suspense>
          }
        />
        <Route
          path="/settings"
          element={
            <Suspense fallback={<PageSkeleton />}>
              <Settings />
            </Suspense>
          }
        />
      </Routes>
    </Suspense>
  );
}

// Preload on hover — instant navigation
const preloadDashboard = () => import('./pages/Dashboard');
<NavLink onMouseEnter={preloadDashboard} to="/dashboard">
  Dashboard
</NavLink>;
```

---

### Component-level lazy — Heavy UI libraries

```tsx
// Lazy load heavy deps (charts ~200KB, editors ~400KB, maps ~300KB)
const ChartView = lazy(() => import('./ChartView'));

function LazyChart({ data }: { data: ChartData }) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { rootMargin: '200px' }, // preload 200px before entering viewport
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={ref}>
      {visible ? (
        <Suspense fallback={<ChartSkeleton />}>
          <ChartView data={data} />
        </Suspense>
      ) : (
        <ChartSkeleton />
      )}
    </div>
  );
}
```

---

### Next.js `dynamic` imports — SSR-aware

```tsx
import dynamic from 'next/dynamic';

// Browser-only libs (maps, canvas, WebGL)
const MapView = dynamic(() => import('./MapView'), {
  ssr: false,
  loading: () => <MapSkeleton />,
});

// Named export
const DataTable = dynamic(() => import('./DataTable').then(m => m.DataTable), {
  loading: () => <TableSkeleton />,
});

// Fetch with ISR caching
const data = await fetch('/api/data', {
  next: { revalidate: 60 }, // regenerate every 60 seconds
});
```

---

## 5. Images, Placeholders & Media

> **LCP is almost always an image.** Get images right and Core Web Vitals follow.

---

### Progressive image loading — Blur-up pattern

```tsx
function ProgressiveImage({
  src,
  placeholder,
  alt,
  style,
  ...props
}: ProgressiveImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(placeholder);

  useEffect(() => {
    const img = new Image();
    img.src = src;
    img.onload = () => {
      setCurrentSrc(src);
      setLoaded(true);
    };
  }, [src]);

  return (
    <img
      src={currentSrc}
      alt={alt}
      style={{
        ...style,
        filter: loaded ? 'none' : 'blur(20px)',
        transform: 'scale(1.05)',
        transition: 'filter 0.4s ease-in-out, transform 0.4s ease-in-out',
      }}
      {...props}
    />
  );
}
```

---

### Next.js Image — Production best practices

```tsx
import Image from 'next/image';

// LCP image — disable lazy loading
<Image
  src="/hero.jpg"
  priority
  placeholder="blur"
  blurDataURL={base64PlaceholderFromServer}
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
  fill
  alt="Hero banner"
  quality={85}
/>

// Below-fold images — lazy by default
<Image
  src={product.imageUrl}
  width={400}
  height={300}
  placeholder="blur"
  blurDataURL={product.blurHash}
  alt={product.name}
  loading="lazy"
/>
```

---

### Skeleton screens — Better than spinners

```tsx
const Skeleton = ({
  width = '100%',
  height = 16,
  radius = 4,
}: SkeletonProps) => (
  <div
    style={{
      width,
      height,
      borderRadius: radius,
      background:
        'linear-gradient(90deg, #e5e7eb 25%, #f3f4f6 50%, #e5e7eb 75%)',
      backgroundSize: '200% 100%',
      animation: 'shimmer 1.5s infinite',
    }}
  />
);

// Match EXACT dimensions of real content to prevent CLS
function UserCardSkeleton() {
  return (
    <div style={{ display: 'flex', gap: 12, padding: 16 }}>
      <Skeleton width={40} height={40} radius={20} />
      <div
        style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}
      >
        <Skeleton height={14} width="60%" />
        <Skeleton height={12} width="40%" />
      </div>
    </div>
  );
}
// @keyframes shimmer { to { background-position: -200% 0; } }
```

> **Layout shift rule:** Skeleton dimensions must exactly match loaded content. Mismatched sizes cause CLS — a Core Web Vitals failure.

---

## 6. State Architecture

> Right tool, right scope. 90% of state management complexity is self-inflicted.

---

### State decision tree

| State type               | What it is                          | Tool                      |
| ------------------------ | ----------------------------------- | ------------------------- |
| **Local UI state**       | open/closed, hover, input values    | `useState` / `useReducer` |
| **Server state**         | API data, loading, errors           | TanStack Query / SWR      |
| **Shared UI state**      | theme, locale, modal                | Context + `useMemo`       |
| **Complex client state** | cart, undo history, multi-step form | Zustand / Jotai           |
| **URL-derived state**    | filters, pagination, active tab     | URL params / router       |

> **Key insight:** Server state is ~60% of most app state. Putting API responses in Redux means manually maintaining a cache — and doing it worse than TanStack Query.

---

### Zustand — Minimal global store

```ts
import { create } from 'zustand';
import { persist, subscribeWithSelector } from 'zustand/middleware';

interface CartStore {
  items: CartItem[];
  total: number;
  addItem: (product: Product) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
}

const useCartStore = create<CartStore>()(
  persist(
    subscribeWithSelector((set, get) => ({
      items: [],
      total: 0,

      addItem: product =>
        set(state => {
          const items = [...state.items, { ...product, qty: 1 }];
          return {
            items,
            total: items.reduce((a, i) => a + i.price * i.qty, 0),
          };
        }),

      removeItem: id =>
        set(state => {
          const items = state.items.filter(i => i.id !== id);
          return {
            items,
            total: items.reduce((a, i) => a + i.price * i.qty, 0),
          };
        }),

      clearCart: () => set({ items: [], total: 0 }),
    })),
    { name: 'cart-storage' },
  ),
);

// ✓ Selector — only re-renders when selected slice changes
const total = useCartStore(state => state.total);
const addItem = useCartStore(state => state.addItem); // stable ref

// ✓ Subscribe outside React (analytics side-effect)
useCartStore.subscribe(
  state => state.items,
  items => analytics.track('cart_updated', { count: items.length }),
);
```

---

### URL state — The underused pattern

```ts
// Filters, pagination, sort — derive from URL params
// Shareable, browser-navigable, survives refresh
'use client';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';

function useFilters() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const setFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.replace(`${pathname}?${params.toString()}`);
  };

  return {
    page: Number(searchParams.get('page') ?? 1),
    sort: searchParams.get('sort') ?? 'created_at',
    category: searchParams.get('category') ?? '',
    setFilter,
  };
}
```

---

## 7. React Native Performance

> The JS thread and UI thread are **separate**. Crossing the bridge is expensive. The goal is to keep all animation and gesture work entirely on the UI thread.

---

### Enable Hermes + New Architecture

**Android** (`android/app/build.gradle`):

```gradle
project.ext.react = [
  enableHermes: true,
]
```

**iOS** (`ios/Podfile`):

```ruby
use_react_native!(
  :hermes_enabled => true
)
```

**New Architecture** (stable in RN 0.74+):

```gradle
# android/gradle.properties
newArchEnabled=true
```

```ruby
# ios/Podfile
ENV['RCT_NEW_ARCH_ENABLED'] = '1'
```

**Benefits:**

- Hermes: faster startup (pre-compiled bytecode), lower memory usage
- New Architecture (Fabric + JSI): eliminates the async bridge — synchronous JS↔native calls
- Reanimated 3 + Gesture Handler run on the UI thread — zero JS involvement during animations

---

### InteractionManager — Never block first frame

```ts
import { InteractionManager } from 'react-native';

// Defer expensive work until after navigation animation completes
useEffect(() => {
  const task = InteractionManager.runAfterInteractions(() => {
    initAnalytics();
    loadRecommendations();
    warmUpCache();
  });
  return () => task.cancel();
}, []);

// In navigation listener
useEffect(() => {
  const unsubscribe = navigation.addListener('transitionEnd', () => {
    InteractionManager.runAfterInteractions(() => {
      fetchSecondaryData();
    });
  });
  return unsubscribe;
}, [navigation]);
```

---

### Avoid the JS Thread During Animations

```ts
// ✗ DON'T — setState during animation = dropped frames
const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
  setScrollY(e.nativeEvent.contentOffset.y); // JS thread → bridge → UI thread
};

// ✓ DO — Reanimated scroll handler runs on UI thread
import {
  useAnimatedScrollHandler,
  useSharedValue,
} from 'react-native-reanimated';

const scrollY = useSharedValue(0);
const scrollHandler = useAnimatedScrollHandler({
  onScroll: event => {
    'worklet'; // runs on UI thread
    scrollY.value = event.contentOffset.y;
  },
});

<Animated.ScrollView onScroll={scrollHandler} scrollEventThrottle={1} />;
```

---

### Reducing Re-renders in React Native

```tsx
// ✓ memo + useCallback for list items
const PostCard = React.memo(({ post, onLike }: PostCardProps) => (
  <View>
    <Text>{post.title}</Text>
    <Pressable onPress={() => onLike(post.id)}>
      <Text>Like</Text>
    </Pressable>
  </View>
));

// ✓ Avoid anonymous style objects — new reference every render
const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 18, fontWeight: '600' },
});
// ✗ style={{ flex: 1, padding: 16 }} — new object every render

// ✓ useWindowDimensions for responsive layouts
import { useWindowDimensions } from 'react-native';
const { width } = useWindowDimensions();
```

---

## 8. FlatList & Virtualized Lists

> FlatList is the most misconfigured component in every React Native codebase.

---

### FlatList — Production configuration

```tsx
const ITEM_HEIGHT = 120;

const renderItem = useCallback(
  ({ item }: { item: Post }) => <PostCard post={item} />,
  [],
);

const keyExtractor = useCallback((item: Post) => item.id, []);

const getItemLayout = useCallback(
  (_: any, index: number) => ({
    length: ITEM_HEIGHT,
    offset: ITEM_HEIGHT * index,
    index,
  }),
  [],
);

<FlatList
  data={posts}
  renderItem={renderItem}
  keyExtractor={keyExtractor}
  getItemLayout={getItemLayout} // skip measurement — massive perf win
  maxToRenderPerBatch={10}
  updateCellsBatchingPeriod={50}
  windowSize={5} // render 2.5 screens above + below
  initialNumToRender={8}
  removeClippedSubviews // unmount off-screen items (Android)
  onEndReachedThreshold={0.5}
  onEndReached={fetchNextPage}
  ListEmptyComponent={<EmptyState />}
  ListFooterComponent={isFetching ? <Spinner /> : null}
  ItemSeparatorComponent={() => <Divider />}
/>;
```

---

### FlashList — 10x faster than FlatList

```tsx
import { FlashList } from '@shopify/flash-list';

// Drop-in replacement — cell recycling like Android RecyclerView
<FlashList
  data={posts}
  renderItem={({ item }) => <PostCard post={item} />}
  estimatedItemSize={120} // only required prop — enables cell recycling
  keyExtractor={item => item.id}
  onEndReachedThreshold={0.5}
  onEndReached={loadMore}
  ListEmptyComponent={<EmptyState />}
/>;
```

> **Use FlashList** for any list with 50+ items. It becomes increasingly faster vs FlatList as list size grows. FlashList recycles cells (like Android RecyclerView) — FlatList destroys and remounts off-screen components.

---

### SectionList — Grouped data

```tsx
const sections = useMemo(
  () =>
    groupBy(contacts, c => c.name[0].toUpperCase()).map(([title, data]) => ({
      title,
      data,
    })),
  [contacts],
);

<SectionList
  sections={sections}
  keyExtractor={item => item.id}
  renderItem={({ item }) => <ContactRow contact={item} />}
  renderSectionHeader={({ section: { title } }) => (
    <Text style={styles.sectionHeader}>{title}</Text>
  )}
  stickySectionHeadersEnabled
  getItemLayout={(_, index) => ({ length: 60, offset: 60 * index, index })}
/>;
```

---

## 9. React Native Images

---

### react-native-fast-image

```tsx
import FastImage from 'react-native-fast-image';

function Avatar({ uri, size = 40 }: { uri: string; size?: number }) {
  return (
    <FastImage
      source={{
        uri,
        priority: FastImage.priority.normal,
        cache: FastImage.cacheControl.immutable,
      }}
      style={{ width: size, height: size, borderRadius: size / 2 }}
      resizeMode={FastImage.resizeMode.cover}
      defaultSource={require('./assets/avatar-placeholder.png')}
    />
  );
}

// Preload images before screen mounts
FastImage.preload([
  { uri: nextScreen.heroImage, priority: FastImage.priority.high },
  { uri: nextScreen.thumbnails[0] },
]);

// Batch preload for entire list
FastImage.preload(upcomingPosts.map(p => ({ uri: p.imageUrl })));
```

---

### Expo Image — Best for Expo projects

```tsx
import { Image } from 'expo-image';

<Image
  source={{ uri: imageUrl }}
  placeholder={{ blurhash: 'LGF5]+Yk^6#M@-5c,1J5@[or[Q6.' }}
  contentFit="cover"
  transition={300}
  cachePolicy="memory-disk"
  style={{ width: 200, height: 200, borderRadius: 8 }}
/>;

// Generate blurhash server-side (never on device)
import { encode } from 'blurhash';
import sharp from 'sharp';

async function getBlurHash(imagePath: string): Promise<string> {
  const { data, info } = await sharp(imagePath)
    .raw()
    .ensureAlpha()
    .resize(32, 32, { fit: 'inside' })
    .toBuffer({ resolveWithObject: true });
  return encode(new Uint8ClampedArray(data), info.width, info.height, 4, 3);
}
```

---

### Image caching strategy

| Cache policy  | When to use                                            |
| ------------- | ------------------------------------------------------ |
| `immutable`   | CDN images with content-hash in URL — never invalidate |
| `web`         | Standard HTTP cache-control headers                    |
| `cacheOnly`   | Offline-first — only serve from cache, fail if missing |
| `memory-disk` | General purpose — fastest reads, persistent storage    |

---

## 10. Animations & Gestures (RN)

---

### Reanimated 3 — UI thread animations

```tsx
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';

// Entry animation
function AnimatedCard({ visible }: { visible: boolean }) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);

  useEffect(() => {
    opacity.value = withTiming(visible ? 1 : 0, { duration: 250 });
    translateY.value = withSpring(visible ? 0 : 20, {
      damping: 15,
      stiffness: 150,
    });
  }, [visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return <Animated.View style={[styles.card, animatedStyle]} />;
}

// Scroll-driven header collapse
function CollapsibleHeader({ scrollY }: { scrollY: SharedValue<number> }) {
  const headerStyle = useAnimatedStyle(() => ({
    height: interpolate(
      scrollY.value,
      [0, 100],
      [120, 60],
      Extrapolation.CLAMP,
    ),
    opacity: interpolate(scrollY.value, [0, 60], [1, 0.8], Extrapolation.CLAMP),
  }));
  return <Animated.View style={[styles.header, headerStyle]} />;
}
```

---

### Gesture Handler + Reanimated — Draggable

```tsx
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';

function DraggableCard({ onDismiss }: { onDismiss: () => void }) {
  const x = useSharedValue(0);
  const y = useSharedValue(0);
  const startX = useSharedValue(0);
  const startY = useSharedValue(0);
  const scale = useSharedValue(1);

  const panGesture = Gesture.Pan()
    .onStart(() => {
      startX.value = x.value;
      startY.value = y.value;
      scale.value = withSpring(0.97);
    })
    .onUpdate(e => {
      x.value = startX.value + e.translationX;
      y.value = startY.value + e.translationY;
    })
    .onEnd(e => {
      scale.value = withSpring(1);
      if (Math.abs(e.velocityX) > 800) {
        runOnJS(onDismiss)(); // call JS function from worklet
      } else {
        x.value = withSpring(0);
        y.value = withSpring(0);
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: x.value },
      { translateY: y.value },
      { scale: scale.value },
    ],
  }));

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={[styles.card, animatedStyle]} />
    </GestureDetector>
  );
}
```

> **Everything runs on the UI thread.** No JS involvement during gesture — zero jank even if the JS thread is busy processing data.

---

### Skeleton shimmer animation (RN)

```tsx
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

function SkeletonRow() {
  const translateX = useSharedValue(-200);

  useEffect(() => {
    translateX.value = withRepeat(
      withTiming(200, { duration: 1200 }),
      -1, // infinite
      false,
    );
  }, []);

  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <View style={styles.skeletonContainer}>
      <Animated.View style={[StyleSheet.absoluteFill, shimmerStyle]}>
        <LinearGradient
          colors={['transparent', 'rgba(255,255,255,0.4)', 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    </View>
  );
}
```

---

## 11. Architecture Patterns

---

### Compound Component pattern

```tsx
const ModalContext = createContext<{ onClose: () => void } | null>(null);

function Modal({ children, onClose }: ModalProps) {
  return (
    <ModalContext.Provider value={{ onClose }}>
      <div className="modal-backdrop" onClick={onClose}>
        <div className="modal-panel" onClick={e => e.stopPropagation()}>
          {children}
        </div>
      </div>
    </ModalContext.Provider>
  );
}

Modal.Header = function ModalHeader({ title }: { title: string }) {
  const { onClose } = useContext(ModalContext)!;
  return (
    <div className="modal-header">
      <h2>{title}</h2>
      <button onClick={onClose}>×</button>
    </div>
  );
};
Modal.Body = ({ children }: { children: React.ReactNode }) => (
  <div className="modal-body">{children}</div>
);
Modal.Footer = ({ children }: { children: React.ReactNode }) => (
  <div className="modal-footer">{children}</div>
);

// Consumer controls the structure
<Modal onClose={handleClose}>
  <Modal.Header title="Confirm Delete" />
  <Modal.Body>This action cannot be undone.</Modal.Body>
  <Modal.Footer>
    <Button variant="ghost" onClick={handleClose}>
      Cancel
    </Button>
    <Button variant="danger" onClick={handleDelete}>
      Delete
    </Button>
  </Modal.Footer>
</Modal>;
```

---

### Custom hook extraction

All stateful logic belongs in custom hooks. Component bodies should be near-pure render.

```ts
// Reusable debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState<T>(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

// Intersection observer hook
function useIntersectionObserver(
  ref: RefObject<Element>,
  options: IntersectionObserverInit = {},
): boolean {
  const [isIntersecting, setIntersecting] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => setIntersecting(entry.isIntersecting),
      options,
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [ref]);
  return isIntersecting;
}

// Local storage hook with SSR safety
function useLocalStorage<T>(key: string, initial: T): [T, (v: T) => void] {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initial;
    try {
      return JSON.parse(localStorage.getItem(key) ?? '') ?? initial;
    } catch {
      return initial;
    }
  });

  const set = useCallback(
    (v: T) => {
      setValue(v);
      localStorage.setItem(key, JSON.stringify(v));
    },
    [key],
  );

  return [value, set];
}
```

---

### Error Boundary pattern

```tsx
class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    logError(error, { componentStack: info.componentStack });
  }

  render() {
    if (this.state.error) {
      return this.props.fallback ? (
        this.props.fallback(this.state.error)
      ) : (
        <DefaultErrorScreen error={this.state.error} />
      );
    }
    return this.props.children;
  }
}

// Always pair with Suspense
<ErrorBoundary fallback={err => <ErrorScreen error={err} />}>
  <Suspense fallback={<PageSkeleton />}>
    <LazyLoadedPage />
  </Suspense>
</ErrorBoundary>;
```

---

### Render props & headless components

```tsx
function Disclosure({
  children,
}: {
  children: (props: DisclosureProps) => React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return children({
    open,
    toggle: () => setOpen(o => !o),
    getButtonProps: () => ({
      onClick: () => setOpen(o => !o),
      'aria-expanded': open,
    }),
    getPanelProps: () => ({ hidden: !open, 'aria-hidden': !open }),
  });
}

<Disclosure>
  {({ getButtonProps, getPanelProps }) => (
    <div>
      <button {...getButtonProps()}>Toggle FAQ</button>
      <p {...getPanelProps()}>Answer text here.</p>
    </div>
  )}
</Disclosure>;
```

---

### Feature flags pattern

```ts
const FEATURES = {
  newCheckout: process.env.NEXT_PUBLIC_NEW_CHECKOUT === 'true',
  aiRecommendations: process.env.NEXT_PUBLIC_AI_RECS === 'true',
} as const;

type Feature = keyof typeof FEATURES;

function useFeatureFlag(feature: Feature): boolean {
  return FEATURES[feature] ?? false;
}
```

---

## 12. Production Audit Checklist

### React Web

- [ ] Bundle analyzed — no duplicate dependencies (`webpack-bundle-analyzer` / `next bundle-analyzer`)
- [ ] All routes are code-split (`React.lazy` + `Suspense`)
- [ ] LCP image has `priority` prop or `<link rel="preload">`
- [ ] No cumulative layout shift — skeletons match real content dimensions exactly
- [ ] Server state lives in TanStack Query, not Redux/Context
- [ ] `React.memo` paired with `useCallback` — not used independently
- [ ] No anonymous objects or functions in JSX props without memoization
- [ ] Every `useEffect` with subscriptions/timers has a cleanup return
- [ ] React DevTools Profiler — no unexpected re-renders in hot paths
- [ ] Lighthouse Performance score >= 90 in production build
- [ ] Core Web Vitals: LCP < 2.5s, CLS < 0.1, FID/INP < 200ms

---

### React Native

- [ ] Hermes enabled on both Android and iOS
- [ ] New Architecture enabled (RN 0.74+)
- [ ] FlashList used for all lists with 50+ items
- [ ] `renderItem` wrapped in `useCallback`
- [ ] `getItemLayout` provided for fixed-height lists
- [ ] All animations running on UI thread (Reanimated 3 — `Animated.Value` avoided)
- [ ] `InteractionManager.runAfterInteractions` for post-navigation work
- [ ] `FastImage` or `expo-image` for all remote images
- [ ] JS FPS and UI FPS both >= 58fps in Flipper profiler
- [ ] No heavy synchronous operations on JS thread during animation
- [ ] App startup time measured — cold start < 2s on mid-range device

---

### Universal (React Web + React Native)

- [ ] State colocated — lives as close to its consumer as possible
- [ ] No prop drilling deeper than 2 levels without composition or context
- [ ] `key` prop is ID-based — never array index for dynamic lists
- [ ] Custom hooks for all stateful logic — zero logic in component bodies
- [ ] TypeScript strict mode — no implicit `any`, no non-null assertions (`!`)
- [ ] Error boundaries wrapping every async/lazy boundary
- [ ] No inline object/array literals in JSX without `useMemo`
- [ ] `useEffect` dependency arrays are complete and accurate (ESLint `exhaustive-deps`)
- [ ] All async operations handle loading, error, and empty states
- [ ] No console errors or warnings in development mode

---

## Quick Reference — Hook Decision Matrix

| Scenario                           | Hook                                   |
| ---------------------------------- | -------------------------------------- |
| Simple local state                 | `useState`                             |
| State with transitions/rules       | `useReducer`                           |
| Expensive computation              | `useMemo`                              |
| Stable function for memo'd child   | `useCallback`                          |
| DOM ref / persistent mutable value | `useRef`                               |
| External system sync               | `useEffect`                            |
| DOM measurement before paint       | `useLayoutEffect`                      |
| Low-priority state update          | `useDeferredValue`                     |
| Non-urgent state transition        | `useTransition`                        |
| Global/shared state access         | `useContext` (small) / Zustand (large) |
| Server data                        | TanStack Query `useQuery`              |
| Server mutations                   | TanStack Query `useMutation`           |
| Infinite scroll                    | TanStack Query `useInfiniteQuery`      |

---

## Performance Impact Summary

| Technique                        | Typical gain                        | Effort            |
| -------------------------------- | ----------------------------------- | ----------------- |
| FlashList (vs FlatList)          | 10x fewer cell creations            | Low               |
| Hermes + New Architecture        | 20–40% faster startup               | Low (config only) |
| Reanimated 3 (vs JS animations)  | 60fps vs 20fps during heavy JS      | Medium            |
| TanStack Query (vs manual fetch) | Eliminates 60–80% of loading states | Medium            |
| Code splitting all routes        | 40–70% smaller initial bundle       | Low               |
| Image prefetch + blurhash        | Eliminates LCP loading delay        | Medium            |
| Memoization (correct pairs)      | Eliminates wasted re-renders        | Medium            |
| InteractionManager               | Smooth navigation transitions       | Low               |

---

_Applies to React 18+, React Native 0.74+, Next.js 14+._
