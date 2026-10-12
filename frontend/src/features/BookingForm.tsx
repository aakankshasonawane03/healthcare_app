import { useEffect, useState } from "react";
import { Text } from "react-native";
import { dateOnly, isValidDate, isValidTime, todayStr, toISO } from "@/lib/format";
import { errMsg } from "@/lib/api";
import {
    Appointment,
    useCreateAppointmentMutation,
    useUpdateAppointmentMutation,
} from "@/redux/slices/appointmentApiSlice";
import { useGetAllDoctorsQuery } from "@/redux/slices/doctorApiSlice";
import { useGetAllPatientsQuery } from "@/redux/slices/patientApiSlice";
import { Field, FormModal, SelectField, toast } from "@/ui/kit";
import { useMyPatient } from "./hooks";

/**
 * Book a new appointment, or (when `editing` is passed) reschedule an existing one.
 * Patients always book for themselves; reception/admin choose the patient.
 */
export default function BookingForm({
    visible,
    onClose,
    role,
    presetDoctorId,
    editing,
}: {
    visible: boolean;
    onClose: () => void;
    role: string;
    presetDoctorId?: string;
    editing?: Appointment | null;
}) {
    const { data: doctors = [] } = useGetAllDoctorsQuery();
    const { data: patients = [] } = useGetAllPatientsQuery();
    const { me: myPatient } = useMyPatient();
    const [createAppt, { isLoading: creating }] = useCreateAppointmentMutation();
    const [updateAppt, { isLoading: updating }] = useUpdateAppointmentMutation();

    const [doctorId, setDoctorId] = useState("");
    const [patientId, setPatientId] = useState("");
    const [date, setDate] = useState(todayStr());
    const [time, setTime] = useState("10:00");
    const [reason, setReason] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        if (!visible) return;
        setError("");
        if (editing) {
            setDoctorId(editing.doctor_id);
            setPatientId(editing.patient_id);
            setDate(dateOnly(editing.appointment_date));
            setTime(editing.appointment_time);
            setReason(editing.reason);
        } else {
            setDoctorId(presetDoctorId || "");
            setPatientId("");
            setDate(todayStr());
            setTime("10:00");
            setReason("");
        }
    }, [visible, editing, presetDoctorId]);

    const isPatient = role === "PATIENT";

    const submit = async () => {
        setError("");
        if (!doctorId) return setError("Please choose a doctor.");
        const pid = isPatient ? myPatient?.id : patientId;
        if (!pid) {
            return setError(
                isPatient
                    ? "Complete your patient profile first (Profile tab) so we know who the appointment is for."
                    : "Please choose a patient."
            );
        }
        if (!isValidDate(date)) return setError("Date must be in YYYY-MM-DD format, e.g. 2026-10-25.");
        if (!editing && date < todayStr()) return setError("Date cannot be in the past.");
        if (!isValidTime(time)) return setError("Time must be 24-hour HH:MM, e.g. 14:30.");
        if (!reason.trim()) return setError("Please enter a reason for the visit.");

        try {
            if (editing) {
                await updateAppt({
                    id: editing.id,
                    appointment_date: toISO(date),
                    appointment_time: time,
                    reason: reason.trim(),
                }).unwrap();
                toast.ok("Appointment rescheduled");
            } else {
                await createAppt({
                    doctor_id: doctorId,
                    patient_id: pid,
                    appointment_date: toISO(date),
                    appointment_time: time,
                    reason: reason.trim(),
                }).unwrap();
                toast.ok("Appointment booked");
            }
            onClose();
        } catch (e) {
            setError(errMsg(e));
        }
    };

    const doctorOptions = doctors
        .filter((d) => d.is_active || d.id === doctorId)
        .map((d) => ({ label: `Dr. ${d.name} — ${d.specialization}`, value: d.id }));

    const patientOptions = patients.map((p) => ({
        label: `${p.first_name} ${p.last_name} (${p.phone})`,
        value: p.id,
    }));

    return (
        <FormModal
            visible={visible}
            title={editing ? "Reschedule appointment" : "Book appointment"}
            onClose={onClose}
            onSubmit={submit}
            submitText={editing ? "Save changes" : "Book"}
            loading={creating || updating}
            error={error}
        >
            {editing ? (
                <Text style={{ color: "#64748B", marginTop: 4 }}>
                    You can change the date, time and reason.
                </Text>
            ) : (
                <>
                    <SelectField
                        label="Doctor"
                        value={doctorId}
                        options={doctorOptions}
                        onChange={setDoctorId}
                        placeholder="Choose a doctor"
                    />
                    {!isPatient ? (
                        <SelectField
                            label="Patient"
                            value={patientId}
                            options={patientOptions}
                            onChange={setPatientId}
                            placeholder="Choose a patient"
                        />
                    ) : null}
                </>
            )}
            <Field label="Date (YYYY-MM-DD)" value={date} onChangeText={setDate} placeholder="2026-10-25" />
            <Field label="Time (24h HH:MM)" value={time} onChangeText={setTime} placeholder="14:30" />
            <Field
                label="Reason for visit"
                value={reason}
                onChangeText={setReason}
                placeholder="e.g. Fever and cough"
                autoCapitalize="sentences"
                multiline
                style={{ height: 80, textAlignVertical: "top", paddingTop: 10 } as any}
            />
        </FormModal>
    );
}
