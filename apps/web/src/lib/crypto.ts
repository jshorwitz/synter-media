/**
 * Token encryption utilities using AES-256-GCM
 */

import { createCipheriv, createDecipheriv, randomBytes } from 'crypto'

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'dev-key-32-chars-min-change-me!'
const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 16
const AUTH_TAG_LENGTH = 16
const VERSION = 'v1'

/**
 * Ensure encryption key is proper length (32 bytes for AES-256)
 */
function getKey(): Buffer {
  const key = Buffer.from(ENCRYPTION_KEY, 'utf-8')
  if (key.length < 32) {
    // Pad with zeros (NOT secure for production - set proper ENCRYPTION_KEY)
    return Buffer.concat([key, Buffer.alloc(32 - key.length)])
  }
  return key.slice(0, 32)
}

/**
 * Encrypt a string token
 * Returns base64-encoded: version:iv:authTag:ciphertext
 */
export function encryptToken(token: string): string {
  const iv = randomBytes(IV_LENGTH)
  const cipher = createCipheriv(ALGORITHM, getKey(), iv)
  
  const encrypted = Buffer.concat([
    cipher.update(token, 'utf8'),
    cipher.final()
  ])
  
  const authTag = cipher.getAuthTag()
  
  // Format: v1:iv:authTag:ciphertext (all base64)
  return [
    VERSION,
    iv.toString('base64'),
    authTag.toString('base64'),
    encrypted.toString('base64')
  ].join(':')
}

/**
 * Decrypt a token encrypted with encryptToken
 */
export function decryptToken(encryptedToken: string): string {
  const parts = encryptedToken.split(':')
  
  if (parts.length !== 4) {
    throw new Error('Invalid encrypted token format')
  }
  
  const [version, ivB64, authTagB64, ciphertextB64] = parts
  
  if (version !== VERSION) {
    throw new Error(`Unsupported encryption version: ${version}`)
  }
  
  const iv = Buffer.from(ivB64, 'base64')
  const authTag = Buffer.from(authTagB64, 'base64')
  const ciphertext = Buffer.from(ciphertextB64, 'base64')
  
  const decipher = createDecipheriv(ALGORITHM, getKey(), iv)
  decipher.setAuthTag(authTag)
  
  const decrypted = Buffer.concat([
    decipher.update(ciphertext),
    decipher.final()
  ])
  
  return decrypted.toString('utf8')
}

/**
 * Convert encrypted string to bytea for Postgres storage
 */
export function encryptToBytea(token: string): Buffer {
  const encrypted = encryptToken(token)
  return Buffer.from(encrypted, 'utf-8')
}

/**
 * Convert bytea from Postgres to decrypted string
 */
export function decryptFromBytea(bytea: Buffer): string {
  const encrypted = bytea.toString('utf-8')
  return decryptToken(encrypted)
}
