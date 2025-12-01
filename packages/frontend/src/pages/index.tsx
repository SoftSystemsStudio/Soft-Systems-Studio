import React from 'react';
import Link from 'next/link';
import Layout from '../components/Layout';

export default function Home() {
  return (
    <Layout>
      <main style={{ padding: 40, maxWidth: 900, margin: '0 auto' }}>
        <header style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 36, marginBottom: 8 }}>Soft Systems Studio</h1>
          <p style={{ fontSize: 18, lineHeight: 1.5 }}>
            AI Automation Systems for modern service businesses. We design and deploy configurable
            AI agents that reduce support volume, streamline workflows, and create leverage across
            your operations.
          </p>
        </header>

        <section style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 24, marginBottom: 8 }}>Phase 1: AI Support + Workflow Launch</h2>
          <p style={{ lineHeight: 1.5, marginBottom: 12 }}>
            Our entry engagement focuses on a fast, high-impact implementation: deploying an AI
            Support System on your website and a lightweight Workflow Automation layer behind it.
            The objective is to deflect routine inquiries, route the rest intelligently, and create
            clear performance visibility within a 6–7 week window.
          </p>
          <ul style={{ paddingLeft: 20, lineHeight: 1.6 }}>
            <li>AI support chat widget on your site, available 24/7.</li>
            <li>Automated routing and follow-up workflows for inbound inquiries.</li>
            <li>Baseline metrics on volume, response times, and automation impact.</li>
            <li>Clear Phase 2 roadmap for Content, Data &amp; BI, and Voice Systems.</li>
          </ul>
        </section>

        <section style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 24, marginBottom: 8 }}>How it works</h2>
          <ol style={{ paddingLeft: 20, lineHeight: 1.6 }}>
            <li>Complete a short intake so we can understand your business and stack.</li>
            <li>We generate an AI Automation Blueprint (solution brief + Phase 1 plan).</li>
            <li>Upon approval, we configure, integrate, test, and launch your agents.</li>
          </ol>
        </section>

        <section style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <Link href="/intake">
            <button
              type="button"
              style={{
                padding: '10px 20px',
                borderRadius: 4,
                border: 'none',
                cursor: 'pointer',
                fontSize: 16,
              }}
            >
              Get Your AI Automation Blueprint
            </button>
          </Link>

          <Link href="/admin/clients" style={{ fontSize: 14, textDecoration: 'underline' }}>
            View admin clients (internal)
          </Link>
        </section>
      </main>
    </Layout>
  );
}
