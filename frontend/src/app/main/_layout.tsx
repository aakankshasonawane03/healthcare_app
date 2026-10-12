import { Redirect, Stack } from "expo-router";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSession } from "@/lib/session";

export default function MainLayout() {
  const { isAuthed } = useSession();

  // Session expired / logged out -> back to login
  if (!isAuthed) return <Redirect href="/auth/login" />;

  return (
    <SafeAreaView edges={["top", "bottom"]} style={styles.safeArea}>
      <View style={styles.container}>
        <Stack screenOptions={{ headerShown: false }} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#2563EB" },
  container: { flex: 1, backgroundColor: "#F8FAFC" },
});
