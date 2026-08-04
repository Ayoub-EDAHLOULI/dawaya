import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const medications = sqliteTable("medications", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  dosage: text("dosage").notNull(),
  imageUri: text("image_uri"),
  audioPromptUri: text("audio_prompt_uri"),
  colorTag: text("color_tag").notNull(),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export const schedules = sqliteTable("schedules", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  medicationId: integer("medication_id")
    .notNull()
    .references(() => medications.id, { onDelete: "cascade" }),
  timeOfDay: text("time_of_day").notNull(),
  daysOfWeek: text("days_of_week").notNull(),
  notificationId: text("notification_id"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export const adherenceLogs = sqliteTable("adherence_logs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  medicationId: integer("medication_id")
    .notNull()
    .references(() => medications.id, { onDelete: "cascade" }),
  scheduleId: integer("schedule_id")
    .notNull()
    .references(() => schedules.id, { onDelete: "cascade" }),
  scheduledFor: integer("scheduled_for", { mode: "timestamp" }).notNull(),
  status: text("status", { enum: ["taken", "skipped", "snoozed"] }).notNull(),
  loggedAt: integer("logged_at", { mode: "timestamp" }).notNull(),
});
