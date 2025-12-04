import { useState } from 'react';

export default function TestEmailPage() {
  // Pre-fill with your Resend account email (free tier only sends to this address)
  const [email, setEmail] = useState('softsystemstudioco@gmail.com');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setMessage('');

    fetch('/api/test-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
      .then(async (res) => {
        const data = (await res.json()) as {
          success?: boolean;
          message?: string;
          error?: string;
          id?: string;
        };

        if (res.ok && data.success) {
          setStatus('success');
          setMessage(`✅ ${data.message} (ID: ${data.id})`);
        } else {
          setStatus('error');
          setMessage(`❌ ${data.error || 'Failed to send email'}`);
        }
      })
      .catch((err: unknown) => {
        setStatus('error');
        setMessage(`❌ Network error: ${err instanceof Error ? err.message : 'Unknown error'}`);
      });
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>🧪 Resend Email Test</h1>
      <p style={styles.subtitle}>Send a test email to verify Resend is working correctly.</p>

      <form onSubmit={handleSubmit} style={styles.form}>
        <label style={styles.label}>
          Email Address:
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
            style={styles.input}
          />
        </label>

        <button
          type="submit"
          disabled={status === 'loading'}
          style={{
            ...styles.button,
            opacity: status === 'loading' ? 0.7 : 1,
          }}
        >
          {status === 'loading' ? 'Sending...' : 'Send Test Email'}
        </button>
      </form>

      {message && (
        <div
          style={{
            ...styles.message,
            backgroundColor: status === 'success' ? '#1a3d1a' : '#3d1a1a',
            borderColor: status === 'success' ? '#c0ff6b' : '#ff6b6b',
          }}
        >
          {message}
        </div>
      )}

      <div style={styles.info}>
        <h3>Note:</h3>
        <p>
          On Resend free tier, emails can only be sent to the email associated with your Resend
          account.
        </p>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    maxWidth: '500px',
    margin: '40px auto',
    padding: '24px',
    fontFamily: 'system-ui, sans-serif',
    backgroundColor: '#1a1a1a',
    borderRadius: '12px',
    color: '#fff',
  },
  title: {
    color: '#c0ff6b',
    marginBottom: '8px',
  },
  subtitle: {
    color: '#888',
    marginBottom: '24px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  label: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    color: '#ccc',
  },
  input: {
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid #333',
    backgroundColor: '#0a0a0a',
    color: '#fff',
    fontSize: '16px',
  },
  button: {
    padding: '12px 24px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: '#c0ff6b',
    color: '#000',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  message: {
    marginTop: '16px',
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid',
  },
  info: {
    marginTop: '24px',
    padding: '16px',
    backgroundColor: '#0a0a0a',
    borderRadius: '8px',
    fontSize: '14px',
    color: '#888',
  },
  error: {
    color: '#ff6b6b',
    marginBottom: '16px',
  },
  link: {
    color: '#c0ff6b',
    textDecoration: 'none',
  },
};
