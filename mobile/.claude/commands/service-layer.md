# Service Layer & API Endpoints — Implementation Guide

> Follow this every time you add a new API domain, endpoint, or data-fetching hook.
> **Rule:** Components → Hooks → Services → API Client. Never skip a layer.

---

## Project Structure

```
src/
├── services/
│   ├── api/
│   │   ├── client.ts          ← Axios instance + interceptors (DO NOT touch per feature)
│   │   ├── endpoints.ts       ← ALL endpoint constants (always add here first)
│   │   ├── auth.service.ts
│   │   ├── user.service.ts
│   │   ├── events.service.ts
│   │   └── <domain>.service.ts   ← one file per domain
│   └── storage/
│       └── tokenStorage.ts    ← AsyncStorage token management
├── hooks/
│   ├── useUser.ts
│   ├── useEvents.ts
│   └── use<Domain>.ts         ← one file per domain
└── types/
    ├── auth.types.ts
    ├── user.types.ts
    └── <domain>.types.ts
```

---

## Step 1 — Add Endpoint Constants

**Always add to `src/services/api/endpoints.ts` first.**

```ts
export const ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER_START: '/auth/register/start',
    REGISTER_VERIFY: '/auth/register/verify',
    REFRESH: '/auth/refresh',
    FORGOT_PASSWORD: '/auth/password/forgot',
    RESET_PASSWORD: '/auth/password/reset',
    VERIFY_OTP: '/auth/verify-otp',
    RESEND_OTP: '/auth/resend-otp',
  },
  USER: {
    PROFILE: '/me/profile',
  },
  EVENTS: {
    LIST: '/events',
    DETAIL: (slug: string) => `/events/${slug}`,
    SEARCH: (query: string, page = 1, limit = 10) =>
      `/events?page=${page}&limit=${limit}&search=${encodeURIComponent(query)}`,
  },
  // Add new domains here
} as const;
```

---

## Step 2 — Create the Service

One file per domain in `src/services/api/`. Pure API logic only — no state, no UI.

```ts
// src/services/api/product.service.ts
import apiClient from './client';
import { ENDPOINTS } from './endpoints';
import { Product, CreateProductPayload } from '@/types/product.types';

export const productService = {
  list: async (): Promise<Product[]> => {
    const { data } = await apiClient.get<Product[]>(ENDPOINTS.PRODUCTS.LIST);
    return data;
  },

  detail: async (id: string): Promise<Product> => {
    const { data } = await apiClient.get<Product>(
      ENDPOINTS.PRODUCTS.DETAIL(id),
    );
    return data;
  },

  create: async (payload: CreateProductPayload): Promise<Product> => {
    const { data } = await apiClient.post<Product>(
      ENDPOINTS.PRODUCTS.CREATE,
      payload,
    );
    return data;
  },

  update: async (
    id: string,
    payload: Partial<CreateProductPayload>,
  ): Promise<Product> => {
    const { data } = await apiClient.put<Product>(
      ENDPOINTS.PRODUCTS.UPDATE(id),
      payload,
    );
    return data;
  },
};
```

**Rules for services:**

- Import `apiClient` from `./client` — never create a local fetch/axios instance
- Import endpoints from `./endpoints` — never hardcode strings
- Never import from React, hooks, or stores
- No `console.log` in production code — remove before commit
- Let errors bubble — the hook layer handles them

---

## Step 3 — Create the Hook

One file per domain in `src/hooks/`. Bridge between service and UI via TanStack Query.

