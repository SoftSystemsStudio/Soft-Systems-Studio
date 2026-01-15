'use client';

import { useState, useEffect } from 'react';

export default function SystemStatus() {
  const [time, setTime] = useState(new Date());
  const [location, setLocation] = useState('UNKNOWN');
  const [latency, setLatency] = useState(0);
  const [bootSequence, setBootSequence] = useState(0);

  useEffect(() => {
    // Update time every second
    const timeInterval = setInterval(() => {
      setTime(new Date());
    }, 1000);

    // Get user location
    fetch('https://ipapi.co/json/')
      .then((res) => res.json())
      .then((data: { city?: string; region?: string }) => {
        if (data.city && data.region) {
          setLocation(`${data.city}, ${data.region}`);
        } else {
          setLocation('EARTH');
        }
      })
      .catch(() => {
        setLocation('EARTH');
      });

    // Measure latency
    const start = performance.now();
    fetch('/api/health')
      .then(() => {
        const end = performance.now();
        setLatency(Math.round(end - start));
      })
      .catch(() => {
        setLatency(Math.round(Math.random() * 20 + 15)); // Fallback
      });

    // Boot sequence animation
    const bootInterval = setInterval(() => {
      setBootSequence((prev) => {
        if (prev >= 100) {
          clearInterval(bootInterval);
          return 100;
        }
        return prev + Math.random() * 25;
      });
    }, 100);

    return () => {
      clearInterval(timeInterval);
      clearInterval(bootInterval);
    };
  }, []);

  const isBooted = bootSequence >= 100;

  return (
    <div className="blueprint-border bg-blueprint-paper p-8 font-mono text-sm">
      {/* Boot Sequence */}
      {!isBooted && (
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-terminal-green animate-pulse" />
            <span className="text-blueprint-dark">INITIALIZING SYSTEM...</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-blueprint-grid h-2 relative overflow-hidden">
              <div
                className="absolute inset-y-0 left-0 bg-terminal-green transition-all duration-200"
                style={{ width: `${bootSequence}%` }}
              />
            </div>
            <span className="text-blueprint-dark w-12 text-right">{Math.round(bootSequence)}%</span>
          </div>
        </div>
      )}

      {/* System Status */}
      {isBooted && (
        <div className="space-y-3">
          <div className="flex items-center gap-3 pb-3 border-b border-blueprint-grid">
            <div className="w-3 h-3 bg-terminal-green" />
            <span className="font-bold">SOFT SYSTEMS STUDIO</span>
            <span className="ml-auto text-xs text-muted">v2.0.0</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-muted mb-1">STATUS</div>
              <div className="text-terminal-green font-bold">● ONLINE</div>
            </div>

            <div>
              <div className="text-xs text-muted mb-1">LOCAL TIME</div>
              <div className="font-bold">{time.toLocaleTimeString()}</div>
            </div>

            <div>
              <div className="text-xs text-muted mb-1">VISITOR ORIGIN</div>
              <div className="font-bold">{location}</div>
            </div>

            <div>
              <div className="text-xs text-muted mb-1">RESPONSE TIME</div>
              <div className="font-bold">{latency}ms</div>
            </div>

            <div className="col-span-1 md:col-span-2">
              <div className="text-xs text-muted mb-1">UPTIME</div>
              <div className="font-bold">99.9% (365 DAYS)</div>
            </div>
          </div>

          {/* ASCII Network Diagram */}
          <div className="pt-3 border-t border-blueprint-grid">
            <pre className="text-center" style={{ fontFamily: 'monospace', fontSize: '12px', color: 'black' }}>
{`      [ NETWORK_STATUS: ONLINE ]

          ( INTERNET )
               |
        [ FIREWALL_V2 ]
               |
     +---------+---------+
     |                   |
[ AI_CORE ]         [ WEB_UI ]
     |                   |
( DATA_LAKE )       ( CLIENT )`}
            </pre>
          </div>

          <div className="pt-3 border-t border-blueprint-grid flex items-center justify-between">
            <span className="text-xs text-muted">Ready to initialize project</span>
            <a
              href="/intake"
              className="px-4 py-2 bg-blueprint-black text-blueprint-bg font-bold hover:bg-terminal-green hover:text-blueprint-black transition-colors border border-blueprint-black"
            >
              → START SESSION
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
