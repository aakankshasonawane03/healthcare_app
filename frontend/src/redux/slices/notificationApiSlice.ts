import { apiSlice } from "./apiSlice";

export const notificationApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getNotifications: builder.query<any[], void>({
            query: () => ({ url: "/api/notifications/getnotifications" }),
            transformResponse: (r: any) => r?.data ?? r?.notifications ?? [],
        }),
    }),
});

export const { useGetNotificationsQuery } = notificationApi;
