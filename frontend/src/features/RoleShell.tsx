import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Activity, CalendarDays, FileText, HeartPulse, Stethoscope, UserRound, Users } from "lucide-react-native";
import { useSession } from "@/lib/session";
import { ConfirmModal } from "@/ui/kit";
import AppointmentsScreen from "./screens/AppointmentsScreen";
import ClinicsScreen from "./screens/ClinicsScreen";
import DoctorsScreen from "./screens/DoctorsScreen";
import OverviewScreen from "./screens/OverviewScreen";
import PatientsScreen from "./screens/PatientsScreen";
import ProfileScreen from "./screens/ProfileScreen";
import RecordsScreen from "./screens/RecordsScreen";
import UsersScreen from "./screens/UsersScreen";

type Tab = { key: string; label: string; icon: any };

const T = {
    overview: { key: "overview", label: "Home", icon: Activity },
    appointments: { key: "appointments", label: "Appointments", icon: CalendarDays },
    doctors: { key: "doctors", label: "Doctors", icon: Stethoscope },
    patients: { key: "patients", label: "Patients", icon: UserRound },
    users: { key: "users", label: "Users", icon: Users },
    clinics: { key: "clinics", label: "Clinics", icon: HeartPulse },
    records: { key: "records", label: "Records", icon: FileText },
    profile: { key: "profile", label: "Profile", icon: UserRound },
} as Record<string, Tab>;

const TABS: Record<string, Tab[]> = {
    ADMIN: [T.overview, T.users, T.doctors, T.patients, T.clinics, T.appointments, T.profile],
    RECEPTION: [T.overview, T.appointments, T.patients, T.doctors, T.profile],
    DOCTOR: [T.overview, T.appointments, T.patients, T.records, T.profile],
    PATIENT: [T.overview, T.doctors, T.appointments, T.records, T.clinics, T.profile],
};

const SCREENS: Record<string, any> = {
    overview: OverviewScreen,
    appointments: AppointmentsScreen,
    doctors: DoctorsScreen,
    patients: PatientsScreen,
    users: UsersScreen,
    clinics: ClinicsScreen,
    records: RecordsScreen,
    profile: ProfileScreen,
};

export default function RoleShell({ role }: { role: string }) {
    const { user, logout } = useSession();
    const tabs = TABS[role] || TABS.PATIENT;
    const [active, setActive] = useState("overview");
    const [intent, setIntent] = useState<string | null>(null);
    const [confirmOut, setConfirmOut] = useState(false);

    const goTo = (tab: string, i?: string) => {
        setIntent(i || null);
        setActive(tab);
    };

    const Screen = SCREENS[active] || OverviewScreen;

    return (
        <View style={s.root}>
            <View style={s.header}>
                <View style={{ flex: 1 }}>
                    <Text style={s.appName}>HealthCare</Text>
                    <Text style={s.sub} numberOfLines={1}>
                        {user?.name} · {role}
                    </Text>
                </View>
                <Pressable onPress={() => setConfirmOut(true)} style={s.logout}>
                    <Text style={{ color: "#fff", fontWeight: "700", fontSize: 13 }}>Log out</Text>
                </Pressable>
            </View>

            <View style={{ flex: 1 }}>
                <Screen
                    key={active}
                    role={role}
                    goTo={goTo}
                    intent={intent}
                    clearIntent={() => setIntent(null)}
                />
            </View>

            <View style={s.tabBar}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
                    {tabs.map((t) => {
                        const Icon = t.icon;
                        const on = t.key === active;
                        return (
                            <Pressable key={t.key} onPress={() => goTo(t.key)} style={s.tab}>
                                <Icon size={20} color={on ? "#2563EB" : "#64748B"} />
                                <Text style={[s.tabText, on && { color: "#2563EB", fontWeight: "700" }]}>{t.label}</Text>
                            </Pressable>
                        );
                    })}
                </ScrollView>
            </View>

            <ConfirmModal
                visible={confirmOut}
                title="Log out?"
                message="You will need to sign in again."
                confirmText="Log out"
                danger
                onConfirm={() => {
                    setConfirmOut(false);
                    logout();
                }}
                onCancel={() => setConfirmOut(false)}
            />
        </View>
    );
}

const s = StyleSheet.create({
    root: { flex: 1, backgroundColor: "#F8FAFC" },
    header: {
        backgroundColor: "#2563EB",
        paddingHorizontal: 16,
        paddingVertical: 12,
        flexDirection: "row",
        alignItems: "center",
    },
    appName: { color: "#fff", fontSize: 18, fontWeight: "800" },
    sub: { color: "#DBEAFE", fontSize: 12, marginTop: 2 },
    logout: { backgroundColor: "rgba(255,255,255,0.2)", paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
    tabBar: { borderTopWidth: 1, borderTopColor: "#E2E8F0", backgroundColor: "#fff" },
    tab: { minWidth: 84, flexGrow: 1, alignItems: "center", paddingVertical: 8, paddingHorizontal: 8 },
    tabText: { fontSize: 11, color: "#64748B", marginTop: 3 },
});
