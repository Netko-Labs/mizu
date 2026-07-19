-- Repair rows written by the bun-sql driver's double-encoded jsonb (stored as a
-- string scalar instead of the intended object/array). `col #>> '{}'` extracts
-- the inner JSON text from the string scalar, and `::jsonb` re-parses it. Guarded
-- by `jsonb_typeof(col) = 'string'` so it is idempotent and never touches rows
-- already stored correctly (e.g. default '{}' values).
UPDATE "service" SET "source_config" = ("source_config" #>> '{}')::jsonb WHERE jsonb_typeof("source_config") = 'string';--> statement-breakpoint
UPDATE "service" SET "ports" = ("ports" #>> '{}')::jsonb WHERE jsonb_typeof("ports") = 'string';--> statement-breakpoint
UPDATE "service" SET "volume_mounts" = ("volume_mounts" #>> '{}')::jsonb WHERE jsonb_typeof("volume_mounts") = 'string';--> statement-breakpoint
UPDATE "service" SET "settings" = ("settings" #>> '{}')::jsonb WHERE jsonb_typeof("settings") = 'string';--> statement-breakpoint
UPDATE "service" SET "canvas_position" = ("canvas_position" #>> '{}')::jsonb WHERE jsonb_typeof("canvas_position") = 'string';--> statement-breakpoint
UPDATE "project" SET "settings" = ("settings" #>> '{}')::jsonb WHERE jsonb_typeof("settings") = 'string';--> statement-breakpoint
UPDATE "database" SET "canvas_position" = ("canvas_position" #>> '{}')::jsonb WHERE jsonb_typeof("canvas_position") = 'string';--> statement-breakpoint
UPDATE "network" SET "canvas_position" = ("canvas_position" #>> '{}')::jsonb WHERE jsonb_typeof("canvas_position") = 'string';--> statement-breakpoint
UPDATE "env_group" SET "canvas_position" = ("canvas_position" #>> '{}')::jsonb WHERE jsonb_typeof("canvas_position") = 'string';--> statement-breakpoint
UPDATE "external_service" SET "canvas_position" = ("canvas_position" #>> '{}')::jsonb WHERE jsonb_typeof("canvas_position") = 'string';
