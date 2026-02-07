export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', background: 'radial-gradient(circle at top, #111111 0, #000000 60%)', color: '#f5f5f5' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 16px 64px' }}>
        {children}
      </div>
    </div>
  );
}
