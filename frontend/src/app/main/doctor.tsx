import RoleGate from "@/features/RoleGate";

export default function DoctorRoute() {
    return <RoleGate role="DOCTOR" />;
}
