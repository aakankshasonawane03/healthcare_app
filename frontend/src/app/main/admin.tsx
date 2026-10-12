import RoleGate from "@/features/RoleGate";

export default function AdminRoute() {
    return <RoleGate role="ADMIN" />;
}
