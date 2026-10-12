import { router } from "expo-router";
import { useDispatch, useSelector } from "react-redux";
import { apiSlice } from "@/redux/slices/apiSlice";
import { setLogout } from "@/redux/slices/authSlice";
import { useLogoutMutation } from "@/redux/slices/userApislices";

export const ROLE_HOME: Record<string, string> = {
    ADMIN: "/main/admin",
    DOCTOR: "/main/doctor",
    RECEPTION: "/main/reception",
    PATIENT: "/main/patient",
};

/** Landing route for a role. Unknown roles go to a safe page (never back into a role route -> no redirect loops). */
export function homeForRole(role?: string): string {
    return ROLE_HOME[(role || "").trim().toUpperCase()] || "/main/unsupported";
}

export function useSession() {
    const dispatch = useDispatch();
    const info = useSelector((s: any) => s.auth?.userInfo) as any;
    const [logoutApi] = useLogoutMutation();

    const logout = async () => {
        try {
            if (info?.refreshToken) {
                await logoutApi({ refresh_token: info.refreshToken }).unwrap();
            }
        } catch {
            // even if the server call fails we still clear the local session
        }
        dispatch(setLogout());
        dispatch(apiSlice.util.resetApiState());
        router.replace("/auth/login");
    };

    return {
        info,
        user: info?.user as { id: string; name: string; email: string; role: string } | undefined,
        role: ((info?.user?.role as string) || "").trim().toUpperCase(),
        isAuthed: !!info?.accessToken,
        logout,
    };
}
