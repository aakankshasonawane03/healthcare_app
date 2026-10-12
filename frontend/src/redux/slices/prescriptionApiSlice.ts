import { apiSlice } from "./apiSlice";

export interface Medicine {
    medicine_name: string;
    dosage: string;
    frequency: string;
    duration: string;
}

export interface Prescription {
    id: string;
    patient_id: string;
    doctor_id: string;
    medicines: Medicine[];
    notes?: string;
    prescription_date: string;
}

export const prescriptionApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getPrescriptions: builder.query<Prescription[], void>({
            query: () => ({ url: "/api/prescriptions/listprescriptions" }),
            transformResponse: (r: any) => r.data ?? [],
            providesTags: ["Prescription"],
        }),
    }),
});

export const { useGetPrescriptionsQuery } = prescriptionApi;
