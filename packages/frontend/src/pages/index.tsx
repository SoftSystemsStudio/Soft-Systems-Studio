import React from 'react';
import Link from 'next/link';
import Layout from '../components/Layout';
import styles from '../styles/Home.module.css';

export default function Home() {
  return (
    <Layout>
      <main className={styles.page}>
        {/* HERO */}
        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <span className={styles.heroBadge}>AI Automation Agency · Soft Systems Studio</span>
            <h1 className={styles.heroTitle}>
              AI systems for support, content, data, workflows, and voice.
              <span className={styles.heroHighlight}> Built for your stack.</span>
            </h1>
            <p className={styles.heroSubtitle}>
              We design and deploy AI agents that plug into your existing tools — one intake, a
              clear systems blueprint, and a phased rollout.
            </p>
            <div className={styles.heroActions}>
              <Link href="/intake" className={styles.primaryButton}>
                Start the intake
              </Link>
              <a href="#systems" className={styles.secondaryButton}>
                Explore the systems
              </a>
            </div>
            <p className={styles.heroFootnote}>
              No obligation. You keep the blueprint even if we don&apos;t work together.
            </p>
          </div>
        </section>

        {/* BENEFITS */}
        <section className={styles.section}>
          <header className={styles.sectionHeader}>
            <h2>From &quot;too much manual work&quot; to automated systems</h2>
            <p>
              Soft Systems Studio focuses on a small set of high-leverage systems that reduce
              support load, increase content output, and make your data usable.
            </p>
          </header>
          <div className={styles.grid3}>
            <div className={styles.card}>
              <h3>Reduce support volume</h3>
              <p>
                Deflect repetitive questions on chat, email, SMS, and social DMs while escalating
                complex issues with full context.
              </p>
            </div>
            <div className={styles.card}>
              <h3>Ship more content</h3>
              <p>
                Turn a single offer or announcement into posts, emails, and scripts — consistently
                on brand.
              </p>
            </div>
            <div className={styles.card}>
              <h3>See your numbers clearly</h3>
              <p>
                Ask natural-language questions over your metrics instead of stitching together
                exports and spreadsheets.
              </p>
            </div>
          </div>
        </section>

        {/* SYSTEMS */}
        <section id="systems" className={styles.section}>
          <header className={styles.sectionHeader}>
            <h2>The five systems we implement</h2>
            <p>Agency on the front, configurable platform on the back.</p>
          </header>
          <div className={styles.grid3}>
            <div className={styles.card}>
              <h3>AI Support Systems</h3>
              <p>
                Multi-channel support (web, email, SMS, social) with routing and escalation rules
                designed around your team.
              </p>
            </div>
            <div className={styles.card}>
              <h3>AI Content Systems</h3>
              <p>
                A content engine that understands your offers and voice, producing drafts for
                campaigns and ongoing posting.
              </p>
            </div>
            <div className={styles.card}>
              <h3>AI Data &amp; BI Systems</h3>
              <p>
                Connect billing, CRM, marketing, and ops data into one interface you can query in
                plain language.
              </p>
            </div>
            <div className={styles.card}>
              <h3>AI Workflow Systems</h3>
              <p>
                Lead intake, qualification, hand-offs, and follow-ups stitched together into
                transparent flows.
              </p>
            </div>
            <div className={styles.card}>
              <h3>AI Voice Reception Systems</h3>
              <p>
                An AI receptionist for inbound calls that can capture, qualify, and book, instead of
                sending people to voicemail.
              </p>
            </div>
          </div>
        </section>

        {/* PROCESS */}
        <section className={styles.section}>
          <header className={styles.sectionHeader}>
            <h2>Simple, three-step engagement model</h2>
            <p>From intake to live agents, without a six-month consulting project.</p>
          </header>
          <div className={styles.grid3}>
            <div className={styles.card}>
              <h3>01 · Intake &amp; discovery</h3>
              <p>
                You complete the intake. We review workflows, volumes, and your current tools to
                locate automation wins.
              </p>
            </div>
            <div className={styles.card}>
              <h3>02 · Systems blueprint</h3>
              <p>
                We design an AI systems architecture and phased rollout, aligned to your goals and
                constraints.
              </p>
            </div>
            <div className={styles.card}>
              <h3>03 · Deploy &amp; iterate</h3>
              <p>
                We configure agents, connect integrations, and iterate based on real conversations,
                content, and data.
              </p>
            </div>
          </div>
        </section>

        {/* METRICS */}
        <section className={styles.section}>
          <header className={styles.sectionHeader}>
            <h2>Targets for the first 90 days</h2>
            <p>Every client has different numbers, but the direction of travel is the same.</p>
          </header>
          <div className={styles.metricsGrid}>
            <div className={styles.metricCard}>
              <div className={styles.metricValue}>40%</div>
              <div className={styles.metricLabel}>reduction in manual support volume</div>
            </div>
            <div className={styles.metricCard}>
              <div className={styles.metricValue}>3×</div>
              <div className={styles.metricLabel}>increase in content output</div>
            </div>
            <div className={styles.metricCard}>
              <div className={styles.metricValue}>1 day</div>
              <div className={styles.metricLabel}>
                to get reporting instead of end-of-month crunch
              </div>
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className={styles.finalCta}>
          <div className={styles.finalCtaInner}>
            <h2>Ready for your AI systems blueprint?</h2>
            <p>
              Share a bit about your company, channels, and goals. We&apos;ll generate a concrete
              architecture and rollout plan.
            </p>
            <Link href="/intake" className={styles.primaryButton}>
              Start the intake
            </Link>
          </div>
        </section>
      </main>
    </Layout>
  );
}
