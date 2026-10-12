import { useMemo, useState } from "react";
import { RefreshControl, ScrollView, Text, View } from "react-native";
import { errMsg } from "@/lib/api";
import { dateOnly, fullName } from "@/lib/format";
import { Patient, useDeletePatientMutation, useGetAllPatientsQuery } from "@/redux/slices/patientApiSlice";
import { Badge, Btn, Card, ConfirmModal, Empty, ErrorBox, FormModal, Loading, Row, SearchBox, SectionTitle, toast } from "@/ui/kit";
import { PatientForm } from "../forms";
import { ScreenProps } from "../hooks";

export default function PatientsScreen({ role }: ScreenProps) {
    const q = useGetAllPatientsQuery();
    const [deletePatient, { isLoading: deleting }] = useDeletePatientMutation();

    const [query, setQuery] = useState("");
    const [formOpen, setFormOpen] = useState(false);
    const [editing, setEditing] = useState<Patient | null>(null);
    const [viewing, setViewing] = useState<Patient | null>(null);
    const [toDelete, setToDelete] = useState<Patient | null>(null);

    const canEdit = role === "RECEPTION" || role === "ADMIN";
    const canDelete = role === "ADMIN";

    const list = useMemo(() => {
        const s = query.trim().toLowerCase();
        let rows = [...(q.data || [])];
        if (s) rows = rows.filter((p) => `${fullName(p)} ${p.email} ${p.phone}`.toLowerCase().includes(s));
        return rows.sort((a, b) => fullName(a).localeCompare(fullName(b)));
    }, [q.data, query]);

    const confirmDelete = async () => {
        if (!toDelete) return;
        try {
            await deletePatient(toDelete.id).unwrap();
            toast.ok("Patient deleted");
        } catch (e) {
            toast.err(errMsg(e));
        }
        setToDelete(null);
    };

    return (
        <ScrollView
            contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
            refreshControl={<RefreshControl refreshing={q.isFetching} onRefresh={q.refetch} />}
        >
            <SectionTitle
                right={
                    canEdit ? (
                        <Btn
                            small
                            title="+ Register"
                            onPress={() => {
                                setEditing(null);
                                setFormOpen(true);
                            }}
                        />
                    ) : null
                }
            >
                Patients
            </SectionTitle>

            <SearchBox value={query} onChangeText={setQuery} placeholder="Search by name, email or phone" />

            {q.isError ? <ErrorBox message={errMsg(q.error)} onRetry={q.refetch} /> : null}
            {q.isLoading ? <Loading /> : null}
            {!q.isLoading && !q.isError && list.length === 0 ? <Empty text="No patients found." /> : null}

            {list.map((p) => (
                <Card key={p.id} onPress={() => setViewing(p)}>
                    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                        <Text style={{ fontWeight: "700", fontSize: 16, color: "#0F172A", flex: 1 }}>{fullName(p)}</Text>
                        <Badge text={p.is_active ? "Active" : "Inactive"} tone={p.is_active ? "green" : "gray"} />
                    </View>
                    <Row label="Phone" value={p.phone} />
                    <Row label="Email" value={p.email} />
                    <Row label="Blood group" value={p.blood_group} />
                    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
                        <Btn small variant="outline" title="View" onPress={() => setViewing(p)} />
                        {canEdit ? (
                            <Btn
                                small
                                variant="outline"
                                title="Edit"
                                onPress={() => {
                                    setEditing(p);
                                    setFormOpen(true);
                                }}
                            />
                        ) : null}
                        {canDelete ? <Btn small variant="danger" title="Delete" onPress={() => setToDelete(p)} /> : null}
                    </View>
                </Card>
            ))}

            <PatientForm visible={formOpen} onClose={() => setFormOpen(false)} editing={editing} allowStatus />

            <FormModal visible={!!viewing} title={viewing ? fullName(viewing) : ""} onClose={() => setViewing(null)}>
                {viewing ? (
                    <View style={{ marginTop: 8 }}>
                        <Row label="Email" value={viewing.email} />
                        <Row label="Phone" value={viewing.phone} />
                        <Row label="Gender" value={viewing.gender} />
                        <Row label="Date of birth" value={dateOnly(viewing.date_of_birth)} />
                        <Row label="Blood group" value={viewing.blood_group} />
                        <Row label="Address" value={viewing.address} />
                        <Row label="Emergency" value={viewing.emergency_contact} />
                        <Row label="Status" value={viewing.is_active ? "Active" : "Inactive"} />
                    </View>
                ) : null}
            </FormModal>

            <ConfirmModal
                visible={!!toDelete}
                title="Delete patient?"
                message={`${toDelete ? fullName(toDelete) : ""} will be permanently removed.`}
                confirmText="Delete"
                danger
                loading={deleting}
                onConfirm={confirmDelete}
                onCancel={() => setToDelete(null)}
            />
        </ScrollView>
    );
}
