'use client'

import '@livekit/components-styles'
import { useEffect, useState, useCallback } from 'react'
import {
  LiveKitRoom,
  RoomAudioRenderer,
  PreJoin,
  useParticipants,
  Chat,
  ControlBar,
  GridLayout,
  ParticipantTile,
  CarouselLayout,
  TrackLoop,
  useTracks,
  useLocalParticipant,
} from '@livekit/components-react'
import { Track } from 'livekit-client'
import { Loader2, Video, X, AlertTriangle, Users, Clock, MessageSquare, Send } from 'lucide-react'

type Props = { classId: string; className: string }
type TokenData = { token: string; wsUrl: string; roomName: string; className: string }
type Stage = 'loading' | 'prejoin' | 'room' | 'disconnected' | 'error'

/* ── Participant count — must live inside <LiveKitRoom> ── */
function ParticipantCount() {
  const participants = useParticipants()
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,0.6)', fontSize: 13 }}>
      <Users size={14} />
      <span>{participants.length}</span>
    </div>
  )
}

/* ── Live duration clock — also inside <LiveKitRoom> ── */
function LiveDuration({ startedAt }: { startedAt: number }) {
  const [label, setLabel] = useState('0:00')
  useEffect(() => {
    const tick = () => {
      const d = Math.max(0, Date.now() - startedAt)
      const h = Math.floor(d / 3600000)
      const m = Math.floor((d % 3600000) / 60000)
      const s = Math.floor((d % 60000) / 1000)
      setLabel(h > 0 ? `${h}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}` : `${m}:${String(s).padStart(2,'0')}`)
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [startedAt])
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>
      <Clock size={12} />
      <span>{label}</span>
    </div>
  )
}

import { useChat } from '@livekit/components-react'

function ChatPersistence({ classId }: { classId: string }) {
  const { chatMessages } = useChat()
  const [lastProcessed, setLastProcessed] = useState(0)

  useEffect(() => {
    const lastMsg = chatMessages[chatMessages.length - 1]
    if (lastMsg && lastMsg.timestamp > lastProcessed && lastMsg.from?.isLocal) {
      setLastProcessed(lastMsg.timestamp)
      fetch('/api/live-classes/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ classId, message: lastMsg.message }),
      }).catch(err => console.error('Failed to persist chat:', err))
    }
  }, [chatMessages, classId, lastProcessed])

  return null
}

import AttendancePanel from './AttendancePanel'

