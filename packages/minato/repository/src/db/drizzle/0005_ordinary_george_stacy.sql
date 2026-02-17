CREATE TABLE "database" (
	"id" uuid PRIMARY KEY NOT NULL,
	"project_id" uuid NOT NULL,
	"type" text NOT NULL,
	"name" text NOT NULL,
	"version" text,
	"credentials" text,
	"port" integer,
	"status" text DEFAULT 'created' NOT NULL,
	"container_id" text,
	"canvas_position" jsonb DEFAULT '{"x":0,"y":0}'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project" (
	"id" uuid PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"settings" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "project_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "service_connection" (
	"id" uuid PRIMARY KEY NOT NULL,
	"from_service_id" uuid NOT NULL,
	"to_service_id" uuid,
	"to_database_id" uuid,
	"target_type" text NOT NULL,
	"connection_type" text NOT NULL,
	"env_var_name" text,
	"created_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "service" (
	"id" uuid PRIMARY KEY NOT NULL,
	"project_id" uuid NOT NULL,
	"name" text NOT NULL,
	"source_type" text NOT NULL,
	"source_config" jsonb NOT NULL,
	"env_vars" text,
	"ports" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"volume_mounts" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"status" text DEFAULT 'created' NOT NULL,
	"container_id" text,
	"canvas_position" jsonb DEFAULT '{"x":0,"y":0}'::jsonb NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "volume" (
	"id" uuid PRIMARY KEY NOT NULL,
	"project_id" uuid NOT NULL,
	"name" text NOT NULL,
	"docker_volume_name" text,
	"path" text,
	"size_bytes" bigint,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "database" ADD CONSTRAINT "database_project_id_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project" ADD CONSTRAINT "project_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_connection" ADD CONSTRAINT "service_connection_from_service_id_service_id_fk" FOREIGN KEY ("from_service_id") REFERENCES "public"."service"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_connection" ADD CONSTRAINT "service_connection_to_service_id_service_id_fk" FOREIGN KEY ("to_service_id") REFERENCES "public"."service"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_connection" ADD CONSTRAINT "service_connection_to_database_id_database_id_fk" FOREIGN KEY ("to_database_id") REFERENCES "public"."database"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service" ADD CONSTRAINT "service_project_id_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "volume" ADD CONSTRAINT "volume_project_id_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "database_projectId_idx" ON "database" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "project_userId_idx" ON "project" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "project_slug_idx" ON "project" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "service_connection_fromServiceId_idx" ON "service_connection" USING btree ("from_service_id");--> statement-breakpoint
CREATE INDEX "service_connection_toServiceId_idx" ON "service_connection" USING btree ("to_service_id");--> statement-breakpoint
CREATE INDEX "service_connection_toDatabaseId_idx" ON "service_connection" USING btree ("to_database_id");--> statement-breakpoint
CREATE INDEX "service_projectId_idx" ON "service" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "volume_projectId_idx" ON "volume" USING btree ("project_id");