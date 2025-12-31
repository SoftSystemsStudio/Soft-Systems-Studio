import Head from 'next/head';
import dynamic from 'next/dynamic';
import { useState, useRef, useEffect } from 'react';
import env from '../lib/env';

// Dynamic import for the 3D component to avoid SSR issues with Canvas
const AgentNetwork = dynamic(() => import('../components/demo/AgentNetwork'), { ssr: false });

type Role = 'user' | 'assistant' | 'system';

interface Message {
  role: Role;
  content: string;
}

export default function DemoPage() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'system', content: 'INITIALIZING SOFT SYSTEMS CORE...' },
    { role: 'system', content: 'CONNECTION ESTABLISHED.' },
    { role: 'assistant', content: 'Greetings. I am the Orchestrator. How can I assist you today?' },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    (async () => {
      if (!input.trim() || loading) return;

      const userMsg = input;
      setInput('');
      setMessages((prev) => [...prev, { role: 'user', content: userMsg }]);
      setLoading(true);

      try {
        const apiUrl = env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
        const res = await fetch(`${apiUrl}/api/v1/public/chat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            workspaceId: 'demo-workspace', // Using a default ID for the demo
            message: userMsg,
          }),
        });

        if (!res.ok) {
          throw new Error('Network response was not ok');
        }

        const data: unknown = await res.json();
        // Adjust based on actual API response shape. Assuming { reply: string } or similar.
        // If the backend returns { reply: "..." }
        const reply =
          typeof data === 'object' && data !== null && 'reply' in data
            ? (data as { reply: string }).reply
            : typeof data === 'object' && data !== null && 'message' in data
              ? (data as { message: string }).message
              : 'I received your message but could not parse the response.';

        setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
      } catch (error) {
        setMessages((prev) => [
          ...prev,
          {
            role: 'system',
            content: `ERROR: CONNECTION LOST - ${error instanceof Error ? error.message : String(error)}`,
          },
        ]);
      } finally {
        setLoading(false);
      }
    })();
  };

  return (
    <>
      <Head>
        <title>Soft Systems Studio | Neural Demo</title>
        <meta
          name="description"
          content="Experience our AI system in action. Interactive demo of Soft Systems Studio."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="canonical" href="https://softsystemsstudiollc.com/demo" />
      </Head>
      <main className="relative w-screen h-screen overflow-hidden bg-black text-white font-mono">
        {/* 3D Background Layer */}
        <div className="absolute inset-0 z-0">
          <AgentNetwork />
        </div>

        {/* UI Overlay Layer */}
        <div className="absolute inset-0 z-10 flex flex-col pointer-events-none">
          {/* Header */}
          <header className="p-6 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent pointer-events-auto">
            <div>
              <h1 className="text-2xl font-bold tracking-widest text-[#00ff88] drop-shadow-[0_0_10px_rgba(0,255,136,0.5)]">
                SOFT SYSTEMS // STUDIO
              </h1>
              <div className="flex items-center gap-2 text-xs text-white/60">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                LIVE NETWORK VISUALIZATION
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <a
                href="/"
                className="text-xs font-mono text-[#00ff88] border border-[#00ff88]/50 px-3 py-1 rounded hover:bg-[#00ff88]/10 transition-colors"
              >
                ← RETURN TO BASE
              </a>
              <div className="text-right text-xs text-white/40">
                <div>BUILD v9.2.1</div>
                <div>LATENCY: 14ms</div>
              </div>
            </div>
          </header>

          <div className="flex-1"></div>

          {/* Chat Terminal */}
          <div className="p-4 md:p-8 flex justify-center pointer-events-auto">
            <div className="w-full max-w-2xl bg-black/60 backdrop-blur-md border border-white/10 rounded-lg overflow-hidden shadow-2xl shadow-purple-900/20 flex flex-col h-[400px]">
              {/* Terminal Header */}
              <div className="bg-white/5 p-2 px-4 text-xs flex items-center justify-between border-b border-white/10">
                <span>TERMINAL_ACCESS_V1</span>
                <span className="text-green-500">SECURE</span>
              </div>

              {/* Messages Area */}
              <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-4 space-y-3 font-mono text-sm"
              >
                {messages.map((m, i) => (
                  <div
                    key={i}
                    className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] p-2 rounded ${
                        m.role === 'user'
                          ? 'bg-[#00ff88]/20 border border-[#00ff88]/40 text-[#00ff88]'
                          : m.role === 'system'
                            ? 'text-red-400 text-xs italic'
                            : 'bg-white/10 border border-white/20 text-indigo-300'
                      }`}
                    >
                      {m.role === 'assistant' && (
                        <span className="mr-2 text-xs text-indigo-500">[ORCHESTRATOR]</span>
                      )}
                      {m.content}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="text-xs text-white/30 animate-pulse">Processing stream...</div>
                )}
              </div>

              {/* Input Area */}
              <form
                onSubmit={handleSubmit}
                className="border-t border-white/10 p-2 bg-black/40 flex"
              >
                <span className="text-green-500 mr-2 py-2">{'>'}</span>
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="flex-1 bg-transparent border-none outline-none text-white font-mono placeholder-white/20"
                  placeholder="Enter command or query..."
                  autoFocus
                />
              </form>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
