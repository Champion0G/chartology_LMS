import { AccessToken } from 'livekit-server-sdk'

const apiKey = process.env.LIVEKIT_API_KEY!
const apiSecret = process.env.LIVEKIT_API_SECRET!

export async function generateLiveKitToken(
  roomName: string,
  participantIdentity: string,
  participantName: string,
  isHost: boolean
): Promise<string> {
  const at = new AccessToken(apiKey, apiSecret, {
    identity: participantIdentity,
    name: participantName,
    ttl: '4h',
  })

  at.addGrant({
    roomJoin: true,
    room: roomName,
    canPublish: true,
    canSubscribe: true,
    canPublishData: true,
    // Host-only privileges
    roomAdmin: isHost,
    roomRecord: isHost,
  })

  return await at.toJwt()
}
