'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LiveKitRoom,
  RoomAudioRenderer,
  useVoiceAssistant,
  useRoomContext,
} from '@livekit/components-react';
import { DisconnectReason } from 'livekit-client';

type TokenResponse = {
  token: string;
  serverUrl: string;
  roomName: string;
  capSeconds: number;
};

type Phase =
  | 'idle'
  | 'requesting-mic'
  | 'mic-denied'
  | 'connecting'
  | 'busy'
  | 'rate-limited'
  | 'in-room' // connected to LiveKit, agent may or may not have joined yet
  | 'live' // agent has joined and is in the conversation
  | 'ended'
  | 'error';

// How long we'll wait, once connected to the room, for the agent to actually
// join before giving up and treating it the same as "busy". Dispatch is
// normally near-instant; this only fires if all 5 free-tier agent slots are
// taken or something else goes wrong.
const AGENT_JOIN_TIMEOUT_MS = 20_000;

const MIC_DENIED_MESSAGE =
  'Microphone access was blocked. Allow microphone access for this site in your browser settings, then try again.';

export default function VoiceDemo() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [phase, setPhase] = useState<Phase>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [session, setSession] = useState<TokenResponse | null>(null);
  // Read inside the onDisconnected callback to tell "never made it to a live
  // call" apart from "call ended normally". A ref (not `phase` state) so the
  // value is never stale even if LiveKitRoom captured an older render's
  // callback closure.
  const hasGoneLiveRef = useRef(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const reset = useCallback(() => {
    hasGoneLiveRef.current = false;
    setPhase('idle');
    setErrorMessage('');
    setSession(null);
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    // Small delay so the closing animation doesn't visibly snap back to idle.
    setTimeout(reset, 300);
  }, [reset]);

  const start = useCallback(async () => {
    hasGoneLiveRef.current = false;
    setOpen(true);
    setPhase('requesting-mic');
    setErrorMessage('');

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // We only needed this to confirm permission; LiveKit captures its own
      // mic track once connected.
      stream.getTracks().forEach((track) => track.stop());
    } catch {
      setPhase('mic-denied');
      return;
    }

    setPhase('connecting');
    try {
      const res = await fetch('/api/livekit-token', { method: 'POST' });
      const data = (await res.json()) as {
        error?: string;
        message?: string;
      } & Partial<TokenResponse>;

      if (!res.ok || !data.token || !data.serverUrl || !data.roomName) {
        if (res.status === 429) {
          setErrorMessage(data.message ?? 'Please wait a moment before trying again.');
          setPhase('rate-limited');
        } else if (res.status === 503) {
          setErrorMessage(
            data.message ?? 'The demo is busy right now. Please try again in a minute.',
          );
          setPhase('busy');
        } else {
          setErrorMessage(data.message ?? 'Could not start the demo. Please try again.');
          setPhase('error');
        }
        return;
      }

      setSession({
        token: data.token,
        serverUrl: data.serverUrl,
        roomName: data.roomName,
        capSeconds: data.capSeconds ?? 180,
      });
      setPhase('in-room');
    } catch {
      setErrorMessage('Connection error. Please check your connection and try again.');
      setPhase('error');
    }
  }, []);

  const modalContent = (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={phase === 'live' ? undefined : close}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              backdropFilter: 'blur(4px)',
              zIndex: 9998,
            }}
          />
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1rem',
              pointerEvents: 'none',
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', duration: 0.5 }}
              style={{ width: '100%', maxWidth: '28rem', pointerEvents: 'auto' }}
            >
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 shadow-2xl relative">
                {phase !== 'live' && (
                  <button
                    onClick={close}
                    aria-label="Close"
                    className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                )}

                {(phase === 'in-room' || phase === 'live') && session ? (
                  <LiveKitRoom
                    token={session.token}
                    serverUrl={session.serverUrl}
                    connect
                    audio
                    video={false}
                    onDisconnected={(reason) => {
                      // If we never made it to a live call, an early
                      // disconnect means the agent didn't show up — treat it
                      // the same as "busy" rather than a confusing generic
                      // error. hasGoneLiveRef (not `phase`) so this is never
                      // reading a stale closure.
                      if (hasGoneLiveRef.current) {
                        setErrorMessage('');
                        setPhase('ended');
                        return;
                      }
                      setErrorMessage(
                        reason === DisconnectReason.SERVER_SHUTDOWN ||
                          reason === undefined ||
                          reason === DisconnectReason.UNKNOWN_REASON
                          ? 'The demo is busy right now. Please try again in a minute.'
                          : 'Connection lost before the call could start. Please try again.',
                      );
                      setPhase('busy');
                    }}
                    onError={() => {
                      setErrorMessage('Connection error. Please try again.');
                      setPhase('error');
                    }}
                  >
                    <RoomAudioRenderer />
                    <LiveCallView
                      capSeconds={session.capSeconds}
                      onAgentJoined={() => {
                        hasGoneLiveRef.current = true;
                        setPhase('live');
                      }}
                      onAgentTimeout={() => {
                        setErrorMessage(
                          'The demo is busy right now — all AI receptionist lines are in use. Please try again in a minute.',
                        );
                        setPhase('busy');
                      }}
                      isLive={phase === 'live'}
                      onEndCall={close}
                    />
                  </LiveKitRoom>
                ) : (
                  <IdlePhases
                    phase={phase}
                    errorMessage={errorMessage}
                    onRetry={() => void start()}
                    onClose={close}
                  />
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );

  return (
    <>
      <button
        onClick={() => void start()}
        className="px-8 py-4 bg-gradient-to-r from-lime-400 to-cyan-400 text-black font-bold rounded-lg hover:scale-105 transition-all duration-300 shadow-lg shadow-lime-400/30"
      >
        🎙️ Talk to Our AI Receptionist Now
      </button>
      {/* Portal target (document.body) only exists client-side — gate just
          the portal, not the button, so the CTA still renders in the
          server-rendered HTML. */}
      {mounted && createPortal(modalContent, document.body)}
    </>
  );
}

