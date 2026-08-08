CREATE TABLE `adherence_logs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`medication_id` integer NOT NULL,
	`dose_id` integer NOT NULL,
	`scheduled_for` integer NOT NULL,
	`status` text NOT NULL,
	`logged_at` integer NOT NULL,
	FOREIGN KEY (`medication_id`) REFERENCES `medications`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`dose_id`) REFERENCES `doses`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `doses` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`medication_id` integer NOT NULL,
	`amount` integer NOT NULL,
	`unit` text NOT NULL,
	`time_of_day` text NOT NULL,
	`meal_timing` text NOT NULL,
	`notification_id` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`medication_id`) REFERENCES `medications`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `medications` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`image_uri` text,
	`audio_prompt_uri` text,
	`color_tag` text,
	`start_date` integer NOT NULL,
	`frequency_interval` integer NOT NULL,
	`frequency_unit` text NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` integer NOT NULL
);
