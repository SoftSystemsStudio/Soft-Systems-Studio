'use client';

import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * AIConcierge - Full-screen conversational AI interface
 *
 * Features:
 * - Voice input via Web Speech API (spacebar to talk)
 * - Streaming responses
 * - Context-aware suggestions based on browsing history
 * - "Thinking" visualization
 * - Voice output option
 */

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
}

interface BrowsingContext {
  pagesVisited: string[];
  timeOnSite: number;
  lastSection: string;
}

export interface AIConciergeProps {
  /** Initial greeting message */
  greeting?: string;
  /** API endpoint for chat */
  apiEndpoint?: string;
  /** Browsing context for personalization */
  context?: BrowsingContext;
  /** Whether to enable voice input */
  enableVoice?: boolean;
  /** Callback when conversation is submitted */
  onSubmit?: (messages: Message[]) => void;
  /** Whether displayed in full-screen mode */
  fullScreen?: boolean;
  /** Close handler for modal mode */
  onClose?: () => void;
}

// Suggested prompts based on context
const CONTEXT_SUGGESTIONS: Record<string, string[]> = {
  pricing: [
    "What's included in the Voice AI package?",
    'Can I get a custom quote?',
    'What are the ongoing costs?',
  ],
  services: [
    'Tell me about your AI automation services',
    'How long does a typical project take?',
    'Do you work with small businesses?',
  ],
  voice: [
    'Can I hear a demo of the AI voice?',
    'What languages does the voice AI support?',
    'How does call routing work?',
  ],
  ecommerce: [
    'Can you build a Shopify integration?',
    'How do you handle payment processing?',
    'What about inventory management?',
  ],
  default: [
    'What services do you offer?',
    'How much does a typical project cost?',
    'Can I see some examples of your work?',
  ],
};

