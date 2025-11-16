import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { isTokenExpired, logout } from "@/utils/auth";

const baseQuery = fetchBaseQuery({
  baseUrl: "https://todo-app.pioneeralpha.com/api/",
  prepareHeaders: (headers) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      if (!isTokenExpired(token)) {
        headers.set("Authorization", `Bearer ${token}`);
      }
    }
    return headers;
  },
});

const baseQueryWithReauth = async (args: any, api: any, extraOptions: any) => {
  let result = await baseQuery(args, api, extraOptions);
  
  if (result.error && result.error.status === 401) {
    const url = typeof args === 'string' ? args : args?.url || '';

    const isAuthEndpoint = 
      url.includes('auth/login') || 
      url.includes('users/signup') ||
      url === 'auth/login/' ||
      url === 'users/signup/';
    
    const isOnAuthPage = typeof window !== 'undefined' && 
      (window.location.pathname === '/login' || window.location.pathname === '/register');
    
    if (typeof window !== 'undefined') {
      console.log('401 Error - URL:', url, 'isAuthEndpoint:', isAuthEndpoint, 'isOnAuthPage:', isOnAuthPage, 'pathname:', window.location.pathname);
    }
    
    if (!isAuthEndpoint && !isOnAuthPage) {
      logout();
    } else {
      console.log('Skipping logout - auth endpoint or on auth page');
    }
  }
  
  return result;
};

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,

  tagTypes: [
    "Users",
    "Todos"
  ],

  endpoints: () => ({}),
});
