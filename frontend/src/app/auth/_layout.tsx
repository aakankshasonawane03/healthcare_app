import { Redirect, Stack } from "expo-router";
import { homeForRole, useSession } from "@/lib/session";

export default function AuthLayout() {
  const { isAuthed, role } = useSession();

  // Already logged in -> go straight to the right dashboard
  if (isAuthed) return <Redirect href={homeForRole(role) as any} />;

  return <Stack screenOptions={{ headerShown: false }} />;
}
