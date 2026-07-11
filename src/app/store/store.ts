import { configureStore } from "@reduxjs/toolkit";
import { baseProtectedApi } from "@/app/store/api/protectedAPI/baseProtectedApi";
import { basePublicApi } from "@/app/store/api/publicApi/basePublicApi";
import toasterReducer from "@/app/store/slices/toasterSlice";
import languageReducer from "./slices/languageSlice";
import authReducer from "./slices/authSlice";
import routeLoaderReducer from "./slices/routeLoaderSlice";
import themeReducer from "./slices/themeSlice";
export const store = configureStore({
  reducer: {
    auth: authReducer,
    toasterGlobal: toasterReducer,
    language: languageReducer,
    routeLoader: routeLoaderReducer,
    theme: themeReducer,

    // ✅ RTK Query reducers
    [basePublicApi.reducerPath]: basePublicApi.reducer,
    [baseProtectedApi.reducerPath]: baseProtectedApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      basePublicApi.middleware,
      baseProtectedApi.middleware,
    ),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
