import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const medications = sqliteTable("medications", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  imageUri: text("image_uri"),
  audioPromptUri: text("audio_prompt_uri"),
  colorTag: text("color_tag"),
  startDate: integer("start_date", { mode: "timestamp" }).notNull(),
  frequencyInterval: integer("frequency_interval").notNull(),
  frequencyUnit: text("frequency_unit", {
    enum: ["hour", "day", "week", "month"],
  }).notNull(),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export const doses = sqliteTable("doses", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  medicationId: integer("medication_id")
    .notNull()
    .references(() => medications.id, { onDelete: "cascade" }),
  amount: integer("amount").notNull(),
  unit: text("unit", { enum: ["Drops", "Pills"] }).notNull(),
  // 24h "HH:mm", e.g. "09:30"
  timeOfDay: text("time_of_day").notNull(),
  mealTiming: text("meal_timing", { enum: ["before", "after"] }).notNull(),
  notificationId: text("notification_id"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export const adherenceLogs = sqliteTable("adherence_logs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  medicationId: integer("medication_id")
    .notNull()
    .references(() => medications.id, { onDelete: "cascade" }),
  doseId: integer("dose_id")
    .notNull()
    .references(() => doses.id, { onDelete: "cascade" }),
  scheduledFor: integer("scheduled_for", { mode: "timestamp" }).notNull(),
  status: text("status", { enum: ["taken", "skipped", "snoozed"] }).notNull(),
  loggedAt: integer("logged_at", { mode: "timestamp" }).notNull(),
});
