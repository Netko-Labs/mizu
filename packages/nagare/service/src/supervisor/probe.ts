import { connect } from 'node:net'

/**
 * TCP liveness check: can we open a connection to host:port within the
 * timeout? The runtime reports a wedged container VM as "running", so this is
 * how the supervisor tells frozen from alive — connect, then hang up.
 */
export function probeTcp(host: string, port: number, timeoutMs: number): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = connect({ host, port })
    const timer = setTimeout(() => {
      socket.destroy()
      resolve(false)
    }, timeoutMs)
    socket.once('connect', () => {
      clearTimeout(timer)
      socket.destroy()
      resolve(true)
    })
    socket.once('error', () => {
      clearTimeout(timer)
      resolve(false)
    })
  })
}
