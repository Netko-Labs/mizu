-- Services are now private by default (settings.exposed gates the auto
-- ingress host). Grandfather every existing service so nothing already
-- deployed loses its URL. Idempotent via the `?` key guard.
UPDATE "service" SET "settings" = "settings" || '{"exposed": true}'::jsonb WHERE NOT ("settings" ? 'exposed');
