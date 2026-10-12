import { useMemo, useState } from "react";
import { RefreshControl, ScrollView, Text, View } from "react-native";
import { errMsg } from "@/lib/api";
import { dateOnly } from "@/lib/format";
import { useSession } from "@/lib/session";
import { UserSummary, useGetUsersQuery, useUpdateUserStatusMutation } from "@/redux/slices/adminApiSlice";
import { Badge, Btn, Card, Chips, ConfirmModal, Empty, ErrorBox, Loading, Row, SearchBox, SectionTitle, toast } from "@/ui/kit";

const ROLES = ["All", "ADMIN", "DOCTOR", "RECEPTION", "PATIENT"];

export default function UsersScreen() {
    const { user: me } = useSession();
    const q = useGetUsersQuery();
    const [updateStatus, { isLoading }] = useUpdateUserStatusMutation();
    const [query, setQuery] = useState("");
    const [role, setRole] = useState("All");
    const [target, setTarget] = useState<UserSummary | null>(null);

    const list = useMemo(() => {
        const s = query.trim().toLowerCase();
        let rows = [...(q.data || [])];
        if (role !== "All") rows = rows.filter((u) => (u.role || "").toUpperCase() === role);
        if (s) rows = rows.filter((u) => `${u.name} ${u.email}`.toLowerCase().includes(s));
        return rows;
    }, [q.data, query, role]);

    const confirm = async () => {
        if (!target) return;
        try {
            await updateStatus({ id: target.id, is_active: !target.is_active }).unwrap();
            toast.ok(target.is_active ? "User deactivated" : "User activated");
        } catch (e) {
            toast.err(errMsg(e));
        }
        setTarget(null);
    };

    return (
        <ScrollView
            contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
            refreshControl={<RefreshControl refreshing={q.isFetching} onRefresh={q.refetch} />}
        >
            <SectionTitle>Users</SectionTitle>
            <SearchBox value={query} onChangeText={setQuery} placeholder="Search by name or email" />
            <Chips options={ROLES} value={role} onChange={setRole} />

            {q.isError ? <ErrorBox message={errMsg(q.error)} onRetry={q.refetch} /> : null}
            {q.isLoading ? <Loading /> : null}
            {!q.isLoading && !q.isError && list.length === 0 ? <Empty text="No users found." /> : null}

            {list.map((u) => (
                <Card key={u.id}>
                    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                        <Text style={{ fontWeight: "700", fontSize: 16, color: "#0F172A", flex: 1 }}>{u.name}</Text>
                        <Badge text={u.is_active ? "Active" : "Inactive"} tone={u.is_active ? "green" : "red"} />
                    </View>
                    <Row label="Email" value={u.email} />
                    <Row label="Role" value={u.role} />
                    <Row label="Joined" value={dateOnly(u.created_at)} />
                    <View style={{ marginTop: 12, flexDirection: "row" }}>
                        <Btn
                            small
                            variant={u.is_active ? "danger" : "primary"}
                            title={u.is_active ? "Deactivate" : "Activate"}
                            disabled={u.id === me?.id}
                            onPress={() => setTarget(u)}
                        />
                    </View>
                </Card>
            ))}

            <ConfirmModal
                visible={!!target}
                title={target?.is_active ? "Deactivate user?" : "Activate user?"}
                message={`${target?.name} (${target?.email})`}
                confirmText={target?.is_active ? "Deactivate" : "Activate"}
                danger={!!target?.is_active}
                loading={isLoading}
                onConfirm={confirm}
                onCancel={() => setTarget(null)}
            />
        </ScrollView>
    );
}
