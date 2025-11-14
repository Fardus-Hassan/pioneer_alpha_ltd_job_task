import { apiSlice } from "../apiSlice";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  access: string;
  refresh: string;
}

export interface SignupPayload {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
}

export interface ChangePasswordPayload {
  old_password: string;
  new_password: string;
}

export interface ErrorResponse {
  detail: string;
}

export const authApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, LoginPayload>({
      query: (data) => ({
        url: "auth/login/",
        method: "POST",
        body: data,
      }),
      transformErrorResponse: (response: any) => response.data as ErrorResponse,
    }),

    signup: builder.mutation<any, SignupPayload>({
      query: (data) => ({
        url: "users/signup/",
        method: "POST",
        body: data,
      }),
      transformErrorResponse: (response: any) => response.data as ErrorResponse,
    }),

    changePassword: builder.mutation<any, ChangePasswordPayload>({
      query: (data) => ({
        url: "users/change-password/",
        method: "POST",
        body: data,
      }),
      transformErrorResponse: (response: any) => response.data as ErrorResponse,
    }),
  }),
});

export const { useLoginMutation, useSignupMutation, useChangePasswordMutation } = authApi;
