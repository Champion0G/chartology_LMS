/**
 * Generates a unique, URL-safe room name for a live class.
 * Format: lc-{12-char-hex}-{timestamp}
 * Uses Node.js built-in crypto.randomUUID() — no external deps.
 */
export function generateRoomName(): string {
  const id = crypto.randomUUID().replace(/-/g, '').slice(0, 12)
  return `lc-${id}-${Date.now()}`
}
