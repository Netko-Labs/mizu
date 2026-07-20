import { z } from 'zod'

/** One-shot command run inside the service container (`sh -lc <command>`). */
export const ExecCommandSchema = z.object({
  command: z.string().min(1).max(4000),
})
export type ExecCommandInput = z.infer<typeof ExecCommandSchema>

/** Path within the service's host-backed file area ('' or '/' = root). */
export const ServiceFileQuerySchema = z.object({
  path: z.string().max(1024).default(''),
})
export type ServiceFileQuery = z.infer<typeof ServiceFileQuerySchema>

/** Write a text file inside the service's host-backed file area. */
export const WriteServiceFileSchema = z.object({
  path: z.string().min(1).max(1024),
  content: z.string().max(512 * 1024, 'file too large to edit here (512KB max)'),
})
export type WriteServiceFileInput = z.infer<typeof WriteServiceFileSchema>
