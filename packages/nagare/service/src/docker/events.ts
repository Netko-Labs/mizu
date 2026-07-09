/**
 * Docker events emitter for Mizu
 * Subscribes to Docker daemon events and exposes them as an async generator.
 */

import { createLogger } from '@mizu/logger'
import { getDockerClient } from './client'
import {
  DockerError,
  type DockerEvent,
  type DockerEventFilter,
  type DockerEventType,
} from './types'

const logger = createLogger('docker:events')

/**
 * Docker event emitter class
 * Manages subscriptions to Docker daemon events
 */
class DockerEventEmitter {
  private stream: NodeJS.ReadableStream | null = null
  private isClosing = false
  private subscribers = new Set<{
    filter?: DockerEventFilter
    callback: (event: DockerEvent) => void
  }>()

  /**
   * Subscribe to Docker events as an async generator
   * @param filter Optional filter for events
   * @yields Docker events
   */
  async *subscribe(filter?: DockerEventFilter): AsyncGenerator<DockerEvent> {
    const docker = getDockerClient()

    logger.debug({ filter }, 'Starting Docker event subscription')

    try {
      // Build Docker API filters
      const filters: Record<string, string[]> = {}

      if (filter?.type) {
        filters.type = Array.isArray(filter.type) ? filter.type : [filter.type]
      }
      if (filter?.container) {
        filters.container = Array.isArray(filter.container) ? filter.container : [filter.container]
      }
      if (filter?.image) {
        filters.image = Array.isArray(filter.image) ? filter.image : [filter.image]
      }
      if (filter?.network) {
        filters.network = Array.isArray(filter.network) ? filter.network : [filter.network]
      }
      if (filter?.volume) {
        filters.volume = Array.isArray(filter.volume) ? filter.volume : [filter.volume]
      }
      if (filter?.label) {
        filters.label = Array.isArray(filter.label) ? filter.label : [filter.label]
      }
      if (filter?.event) {
        filters.event = Array.isArray(filter.event) ? filter.event : [filter.event]
      }

      const stream = await docker.getEvents({
        filters: Object.keys(filters).length > 0 ? filters : undefined,
      })

      this.stream = stream

      // Create a buffer for partial JSON data
      let buffer = ''

      for await (const chunk of stream as AsyncIterable<Buffer>) {
        if (this.isClosing) {
          break
        }

        buffer += chunk.toString()

        // Docker sends events as newline-delimited JSON
        const lines = buffer.split('\n')
        buffer = lines.pop() || '' // Keep incomplete line in buffer

        for (const line of lines) {
          if (!line.trim()) continue

          try {
            const rawEvent = JSON.parse(line) as {
              Type: string
              Action: string
              Actor: { ID: string; Attributes: Record<string, string> }
              time: number
              timeNano: number
            }

            const event: DockerEvent = {
              type: rawEvent.Type as DockerEventType,
              action: rawEvent.Action,
              actorId: rawEvent.Actor.ID,
              attributes: rawEvent.Actor.Attributes || {},
              time: rawEvent.time,
              timeNano: rawEvent.timeNano,
            }

            yield event
          } catch (parseError) {
            logger.warn({ line, error: parseError }, 'Failed to parse Docker event')
          }
        }
      }
    } catch (error) {
      if (!this.isClosing) {
        const message = error instanceof Error ? error.message : String(error)
        logger.error({ error: message }, 'Error in Docker event stream')
        throw new DockerError(`Docker event stream error: ${message}`)
      }
    } finally {
      logger.debug('Docker event subscription ended')
    }
  }

  /**
   * Subscribe to events with a callback function
   * Useful for non-generator consumption patterns
   * @param callback Function to call for each event
   * @param filter Optional filter for events
   * @returns Unsubscribe function
   */
  on(callback: (event: DockerEvent) => void, filter?: DockerEventFilter): () => void {
    const subscriber = { filter, callback }
    this.subscribers.add(subscriber)

    // Start the event loop if not already running
    if (this.subscribers.size === 1) {
      this.startEventLoop()
    }

    return () => {
      this.subscribers.delete(subscriber)
      if (this.subscribers.size === 0) {
        this.close()
      }
    }
  }