function CustomRoomContent({ classId, className, tokenData, joinedAt, setStage }: { 
  classId: string,
  className: string, 
  tokenData: TokenData, 
  joinedAt: number,
  setStage: (s: Stage) => void 
}) {
  const [showChat, setShowChat] = useState(true)
  const [showRecord, setShowRecord] = useState(false)
  const [history, setHistory] = useState<any[]>([])
  const tracks = useTracks([
    { source: Track.Source.Camera, withPlaceholder: true },
    { source: Track.Source.ScreenShare, withPlaceholder: false },
  ])

  useEffect(() => {
    fetch(`/api/live-classes/chat?classId=${classId}`)
      .then(res => res.json())
      .then(data => setHistory(Array.isArray(data) ? data : []))
  }, [classId])

  return (
    <>
      <ChatPersistence classId={classId} />
      {showRecord && (
        <AttendancePanel 
          classId={classId} 
          className={className} 
          onClose={() => setShowRecord(false)} 
        />
      )}
      {/* ── Top bar pinned at top ── */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 60, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', background: 'rgba(8,8,18,0.9)', borderBottom: '1px solid rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div className="lkr-logo-sm"><Video size={15} color="#fff" /></div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, lineHeight: 1.2 }}>{className || tokenData.className}</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>Live Session</div>
          </div>
          <div style={{ background: 'rgba(239,68,68,0.18)', color: '#f87171', padding: '3px 10px', borderRadius: 999, fontSize: 11, fontWeight: 700, border: '1px solid rgba(239,68,68,0.3)', animation: 'livepulse 2s ease-in-out infinite' }}>● LIVE</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <LiveDuration startedAt={joinedAt} />
          <ParticipantCount />
          <button 
            onClick={() => setShowRecord(true)}
            style={{ 
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: 'rgba(255,255,255,0.8)',
              padding: '8px 14px', borderRadius: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, transition: 'all 0.2s', fontWeight: 600
            }}
          >
            <Users size={16} /> Class Record
          </button>
          <button 
            onClick={() => setShowChat(!showChat)}
            style={{ 
              background: showChat ? 'rgba(168, 85, 247, 0.15)' : 'rgba(255,255,255,0.05)',
              border: `1px solid ${showChat ? 'rgba(168, 85, 247, 0.3)' : 'rgba(255,255,255,0.1)'}`,
              color: showChat ? '#c084fc' : 'rgba(255,255,255,0.6)',
              padding: '8px 12px', borderRadius: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, transition: 'all 0.2s'
            }}
          >
            <MessageSquare size={16} /> {showChat ? 'Hide Chat' : 'Show Chat'}
          </button>
          <a
            href="/live-classes"
            onClick={() => setStage('disconnected')}
            style={{ display: 'flex', alignItems: 'center', gap: 7, background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171', padding: '7px 14px', borderRadius: 8, fontSize: 13, fontWeight: 600, textDecoration: 'none', transition: 'all 0.2s' }}
          >
            <X size={13} /> Leave
          </a>
        </div>
      </div>

      {/* ── Main Layout ── */}
      <div style={{ position: 'absolute', top: 60, left: 0, right: 0, bottom: 0, display: 'flex', overflow: 'hidden' }}>
        {/* Video Area */}
        <div style={{ flex: 1, position: 'relative', background: '#000', overflow: 'hidden' }}>
          <GridLayout tracks={tracks} style={{ height: '100%' }}>
            <ParticipantTile />
          </GridLayout>
          
          {/* Controls Bar Floating at bottom */}
          <div style={{ position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)', zIndex: 50 }}>
            <div className="lkr-controls-wrap">
              <ControlBar variation="minimal" controls={{ leave: false, chat: false }} />
            </div>
          </div>
        </div>

        {/* Chat Sidebar */}
        <div style={{ 
          width: showChat ? 350 : 0, 
          opacity: showChat ? 1 : 0,
          visibility: showChat ? 'visible' : 'hidden',
          transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.2s',
          background: 'rgba(10, 10, 20, 0.95)',
          borderLeft: '1px solid rgba(255,255,255,0.07)',
          display: 'flex',
          flexDirection: 'column',
          backdropFilter: 'blur(30px)',
          zIndex: 80,
          overflow: 'hidden'
        }}>
          <div className="custom-chat-container" style={{ width: 350, flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
              <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: 0.5, color: 'rgba(255,255,255,0.8)' }}>CLASS CHAT</span>
              <button onClick={() => setShowChat(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer' }}><X size={16} /></button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
              {/* Persistent History Header */}
              {history.length > 0 && (
                <div style={{ padding: '12px 16px', background: 'rgba(168, 85, 247, 0.03)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ fontSize: 10, fontWeight: 800, color: '#a855f7', opacity: 0.6, letterSpacing: 1, textAlign: 'center', marginBottom: 12 }}>PREVIOUS MESSAGES</div>
                  {history.map(m => (
                    <div key={m.id} style={{ marginBottom: 12, padding: '8px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.05)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: '#a855f7' }}>{m.user?.name}</span>
                        <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)' }}>{new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', margin: 0 }}>{m.message}</p>
                    </div>
                  ))}
                  <div style={{ fontSize: 10, fontWeight: 800, color: '#a855f7', opacity: 0.6, letterSpacing: 1, textAlign: 'center', marginTop: 12, borderTop: '1px dashed rgba(168, 85, 247, 0.2)', paddingTop: 12 }}>LIVE CHAT STARTED</div>
                </div>
              )}
              <Chat />
            </div>
          </div>
        </div>
      </div>
      <RoomAudioRenderer />
    </>
  )
}

export default function RoomClient({ classId, className }: Props) {
  const [tokenData, setTokenData]   = useState<TokenData | null>(null)
  const [error, setError]           = useState<string | null>(null)
  const [stage, setStage]           = useState<Stage>('loading')
  const [videoOn, setVideoOn]       = useState(true)
  const [audioOn, setAudioOn]       = useState(true)
  const [joinedAt]                  = useState(Date.now)

  const fetchToken = useCallback(async () => {
    try {
      setStage('loading'); setError(null)
      const res = await fetch('/api/live-classes/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ classId }),
      })
      if (!res.ok) { const { error } = await res.json(); setError(error || 'Failed to join'); setStage('error'); return }
      setTokenData(await res.json())
      setStage('prejoin')
    } catch { setError('Unable to connect. Check your internet.'); setStage('error') }
  }, [classId])

  useEffect(() => { fetchToken() }, [fetchToken])

  /* ── LOADING ── */
  if (stage === 'loading') return (
    <div className="lkr-center" style={{ background: '#06060f' }}>
      <div className="lkr-logo"><Video size={28} color="#fff" /></div>
      <Loader2 size={26} className="lkr-spin" style={{ color: '#a855f7' }} />
      <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, marginTop: 6 }}>Connecting…</p>
      {CSS}
    </div>
  )

  /* ── ERROR ── */
  if (stage === 'error') return (
    <div className="lkr-center" style={{ background: '#06060f' }}>
      <div className="lkr-err-card">
        <AlertTriangle size={36} color="#f87171" style={{ marginBottom: 14 }} />
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Cannot Join</h2>
        <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 14, marginBottom: 22 }}>{error}</p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
          <button className="lkr-btn-primary" onClick={fetchToken}>Try Again</button>
          <a href="/live-classes" className="lkr-btn-secondary">Back</a>
        </div>
      </div>
      {CSS}
    </div>
  )

  /* ── DISCONNECTED ── */
  if (stage === 'disconnected') return (
    <div className="lkr-center" style={{ background: '#06060f' }}>
      <div className="lkr-err-card">
        <div className="lkr-logo" style={{ margin: '0 auto 20px' }}><Video size={24} color="#fff" /></div>
        <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>You left the class</h2>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, marginBottom: 22 }}>Session ended or you disconnected.</p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
          <button className="lkr-btn-primary" onClick={() => { setStage('prejoin') }}>Rejoin</button>
          <a href="/live-classes" className="lkr-btn-secondary">Back to Classes</a>
        </div>
      </div>
      {CSS}
    </div>
  )

  if (!tokenData) return null

  /* ── PRE-JOIN ── */
  if (stage === 'prejoin') return (
    <div style={{ position: 'fixed', inset: 0, background: '#06060f', display: 'flex', flexDirection: 'column', zIndex: 9999, fontFamily: 'Inter,sans-serif' }}>
      {/* header */}
      <div style={{ height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', background: 'rgba(10,10,20,0.9)', borderBottom: '1px solid rgba(255,255,255,0.07)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className="lkr-logo-sm"><Video size={15} color="#fff" /></div>
          <span style={{ fontWeight: 700, fontSize: 15 }}>{className}</span>
        </div>
        <a href="/live-classes" style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13, textDecoration: 'none' }}>✕ Cancel</a>
      </div>

      {/* body */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, overflowY: 'auto' }}>
        <div style={{ width: '100%', maxWidth: 560 }}>
          <h2 style={{ fontSize: 26, fontWeight: 800, marginBottom: 6, textAlign: 'center' }}>Ready to join?</h2>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, textAlign: 'center', marginBottom: 28 }}>Check your camera &amp; mic before entering the classroom</p>

          {/* Camera / mic toggles */}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 28 }}>
            <button onClick={() => setVideoOn(v => !v)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 10, border: `1px solid ${videoOn ? 'rgba(59,130,246,0.4)' : 'rgba(239,68,68,0.3)'}`, background: videoOn ? 'rgba(59,130,246,0.1)' : 'rgba(239,68,68,0.08)', color: videoOn ? '#60a5fa' : '#f87171', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
              📷 Camera {videoOn ? 'On' : 'Off'}
            </button>
            <button onClick={() => setAudioOn(a => !a)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 10, border: `1px solid ${audioOn ? 'rgba(59,130,246,0.4)' : 'rgba(239,68,68,0.3)'}`, background: audioOn ? 'rgba(59,130,246,0.1)' : 'rgba(239,68,68,0.08)', color: audioOn ? '#60a5fa' : '#f87171', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
              🎤 Mic {audioOn ? 'On' : 'Off'}
            </button>
          </div>

          {/* LiveKit PreJoin for device selection */}
          <div className="lkr-prejoin-wrap">
            <PreJoin
              defaults={{ videoEnabled: videoOn, audioEnabled: audioOn }}
              onSubmit={() => setStage('room')}
              onError={e => console.warn('PreJoin error', e)}
            />
          </div>
        </div>
      </div>
      {CSS}
    </div>
  )

  /* ── ROOM ── */
  return (
    <div className="lkr-room-root" style={{ position: 'fixed', inset: 0, background: '#06060f', zIndex: 9999, fontFamily: 'Inter,sans-serif' }}>
      <LiveKitRoom
        token={tokenData.token}
        serverUrl={tokenData.wsUrl}
        connect={true}
        video={videoOn}
        audio={audioOn}
        onDisconnected={() => setStage('disconnected')}
        style={{ position: 'absolute', inset: 0 }}
      >
        <CustomRoomContent 
          classId={classId}
          className={className} 
          tokenData={tokenData} 
          joinedAt={joinedAt} 
          setStage={setStage} 
        />
      </LiveKitRoom>

      {CSS}
    </div>
  )
}

