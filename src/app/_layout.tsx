import { useMigrations } from "drizzle-orm/expo-sqlite/migrator";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { Platform } from "react-native";
import { colors } from "../constants/theme";
import { db } from "../db";
import migrations from "../db/migrations/migrations";
import "../i18n"; // Initializes the translation engine

// Prevent the splash screen from auto-hiding before DB migrations finish.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { success, error } = useMigrations(
    db ?? ({} as NonNullable<typeof db>),
    migrations,
  );
  const isReady = Platform.OS === "web" || success;

  useEffect(() => {
    if (isReady) {
      SplashScreen.hideAsync();
    }
    if (error && Platform.OS !== "web") {
      console.error("Database migration error:", error);
    }
  }, [isReady, error]);

  if (!isReady) {
    return null;
  }

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
