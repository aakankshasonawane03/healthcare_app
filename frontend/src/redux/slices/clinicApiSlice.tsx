import { apiSlice } from "./apiSlice";

export interface Clinic {
    id: string;
    name: string;
    address: string;
    phone: string;
    city?: string;
    state?: string;
    email?: string;
    is_active?: boolean;
    created_at?: string;
}

export const clinicApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        // readable by every logged-in user
        getClinics: builder.query<Clinic[], void>({
            query: () => ({ url: "/api/clinics/list" }),
            transformResponse: (r: any) => r.data ?? [],
            providesTags: ["Clinic"],
        }),

        // admin only
        createClinic: builder.mutation<any, { name: string; address: string; phone: string }>({
            query: (body) => ({ url: "/api/admin/clinics", method: "POST", body }),
            invalidatesTags: ["Clinic", "Admin"],
        }),

        updateClinic: builder.mutation<any, { id: string; name?: string; address?: string; phone?: string }>({
            query: ({ id, ...body }) => ({ url: `/api/admin/clinics/${id}`, method: "PUT", body }),
            invalidatesTags: ["Clinic", "Admin"],
        }),

        deleteClinic: builder.mutation<any, string>({
            query: (id) => ({ url: `/api/admin/clinics/${id}`, method: "DELETE" }),
            invalidatesTags: ["Clinic", "Admin"],
        }),
    }),
});

export const {
    useGetClinicsQuery,
    useCreateClinicMutation,
    useUpdateClinicMutation,
    useDeleteClinicMutation,
} = clinicApi;
