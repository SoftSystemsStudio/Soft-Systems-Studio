import React, { useState, useRef, useEffect } from 'react';

export type ChatMessage = {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: Date;
};

export type ChatWidgetProps = {
  apiUrl?: string;
  title?: string;
  placeholder?: string;
  greeting?: string;
  position?: 'bottom-right' | 'bottom-left';
  primaryColor?: string;
  onMessage?: (message: ChatMessage) => void;
};

export const ChatWidget: React.FC<ChatWidgetProps> = ({
  apiUrl = '/api/v1/public/chat',
  title = 'Chat with us',
  placeholder = 'Type your message...',
  greeting = 'Hi! How can I help you today?',
  position = 'bottom-right',
  primaryColor = '#2563eb',
  onMessage,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: greeting, timestamp: new Date() },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);

    if (onMessage) {
      onMessage(userMessage);
    }

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage.content,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      const data = await response.json();
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: data.reply,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      if (onMessage) {
        onMessage(assistantMessage);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to send message. Please try again.';
      setError(errorMessage);

      const errorResponse: ChatMessage = {
        role: 'assistant',
        content: "I'm having trouble connecting right now. Please try again in a moment.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorResponse]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const positionStyles =
    position === 'bottom-right'
      ? { bottom: '20px', right: '20px' }
      : { bottom: '20px', left: '20px' };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        style={{
          position: 'fixed',
          ...positionStyles,
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          backgroundColor: primaryColor,
          color: 'white',
          border: 'none',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '24px',
          zIndex: 1000,
          transition: 'transform 0.2s',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.1)')}
        onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        aria-label="Open chat"
      >
        💬
      </button>
    );
  }

  return (
    <div
      style={{
        position: 'fixed',
        ...positionStyles,
        width: '380px',
        maxWidth: 'calc(100vw - 40px)',
        height: '600px',
        maxHeight: 'calc(100vh - 100px)',
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        zIndex: 1000,
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      {/* Header */}
      <div
        style={{
          backgroundColor: primaryColor,
          color: 'white',
          padding: '16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>{title}</h3>
        <button
          onClick={() => setIsOpen(false)}
          style={{
            background: 'none',
            border: 'none',
            color: 'white',
            fontSize: '24px',
            cursor: 'pointer',
            padding: '0',
            width: '24px',
            height: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          aria-label="Close chat"
        >
          ×
        </button>
      </div>

      {/* Messages */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px',
          backgroundColor: '#f9fafb',
        }}
      >
        {messages.map((message, index) => (
          <div
            key={index}
            style={{
              marginBottom: '12px',
              display: 'flex',
              justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start',
            }}
          >
            <div
              style={{
                maxWidth: '80%',
                padding: '10px 14px',
                borderRadius: '12px',
                backgroundColor: message.role === 'user' ? primaryColor : 'white',
                color: message.role === 'user' ? 'white' : '#1f2937',
                fontSize: '14px',
                lineHeight: '1.5',
                boxShadow: message.role === 'assistant' ? '0 1px 2px rgba(0, 0, 0, 0.05)' : 'none',
                wordWrap: 'break-word',
              }}
            >
              {message.content}
            </div>
          </div>
        ))}

        {isLoading && (
          <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '12px' }}>
            <div
              style={{
                padding: '10px 14px',
                borderRadius: '12px',
                backgroundColor: 'white',
                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
              }}
            >
              <div style={{ display: 'flex', gap: '4px' }}>
                <div
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: '#9ca3af',
                    animation: 'bounce 1.4s infinite ease-in-out both',
                  }}
                />
                <div
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: '#9ca3af',
                    animation: 'bounce 1.4s infinite ease-in-out both 0.16s',
                  }}
                />
                <div
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: '#9ca3af',
                    animation: 'bounce 1.4s infinite ease-in-out both 0.32s',
                  }}
                />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Error Message */}
      {error && (
        <div
          style={{
            padding: '8px 16px',
            backgroundColor: '#fef2f2',
            color: '#991b1b',
            fontSize: '12px',
            borderTop: '1px solid #fee2e2',
          }}
        >
          {error}
        </div>
      )}

      {/* Input */}
      <div
        style={{
          padding: '16px',
          borderTop: '1px solid #e5e7eb',
          backgroundColor: 'white',
        }}
      >
        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            disabled={isLoading}
            style={{
              flex: 1,
              padding: '10px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '14px',
              outline: 'none',
              transition: 'border-color 0.2s',
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = primaryColor)}
            onBlur={(e) => (e.currentTarget.style.borderColor = '#d1d5db')}
          />
          <button
            onClick={sendMessage}
            disabled={isLoading || !input.trim()}
            style={{
              padding: '10px 20px',
              backgroundColor: primaryColor,
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: isLoading || !input.trim() ? 'not-allowed' : 'pointer',
              opacity: isLoading || !input.trim() ? 0.6 : 1,
              transition: 'opacity 0.2s',
            }}
          >
            {isLoading ? '...' : 'Send'}
          </button>
        </div>
        <div
          style={{
            marginTop: '8px',
            fontSize: '11px',
            color: '#6b7280',
            textAlign: 'center',
          }}
        >
          Powered by Soft Systems Studio
        </div>
      </div>

      {/* CSS Animation for typing indicator */}
      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { 
            transform: scale(0);
          } 
          40% { 
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
};

export default ChatWidget;
