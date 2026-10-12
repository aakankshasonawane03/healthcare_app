import { apiSlice } from "./apiSlice";

const URL = "/api/medicalrecords";

export interface MedicalRecord {
    id: string;
    patient_id: string;
    doctor_id: string;
    diagnosis?: string;
    symptoms?: string;
    treatment?: string;
    notes?: string;
    record_date: string;
}

export interface MedicalRecordInput {
    patient_id: string;
    doctor_id: string;
    diagnosis: string;
    symptoms: string;
    treatment: string;
    notes: string;
}

export const medicalRecordApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getMedicalRecords: builder.query<MedicalRecord[], void>({
            query: () => ({ url: `${URL}/listschedule` }), // (sic) route is named listschedule on the backend
            transformResponse: (r: any) => r.data ?? [],
            providesTags: ["Record"],
        }),

        createMedicalRecord: builder.mutation<MedicalRecord, MedicalRecordInput>({
            query: (body) => ({ url: `${URL}/createschedule`, method: "POST", body }),
            transformResponse: (r: any) => r.data,
            invalidatesTags: ["Record"],
        }),

        deleteMedicalRecord: builder.mutation<any, string>({
            query: (id) => ({ url: `${URL}/delete/${id}`, method: "DELETE" }),
            invalidatesTags: ["Record"],
        }),
    }),
});

export const {
    useGetMedicalRecordsQuery,
    useCreateMedicalRecordMutation,
    useDeleteMedicalRecordMutation,
} = medicalRecordApi;
