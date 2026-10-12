import { useMemo, useState } from "react";
import { RefreshControl, ScrollView, Text, View } from "react-native";
import { errMsg } from "@/lib/api";
import { money } from "@/lib/format";
import { Doctor, useDeleteDoctorMutation, useGetAllDoctorsQuery } from "@/redux/slices/doctorApiSlice";
import { Badge, Btn, Card, ConfirmModal, Empty, ErrorBox, Loading, Row, SearchBox, SectionTitle, toast } from "@/ui/kit";
import BookingForm from "../BookingForm";
import { DoctorForm } from "../forms";
import { ScreenProps, useMyPatient } from "../hooks";

export default function DoctorsScreen({ role, goTo }: ScreenProps) {
    const q = useGetAllDoctorsQuery();
    const { me: myPatient } = useMyPatient();
    const [deleteDoctor, { isLoading: deleting }] = useDeleteDoctorMutation();

    const [query, setQuery] = useState("");
    const [formOpen, setFormOpen] = useState(false);
    const [editing, setEditing] = useState<Doctor | null>(null);
    const [toDelete, setToDelete] = useState<Doctor | null>(null);
    const [bookFor, setBookFor] = useState<string | undefined>(undefined);
    const [bookOpen, setBookOpen] = useState(false);

    const canEdit = role === "ADMIN" || role === "RECEPTION";
    const canDelete = role === "ADMIN";

    const list = useMemo(() => {
        const s = query.trim().toLowerCase();
        let rows = [...(q.data || [])];
        if (role === "PATIENT") rows = rows.filter((d) => d.is_active);
        if (s) rows = rows.filter((d) => `${d.name} ${d.specialization} ${d.qualification} ${d.email}`.toLowerCase().includes(s));
        return rows.sort((a, b) => a.name.localeCompare(b.name));
    }, [q.data, query, role]);

    const confirmDelete = async () => {
        if (!toDelete) return;
        try {
            await deleteDoctor(toDelete.id).unwrap();
            toast.ok("Doctor deleted");
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
                            title="+ Add"
                            onPress={() => {
                                setEditing(null);
                                setFormOpen(true);
                            }}
                        />
                    ) : null
                }
            >
                {role === "PATIENT" ? "Find a doctor" : "Doctors"}
            </SectionTitle>

            <SearchBox value={query} onChangeText={setQuery} placeholder="Search by name or specialization" />

            {q.isError ? <ErrorBox message={errMsg(q.error)} onRetry={q.refetch} /> : null}
            {q.isLoading ? <Loading /> : null}
            {!q.isLoading && !q.isError && list.length === 0 ? <Empty text="No doctors found." /> : null}

            {list.map((d) => (
                <Card key={d.id}>
                    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                        <Text style={{ fontWeight: "700", fontSize: 16, color: "#0F172A", flex: 1 }}>Dr. {d.name}</Text>
                        <Badge text={d.is_active ? "Active" : "Inactive"} tone={d.is_active ? "green" : "gray"} />
                    </View>
                    <Text style={{ color: "#2563EB", marginTop: 2 }}>{d.specialization}</Text>
                    <Row label="Qualification" value={d.qualification} />
                    <Row label="Experience" value={`${d.experience} years`} />
                    <Row label="Fee" value={money(d.consultation_fee)} />
                    {role !== "PATIENT" ? <Row label="Phone" value={d.phone} /> : null}
                    {role !== "PATIENT" ? <Row label="Email" value={d.email} /> : null}

                    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
                        {role === "PATIENT" ? (
                            <Btn
                                small
                                title="Book appointment"
                                onPress={() => {
                                    if (!myPatient) {
                                        toast.err("Complete your patient profile first.");
                                        goTo("profile");
                                        return;
                                    }
                                    setBookFor(d.id);
                                    setBookOpen(true);
                                }}
                            />
                        ) : null}
                        {canEdit ? (
                            <Btn
                                small
                                variant="outline"
                                title="Edit"
                                onPress={() => {
                                    setEditing(d);
                                    setFormOpen(true);
                                }}
                            />
                        ) : null}
                        {canDelete ? <Btn small variant="danger" title="Delete" onPress={() => setToDelete(d)} /> : null}
                    </View>
                </Card>
            ))}

            <DoctorForm visible={formOpen} onClose={() => setFormOpen(false)} editing={editing} allowStatus />
            <BookingForm visible={bookOpen} onClose={() => setBookOpen(false)} role={role} presetDoctorId={bookFor} />
            <ConfirmModal
                visible={!!toDelete}
                title="Delete doctor?"
                message={`Dr. ${toDelete?.name} will be permanently removed.`}
                confirmText="Delete"
                danger
                loading={deleting}
                onConfirm={confirmDelete}
                onCancel={() => setToDelete(null)}
            />
        </ScrollView>
    );
}