/* ── Shared styles ── */
const CSS = (
  <style>{`
    .lkr-center { position:fixed; inset:0; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:14px; font-family:Inter,sans-serif; z-index:9999; }
    .lkr-logo { width:56px; height:56px; border-radius:14px; background:linear-gradient(135deg,#ef4444,#dc2626,#000); display:flex; align-items:center; justify-content:center; }
    .lkr-logo-sm { width:32px; height:32px; border-radius:8px; background:linear-gradient(135deg,#ef4444,#dc2626,#000); display:flex; align-items:center; justify-content:center; flex-shrink:0; }
    .lkr-err-card { background:rgba(20,20,35,0.85); border:1px solid rgba(255,255,255,0.08); border-radius:20px; padding:44px 40px; text-align:center; max-width:400px; backdrop-filter:blur(20px); }
    .lkr-btn-primary { background:linear-gradient(135deg,#ef4444,#dc2626); color:#fff; border:none; padding:11px 24px; border-radius:10px; font-size:14px; font-weight:600; cursor:pointer; }
    .lkr-btn-secondary { background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.1); color:rgba(255,255,255,0.7); padding:11px 24px; border-radius:10px; font-size:14px; font-weight:600; text-decoration:none; display:flex; align-items:center; }
    .lkr-spin { animation:spin 1s linear infinite; }
    @keyframes spin { 100% { transform:rotate(360deg); } }
    @keyframes livepulse { 0%,100%{opacity:1} 50%{opacity:0.45} }
    /* Style the LiveKit PreJoin to match dark theme */
    .lkr-prejoin-wrap { --lk-color-primary:#ef4444; }
    .lkr-prejoin-wrap .lk-prejoin { background:rgba(15,15,28,0.6); border:1px solid rgba(255,255,255,0.08); border-radius:16px; }
    /* dvh: fullscreen Chrome changes viewport height — dvh tracks it, vh does not */
    .lkr-room-root { height: 100vh; height: 100dvh; }
    
    /* Premium Chat Styles */
    .custom-chat-container .lk-chat { 
      background: transparent !important; 
      border: none !important; 
      display: flex !important;
      flex-direction: column !important;
      height: 100% !important;
      width: 100% !important;
    }
    .custom-chat-container .lk-chat-messages {
      flex: 1 !important;
      padding: 16px !important;
      gap: 12px !important;
      scrollbar-width: thin;
      scrollbar-color: rgba(255,255,255,0.1) transparent;
    }
    .custom-chat-container .lk-chat-entry {
      background: rgba(255,255,255,0.03) !important;
      border: 1px solid rgba(255,255,255,0.05) !important;
      border-radius: 12px !important;
      padding: 10px 12px !important;
      max-width: 90% !important;
      animation: messageIn 0.3s ease-out !important;
    }
    @keyframes messageIn { from{opacity:0; transform:translateY(10px)} to{opacity:1; transform:translateY(0)} }
    
    .custom-chat-container .lk-chat-entry-author {
      color: #ef4444 !important;
      font-weight: 700 !important;
      font-size: 11px !important;
      text-transform: uppercase !important;
      letter-spacing: 0.5px !important;
      margin-bottom: 4px !important;
    }
    .custom-chat-container .lk-chat-entry-content {
      color: rgba(255,255,255,0.9) !important;
      font-size: 13px !important;
      line-height: 1.5 !important;
    }
    .custom-chat-container .lk-chat-form {
      padding: 16px !important;
      background: rgba(0,0,0,0.2) !important;
      border-top: 1px solid rgba(255,255,255,0.05) !important;
      gap: 10px !important;
    }
    .custom-chat-container .lk-chat-form-input {
      background: rgba(255,255,255,0.05) !important;
      border: 1px solid rgba(255,255,255,0.1) !important;
      border-radius: 10px !important;
      color: #fff !important;
      padding: 10px 14px !important;
      font-size: 13px !important;
      transition: all 0.2s !important;
    }
    .custom-chat-container .lk-chat-form-input:focus {
      border-color: #ef4444 !important;
      background: rgba(239, 68, 68, 0.05) !important;
      outline: none !important;
    }
    .custom-chat-container .lk-chat-form-button {
      background: #ef4444 !important;
      border-radius: 10px !important;
      width: 40px !important;
      height: 40px !important;
      padding: 0 !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      border: none !important;
      transition: all 0.2s !important;
    }
    .custom-chat-container .lk-chat-form-button:hover {
      background: #dc2626 !important;
      transform: scale(1.05);
    }

    /* Control Bar Customization */
    .lkr-controls-wrap .lk-control-bar {
      background: rgba(20, 20, 35, 0.8) !important;
      backdrop-filter: blur(20px) !important;
      border: 1px solid rgba(255,255,255,0.1) !important;
      border-radius: 16px !important;
      padding: 8px 12px !important;
      gap: 10px !important;
    }
    .lkr-controls-wrap .lk-button {
      background: rgba(255,255,255,0.05) !important;
      border-radius: 10px !important;
      transition: all 0.2s !important;
    }
    .lkr-controls-wrap .lk-button:hover {
      background: rgba(255,255,255,0.1) !important;
    }
    .lkr-controls-wrap .lk-button[data-lk-active="true"] {
      background: rgba(239, 68, 68, 0.2) !important;
      color: #f87171 !important;
    }

    /* Mobile adjustments */
    @media (max-width: 768px) {
      .custom-chat-container { width: 100% !important; position: absolute; inset: 0; }
    }
  `}</style>
)
