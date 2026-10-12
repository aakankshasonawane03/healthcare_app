import { useEffect, useState } from "react";
import { RefreshControl, ScrollView, Text, View } from "react-native";
import { errMsg } from "@/lib/api";
import {
    Clinic,
    useCreateClinicMutation,
    useDeleteClinicMutation,
    useGetClinicsQuery,
    useUpdateClinicMutation,
} from "@/redux/slices/clinicApiSlice";
import { Btn, Card, ConfirmModal, Empty, ErrorBox, Field, FormModal, Loading, Row, SectionTitle, toast } from "@/ui/kit";
import { ScreenProps } from "../hooks";

export default function ClinicsScreen({ role }: ScreenProps) {
    const q = useGetClinicsQuery();
    const [createClinic, { isLoading: creating }] = useCreateClinicMutation();
    const [updateClinic, { isLoading: updating }] = useUpdateClinicMutation();
    const [deleteClinic, { isLoading: deleting }] = useDeleteClinicMutation();

    const canEdit = role === "ADMIN";

    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState<Clinic | null>(null);
    const [toDelete, setToDelete] = useState<Clinic | null>(null);
    const [name, setName] = useState("");
    const [address, setAddress] = useState("");
    const [phone, setPhone] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        if (!open) return;
        setError("");
        setName(editing?.name ?? "");
        setAddress(editing?.address ?? "");
        setPhone(editing?.phone ?? "");
    }, [open, editing]);

    const submit = async () => {
        setError("");
        if (!name.trim()) return setError("Clinic name is required.");
        if (!address.trim()) return setError("Address is required.");
        if (!phone.trim()) return setError("Phone is required.");
        try {
            if (editing) {
                await updateClinic({ id: editing.id, name: name.trim(), address: address.trim(), phone: phone.trim() }).unwrap();
                toast.ok("Clinic updated");
            } else {
                await createClinic({ name: name.trim(), address: address.trim(), phone: phone.trim() }).unwrap();
                toast.ok("Clinic created");
            }
            setOpen(false);
        } catch (e) {
            setError(errMsg(e));
        }
    };

    const confirmDelete = async () => {
        if (!toDelete) return;
        try {
            await deleteClinic(toDelete.id).unwrap();
            toast.ok("Clinic deleted");
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
                                setOpen(true);
                            }}
                        />
                    ) : null
                }
            >
                Clinics
            </SectionTitle>

            {q.isError ? <ErrorBox message={errMsg(q.error)} onRetry={q.refetch} /> : null}
            {q.isLoading ? <Loading /> : null}
            {!q.isLoading && !q.isError && (q.data || []).length === 0 ? <Empty text="No clinics yet." /> : null}

            {(q.data || []).map((c) => (
                <Card key={c.id}>
                    <Text style={{ fontWeight: "700", fontSize: 16, color: "#0F172A" }}>{c.name}</Text>
                    <Row label="Address" value={[c.address, c.city, c.state].filter(Boolean).join(", ")} />
                    <Row label="Phone" value={c.phone} />
                    {canEdit ? (
                        <View style={{ flexDirection: "row", gap: 8, marginTop: 12 }}>
                            <Btn
                                small
                                variant="outline"
                                title="Edit"
                                onPress={() => {
                                    setEditing(c);
                                    setOpen(true);
                                }}
                            />
                            <Btn small variant="danger" title="Delete" onPress={() => setToDelete(c)} />
                        </View>
                    ) : null}
                </Card>
            ))}

            <FormModal
                visible={open}
                title={editing ? "Edit clinic" : "Add clinic"}
                onClose={() => setOpen(false)}
                onSubmit={submit}
                loading={creating || updating}
                error={error}
            >
                <Field label="Clinic name" value={name} onChangeText={setName} autoCapitalize="words" />
                <Field label="Address" value={address} onChangeText={setAddress} autoCapitalize="sentences" />
                <Field label="Phone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
            </FormModal>

            <ConfirmModal
                visible={!!toDelete}
                title="Delete clinic?"
                message={`${toDelete?.name} will be permanently removed.`}
                confirmText="Delete"
                danger
                loading={deleting}
                onConfirm={confirmDelete}
                onCancel={() => setToDelete(null)}
            />
        </ScrollView>
    );
}
