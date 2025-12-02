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
            <div className={styles.heroBadge}>Soft Systems Studio · AI Automation</div>
            <h1 className={styles.heroTitle}>
              Turn operational chaos into
              <span className={styles.heroHighlight}> a predictable, AI-driven system.</span>
            </h1>
            <p className={styles.heroSubtitle}>
              For founders and lean teams who are done firefighting support, workflows, and
              reporting. We design and implement AI systems that quietly handle the busywork while
              you focus on growth.
            </p>

            <div className={styles.heroActions}>
              <Link href="/intake" className={styles.primaryButton}>
                Start your AI Automation Blueprint
              </Link>
              <a href="#process" className={styles.secondaryButton}>
                View the engagement model
              </a>
            </div>

            <p className={styles.heroFootnote}>
              Complete a focused intake. We return a tailored Solution Brief and Phase 1
              implementation plan—built from your real workflows and tools.
            </p>
          </div>

          <aside className={styles.heroAside}>
            <div className={styles.heroCard}>
              <h3>What changes after we work together</h3>
              <ul>
                <li>Support noise drops; repeat questions handled by AI.</li>
                <li>Key workflows run reliably without manual chasing.</li>
                <li>Reporting stops being a fire drill and becomes a weekly habit.</li>
              </ul>
              <div className={styles.heroCardMeta}>
                Designed for service businesses, agencies, and lean SaaS teams that feel “maxed out”
                but still growing.
              </div>
            </div>
          </aside>
        </section>

        {/* VALUE STRIP */}
        <section className={styles.valueStrip}>
          You already have tools—email, chat, CRM, project management. Our job is to design the AI
          layer that makes them feel like one system instead of a pile of tabs.
        </section>

        {/* BENEFITS */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2>Strategic systems, not one-off AI experiments</h2>
            <p>
              We build around three leverage points: how customers talk to you, how work moves
              through your team, and how you see what is actually happening.
            </p>
          </div>

          <div className={styles.grid3}>
            <div className={styles.card}>
              <h3>AI Support Systems</h3>
              <p>
                Consolidated support across email, social, SMS, and chat. AI handles FAQs, routing,
                and first responses so your team only touches the work that truly needs their mind.
              </p>
            </div>
            <div className={styles.card}>
              <h3>Workflow Automation</h3>
              <p>
                Automate hand-offs, reminders, and status changes across ops and marketing. No more
                “who owns this?” threads—each workflow has a clear owner and state.
              </p>
            </div>
            <div className={styles.card}>
              <h3>Data & Reporting</h3>
              <p>
                Translate activity across tools into a single operational view. We instrument the
                right metrics so you can steer the business without refreshing five dashboards.
              </p>
            </div>
          </div>
        </section>

        {/* PROCESS */}
        <section id="process" className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2>An engagement model built for busy founders</h2>
            <p>
              Clear phases, clear outputs. You always know what you are getting, what we are
              touching, and how it connects back to business impact.
            </p>
          </div>

          <div className={styles.processGrid}>
            <div className={styles.processStep}>
              <div className={styles.stepNumber}>01</div>
              <h3>Intake & Blueprint</h3>
              <p>
                You complete the intake and a short discovery call. We map your support, workflows,
                and data into a structured ClientConfig, then generate a Solution Brief and Phase 1
                proposal.
              </p>
            </div>
            <div className={styles.processStep}>
              <div className={styles.stepNumber}>02</div>
              <h3>Phase 1 Build</h3>
              <p>
                We implement a focused slice—typically AI support + workflow automation—connected to
                your existing stack. The target is a visible reduction in manual noise within the
                first weeks.
              </p>
            </div>
            <div className={styles.processStep}>
              <div className={styles.stepNumber}>03</div>
              <h3>Scale & Deepen</h3>
              <p>
                With the first system running, we extend into richer workflows, additional channels,
                and reporting. Each iteration is based on live usage and measurable outcomes.
              </p>
            </div>
          </div>
        </section>

        {/* METRICS / PROOF – FRAMED AS DESIRED OUTCOMES */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2>Designed to change how your week feels</h2>
            <p>
              We anchor each build around a small set of measurable shifts that you can feel in your
              calendar and see in your metrics.
            </p>
          </div>

          <div className={styles.metricsGrid}>
            <div className={styles.metricCard}>
              <div className={styles.metricValue}>40–70%</div>
              <div className={styles.metricLabel}>
                of repeat inquiries deflected or resolved by AI before a human ever reads them.
              </div>
            </div>
            <div className={styles.metricCard}>
              <div className={styles.metricValue}>2–3 hrs/day</div>
              <div className={styles.metricLabel}>
                reclaimed across the team from manual follow-ups, chasing status, and ad-hoc
                reporting.
              </div>
            </div>
            <div className={styles.metricCard}>
              <div className={styles.metricValue}>1 source</div>
              <div className={styles.metricLabel}>
                of truth for support, ops, and marketing performance—built on top of tools you
                already use.
              </div>
            </div>
          </div>
        </section>

        {/* INTEGRATIONS */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2>Built around your current stack, not against it</h2>
            <p>
              We actively avoid “new platform” fatigue. Instead, we wrap your existing tools with a
              coherent automation and data layer.
            </p>
          </div>

          <div className={styles.integrationsRow}>
            <div className={styles.integrationBadge}>HubSpot / Pipedrive</div>
            <div className={styles.integrationBadge}>Intercom / Zendesk</div>
            <div className={styles.integrationBadge}>Slack & Email</div>
            <div className={styles.integrationBadge}>Google Workspace</div>
            <div className={styles.integrationBadge}>Notion / ClickUp / Asana</div>
          </div>
        </section>

        {/* PRICING / ENGAGEMENT STRUCTURE */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2>Engagement structure, at a glance</h2>
            <p>
              Simple structure: one strategic blueprint, one focused build, optional ongoing
              partnership. You stay in control of scope and spend.
            </p>
          </div>

          <div className={styles.pricingGrid}>
            <div className={styles.pricingCard}>
              <div className={styles.pricingTagline}>01 · Strategic</div>
              <h3>AI Automation Blueprint</h3>
              <p className={styles.pricingNote}>
                The front door to everything. Intake, discovery, ClientConfig, Solution Brief, and a
                concrete Phase 1 proposal.
              </p>
              <ul>
                <li>Structured intake, tailored to your business</li>
                <li>ClientConfig and architecture design</li>
                <li>Solution brief & Phase 1 implementation plan</li>
              </ul>
            </div>

            <div className={`${styles.pricingCard} ${styles.pricingCardPrimary}`}>
              <div className={styles.pricingTagline}>02 · Implementation</div>
              <h3>Phase 1 Build</h3>
              <p className={styles.pricingNote}>
                A tightly scoped sprint focused on one or two systems that meaningfully reduce
                operational drag.
              </p>
              <ul>
                <li>AI support + workflow automation implementation</li>
                <li>Integration with your existing tools and channels</li>
                <li>Training, handover, and measurement plan</li>
              </ul>
              <Link href="/intake" className={styles.primaryButton}>
                Start with the Blueprint
              </Link>
            </div>

            <div className={styles.pricingCard}>
              <div className={styles.pricingTagline}>03 · Ongoing</div>
              <h3>Continuous Optimization</h3>
              <p className={styles.pricingNote}>
                Optional retainer to iterate on automations, add new flows, and deepen reporting as
                your operations evolve.
              </p>
              <ul>
                <li>New flows and channels added incrementally</li>
                <li>Performance reviews and tuning</li>
                <li>Roadmapping for future automation phases</li>
              </ul>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2>Key questions before you start</h2>
            <p>
              The intake is low-risk: you invest time and context; we return a concrete plan. These
              are the questions that usually show up first.
            </p>
          </div>

          <div className={styles.faqList}>
            <details className={styles.faqItem}>
              <summary>What do you actually deliver after the intake?</summary>
              <p>
                You receive a structured ClientConfig, a Solution Brief outlining recommended
                systems and architecture, and a Phase 1 proposal with objectives, deliverables,
                timeline, and commercial model.
              </p>
            </details>

            <details className={styles.faqItem}>
              <summary>Are we locked into a long-term contract?</summary>
              <p>
                No. The Blueprint and Phase 1 are discrete engagements. Ongoing optimization is
                optional and only makes sense once the initial system is delivering value.
              </p>
            </details>

            <details className={styles.faqItem}>
              <summary>How opinionated are you about tools?</summary>
              <p>
                We are tool-agnostic but opinionated about systems behavior. We work with your
                existing stack where possible and only recommend new tools if they materially
                simplify the architecture.
              </p>
            </details>

            <details className={styles.faqItem}>
              <summary>What size / stage of company is this for?</summary>
              <p>
                Typically founder-led companies with 3–50 people, where the leadership team still
                feels day-to-day operational drag and needs leverage rather than headcount.
              </p>
            </details>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className={styles.finalCta}>
          <div className={styles.finalCtaInner}>
            <h2>Ready to design the system that replaces the chaos?</h2>
            <p>
              Start the intake. We will translate your reality into a concrete AI automation plan
              that you can implement with us or internally.
            </p>
            <Link href="/intake" className={styles.primaryButton}>
              Begin the AI Automation Intake
            </Link>
          </div>
        </section>
      </main>
    </Layout>
  );
}
