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
CREATE TABLE "env_group" (
	"id" uuid PRIMARY KEY NOT NULL,
	"project_id" uuid NOT NULL,
	"name" text NOT NULL,
	"values" text,
	"is_secret" boolean DEFAULT false NOT NULL,
	"canvas_position" jsonb DEFAULT '{"x":0,"y":0}'::jsonb NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "external_service" (
	"id" uuid PRIMARY KEY NOT NULL,
	"project_id" uuid NOT NULL,
	"name" text NOT NULL,
	"type" text NOT NULL,
	"host" text NOT NULL,
	"port" integer,
	"protocol" text DEFAULT 'https' NOT NULL,
	"credentials" text,
	"health_endpoint" text,
	"canvas_position" jsonb DEFAULT '{"x":0,"y":0}'::jsonb NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
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
--> statement-breakpoint
CREATE TABLE "network" (
	"id" uuid PRIMARY KEY NOT NULL,
	"project_id" uuid NOT NULL,
	"name" text NOT NULL,
	"subnet" text,
	"gateway" text,
	"internal" boolean DEFAULT false NOT NULL,
	"network_id" text,
	"canvas_position" jsonb DEFAULT '{"x":0,"y":0}'::jsonb NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project" (
	"id" uuid PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"workspace_id" uuid,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"settings" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"network_id" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "project_workspaceId_slug_unique" UNIQUE("workspace_id","slug")
);
--> statement-breakpoint
CREATE TABLE "service_connection" (
	"id" uuid PRIMARY KEY NOT NULL,
	"from_service_id" uuid NOT NULL,
	"to_service_id" uuid,
	"to_database_id" uuid,
	"to_network_id" uuid,
	"to_external_service_id" uuid,
	"to_env_group_id" uuid,
	"target_type" text NOT NULL,
	"connection_type" text NOT NULL,
	"env_var_name" text,
	"created_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "service_env_group" (
	"id" uuid PRIMARY KEY NOT NULL,
	"service_id" uuid NOT NULL,
	"env_group_id" uuid NOT NULL,
	"prefix" text,
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
	"volume_name" text,
	"path" text,
	"size_bytes" bigint,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workspace" (
	"id" uuid PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"settings" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "workspace_userId_slug_unique" UNIQUE("user_id","slug")
);
--> statement-breakpoint
ALTER TABLE "database" ADD CONSTRAINT "database_project_id_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "env_group" ADD CONSTRAINT "env_group_project_id_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "external_service" ADD CONSTRAINT "external_service_project_id_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "network" ADD CONSTRAINT "network_project_id_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project" ADD CONSTRAINT "project_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_connection" ADD CONSTRAINT "service_connection_from_service_id_service_id_fk" FOREIGN KEY ("from_service_id") REFERENCES "public"."service"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_connection" ADD CONSTRAINT "service_connection_to_service_id_service_id_fk" FOREIGN KEY ("to_service_id") REFERENCES "public"."service"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_connection" ADD CONSTRAINT "service_connection_to_database_id_database_id_fk" FOREIGN KEY ("to_database_id") REFERENCES "public"."database"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_connection" ADD CONSTRAINT "service_connection_to_network_id_network_id_fk" FOREIGN KEY ("to_network_id") REFERENCES "public"."network"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_connection" ADD CONSTRAINT "service_connection_to_external_service_id_external_service_id_fk" FOREIGN KEY ("to_external_service_id") REFERENCES "public"."external_service"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_connection" ADD CONSTRAINT "service_connection_to_env_group_id_env_group_id_fk" FOREIGN KEY ("to_env_group_id") REFERENCES "public"."env_group"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_env_group" ADD CONSTRAINT "service_env_group_service_id_service_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."service"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_env_group" ADD CONSTRAINT "service_env_group_env_group_id_env_group_id_fk" FOREIGN KEY ("env_group_id") REFERENCES "public"."env_group"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service" ADD CONSTRAINT "service_project_id_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "volume" ADD CONSTRAINT "volume_project_id_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "database_projectId_idx" ON "database" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "env_group_projectId_idx" ON "env_group" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "external_service_projectId_idx" ON "external_service" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "network_projectId_idx" ON "network" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "project_userId_idx" ON "project" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "project_workspaceId_idx" ON "project" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX "service_connection_fromServiceId_idx" ON "service_connection" USING btree ("from_service_id");--> statement-breakpoint
CREATE INDEX "service_connection_toServiceId_idx" ON "service_connection" USING btree ("to_service_id");--> statement-breakpoint
CREATE INDEX "service_connection_toDatabaseId_idx" ON "service_connection" USING btree ("to_database_id");--> statement-breakpoint
CREATE INDEX "service_connection_toNetworkId_idx" ON "service_connection" USING btree ("to_network_id");--> statement-breakpoint
CREATE INDEX "service_connection_toExternalServiceId_idx" ON "service_connection" USING btree ("to_external_service_id");--> statement-breakpoint
CREATE INDEX "service_connection_toEnvGroupId_idx" ON "service_connection" USING btree ("to_env_group_id");--> statement-breakpoint
CREATE INDEX "service_env_group_serviceId_idx" ON "service_env_group" USING btree ("service_id");--> statement-breakpoint
CREATE INDEX "service_env_group_envGroupId_idx" ON "service_env_group" USING btree ("env_group_id");--> statement-breakpoint
CREATE INDEX "service_projectId_idx" ON "service" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "volume_projectId_idx" ON "volume" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "workspace_userId_idx" ON "workspace" USING btree ("user_id");