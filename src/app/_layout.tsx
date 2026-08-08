import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { colors } from "../constants/theme";
import "../i18n"; // Initializes the translation engine

export default function RootLayout() {
  return (
    <>
      <StatusBar style="dark" translucent backgroundColor="transparent" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="add-alert" options={{ presentation: "modal" }} />
      </Stack>
    </>
  );
}
