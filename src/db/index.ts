import { drizzle } from "drizzle-orm/expo-sqlite";
import { openDatabaseSync } from "expo-sqlite";
import { Platform } from "react-native";

import * as schema from "./schema";

// expo-sqlite's web backend is alpha and unreliable in the Metro dev
// server (worker init can hang indefinitely), so we skip opening a
// real database on web and let _layout.tsx bypass the migration gate.
const expoDb = Platform.OS === "web" ? null : openDatabaseSync("dawaya.db");

export const db = expoDb ? drizzle(expoDb, { schema }) : null;
