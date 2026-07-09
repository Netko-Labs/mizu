import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto'
import { nagareEnvConfig } from '@mizu/nagare-config'

const MASTER_KEY = nagareEnvConfig.app.encryptionKey
const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 16

/**
 * Derive a 32-byte key from the master key.
 * Accepts either a 64-char hex string or an arbitrary string (hashed with SHA-256).
 */
function deriveKeyBuffer(key: string): Buffer {
  // If it's a valid 64-char hex string, use it directly
  if (/^[0-9a-f]{64}$/i.test(key)) {
    return Buffer.from(key, 'hex')
  }
  // Otherwise, derive a 32-byte key via SHA-256
  return createHash('sha256').update(key).digest()
}

const KEY_BUFFER = deriveKeyBuffer(MASTER_KEY)

export const encrypt = (text: string) => {
  const iv = randomBytes(IV_LENGTH)
  const cipher = createCipheriv(ALGORITHM, KEY_BUFFER, iv)
  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()])
  const authTag = cipher.getAuthTag()

  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted.toString('hex')}`
}

export const decrypt = (hash: string) => {
  const [ivHex, authTagHex, encryptedHex] = hash.split(':')

  if (!ivHex || !authTagHex || !encryptedHex) {
    throw new Error('Invalid encrypted key format.')
  }

  const iv = Buffer.from(ivHex, 'hex')
  const authTag = Buffer.from(authTagHex, 'hex')
  const encrypted = Buffer.from(encryptedHex, 'hex')

  const decipher = createDecipheriv(ALGORITHM, KEY_BUFFER, iv)
  decipher.setAuthTag(authTag)

  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()])

  return decrypted.toString('utf8')
}
