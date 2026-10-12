import { useMemo } from "react";
import { RefreshControl, ScrollView, Text, View } from "react-native";
import { errMsg } from "@/lib/api";
import { apptKey, dateOnly, todayStr } from "@/lib/format";
import { useSession } from "@/lib/session";
import { useGetAdminDashboardQuery } from "@/redux/slices/adminApiSlice";
import { useGetAppointmentsQuery } from "@/redux/slices/appointmentApiSlice";
import { useGetAllDoctorsQuery } from "@/redux/slices/doctorApiSlice";
import { useGetAllPatientsQuery } from "@/redux/slices/patientApiSlice";
import { Badge, Btn, Card, ErrorBox, Loading, Row, SectionTitle, statusTone } from "@/ui/kit";
import { ScreenProps, useMyDoctor, useMyPatient } from "../hooks";

function Stat({ label, value, onPress }: { label: string; value: string | number; onPress?: () => void }) {
    return (
        <View style={{ width: "50%", padding: 6 }}>
            <Card onPress={onPress}>
                <Text style={{ color: "#64748B", fontSize: 13 }}>{label}</Text>
                <Text style={{ fontSize: 28, fontWeight: "800", color: "#0F172A", marginTop: 4 }}>{value}</Text>
            </Card>
        </View>
    );
}

