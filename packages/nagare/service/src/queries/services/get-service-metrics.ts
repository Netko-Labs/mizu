import type { ServiceMetrics } from '@mizu/nagare-domain'
import { getServiceSamples } from '../../metrics'

/**
 * The service's in-memory metrics window (api layer never imports the hub
 * directly — layering stays domain → repository → service → api).
 */
export const getServiceMetrics = (serviceId: string): ServiceMetrics => {
  return getServiceSamples(serviceId)
}
