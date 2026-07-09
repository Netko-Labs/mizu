interface EdenResult<T> {
  data: T
  error: unknown
}

function toError(error: unknown): Error {
  if (error instanceof Error) return error
  if (typeof error === 'object' && error !== null && 'value' in error) {
    const value = (error as { value: unknown }).value
    return new Error(typeof value === 'string' ? value : JSON.stringify(value))
  }
  return new Error(typeof error === 'string' ? error : JSON.stringify(error))
}

/** Unwrap an Eden Treaty `{ data, error }` envelope: throw on error, return data. */
export async function unwrap<T>(promise: Promise<EdenResult<T>>): Promise<T> {
  const { data, error } = await promise
  if (error) throw toError(error)
  return data
}