function IdlePhases({
  phase,
  errorMessage,
  onRetry,
  onClose,
}: {
  phase: Phase;
  errorMessage: string;
  onRetry: () => void;
  onClose: () => void;
}) {
  const header = (
    <div className="w-16 h-16 bg-lime-400/10 rounded-full flex items-center justify-center mx-auto mb-4">
      <svg className="w-8 h-8 text-lime-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z"
        />
      </svg>
    </div>
  );

  if (phase === 'requesting-mic' || phase === 'connecting') {
    return (
      <div className="text-center py-4">
        {header}
        <Spinner />
        <p className="text-white font-semibold mt-4">
          {phase === 'requesting-mic' ? 'Requesting microphone access...' : 'Connecting you now...'}
        </p>
        <p className="text-gray-500 text-sm mt-2">
          {phase === 'requesting-mic'
            ? 'Your browser will ask permission to use your microphone.'
            : "Chattahoochee Auto & Tire's AI receptionist will pick up in a moment."}
        </p>
      </div>
    );
  }

  if (phase === 'mic-denied') {
    return (
      <div className="text-center py-4">
        {header}
        <h2 className="text-xl font-bold text-white mb-2">Microphone access needed</h2>
        <p className="text-gray-400 mb-6">{MIC_DENIED_MESSAGE}</p>
        <RetryButton onRetry={onRetry} onClose={onClose} />
      </div>
    );
  }

  if (phase === 'busy' || phase === 'rate-limited') {
    return (
      <div className="text-center py-4">
        <div className="w-16 h-16 bg-amber-400/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-amber-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
            />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-white mb-2">
          {phase === 'busy' ? 'Demo is busy right now' : 'Slow down a little'}
        </h2>
        <p className="text-gray-400 mb-6">{errorMessage}</p>
        <RetryButton onRetry={onRetry} onClose={onClose} />
      </div>
    );
  }

  if (phase === 'ended') {
    return (
      <div className="text-center py-4">
        <div className="w-16 h-16 bg-lime-400/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-lime-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-white mb-2">That's the demo!</h2>
        <p className="text-gray-400 mb-6">
          That's what your customers would experience, 24/7. Ready to get this for your business?
        </p>
        <div className="flex flex-col gap-3">
          <a
            href="/intake"
            className="w-full py-3 rounded-lg font-bold bg-lime-400 text-black hover:bg-lime-300 transition-all text-center"
          >
            Get This For My Business
          </a>
          <button
            onClick={onClose}
            className="w-full py-3 rounded-lg font-medium text-gray-400 hover:text-white transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  if (phase === 'error') {
    return (
      <div className="text-center py-4">
        <div className="w-16 h-16 bg-red-400/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-red-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
            />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Something went wrong</h2>
        <p className="text-gray-400 mb-6">{errorMessage || 'Please try again.'}</p>
        <RetryButton onRetry={onRetry} onClose={onClose} />
      </div>
    );
  }

  // idle — shouldn't render (modal only opens once a phase is set), but keep
  // a safe fallback.
  return null;
}

function RetryButton({ onRetry, onClose }: { onRetry: () => void; onClose: () => void }) {
  return (
    <div className="flex flex-col gap-3">
      <button
        onClick={onRetry}
        className="w-full py-3 rounded-lg font-bold bg-lime-400 text-black hover:bg-lime-300 transition-all"
      >
        Try Again
      </button>
      <button
        onClick={onClose}
        className="w-full py-3 rounded-lg font-medium text-gray-400 hover:text-white transition-colors"
      >
        Close
      </button>
    </div>
  );
}

function Spinner() {
  return (
    <svg className="animate-spin w-8 h-8 text-lime-400 mx-auto" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

const AGENT_STATE_LABEL: Record<string, string> = {
  connecting: 'Connecting the call...',
  initializing: 'Connecting the call...',
  listening: 'Listening — go ahead, ask about a service',
  thinking: 'Thinking...',
  speaking: 'Speaking...',
  idle: 'Waiting...',
};

function LiveCallView({
  capSeconds,
  isLive,
  onAgentJoined,
  onAgentTimeout,
  onEndCall,
}: {
  capSeconds: number;
  isLive: boolean;
  onAgentJoined: () => void;
  onAgentTimeout: () => void;
  onEndCall: () => void;
}) {
  const { agent, state } = useVoiceAssistant();
  const room = useRoomContext();
  const [secondsLeft, setSecondsLeft] = useState(capSeconds);
  const joinedRef = useRef(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Give the agent a window to dispatch and join before giving up. Only
  // ever set up once, on mount — deliberately not re-run when `room` or
  // `onAgentTimeout` change identity.
  useEffect(() => {
    timeoutRef.current = setTimeout(() => {
      if (!joinedRef.current) {
        void room.disconnect();
        onAgentTimeout();
      }
    }, AGENT_JOIN_TIMEOUT_MS);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  useEffect(() => {
    if (agent && !joinedRef.current) {
      joinedRef.current = true;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      onAgentJoined();
    }
  }, [agent, onAgentJoined]);

  useEffect(() => {
    if (!isLive) return;
    const interval = setInterval(() => {
      setSecondsLeft((s) => Math.max(0, s - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [isLive]);

  if (!isLive) {
    return (
      <div className="text-center py-4">
        <div className="w-16 h-16 bg-lime-400/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <PhonePulseIcon />
        </div>
        <Spinner />
        <p className="text-white font-semibold mt-4">Connecting you now...</p>
        <p className="text-gray-500 text-sm mt-2">
          Chattahoochee Auto & Tire's AI receptionist will pick up in a moment.
        </p>
      </div>
    );
  }

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  // eslint-disable-next-line security/detect-object-injection -- state is a typed AgentState union, not user input
  const label = AGENT_STATE_LABEL[state] ?? 'Connected';

  return (
    <div className="text-center py-4">
      <div className="w-16 h-16 bg-lime-400/10 rounded-full flex items-center justify-center mx-auto mb-4 relative">
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-lime-400"
          animate={{ opacity: state === 'speaking' ? [0.3, 1, 0.3] : 0.3 }}
          transition={{ repeat: state === 'speaking' ? Infinity : 0, duration: 1.2 }}
        />
        <PhonePulseIcon />
      </div>
      <h2 className="text-xl font-bold text-white mb-1">Chattahoochee Auto &amp; Tire</h2>
      <p className="text-lime-400 text-sm font-medium mb-4">{label}</p>
      <p className="text-gray-500 text-xs mb-6">
        Demo calls end automatically after 3 minutes — {minutes}:{String(seconds).padStart(2, '0')}{' '}
        left
      </p>
      <button
        onClick={onEndCall}
        className="w-full py-3 rounded-lg font-bold bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20 transition-all"
      >
        End Call
      </button>
    </div>
  );
}

function PhonePulseIcon() {
  return (
    <svg className="w-8 h-8 text-lime-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
      />
    </svg>
  );
}
