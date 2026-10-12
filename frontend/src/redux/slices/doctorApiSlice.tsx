import { apiSlice } from "./apiSlice";

const URL = "/api/doctors";

export interface Doctor {
    id: string;
    name: string;
    email: string;
    phone: string;
    specialization: string;
    qualification: string;
    experience: number;
    consultation_fee: number;
    is_active: boolean;
    created_at?: string;
    updated_at?: string;
}

export interface DoctorInput {
    name: string;
    email: string;
    phone: string;
    specialization: string;
    qualification: string;
    experience: number;
    consultation_fee: number;
}

export const doctorApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getAllDoctors: builder.query<Doctor[], void>({
            query: () => ({ url: `${URL}/listdoctors` }),
            transformResponse: (r: any) => r.data ?? [],
            providesTags: ["Doctor"],
        }),

        createDoctor: builder.mutation<Doctor, DoctorInput>({
            query: (body) => ({ url: `${URL}/createdoctor`, method: "POST", body }),
            transformResponse: (r: any) => r.data,
            invalidatesTags: ["Doctor", "Admin"],
        }),

        // NOTE: backend overwrites is_active on every update, so always send it.
        updateDoctor: builder.mutation<Doctor, { id: string } & Partial<DoctorInput> & { is_active: boolean }>({
            query: ({ id, ...body }) => ({ url: `${URL}/updatedoctor/${id}`, method: "PUT", body }),
            transformResponse: (r: any) => r.data,
            invalidatesTags: ["Doctor", "Admin"],
        }),

        deleteDoctor: builder.mutation<any, string>({
            query: (id) => ({ url: `${URL}/deletedoctor/${id}`, method: "DELETE" }),
            invalidatesTags: ["Doctor", "Admin"],
        }),
    }),
});

export const {
    useGetAllDoctorsQuery,
    useCreateDoctorMutation,
    useUpdateDoctorMutation,
    useDeleteDoctorMutation,
} = doctorApi;
