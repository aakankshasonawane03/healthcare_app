import { useEffect, useMemo, useState } from "react";
import { RefreshControl, ScrollView, Text, View } from "react-native";
import { errMsg } from "@/lib/api";
import { dateOnly, fullName } from "@/lib/format";
import { useGetAllDoctorsQuery } from "@/redux/slices/doctorApiSlice";
import { useGetAllPatientsQuery } from "@/redux/slices/patientApiSlice";
import {
    MedicalRecord,
    useCreateMedicalRecordMutation,
    useDeleteMedicalRecordMutation,
    useGetMedicalRecordsQuery,
} from "@/redux/slices/medicalrecordApiSlice";
import { useGetPrescriptionsQuery } from "@/redux/slices/prescriptionApiSlice";
import { Btn, Card, Chips, ConfirmModal, Empty, ErrorBox, Field, FormModal, Loading, Row, SectionTitle, SelectField, toast } from "@/ui/kit";
import { ScreenProps, useMyDoctor, useMyPatient } from "../hooks";

export default function RecordsScreen({ role, goTo, intent, clearIntent }: ScreenProps) {
    const isDoctor = role === "DOCTOR";
    const [tab, setTab] = useState("Medical records");

    const recordsQ = useGetMedicalRecordsQuery();
    const rxQ = useGetPrescriptionsQuery();
    const doctorsQ = useGetAllDoctorsQuery();
    const patientsQ = useGetAllPatientsQuery();
    const { me: myDoctor } = useMyDoctor();
    const { me: myPatient } = useMyPatient();

    const [createRecord, { isLoading: creating }] = useCreateMedicalRecordMutation();
    const [deleteRecord, { isLoading: deleting }] = useDeleteMedicalRecordMutation();

    const [open, setOpen] = useState(false);
    const [patientId, setPatientId] = useState("");
    const [diagnosis, setDiagnosis] = useState("");
    const [symptoms, setSymptoms] = useState("");
    const [treatment, setTreatment] = useState("");
    const [notes, setNotes] = useState("");
    const [error, setError] = useState("");
    const [toDelete, setToDelete] = useState<MedicalRecord | null>(null);

    useEffect(() => {
        if (intent === "new" && isDoctor) setOpen(true);
        if (intent) clearIntent?.();
    }, [intent]);

    const doctorName = (id: string) => {
        const d = doctorsQ.data?.find((x) => x.id === id);
        return d ? `Dr. ${d.name}` : "Unknown doctor";
    };
    const patientName = (id: string) => fullName(patientsQ.data?.find((x) => x.id === id)) || "Unknown patient";

    const mine = (r: { doctor_id: string; patient_id: string }) =>
        isDoctor ? r.doctor_id === myDoctor?.id : r.patient_id === myPatient?.id;

    const records = useMemo(
        () => (recordsQ.data || []).filter(mine).sort((a, b) => (b.record_date || "").localeCompare(a.record_date || "")),
        [recordsQ.data, myDoctor?.id, myPatient?.id]
    );
    const prescriptions = useMemo(
        () => (rxQ.data || []).filter(mine).sort((a, b) => (b.prescription_date || "").localeCompare(a.prescription_date || "")),
        [rxQ.data, myDoctor?.id, myPatient?.id]
    );

    const noProfile = isDoctor ? !myDoctor && !doctorsQ.isLoading : !myPatient && !patientsQ.isLoading;

    const submit = async () => {
        setError("");
        if (!myDoctor) return setError("Complete your doctor profile first.");
        if (!patientId) return setError("Please choose a patient.");
        if (!diagnosis.trim()) return setError("Diagnosis is required.");
        try {
            await createRecord({
                patient_id: patientId,
                doctor_id: myDoctor.id,
                diagnosis: diagnosis.trim(),
                symptoms: symptoms.trim(),
                treatment: treatment.trim(),
                notes: notes.trim(),
            }).unwrap();
            toast.ok("Medical record added");
            setOpen(false);
            setPatientId("");
            setDiagnosis("");
            setSymptoms("");
            setTreatment("");
            setNotes("");
        } catch (e) {
            setError(errMsg(e));
        }
    };

    const confirmDelete = async () => {
        if (!toDelete) return;
        try {
            await deleteRecord(toDelete.id).unwrap();
            toast.ok("Record deleted");
        } catch (e) {
            toast.err(errMsg(e));
        }
        setToDelete(null);
    };

    const refetch = () => {
        recordsQ.refetch();
        rxQ.refetch();
    };

    return (
        <ScrollView
            contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
            refreshControl={<RefreshControl refreshing={recordsQ.isFetching || rxQ.isFetching} onRefresh={refetch} />}
        >
            <SectionTitle
                right={
                    isDoctor && tab === "Medical records" ? (
                        <Btn small title="+ Add record" onPress={() => setOpen(true)} />
                    ) : null
                }
            >
                Records
            </SectionTitle>

            <Chips options={["Medical records", "Prescriptions"]} value={tab} onChange={setTab} />

            {noProfile ? (
                <Card>
                    <Text style={{ color: "#92400E", marginBottom: 8 }}>
                        Complete your {isDoctor ? "doctor" : "patient"} profile to see your records.
                    </Text>
                    <Btn small title="Go to Profile" onPress={() => goTo("profile")} />
                </Card>
            ) : null}

            {(recordsQ.isError || rxQ.isError) ? (
                <ErrorBox message={errMsg(recordsQ.error || rxQ.error)} onRetry={refetch} />
            ) : null}
            {recordsQ.isLoading || rxQ.isLoading ? <Loading /> : null}

            {tab === "Medical records" ? (
                <>
                    {!recordsQ.isLoading && !noProfile && records.length === 0 ? <Empty text="No medical records yet." /> : null}
                    {records.map((r) => (
                        <Card key={r.id}>
                            <Text style={{ fontWeight: "700", fontSize: 15, color: "#0F172A" }}>
                                {r.diagnosis || "Consultation"} · {dateOnly(r.record_date)}
                            </Text>
                            <Row label={isDoctor ? "Patient" : "Doctor"} value={isDoctor ? patientName(r.patient_id) : doctorName(r.doctor_id)} />
                            <Row label="Symptoms" value={r.symptoms} />
                            <Row label="Treatment" value={r.treatment} />
                            <Row label="Notes" value={r.notes} />
                            {isDoctor ? (
                                <View style={{ marginTop: 12, flexDirection: "row" }}>
                                    <Btn small variant="danger" title="Delete" onPress={() => setToDelete(r)} />
                                </View>
                            ) : null}
                        </Card>
                    ))}
                </>
            ) : (
                <>
                    {!rxQ.isLoading && !noProfile && prescriptions.length === 0 ? (
                        <Empty text="No prescriptions yet." />
                    ) : null}
                    {prescriptions.map((p) => (
                        <Card key={p.id}>
                            <Text style={{ fontWeight: "700", fontSize: 15, color: "#0F172A" }}>
                                Prescription · {dateOnly(p.prescription_date)}
                            </Text>
                            <Row label={isDoctor ? "Patient" : "Doctor"} value={isDoctor ? patientName(p.patient_id) : doctorName(p.doctor_id)} />
                            {(p.medicines || []).map((m, i) => (
                                <Text key={i} style={{ marginTop: 6, color: "#334155", fontSize: 13 }}>
                                    • {m.medicine_name} — {m.dosage}, {m.frequency}, {m.duration}
                                </Text>
                            ))}
                            {p.notes ? <Row label="Notes" value={p.notes} /> : null}
                        </Card>
                    ))}
                </>
            )}

            <FormModal
                visible={open}
                title="Add medical record"
                onClose={() => setOpen(false)}
                onSubmit={submit}
                loading={creating}
                error={error}
            >
                <SelectField
                    label="Patient"
                    value={patientId}
                    options={(patientsQ.data || []).map((p) => ({ label: `${fullName(p)} (${p.phone})`, value: p.id }))}
                    onChange={setPatientId}
                    placeholder="Choose a patient"
                />
                <Field label="Diagnosis" value={diagnosis} onChangeText={setDiagnosis} autoCapitalize="sentences" />
                <Field label="Symptoms" value={symptoms} onChangeText={setSymptoms} autoCapitalize="sentences" />
                <Field label="Treatment" value={treatment} onChangeText={setTreatment} autoCapitalize="sentences" />
                <Field label="Notes" value={notes} onChangeText={setNotes} autoCapitalize="sentences" />
            </FormModal>

            <ConfirmModal
                visible={!!toDelete}
                title="Delete record?"
                message="This medical record will be permanently removed."
                confirmText="Delete"
                danger
                loading={deleting}
                onConfirm={confirmDelete}
                onCancel={() => setToDelete(null)}
            />
        </ScrollView>
    );
}