  private async startEventLoop(): Promise<void> {
    try {
      for await (const event of this.subscribe()) {
        for (const { filter, callback } of this.subscribers) {
          if (this.matchesFilter(event, filter)) {
            try {
              callback(event)
            } catch (error) {
              logger.warn({ error }, 'Error in event callback')
            }
          }
        }
      }
    } catch (error) {
      if (!this.isClosing) {
        logger.error({ error }, 'Event loop error')
        // Attempt to restart after a delay
        setTimeout(() => {
          if (this.subscribers.size > 0) {
            this.startEventLoop()
          }
        }, 5000)
      }
    }
  }

  private matchesFilter(event: DockerEvent, filter?: DockerEventFilter): boolean {
    if (!filter) return true

    if (filter.type) {
      const types = Array.isArray(filter.type) ? filter.type : [filter.type]
      if (!types.includes(event.type)) return false
    }

    if (filter.event) {
      const events = Array.isArray(filter.event) ? filter.event : [filter.event]
      if (!events.includes(event.action)) return false
    }

    if (filter.container && event.type === 'container') {
      const containers = Array.isArray(filter.container) ? filter.container : [filter.container]
      if (
        !containers.includes(event.actorId) &&
        !containers.includes(event.attributes.name || '')
      ) {
        return false
      }
    }

    if (filter.image && event.type === 'image') {
      const images = Array.isArray(filter.image) ? filter.image : [filter.image]
      if (!images.includes(event.actorId) && !images.includes(event.attributes.name || '')) {
        return false
      }
    }

    if (filter.network && event.type === 'network') {
      const networks = Array.isArray(filter.network) ? filter.network : [filter.network]
      if (!networks.includes(event.actorId) && !networks.includes(event.attributes.name || '')) {
        return false
      }
    }

    if (filter.volume && event.type === 'volume') {
      const volumes = Array.isArray(filter.volume) ? filter.volume : [filter.volume]
      if (!volumes.includes(event.actorId)) return false
    }

    if (filter.label) {
      const labels = Array.isArray(filter.label) ? filter.label : [filter.label]
      const hasMatchingLabel = labels.some((label) => {
        const parts = label.split('=')
        const key = parts[0]
        const value = parts[1]
        if (!key) return false
        if (value !== undefined) {
          return event.attributes[key] === value
        }
        return key in event.attributes
      })
      if (!hasMatchingLabel) return false
    }

    return true
  }

  /**
   * Close the event stream
   */
  close(): void {
    logger.debug('Closing Docker event stream')
    this.isClosing = true
    this.subscribers.clear()

    if (this.stream) {
      // Destroy the stream to stop receiving events
      if ('destroy' in this.stream && typeof this.stream.destroy === 'function') {
        this.stream.destroy()
      }
      this.stream = null
    }
  }

  /**
   * Reset the emitter for new subscriptions
   */
  reset(): void {
    this.isClosing = false
  }
}

/** Singleton Docker event emitter instance */
export const dockerEvents = new DockerEventEmitter()

/**
 * Helper function to wait for a specific container event
 * @param containerId Container ID to watch
 * @param action Event action to wait for
 * @param timeout Timeout in milliseconds (default: 30000)
 * @returns The matching event
 */
export async function waitForContainerEvent(
  containerId: string,
  action: string,
  timeout = 30000,
): Promise<DockerEvent> {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      unsubscribe()
      reject(new DockerError(`Timeout waiting for container event '${action}' on '${containerId}'`))
    }, timeout)

    const unsubscribe = dockerEvents.on(
      (event) => {
        if (event.actorId === containerId || event.attributes.name === containerId) {
          clearTimeout(timeoutId)
          unsubscribe()
          resolve(event)
        }
      },
      { type: 'container', event: action },
    )
  })
}
