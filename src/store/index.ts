import { configureStore } from '@reduxjs/toolkit'
import { clubApi } from './clubApi'

export const store = configureStore({
  reducer: {
    [clubApi.reducerPath]: clubApi.reducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(clubApi.middleware),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