```ts
// src/hooks/useProduct.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productService } from '@services/api/product.service';
import { getErrorMessage } from '@utils/errorHandler';
import { showToast } from '@utils/toast';

// ── Query keys — always define as a factory object ────────────────────────────
export const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  detail: (id: string) => [...productKeys.all, 'detail', id] as const,
};

// ── Queries ───────────────────────────────────────────────────────────────────

export const useProducts = () =>
  useQuery({
    queryKey: productKeys.lists(),
    queryFn: productService.list,
    staleTime: 5 * 60 * 1000,
  });

export const useProduct = (id: string) =>
  useQuery({
    queryKey: productKeys.detail(id),
    queryFn: () => productService.detail(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000,
  });

// ── Mutations ─────────────────────────────────────────────────────────────────

export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: productService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
    },
    onError: error => {
      showToast(getErrorMessage(error), 'error');
    },
  });
};

export const useUpdateProduct = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Parameters<typeof productService.update>[1]) =>
      productService.update(id, payload),
    onMutate: async payload => {
      await queryClient.cancelQueries({ queryKey: productKeys.detail(id) });
      const snapshot = queryClient.getQueryData(productKeys.detail(id));
      queryClient.setQueryData(productKeys.detail(id), (old: any) => ({
        ...old,
        ...payload,
      }));
      return { snapshot };
    },
    onError: (_err, _vars, ctx) => {
      queryClient.setQueryData(productKeys.detail(id), ctx?.snapshot);
      showToast(getErrorMessage(_err), 'error');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
    },
  });
};
```

**Rules for hooks:**

- Always define a `<domain>Keys` factory object for cache key consistency
- `staleTime` minimum 5 min for read-heavy data, shorter for real-time
- Mutations must handle `onError` — call `getErrorMessage` + `showToast`
- Optimistic updates: snapshot → apply → rollback on error → invalidate on settled
- Export all hooks from `src/hooks/index.ts`

---

## Step 4 — Define Types

```ts
// src/types/product.types.ts
export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  inStock: boolean;
}

export interface CreateProductPayload {
  name: string;
  price: number;
  category: string;
}

// Wrap all API list responses in a standard envelope
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}
```

---

## Step 5 — Use in Component

```tsx
// screens/ProductScreen.tsx
import { useProducts, useCreateProduct } from '@hooks/useProduct';
import { getErrorMessage } from '@utils/errorHandler';

const ProductScreen = () => {
  const { data: products, isLoading, isError, error } = useProducts();
  const { mutate: createProduct, isPending } = useCreateProduct();

  if (isLoading) return <Loader />;
  if (isError) return <ErrorView message={getErrorMessage(error)} />;

  return (
    <AppList
      data={products ?? []}
      renderItem={({ item }) => <ProductRow product={item} />}
    />
  );
};
```

---

## Error Handling Reference

Use `getErrorMessage` from `@utils/errorHandler` — already handles:

- `AxiosError` with API error body
- HTTP status code mapping (400, 401, 403, 404, 409, 429, 500, 503)
- Network errors and timeouts

```ts
import { getErrorMessage, getAuthErrorMessage } from '@utils/errorHandler';

// In hook onError
onError: error => {
  showToast(getErrorMessage(error), 'error');
};

// In auth flows
onError: error => {
  showToast(getAuthErrorMessage(error, 'login'), 'error');
};
```

---

## Token & Auth

- Tokens are managed by `tokenStorage` in `src/services/storage/tokenStorage.ts`
- The Axios client in `client.ts` automatically attaches `Authorization: Bearer <token>` via interceptor
- Token refresh (401 → refresh → retry) is handled by the response interceptor — **do not replicate in services**
- Session expiry fires `sessionEvents.emitSessionExpired()` — handled by `AuthContext`

---

## Checklist — Before Committing a New Service/Hook

- [ ] Endpoint string added to `ENDPOINTS` in `endpoints.ts` — not hardcoded in service
- [ ] Service imports `apiClient` from `./client` — no local fetch/axios instance
- [ ] No `console.log` statements in service files
- [ ] Hook defines a `<domain>Keys` factory object
- [ ] Mutations have `onError` calling `getErrorMessage` + `showToast`
- [ ] Hook exported from `src/hooks/index.ts`
- [ ] Types defined in `src/types/<domain>.types.ts`
- [ ] Component uses the hook — not the service directly
