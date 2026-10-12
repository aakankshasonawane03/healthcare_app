import { apiSlice } from "./apiSlice";

const AUTH = "/api/auth";

export interface LoginResponse {
    success: boolean;
    access_token: string;
    refresh_token: string;
    user: { id: string; name: string; email: string; role: string; is_active: boolean };
}

export const authApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        login: builder.mutation<LoginResponse, { email: string; password: string }>({
            query: (body) => ({ url: `${AUTH}/login`, method: "POST", body }),
        }),

        register: builder.mutation<any, { name: string; email: string; password: string; role: string }>({
            query: (body) => ({ url: `${AUTH}/register`, method: "POST", body }),
        }),

        logout: builder.mutation<any, { refresh_token: string }>({
            query: (body) => ({ url: `${AUTH}/logout`, method: "POST", body }),
        }),

        getMe: builder.query<any, void>({
            query: () => ({ url: `${AUTH}/me` }),
            transformResponse: (r: any) => r.data,
        }),
    }),
});

export const { useLoginMutation, useRegisterMutation, useLogoutMutation, useGetMeQuery } = authApi;
