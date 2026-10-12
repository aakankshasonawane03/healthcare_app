import { useSession } from "@/lib/session";
import { useGetAllDoctorsQuery } from "@/redux/slices/doctorApiSlice";
import { useGetAllPatientsQuery } from "@/redux/slices/patientApiSlice";

/** The Doctor record that belongs to the logged-in user (matched by email). */
export function useMyDoctor() {
    const { user } = useSession();
    const q = useGetAllDoctorsQuery();
    const me = q.data?.find((d) => d.email?.toLowerCase() === user?.email?.toLowerCase());
    return { ...q, me };
}

/** The Patient record that belongs to the logged-in user (matched by email). */
export function useMyPatient() {
    const { user } = useSession();
    const q = useGetAllPatientsQuery();
    const me = q.data?.find((p) => p.email?.toLowerCase() === user?.email?.toLowerCase());
    return { ...q, me };
}

export interface ScreenProps {
    role: string;
    goTo: (tab: string, intent?: string) => void;
    intent?: string | null;
    clearIntent?: () => void;
}
