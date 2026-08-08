import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

// TEMPORARY: db + i18n removed to isolate a native-module crash on Android.
// Restore the migration gate and "../i18n" import once confirmed working.
export default function RootLayout() {
  return (
    <>
      <StatusBar style="dark" backgroundColor="#F3F4F6" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="add-alert" options={{ presentation: "modal" }} />
      </Stack>
    </>
  );
}
