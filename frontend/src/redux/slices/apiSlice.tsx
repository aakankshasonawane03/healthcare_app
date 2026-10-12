import {
    BaseQueryFn,
    FetchArgs,
    FetchBaseQueryError,
    createApi,
    fetchBaseQuery,
} from "@reduxjs/toolkit/query/react";
import { API_URL } from "@/lib/api";
import { setLogout, tokenRefreshed } from "./authSlice";

const rawBaseQuery = fetchBaseQuery({
    baseUrl: API_URL,
    prepareHeaders: (headers, { getState }) => {
        const token = (getState() as any).auth?.userInfo?.accessToken;
        if (token) headers.set("Authorization", `Bearer ${token}`);
        return headers;
    },
});

/**
 * Wraps the base query: on a 401 it tries /api/auth/refresh once with the
 * stored refresh token, retries the request, and logs the user out if that fails.
 */
const baseQueryWithReauth: BaseQueryFn<
    string | FetchArgs,
    unknown,
    FetchBaseQueryError
> = async (args, api, extraOptions) => {
    let result = await rawBaseQuery(args, api, extraOptions);

    const url = typeof args === "string" ? args : args.url;
    const isAuthCall = url.includes("/api/auth/");

    if (result.error && result.error.status === 401 && !isAuthCall) {
        const refreshToken = (api.getState() as any).auth?.userInfo?.refreshToken;

        if (refreshToken) {
            const refresh: any = await rawBaseQuery(
                { url: "/api/auth/refresh", method: "POST", body: { refresh_token: refreshToken } },
                api,
                extraOptions
            );

            if (refresh.data?.access_token) {
                api.dispatch(tokenRefreshed(refresh.data.access_token));
                result = await rawBaseQuery(args, api, extraOptions);
            } else {
                api.dispatch(setLogout());
            }
        } else {
            api.dispatch(setLogout());
        }
    }

    return result;
};

export const apiSlice = createApi({
    reducerPath: "api",
    baseQuery: baseQueryWithReauth,
    tagTypes: ["Doctor", "Patient", "Appointment", "Clinic", "Admin", "Record", "Prescription", "User"],
    endpoints: () => ({}),
});