export default function OverviewScreen({ role, goTo }: ScreenProps) {
    const { user } = useSession();
    const admin = useGetAdminDashboardQuery(undefined, { skip: role !== "ADMIN" });
    const appts = useGetAppointmentsQuery();
    const doctorsQ = useGetAllDoctorsQuery();
    const patientsQ = useGetAllPatientsQuery();
    const { me: myDoctor } = useMyDoctor();
    const { me: myPatient } = useMyPatient();

    const today = todayStr();

    const mineAppts = useMemo(() => {
        const all = appts.data || [];
        if (role === "DOCTOR") return all.filter((a) => a.doctor_id === myDoctor?.id);
        if (role === "PATIENT") return all.filter((a) => a.patient_id === myPatient?.id);
        return all;
    }, [appts.data, role, myDoctor?.id, myPatient?.id]);

    const upcoming = useMemo(
        () =>
            mineAppts
                .filter((a) => (a.status === "Booked" || a.status === "Confirmed") && dateOnly(a.appointment_date) >= today)
                .sort((a, b) => apptKey(a).localeCompare(apptKey(b))),
        [mineAppts, today]
    );

    const doctorName = (id: string) => {
        const d = doctorsQ.data?.find((x) => x.id === id);
        return d ? `Dr. ${d.name}` : "Doctor";
    };

    const todayCount = mineAppts.filter((a) => dateOnly(a.appointment_date) === today && a.status !== "Cancelled").length;
    const pendingCount = mineAppts.filter((a) => a.status === "Booked").length;
    const doneCount = mineAppts.filter((a) => a.status === "Completed").length;

    const refetchAll = () => {
        admin.refetch?.();
        appts.refetch();
        doctorsQ.refetch();
        patientsQ.refetch();
    };

    const needsProfile =
        (role === "PATIENT" && !myPatient && !patientsQ.isLoading) ||
        (role === "DOCTOR" && !myDoctor && !doctorsQ.isLoading);

    const next = upcoming[0];

    return (
        <ScrollView
            contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
            refreshControl={<RefreshControl refreshing={appts.isFetching} onRefresh={refetchAll} />}
        >
            <Text style={{ fontSize: 22, fontWeight: "800", color: "#0F172A" }}>Hello, {user?.name?.split(" ")[0]} 👋</Text>
            <Text style={{ color: "#64748B", marginBottom: 12 }}>
                {role === "ADMIN" && "Here’s how the platform is doing."}
                {role === "DOCTOR" && "Here’s your schedule at a glance."}
                {role === "RECEPTION" && "Manage today’s patients and appointments."}
                {role === "PATIENT" && "Manage your health in one place."}
            </Text>

            {needsProfile ? (
                <Card>
                    <Text style={{ color: "#92400E", marginBottom: 8 }}>
                        {role === "PATIENT"
                            ? "Finish your patient profile so you can book appointments."
                            : "Finish your doctor profile so patients can book you."}
                    </Text>
                    <Btn small title="Complete profile" onPress={() => goTo("profile")} />
                </Card>
            ) : null}

            {(appts.isError || admin.isError) && (
                <ErrorBox message={errMsg(appts.error || admin.error)} onRetry={refetchAll} />
            )}

            {role === "ADMIN" ? (
                admin.isLoading ? (
                    <Loading />
                ) : admin.data ? (
                    <View style={{ flexDirection: "row", flexWrap: "wrap", margin: -6 }}>
                        <Stat label="Users" value={admin.data.total_users} onPress={() => goTo("users")} />
                        <Stat label="Active users" value={admin.data.active_users} onPress={() => goTo("users")} />
                        <Stat label="Doctors" value={admin.data.total_doctors} onPress={() => goTo("doctors")} />
                        <Stat label="Patients" value={admin.data.total_patients} onPress={() => goTo("patients")} />
                        <Stat label="Clinics" value={admin.data.total_clinics} onPress={() => goTo("clinics")} />
                        <Stat label="Appointments" value={admin.data.total_appointments} onPress={() => goTo("appointments")} />
                        <Stat label="Pending" value={admin.data.pending_appointments} onPress={() => goTo("appointments")} />
                        <Stat label="Completed" value={admin.data.completed_appointments} onPress={() => goTo("appointments")} />
                    </View>
                ) : null
            ) : (
                <View style={{ flexDirection: "row", flexWrap: "wrap", margin: -6 }}>
                    <Stat label="Today" value={todayCount} onPress={() => goTo("appointments")} />
                    <Stat label="Upcoming" value={upcoming.length} onPress={() => goTo("appointments")} />
                    <Stat label="Pending" value={pendingCount} onPress={() => goTo("appointments")} />
                    {role === "RECEPTION" ? (
                        <Stat label="Patients" value={(patientsQ.data || []).length} onPress={() => goTo("patients")} />
                    ) : (
                        <Stat label="Completed" value={doneCount} onPress={() => goTo("appointments")} />
                    )}
                </View>
            )}

            {role !== "ADMIN" ? (
                <>
                    <SectionTitle>{role === "PATIENT" ? "Next appointment" : "Next up"}</SectionTitle>
                    {appts.isLoading ? <Loading /> : null}
                    {!appts.isLoading && !next ? (
                        <Card>
                            <Text style={{ color: "#64748B" }}>No upcoming appointments.</Text>
                        </Card>
                    ) : null}
                    {next ? (
                        <Card onPress={() => goTo("appointments")}>
                            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                                <Text style={{ fontWeight: "700", fontSize: 15, color: "#0F172A" }}>
                                    {dateOnly(next.appointment_date)} · {next.appointment_time}
                                </Text>
                                <Badge text={next.status} tone={statusTone(next.status) as any} />
                            </View>
                            <Row label="Doctor" value={doctorName(next.doctor_id)} />
                            <Row label="Reason" value={next.reason} />
                        </Card>
                    ) : null}
                </>
            ) : null}

            <SectionTitle>Quick actions</SectionTitle>
            <View style={{ gap: 10 }}>
                {role === "PATIENT" ? (
                    <>
                        <Btn title="Find a doctor & book" onPress={() => goTo("doctors")} />
                        <Btn title="My appointments" variant="outline" onPress={() => goTo("appointments")} />
                        <Btn title="Medical records & prescriptions" variant="outline" onPress={() => goTo("records")} />
                    </>
                ) : null}
                {role === "DOCTOR" ? (
                    <>
                        <Btn title="View appointments" onPress={() => goTo("appointments")} />
                        <Btn title="Add medical record" variant="outline" onPress={() => goTo("records", "new")} />
                        <Btn title="Patients" variant="outline" onPress={() => goTo("patients")} />
                    </>
                ) : null}
                {role === "RECEPTION" ? (
                    <>
                        <Btn title="Book an appointment" onPress={() => goTo("appointments", "new")} />
                        <Btn title="Register a patient" variant="outline" onPress={() => goTo("patients")} />
                        <Btn title="Doctors" variant="outline" onPress={() => goTo("doctors")} />
                    </>
                ) : null}
                {role === "ADMIN" ? (
                    <>
                        <Btn title="Manage users" onPress={() => goTo("users")} />
                        <Btn title="Manage doctors" variant="outline" onPress={() => goTo("doctors")} />
                        <Btn title="Manage clinics" variant="outline" onPress={() => goTo("clinics")} />
                    </>
                ) : null}
            </View>
        </ScrollView>
    );
}
