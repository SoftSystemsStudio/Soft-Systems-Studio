import AdminSidebar from '@/components/AdminSidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'radial-gradient(circle at top, #111111 0, #000000 60%)',
        color: '#f5f5f5',
        display: 'flex',
      }}
    >
      <AdminSidebar />
      <div style={{ flex: 1, maxWidth: 1400, margin: '0 auto', width: '100%' }}>
        {children}
      </div>
    </div>
  );
}
