/**
 * Registry of live log-stream connections, keyed by the client-supplied
 * connection id (`?cid=`). Each WS connection owns one docker log stream;
 * releasing a connection aborts its stream.
 */
class StreamHub {
  private readonly streams = new Map<string, AbortController>()

  register(cid: string): AbortController {
    this.release(cid)
    const controller = new AbortController()
    this.streams.set(cid, controller)
    return controller
  }

  release(cid: string): void {
    const controller = this.streams.get(cid)
    if (controller) {
      controller.abort()
      this.streams.delete(cid)
    }
  }
}

export const streamHub = new StreamHub()
