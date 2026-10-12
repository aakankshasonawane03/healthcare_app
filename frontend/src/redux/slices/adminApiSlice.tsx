import { apiSlice } from "./apiSlice";

export interface AdminDashboard {
    total_users: number;
    active_users: number;
    total_doctors: number;
    active_doctors: number;
    total_patients: number;
    active_patients: number;
    total_clinics: number;
    total_appointments: number;
    pending_appointments: number;
    completed_appointments: number;
}

export interface UserSummary {
    id: string;
    name: string;
    email: string;
    role: string;
    is_active: boolean;
    created_at: string;
}

export const adminApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getAdminDashboard: builder.query<AdminDashboard, void>({
            query: () => ({ url: "/api/admin/dashboard" }),
            transformResponse: (r: any) => r.data,
            providesTags: ["Admin"],
        }),

        getUsers: builder.query<UserSummary[], void>({
            query: () => ({ url: "/api/admin/users" }),
            transformResponse: (r: any) => r.data ?? [],
            providesTags: ["User"],
        }),

        updateUserStatus: builder.mutation<any, { id: string; is_active: boolean }>({
            query: ({ id, is_active }) => ({
                url: `/api/admin/users/${id}/status`,
                method: "PUT",
                body: { is_active },
            }),
            invalidatesTags: ["User", "Admin"],
        }),
    }),
});

export const {
    useGetAdminDashboardQuery,
    useGetUsersQuery,
    useUpdateUserStatusMutation,
} = adminApi;
