import React, { useEffect, useState } from 'react';
import Link from 'next/link';

export default function ClientsListPage() {
  const [clients, setClients] = useState<any[]>([]);

  useEffect(() => {
    fetch('/clients')
      .then((r) => r.json())
      .then(setClients)
      .catch(() => setClients([]));
  }, []);

  return (
    <main style={{ padding: 24 }}>
      <h1>Clients</h1>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left' }}>ID</th>
            <th style={{ textAlign: 'left' }}>Company</th>
            <th style={{ textAlign: 'left' }}>Website</th>
            <th style={{ textAlign: 'left' }}>Created</th>
          </tr>
        </thead>
        <tbody>
          {clients.map((c) => (
            <tr key={c.id}>
              <td>
                <Link href={`/admin/clients/${c.id}`}>{c.id}</Link>
              </td>
              <td>{c.companyName}</td>
              <td>{c.website}</td>
              <td>{new Date(c.createdAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
