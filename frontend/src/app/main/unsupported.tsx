import { Text, View } from "react-native";
import { useSession } from "@/lib/session";
import { Btn } from "@/ui/kit";

/** Shown when the logged-in account has a role the app doesn't know. Lets the user log out instead of looping. */
export default function UnsupportedRoleRoute() {
    const { user, role, logout } = useSession();

    return (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 24, backgroundColor: "#F8FAFC" }}>
            <Text style={{ fontSize: 20, fontWeight: "800", color: "#0F172A", marginBottom: 8 }}>
                Role not supported
            </Text>
            <Text style={{ color: "#64748B", textAlign: "center", marginBottom: 20 }}>
                {user?.email || "This account"} has the role “{role || "none"}”. Expected ADMIN, DOCTOR, RECEPTION or PATIENT.
                Log out and sign in with a different account.
            </Text>
            <Btn title="Log out" variant="danger" onPress={logout} />
        </View>
    );
}
