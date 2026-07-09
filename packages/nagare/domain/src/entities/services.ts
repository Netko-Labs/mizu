import { createInsertSchema, createSelectSchema, createUpdateSchema } from 'drizzle-zod'
import type { z } from 'zod'
import { serviceTable } from '../db'

/**
 * (=^･ω･^=) Service Schemas (=^･ω･^=)
 * Validation for your containerized fish
 */
export const ServiceInsertSchema = createInsertSchema(serviceTable)
export type ServiceInsert = z.infer<typeof ServiceInsertSchema>

export const ServiceUpdateSchema = createUpdateSchema(serviceTable).required({ id: true })
export type ServiceUpdate = z.infer<typeof ServiceUpdateSchema>

export const ServiceSchema = createSelectSchema(serviceTable)
export type Service = z.infer<typeof ServiceSchema>

/** Service source types */
export type ServiceSourceType = 'image' | 'git' | 'template'

/** Service status */
export type ServiceStatus =
  | 'created'
  | 'building'
  | 'starting'
  | 'running'
  | 'stopping'
  | 'stopped'
  | 'error'

/** Port mapping configuration */
export interface PortMapping {
  container: number
  host: number
  protocol?: 'tcp' | 'udp'
}

/** Volume mount configuration */
export interface VolumeMount {
  volumeId: string
  containerPath: string
}

/** Canvas position */
export interface CanvasPosition {
  x: number
  y: number
}

/** Source config for image-based services */
export interface ImageSourceConfig {
  image: string
  tag?: string
}

/** Source config for git-based services */
export interface GitSourceConfig {
  repository: string
  branch?: string
  buildCommand?: string
  startCommand?: string
  dockerfile?: string
}

/** Source config for template-based services */
export interface TemplateSourceConfig {
  templateId: string
  overrides?: Record<string, unknown>
}
