import { useState } from "react";
import { RefreshControl, ScrollView, Text, View } from "react-native";
import { dateOnly, fullName, money } from "@/lib/format";
import { useSession } from "@/lib/session";
import { Badge, Btn, Card, ConfirmModal, Row, SectionTitle } from "@/ui/kit";
import { DoctorForm, PatientForm } from "../forms";
import { ScreenProps, useMyDoctor, useMyPatient } from "../hooks";

export default function ProfileScreen({ role }: ScreenProps) {
    const { user, logout } = useSession();
    const doctorQ = useMyDoctor();
    const patientQ = useMyPatient();
    const [formOpen, setFormOpen] = useState(false);
    const [confirmOut, setConfirmOut] = useState(false);
    const [busy, setBusy] = useState(false);

    const doctor = doctorQ.me;
    const patient = patientQ.me;
    const refreshing = doctorQ.isFetching || patientQ.isFetching;

    return (
        <ScrollView
            contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
            refreshControl={
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={() => {
                        doctorQ.refetch();
                        patientQ.refetch();
                    }}
                />
            }
        >
            <SectionTitle>My account</SectionTitle>
            <Card>
                <Text style={{ fontSize: 18, fontWeight: "700", color: "#0F172A" }}>{user?.name}</Text>
                <View style={{ marginVertical: 6, flexDirection: "row" }}>
                    <Badge text={role} tone="blue" />
                </View>
                <Row label="Email" value={user?.email} />
            </Card>

            {role === "DOCTOR" ? (
                <>
                    <SectionTitle
                        right={
                            <Btn
                                small
                                title={doctor ? "Edit" : "Complete profile"}
                                onPress={() => setFormOpen(true)}
                            />
                        }
                    >
                        Doctor profile
                    </SectionTitle>
                    {doctor ? (
                        <Card>
                            <Row label="Name" value={`Dr. ${doctor.name}`} />
                            <Row label="Phone" value={doctor.phone} />
                            <Row label="Specialization" value={doctor.specialization} />
                            <Row label="Qualification" value={doctor.qualification} />
                            <Row label="Experience" value={`${doctor.experience} years`} />
                            <Row label="Fee" value={money(doctor.consultation_fee)} />
                            <Row label="Status" value={doctor.is_active ? "Active" : "Inactive"} />
                        </Card>
                    ) : (
                        <Card>
                            <Text style={{ color: "#92400E" }}>
                                Your doctor profile isn’t set up yet. Patients can’t book you until you complete it.
                            </Text>
                        </Card>
                    )}
                    <DoctorForm
                        visible={formOpen}
                        onClose={() => setFormOpen(false)}
                        editing={doctor}
                        prefillEmail={user?.email}
                        prefillName={user?.name}
                        title={doctor ? "Edit my profile" : "Complete doctor profile"}
                    />
                </>
            ) : null}

            {role === "PATIENT" ? (
                <>
                    <SectionTitle
                        right={
                            <Btn
                                small
                                title={patient ? "Edit" : "Complete profile"}
                                onPress={() => setFormOpen(true)}
                            />
                        }
                    >
                        Patient profile
                    </SectionTitle>
                    {patient ? (
                        <Card>
                            <Row label="Name" value={fullName(patient)} />
                            <Row label="Phone" value={patient.phone} />
                            <Row label="Gender" value={patient.gender} />
                            <Row label="Date of birth" value={dateOnly(patient.date_of_birth)} />
                            <Row label="Blood group" value={patient.blood_group} />
                            <Row label="Address" value={patient.address} />
                            <Row label="Emergency" value={patient.emergency_contact} />
                        </Card>
                    ) : (
                        <Card>
                            <Text style={{ color: "#92400E" }}>
                                Complete your patient profile to book appointments and see your medical records.
                            </Text>
                        </Card>
                    )}
                    <PatientForm
                        visible={formOpen}
                        onClose={() => setFormOpen(false)}
                        editing={patient}
                        prefillEmail={user?.email}
                        prefillName={user?.name}
                        title={patient ? "Edit my profile" : "Complete patient profile"}
                    />
                </>
            ) : null}

            <View style={{ marginTop: 20 }}>
                <Btn title="Log out" variant="danger" onPress={() => setConfirmOut(true)} />
            </View>

            <ConfirmModal
                visible={confirmOut}
                title="Log out?"
                message="You will need to sign in again."
                confirmText="Log out"
                danger
                loading={busy}
                onConfirm={async () => {
                    setBusy(true);
                    await logout();
                    setBusy(false);
                    setConfirmOut(false);
                }}
                onCancel={() => setConfirmOut(false)}
            />
        </ScrollView>
    );
}
