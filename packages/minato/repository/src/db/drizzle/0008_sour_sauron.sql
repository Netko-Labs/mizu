CREATE TABLE "instance_setting" (
	"id" uuid PRIMARY KEY NOT NULL,
	"instance_name" text DEFAULT 'mizu' NOT NULL,
	"domain" text,
	"dns" text,
	"timezone" text DEFAULT 'UTC' NOT NULL,
	"public_ipv4" text,
	"public_ipv6" text,
	"do_not_track" boolean DEFAULT false NOT NULL,
	"registration_enabled" boolean DEFAULT true NOT NULL,
	"updates_cron_expression" text DEFAULT '0 3 * * *' NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
