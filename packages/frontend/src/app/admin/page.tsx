'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

interface ClientListItem {
  id: string;
  companyName: string;
  website?: string | null;
  industry?: string | null;
  createdAt?: string;
}

interface DashboardStats {
  totalClients: number;
  activeProjects: number;
  totalRevenue: number;
  recentClients: ClientListItem[];
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalClients: 0,
    activeProjects: 0,
    totalRevenue: 0,
    recentClients: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load clients from API
    fetch('/api/clients')
      .then((res) => res.json())
      .then((clients: ClientListItem[]) => {
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        
        const activeProjects = clients.filter((c) => {
          if (!c.createdAt) return false;
          const created = new Date(c.createdAt);
          return created > thirtyDaysAgo;
        }).length;

        setStats({
          totalClients: clients.length,
          activeProjects,
          totalRevenue: 0, // TODO: Calculate from actual revenue data
          recentClients: clients.slice(0, 5),
        });
      })
      .catch((err) => {
        console.error('Failed to load dashboard stats', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const StatCard = ({ title, value, subtitle, icon }: { title: string; value: string | number; subtitle?: string; icon: string }) => (
    <div
      style={{
        background: 'linear-gradient(135deg, #111 0%, #1a1a1a 100%)',
        border: '1px solid #2a2a2a',
        borderRadius: 12,
        padding: 24,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div style={{ position: 'absolute', top: 16, right: 16, fontSize: 32, opacity: 0.2 }}>
        {icon}
      </div>
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ color: '#9ca3af', fontSize: 14, marginBottom: 8 }}>{title}</div>
        <div style={{ fontSize: 36, fontWeight: 700, color: '#A3E635', marginBottom: 4 }}>
          {value}
        </div>
        {subtitle && <div style={{ color: '#6b7280', fontSize: 13 }}>{subtitle}</div>}
      </div>
    </div>
  );

  return (
    <main style={{ padding: 32 }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, color: '#f5f5f5', marginBottom: 8 }}>
          Dashboard
        </h1>
        <p style={{ color: '#9ca3af', fontSize: 16 }}>
          Welcome back. Here's what's happening with your business.
        </p>
      </div>

      {loading && (
        <div style={{ color: '#9ca3af', fontSize: 16 }}>Loading dashboard...</div>
      )}

      {!loading && (
        <>
          {/* Stats Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: 20,
              marginBottom: 32,
            }}
          >
            <StatCard
              title="Total Clients"
              value={stats.totalClients}
              subtitle="All time"
              icon="👥"
            />
            <StatCard
              title="Active Projects"
              value={stats.activeProjects}
              subtitle="Last 30 days"
              icon="🚀"
            />
            <StatCard
              title="Revenue"
              value={`$${stats.totalRevenue.toLocaleString()}`}
              subtitle="Total earned"
              icon="💰"
            />
          </div>

          {/* Recent Clients */}
          <section
            style={{
              background: 'linear-gradient(135deg, #111 0%, #1a1a1a 100%)',
              border: '1px solid #2a2a2a',
              borderRadius: 12,
              padding: 24,
              marginBottom: 32,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontSize: 20, fontWeight: 600, color: '#f5f5f5', margin: 0 }}>
                Recent Clients
              </h2>
              <Link
                href="/admin/clients"
                style={{
                  color: '#A3E635',
                  fontSize: 14,
                  textDecoration: 'none',
                  transition: 'opacity 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.7')}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
              >
                View all →
              </Link>
            </div>

            {stats.recentClients.length === 0 && (
              <div style={{ color: '#6b7280', fontSize: 14 }}>
                No clients yet. They'll appear here once someone completes the intake form.
              </div>
            )}

            {stats.recentClients.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {stats.recentClients.map((client) => (
                  <Link
                    key={client.id}
                    href={`/admin/clients/${client.id}`}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: 16,
                      background: '#0a0a0a',
                      border: '1px solid #2a2a2a',
                      borderRadius: 8,
                      textDecoration: 'none',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#A3E635';
                      e.currentTarget.style.transform = 'translateX(4px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#2a2a2a';
                      e.currentTarget.style.transform = 'translateX(0)';
                    }}
                  >
                    <div>
                      <div style={{ color: '#f5f5f5', fontWeight: 500, marginBottom: 4 }}>
                        {client.companyName}
                      </div>
                      <div style={{ color: '#6b7280', fontSize: 13 }}>
                        {client.industry || 'No industry specified'}
                      </div>
                    </div>
                    <div style={{ color: '#A3E635', fontSize: 20 }}>→</div>
                  </Link>
                ))}
              </div>
            )}
          </section>

          {/* Quick Actions */}
          <section>
            <h2 style={{ fontSize: 20, fontWeight: 600, color: '#f5f5f5', marginBottom: 16 }}>
              Quick Actions
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
              <Link
                href="/admin/clients"
                style={{
                  display: 'block',
                  padding: 20,
                  background: 'linear-gradient(135deg, #111 0%, #1a1a1a 100%)',
                  border: '1px solid #2a2a2a',
                  borderRadius: 12,
                  textDecoration: 'none',
                  textAlign: 'center',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#A3E635';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#2a2a2a';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div style={{ fontSize: 32, marginBottom: 8 }}>👥</div>
                <div style={{ color: '#f5f5f5', fontWeight: 500 }}>View All Clients</div>
              </Link>

              <Link
                href="/intake"
                style={{
                  display: 'block',
                  padding: 20,
                  background: 'linear-gradient(135deg, #111 0%, #1a1a1a 100%)',
                  border: '1px solid #2a2a2a',
                  borderRadius: 12,
                  textDecoration: 'none',
                  textAlign: 'center',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#A3E635';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#2a2a2a';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div style={{ fontSize: 32, marginBottom: 8 }}>📋</div>
                <div style={{ color: '#f5f5f5', fontWeight: 500 }}>Test Intake Form</div>
              </Link>

              <a
                href="/"
                style={{
                  display: 'block',
                  padding: 20,
                  background: 'linear-gradient(135deg, #111 0%, #1a1a1a 100%)',
                  border: '1px solid #2a2a2a',
                  borderRadius: 12,
                  textDecoration: 'none',
                  textAlign: 'center',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#A3E635';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#2a2a2a';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div style={{ fontSize: 32, marginBottom: 8 }}>🏠</div>
                <div style={{ color: '#f5f5f5', fontWeight: 500 }}>Back to Site</div>
              </a>
            </div>
          </section>
        </>
      )}
    </main>
  );
}