export default function AIConcierge({
  greeting = "Hello! I'm the Soft Systems AI. How can I help you build something incredible today?",
  apiEndpoint = '/api/chat',
  context,
  enableVoice = true,
  onSubmit,
  fullScreen = false,
  onClose,
}: AIConciergeProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'greeting',
      role: 'assistant',
      content: greeting,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [speechSynthSupported, setSpeechSynthSupported] = useState(false);
  const [speakResponses, setSpeakResponses] = useState(false);
  const [showThinking, setShowThinking] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Determine suggestions based on context
  const suggestions = useMemo(() => {
    if (!context?.lastSection) return CONTEXT_SUGGESTIONS.default;

    const section = context.lastSection.toLowerCase();
    for (const [key, value] of Object.entries(CONTEXT_SUGGESTIONS)) {
      if (section.includes(key)) return value;
    }
    return CONTEXT_SUGGESTIONS.default;
  }, [context]);

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognitionAPI) {
        setVoiceSupported(true);
        const recognition = new SpeechRecognitionAPI();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        recognition.onresult = (event: any) => {
          const transcript = Array.from(event.results as ArrayLike<{ 0: { transcript: string } }>)
            .map((result) => result[0].transcript)
            .join('');
          setInput(transcript);
        };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        recognition.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }

      // Check for speech synthesis
      if ('speechSynthesis' in window) {
        setSpeechSynthSupported(true);
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  // Handle spacebar for voice input
  useEffect(() => {
    if (!enableVoice || !voiceSupported) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && e.target === document.body && !isLoading) {
        e.preventDefault();
        startListening();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space' && isListening) {
        stopListening();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [enableVoice, voiceSupported, isListening, isLoading]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const startListening = useCallback(() => {
    if (!recognitionRef.current || isListening) return;

    try {
      recognitionRef.current.start();
      setIsListening(true);
    } catch (e) {
      console.error('Failed to start recognition:', e);
    }
  }, [isListening]);

  const stopListening = useCallback(() => {
    if (!recognitionRef.current) return;
    recognitionRef.current.stop();
    setIsListening(false);
  }, []);

  const speakText = useCallback(
    (text: string) => {
      if (!speechSynthSupported || !speakResponses) return;

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;

      // Try to find a nice voice
      const voices = speechSynthesis.getVoices();
      const preferredVoice = voices.find(
        (v) => v.name.includes('Google') || v.name.includes('Samantha'),
      );
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      speechSynthesis.speak(utterance);
    },
    [speechSynthSupported, speakResponses],
  );

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isLoading) return;

      // Add user message
      const userMessage: Message = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: content.trim(),
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setInput('');
      setIsLoading(true);
      setShowThinking(true);

      // Create assistant message placeholder for streaming
      const assistantId = `assistant-${Date.now()}`;
      setMessages((prev) => [
        ...prev,
        {
          id: assistantId,
          role: 'assistant',
          content: '',
          timestamp: new Date(),
          isStreaming: true,
        },
      ]);

      try {
        abortControllerRef.current = new AbortController();

        const response = await fetch(apiEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: messages.concat(userMessage).map((m) => ({
              role: m.role,
              content: m.content,
            })),
            context: context,
          }),
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) throw new Error('Failed to get response');

        // Handle streaming response
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let fullContent = '';

        if (reader) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            fullContent += chunk;

            setMessages((prev) =>
              prev.map((m) => (m.id === assistantId ? { ...m, content: fullContent } : m)),
            );
          }
        } else {
          // Fallback for non-streaming response
          const data = await response.json();
          fullContent =
            data.content || data.message || "I'm sorry, I couldn't process that request.";

          setMessages((prev) =>
            prev.map((m) => (m.id === assistantId ? { ...m, content: fullContent } : m)),
          );
        }

        // Mark streaming complete
        setMessages((prev) =>
          prev.map((m) => (m.id === assistantId ? { ...m, isStreaming: false } : m)),
        );

        // Speak response if enabled
        speakText(fullContent);
      } catch (error) {
        if ((error as Error).name === 'AbortError') return;

        console.error('Chat error:', error);

        // Show error message
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? {
                  ...m,
                  content:
                    "I'm experiencing some technical difficulties. Please try again or contact us directly.",
                  isStreaming: false,
                }
              : m,
          ),
        );
      } finally {
        setIsLoading(false);
        setShowThinking(false);
      }
    },
    [messages, apiEndpoint, context, isLoading, speakText],
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleSuggestionClick = (suggestion: string) => {
    sendMessage(suggestion);
  };

  const containerClass = fullScreen
    ? 'fixed inset-0 bg-black z-50 flex flex-col'
    : 'w-full max-w-2xl mx-auto bg-gray-900 rounded-2xl overflow-hidden border border-gray-800';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className={containerClass}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800 bg-black/50 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-lime to-cyan-400 flex items-center justify-center">
              <span className="text-black text-lg">🤖</span>
            </div>
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-brand-lime border-2 border-black"
            />
          </div>
          <div>
            <div className="font-bold text-white">Soft Systems AI</div>
            <div className="text-xs text-gray-400">{isLoading ? 'Thinking...' : 'Online'}</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {speechSynthSupported && (
            <button
              onClick={() => setSpeakResponses(!speakResponses)}
              className={`p-2 rounded-lg transition-colors ${
                speakResponses
                  ? 'bg-brand-lime/20 text-brand-lime'
                  : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
              title={speakResponses ? 'Voice enabled' : 'Enable voice'}
            >
              🔊
            </button>
          )}

          {onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-gray-800 text-gray-400 hover:text-white transition-colors"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        <AnimatePresence mode="popLayout">
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  message.role === 'user'
                    ? 'bg-brand-lime text-black rounded-br-sm'
                    : 'bg-gray-800 text-white rounded-bl-sm'
                }`}
              >
                <div className="whitespace-pre-wrap">{message.content}</div>
                {message.isStreaming && (
                  <motion.span
                    animate={{ opacity: [1, 0, 1] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                    className="inline-block w-2 h-4 bg-current ml-1"
                  />
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Thinking indicator */}
        <AnimatePresence>
          {showThinking && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex justify-start"
            >
              <div className="bg-gray-800 rounded-2xl px-4 py-3 rounded-bl-sm">
                <div className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      animate={{ y: [0, -5, 0] }}
                      transition={{
                        duration: 0.5,
                        repeat: Infinity,
                        delay: i * 0.1,
                      }}
                      className="w-2 h-2 rounded-full bg-brand-lime"
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions */}
      {messages.length === 1 && (
        <div className="px-6 pb-4">
          <div className="text-xs text-gray-500 mb-2">Suggested questions:</div>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion, i) => (
              <motion.button
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                onClick={() => handleSuggestionClick(suggestion)}
                className="px-3 py-1.5 bg-gray-800 text-gray-300 text-sm rounded-full hover:bg-gray-700 hover:text-white transition-colors"
              >
                {suggestion}
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-800 bg-black/50">
        <div className="flex gap-3">
          {/* Voice button */}
          {enableVoice && voiceSupported && (
            <button
              type="button"
              onMouseDown={startListening}
              onMouseUp={stopListening}
              onTouchStart={startListening}
              onTouchEnd={stopListening}
              className={`p-3 rounded-xl transition-all ${
                isListening
                  ? 'bg-red-500 text-white scale-110 animate-pulse'
                  : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
              title="Hold to speak"
            >
              🎤
            </button>
          )}

          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              placeholder={isListening ? 'Listening...' : 'Type your message...'}
              rows={1}
              className="w-full px-4 py-3 bg-gray-800 text-white rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-brand-lime/50 placeholder-gray-500"
              disabled={isLoading}
            />
          </div>

          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="p-3 rounded-xl bg-brand-lime text-black font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-brand-lime/90 transition-colors"
          >
            →
          </button>
        </div>

        {enableVoice && voiceSupported && (
          <div className="text-xs text-gray-500 text-center mt-2">
            Hold <kbd className="px-1.5 py-0.5 bg-gray-800 rounded text-gray-400">Space</kbd> to
            speak
          </div>
        )}
      </form>
    </motion.div>
  );
}

// Type declarations for Web Speech API
declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    SpeechRecognition: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    webkitSpeechRecognition: any;
  }
}
