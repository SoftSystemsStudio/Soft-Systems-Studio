import React, { useState } from 'react';

export type ChatWidgetProps = {
  apiUrl?: string; // full URL to backend chat endpoint
  workspaceId?: string;
};

export const ChatWidget: React.FC<ChatWidgetProps> = ({
  apiUrl = '/api/v1/agents/customer-service/run',
  workspaceId = 'demo',
}) => {
  const [text, setText] = useState('');
  const [messages, setMessages] = useState<{ from: string; text: string }[]>([]);
  const [loading, setLoading] = useState(false);

  async function send() {
    if (!text) return;
    const user = text;
    setMessages((m) => [...m, { from: 'user', text: user }]);
    setText('');
    setLoading(true);
    try {
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workspaceId, message: user }),
      });
      const json = await res.json();
      setMessages((m) => [...m, { from: 'assistant', text: json.reply || JSON.stringify(json) }]);
    } catch (e) {
      setMessages((m) => [...m, { from: 'assistant', text: 'Error contacting API' }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        width: 340,
        border: '1px solid #ddd',
        borderRadius: 8,
        padding: 12,
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
    >
      <div style={{ height: 240, overflow: 'auto', marginBottom: 8 }}>
        {messages.map((m, i) => (
          <div key={i} style={{ margin: '6px 0' }}>
            <b>{m.from}:</b>
            <div>{m.text}</div>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <input value={text} onChange={(e) => setText(e.target.value)} style={{ flex: 1 }} />
        <button onClick={send} disabled={loading}>
          {loading ? '...' : 'Send'}
        </button>
      </div>
    </div>
  );
};

export default ChatWidget;
