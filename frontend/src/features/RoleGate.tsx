import { Redirect } from "expo-router";
import { ROLE_HOME, homeForRole, useSession } from "@/lib/session";
import RoleShell from "./RoleShell";

/** Renders the app for `role`, bouncing logged-out users to login and wrong-role users to their own home. */
export default function RoleGate({ role }: { role: string }) {
    const { isAuthed, role: myRole } = useSession();

    if (!isAuthed) return <Redirect href="/auth/login" />;
    if (myRole !== role) {
        const target = homeForRole(myRole);
        // never redirect to the route we are already on
        if (target !== ROLE_HOME[role]) return <Redirect href={target as any} />;
        return <Redirect href={"/main/unsupported" as any} />;
    }

    return <RoleShell role={role} />;
}
