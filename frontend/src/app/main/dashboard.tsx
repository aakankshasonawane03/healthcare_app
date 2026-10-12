import { Redirect } from "expo-router";
import { homeForRole, useSession } from "@/lib/session";

export default function DashboardRoute() {
  const { isAuthed, role } = useSession();

  if (!isAuthed) return <Redirect href="/auth/login" />;

  return <Redirect href={homeForRole(role) as any} />;
}
