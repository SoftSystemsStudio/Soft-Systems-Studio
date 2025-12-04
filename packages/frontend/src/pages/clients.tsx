import { useEffect } from 'react';
import { useRouter } from 'next/router';

// Redirect /clients to /admin/clients
export default function ClientsRedirect() {
  const router = useRouter();

  useEffect(() => {
    void router.replace('/admin/clients');
  }, [router]);

  return (
    <div style={{ padding: 40, textAlign: 'center' }}>
      <p>Redirecting to clients...</p>
    </div>
  );
}
