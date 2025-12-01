import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Layout from '../../../components/Layout';

export default function ClientsListPage() {
  type ClientListItem = {
    id: string;
    companyName: string;
    website?: string | null;
    createdAt?: string; // or Date, depending on what the API returns
  };

  const [clients, setClients] = useState<ClientListItem[]>([]);

  useEffect(() => {
    fetch('/api/clients')
      .then((res) => res.json())
      .then(setClients)
      .catch(console.error);
  }, []);

  return (
    <Layout>
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
                <td>{c.createdAt ? new Date(c.createdAt).toLocaleDateString() : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>
    </Layout>
  );
}
