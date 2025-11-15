import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { isTokenExpired, logout } from "@/utils/auth";

const baseQuery = fetchBaseQuery({
  baseUrl: "https://todo-app.pioneeralpha.com/api/",
  prepareHeaders: (headers) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      // Check if token is expired before using it
      if (isTokenExpired(token)) {
        logout();
        return headers;
      }
      headers.set("Authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

const baseQueryWithReauth = async (args: any, api: any, extraOptions: any) => {
  let result = await baseQuery(args, api, extraOptions);
  
  // If we get a 401, token is invalid/expired - logout
  if (result.error && result.error.status === 401) {
    logout();
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
