import { apiSlice } from "./apiSlice";

const URL = "/api/patients";

export interface Patient {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    gender: string;
    date_of_birth: string;
    blood_group: string;
    address: string;
    emergency_contact: string;
    is_active: boolean;
    created_at?: string;
}

export interface PatientInput {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    gender: string;
    date_of_birth: string; // ISO date-time
    blood_group: string;
    address: string;
    emergency_contact: string;
}

export const patientApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getAllPatients: builder.query<Patient[], void>({
            query: () => ({ url: `${URL}/listpatients` }),
            transformResponse: (r: any) => r.data ?? [],
            providesTags: ["Patient"],
        }),

        createPatient: builder.mutation<Patient, PatientInput>({
            query: (body) => ({ url: `${URL}/createpatient`, method: "POST", body }),
            transformResponse: (r: any) => r.data,
            invalidatesTags: ["Patient", "Admin"],
        }),

        updatePatient: builder.mutation<Patient, { id: string } & Partial<PatientInput> & { is_active: boolean }>({
            query: ({ id, ...body }) => ({ url: `${URL}/updatepatient/${id}`, method: "PUT", body }),
            transformResponse: (r: any) => r.data,
            invalidatesTags: ["Patient", "Admin"],
        }),

        deletePatient: builder.mutation<any, string>({
            query: (id) => ({ url: `${URL}/deletepatient/${id}`, method: "DELETE" }),
            invalidatesTags: ["Patient", "Admin"],
        }),
    }),
});

export const {
    useGetAllPatientsQuery,
    useCreatePatientMutation,
    useUpdatePatientMutation,
    useDeletePatientMutation,
} = patientApi;
