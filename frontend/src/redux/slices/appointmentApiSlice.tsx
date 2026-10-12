import { apiSlice } from "./apiSlice";

const URL = "/api/appointments";

export type AppointmentStatus = "Booked" | "Confirmed" | "Completed" | "Cancelled";

export interface Appointment {
    id: string;
    doctor_id: string;
    patient_id: string;
    appointment_date: string;
    appointment_time: string;
    reason: string;
    status: string;
    created_at?: string;
}

export interface AppointmentInput {
    doctor_id: string;
    patient_id: string;
    appointment_date: string; // ISO date-time
    appointment_time: string; // HH:MM
    reason: string;
}

export const appointmentApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getAppointments: builder.query<Appointment[], void>({
            query: () => ({ url: `${URL}/list` }),
            transformResponse: (r: any) => r.data ?? [],
            providesTags: ["Appointment"],
        }),

        createAppointment: builder.mutation<Appointment, AppointmentInput>({
            query: (body) => ({ url: `${URL}/createappointment`, method: "POST", body }),
            transformResponse: (r: any) => r.data,
            invalidatesTags: ["Appointment", "Admin"],
        }),

        updateAppointment: builder.mutation<Appointment, { id: string } & Partial<AppointmentInput> & { status?: string }>({
            query: ({ id, ...body }) => ({ url: `${URL}/update/${id}`, method: "PUT", body }),
            transformResponse: (r: any) => r.data,
            invalidatesTags: ["Appointment", "Admin"],
        }),

        deleteAppointment: builder.mutation<any, string>({
            query: (id) => ({ url: `${URL}/delete/${id}`, method: "DELETE" }),
            invalidatesTags: ["Appointment", "Admin"],
        }),
    }),
});

export const {
    useGetAppointmentsQuery,
    useCreateAppointmentMutation,
    useUpdateAppointmentMutation,
    useDeleteAppointmentMutation,
} = appointmentApi;
