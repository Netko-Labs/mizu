-- Workspace and Canvas Entities Migration
-- Adds: workspaces, networks, env_groups, external_services
-- Modifies: projects (add workspace_id), service_connections (add new target types)

CREATE TABLE IF NOT EXISTS "env_group" (
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
CREATE TABLE IF NOT EXISTS "external_service" (
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
CREATE TABLE IF NOT EXISTS "network" (
	"id" uuid PRIMARY KEY NOT NULL,
	"project_id" uuid NOT NULL,
	"name" text NOT NULL,
	"driver" text DEFAULT 'bridge' NOT NULL,
	"subnet" text,
	"gateway" text,
	"internal" boolean DEFAULT false NOT NULL,
	"docker_network_id" text,
	"canvas_position" jsonb DEFAULT '{"x":0,"y":0}'::jsonb NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "service_env_group" (
	"id" uuid PRIMARY KEY NOT NULL,
	"service_id" uuid NOT NULL,
	"env_group_id" uuid NOT NULL,
	"prefix" text,
	"created_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "workspace" (
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
ALTER TABLE "project" DROP CONSTRAINT IF EXISTS "project_slug_unique";
--> statement-breakpoint
DROP INDEX IF EXISTS "project_slug_idx";
--> statement-breakpoint
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'project' AND column_name = 'workspace_id') THEN
    ALTER TABLE "project" ADD COLUMN "workspace_id" uuid;
  END IF;
END $$;
--> statement-breakpoint
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'service_connection' AND column_name = 'to_network_id') THEN
    ALTER TABLE "service_connection" ADD COLUMN "to_network_id" uuid;
  END IF;
END $$;
--> statement-breakpoint
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'service_connection' AND column_name = 'to_external_service_id') THEN
    ALTER TABLE "service_connection" ADD COLUMN "to_external_service_id" uuid;
  END IF;
END $$;
--> statement-breakpoint
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'service_connection' AND column_name = 'to_env_group_id') THEN
    ALTER TABLE "service_connection" ADD COLUMN "to_env_group_id" uuid;
  END IF;
END $$;
--> statement-breakpoint
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'env_group_project_id_project_id_fk') THEN
    ALTER TABLE "env_group" ADD CONSTRAINT "env_group_project_id_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action;
  END IF;
END $$;
--> statement-breakpoint
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'external_service_project_id_project_id_fk') THEN
    ALTER TABLE "external_service" ADD CONSTRAINT "external_service_project_id_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action;
  END IF;
END $$;
--> statement-breakpoint
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'network_project_id_project_id_fk') THEN
    ALTER TABLE "network" ADD CONSTRAINT "network_project_id_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action;
  END IF;
END $$;
--> statement-breakpoint
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'service_env_group_service_id_service_id_fk') THEN
    ALTER TABLE "service_env_group" ADD CONSTRAINT "service_env_group_service_id_service_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."service"("id") ON DELETE cascade ON UPDATE no action;
  END IF;
END $$;
--> statement-breakpoint
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'service_env_group_env_group_id_env_group_id_fk') THEN
    ALTER TABLE "service_env_group" ADD CONSTRAINT "service_env_group_env_group_id_env_group_id_fk" FOREIGN KEY ("env_group_id") REFERENCES "public"."env_group"("id") ON DELETE cascade ON UPDATE no action;
  END IF;
END $$;
--> statement-breakpoint
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'workspace_user_id_user_id_fk') THEN
    ALTER TABLE "workspace" ADD CONSTRAINT "workspace_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
  END IF;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "env_group_projectId_idx" ON "env_group" USING btree ("project_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "external_service_projectId_idx" ON "external_service" USING btree ("project_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "network_projectId_idx" ON "network" USING btree ("project_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "service_env_group_serviceId_idx" ON "service_env_group" USING btree ("service_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "service_env_group_envGroupId_idx" ON "service_env_group" USING btree ("env_group_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "workspace_userId_idx" ON "workspace" USING btree ("user_id");
--> statement-breakpoint
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'project_workspace_id_workspace_id_fk') THEN
    ALTER TABLE "project" ADD CONSTRAINT "project_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE cascade ON UPDATE no action;
  END IF;
END $$;
--> statement-breakpoint
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'service_connection_to_network_id_network_id_fk') THEN
    ALTER TABLE "service_connection" ADD CONSTRAINT "service_connection_to_network_id_network_id_fk" FOREIGN KEY ("to_network_id") REFERENCES "public"."network"("id") ON DELETE set null ON UPDATE no action;
  END IF;
END $$;
--> statement-breakpoint
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'service_connection_to_external_service_id_external_service_id_fk') THEN
    ALTER TABLE "service_connection" ADD CONSTRAINT "service_connection_to_external_service_id_external_service_id_fk" FOREIGN KEY ("to_external_service_id") REFERENCES "public"."external_service"("id") ON DELETE set null ON UPDATE no action;
  END IF;
END $$;
--> statement-breakpoint
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'service_connection_to_env_group_id_env_group_id_fk') THEN
    ALTER TABLE "service_connection" ADD CONSTRAINT "service_connection_to_env_group_id_env_group_id_fk" FOREIGN KEY ("to_env_group_id") REFERENCES "public"."env_group"("id") ON DELETE set null ON UPDATE no action;
  END IF;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "project_workspaceId_idx" ON "project" USING btree ("workspace_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "service_connection_toNetworkId_idx" ON "service_connection" USING btree ("to_network_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "service_connection_toExternalServiceId_idx" ON "service_connection" USING btree ("to_external_service_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "service_connection_toEnvGroupId_idx" ON "service_connection" USING btree ("to_env_group_id");
--> statement-breakpoint
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'project_workspaceId_slug_unique') THEN
    ALTER TABLE "project" ADD CONSTRAINT "project_workspaceId_slug_unique" UNIQUE("workspace_id","slug");
  END IF;
END $$;
