import { customType } from 'drizzle-orm/pg-core'

/**
 * A `jsonb` column that serializes correctly under the **bun-sql** driver.
 *
 * drizzle's built-in `jsonb` runs `JSON.stringify` in its `toDriver`, handing
 * bun-sql a string; bun-sql then JSON-encodes that string *again* for the jsonb
 * parameter, so the value lands as a double-encoded string scalar
 * (`jsonb_typeof(col) = 'string'`) instead of the intended object/array. The app
 * mostly hides it (the built-in `fromDriver` JSON.parses it back), but the stored
 * data is malformed and any raw SQL / jsonb operator (`col->>'x'`, `col || …`)
 * breaks.
 *
 * Passing the value through untouched lets bun-sql serialize it exactly once
 * (verified: object param → `jsonb_typeof = object`, array → `array`).
 * `fromDriver` still parses legacy string scalars, so rows written before the
 * fix keep reading correctly until they're rewritten.
 */
export const jsonb = <TData = unknown>(name: string) =>
  customType<{ data: TData; driverData: unknown }>({
    dataType() {
      return 'jsonb'
    },
    toDriver(value: TData): unknown {
      return value
    },
    fromDriver(value: unknown): TData {
      if (typeof value === 'string') {
        try {
          return JSON.parse(value) as TData
        } catch {
          return value as TData
        }
      }
      return value as TData
    },
  })(name)
