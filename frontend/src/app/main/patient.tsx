import RoleGate from "@/features/RoleGate";

export default function PatientRoute() {
    return <RoleGate role="PATIENT" />;
}
