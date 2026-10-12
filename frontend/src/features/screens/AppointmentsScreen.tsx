import { useEffect, useMemo, useState } from "react";
import { RefreshControl, ScrollView, Text, View } from "react-native";
import { errMsg } from "@/lib/api";
import { apptKey, dateOnly, fullName } from "@/lib/format";
import {
    Appointment,
    useDeleteAppointmentMutation,
    useGetAppointmentsQuery,
    useUpdateAppointmentMutation,
} from "@/redux/slices/appointmentApiSlice";
import { useGetAllDoctorsQuery } from "@/redux/slices/doctorApiSlice";
import { useGetAllPatientsQuery } from "@/redux/slices/patientApiSlice";
import { Badge, Btn, Card, Chips, ConfirmModal, Empty, ErrorBox, Loading, Row, SearchBox, SectionTitle, statusTone, toast } from "@/ui/kit";
import BookingForm from "../BookingForm";
import { ScreenProps, useMyDoctor, useMyPatient } from "../hooks";

const FILTERS = ["All", "Booked", "Confirmed", "Completed", "Cancelled"];

type Pending = { appt: Appointment; action: "Confirmed" | "Completed" | "Cancelled" | "delete" } | null;

export default function AppointmentsScreen({ role, goTo, intent, clearIntent }: ScreenProps) {
    const appts = useGetAppointmentsQuery();
    const doctorsQ = useGetAllDoctorsQuery();
    const patientsQ = useGetAllPatientsQuery();
    const { me: myDoctor } = useMyDoctor();
    const { me: myPatient } = useMyPatient();

    const [updateAppt, { isLoading: updating }] = useUpdateAppointmentMutation();
    const [deleteAppt, { isLoading: deleting }] = useDeleteAppointmentMutation();

    const [filter, setFilter] = useState("All");
    const [query, setQuery] = useState("");
    const [bookOpen, setBookOpen] = useState(false);
    const [editing, setEditing] = useState<Appointment | null>(null);
    const [pending, setPending] = useState<Pending>(null);

    const canBook = role === "PATIENT" || role === "RECEPTION" || role === "ADMIN";
    const canManage = role === "DOCTOR" || role === "RECEPTION" || role === "ADMIN";

    useEffect(() => {
        if (intent === "new" && canBook) {
            setEditing(null);
            setBookOpen(true);
        }
        if (intent) clearIntent?.();
    }, [intent]);

    const doctorName = (id: string) => {
        const d = doctorsQ.data?.find((x) => x.id === id);
        return d ? `Dr. ${d.name}` : "Unknown doctor";
    };
    const patientName = (id: string) => fullName(patientsQ.data?.find((x) => x.id === id)) || "Unknown patient";

    const list = useMemo(() => {
        let rows = [...(appts.data || [])];
        if (role === "DOCTOR") rows = rows.filter((a) => a.doctor_id === myDoctor?.id);
        if (role === "PATIENT") rows = rows.filter((a) => a.patient_id === myPatient?.id);
        if (filter !== "All") rows = rows.filter((a) => a.status === filter);
        const q = query.trim().toLowerCase();
        if (q) {
            rows = rows.filter((a) =>
                `${doctorName(a.doctor_id)} ${patientName(a.patient_id)} ${a.reason} ${a.status}`.toLowerCase().includes(q)
            );
        }
        return rows.sort((a, b) => apptKey(b).localeCompare(apptKey(a)));
    }, [appts.data, doctorsQ.data, patientsQ.data, role, myDoctor?.id, myPatient?.id, filter, query]);

    const loading = appts.isLoading || doctorsQ.isLoading || patientsQ.isLoading;

    const runPending = async () => {
        if (!pending) return;
        try {
            if (pending.action === "delete") {
                await deleteAppt(pending.appt.id).unwrap();
                toast.ok("Appointment deleted");
            } else {
                await updateAppt({ id: pending.appt.id, status: pending.action }).unwrap();
                toast.ok(`Appointment ${pending.action.toLowerCase()}`);
            }
            setPending(null);
        } catch (e) {
            setPending(null);
            toast.err(errMsg(e));
        }
    };

    const needsProfile =
        (role === "PATIENT" && !myPatient && !patientsQ.isLoading) ||
        (role === "DOCTOR" && !myDoctor && !doctorsQ.isLoading);

    return (
        <ScrollView
            contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
            refreshControl={<RefreshControl refreshing={appts.isFetching} onRefresh={appts.refetch} />}
        >
            <SectionTitle
                right={
                    canBook ? (
                        <Btn
                            small
                            title="+ Book"
                            onPress={() => {
                                setEditing(null);
                                setBookOpen(true);
                            }}
                        />
                    ) : null
                }
            >
                Appointments
            </SectionTitle>

            {needsProfile ? (
                <Card>
                    <Text style={{ color: "#92400E", marginBottom: 8 }}>
                        {role === "PATIENT"
                            ? "Complete your patient profile to see and book your appointments."
                            : "Complete your doctor profile to see your appointments."}
                    </Text>
                    <Btn small title="Go to Profile" onPress={() => goTo("profile")} />
                </Card>
            ) : null}

            <SearchBox value={query} onChangeText={setQuery} placeholder="Search by doctor, patient or reason" />
            <Chips options={FILTERS} value={filter} onChange={setFilter} />

            {appts.isError ? <ErrorBox message={errMsg(appts.error)} onRetry={appts.refetch} /> : null}
            {loading ? <Loading /> : null}
            {!loading && !appts.isError && list.length === 0 ? <Empty text="No appointments found." /> : null}

            {list.map((a) => {
                const open = a.status === "Booked" || a.status === "Confirmed";
                return (
                    <Card key={a.id}>
                        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                            <Text style={{ fontWeight: "700", fontSize: 15, color: "#0F172A" }}>
                                {dateOnly(a.appointment_date)} · {a.appointment_time}
                            </Text>
                            <Badge text={a.status} tone={statusTone(a.status) as any} />
                        </View>
                        <Row label="Doctor" value={doctorName(a.doctor_id)} />
                        {role !== "PATIENT" ? <Row label="Patient" value={patientName(a.patient_id)} /> : null}
                        <Row label="Reason" value={a.reason} />

                        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
                            {role === "PATIENT" && open ? (
                                <Btn small variant="danger" title="Cancel" onPress={() => setPending({ appt: a, action: "Cancelled" })} />
                            ) : null}

                            {canManage && a.status === "Booked" ? (
                                <Btn small title="Confirm" onPress={() => setPending({ appt: a, action: "Confirmed" })} />
                            ) : null}
                            {canManage && open ? (
                                <Btn small variant="outline" title="Complete" onPress={() => setPending({ appt: a, action: "Completed" })} />
                            ) : null}
                            {(role === "RECEPTION" || role === "ADMIN") && open ? (
                                <Btn
                                    small
                                    variant="outline"
                                    title="Reschedule"
                                    onPress={() => {
                                        setEditing(a);
                                        setBookOpen(true);
                                    }}
                                />
                            ) : null}
                            {canManage && open ? (
                                <Btn small variant="danger" title="Cancel" onPress={() => setPending({ appt: a, action: "Cancelled" })} />
                            ) : null}
                            {role === "ADMIN" ? (
                                <Btn small variant="ghost" title="Delete" onPress={() => setPending({ appt: a, action: "delete" })} />
                            ) : null}
                        </View>
                    </Card>
                );
            })}

            <BookingForm
                visible={bookOpen}
                onClose={() => setBookOpen(false)}
                role={role}
                editing={editing}
            />

            <ConfirmModal
                visible={!!pending}
                title={pending?.action === "delete" ? "Delete appointment?" : `${pending?.action === "Cancelled" ? "Cancel" : pending?.action === "Completed" ? "Complete" : "Confirm"} appointment?`}
                message={
                    pending?.action === "delete"
                        ? "This permanently removes the appointment."
                        : "The status will be updated for everyone."
                }
                confirmText="Yes"
                danger={pending?.action === "Cancelled" || pending?.action === "delete"}
                loading={updating || deleting}
                onConfirm={runPending}
                onCancel={() => setPending(null)}
            />
        </ScrollView>
    );
}
