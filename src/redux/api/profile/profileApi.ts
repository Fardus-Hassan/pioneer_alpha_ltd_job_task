import { apiSlice } from "../apiSlice";

export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  address: string;
  contact_number: string;
  birthday: string;
  profile_image: string | null;
  bio: string;
}

export interface UpdateUserPayload {
  first_name?: string;
  last_name?: string;
  address?: string;
  contact_number?: string;
  birthday?: string;
  bio?: string;
  profile_image?: File | null;
}

export const profileApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getUser: builder.query<User, void>({
      query: () => "users/me/",
      providesTags: ["Users"],
    }),
    updateUser: builder.mutation<User, UpdateUserPayload>({
      query: (data) => {
        const formData = new FormData();
        Object.entries(data).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            formData.append(key, value as any);
          }
        });
        return {
          url: "users/me/",
          method: "PATCH",
          body: formData,
        };
      },
      invalidatesTags: ["Users"],
    }),
  }),
});

export const { useGetUserQuery, useUpdateUserMutation } = profileApi;
