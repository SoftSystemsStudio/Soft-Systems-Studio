# Soft Systems Studio Website Audit — September 2026

**Scope:** `softsystemsstudiollc.com`, everything currently in this repo (`packages/frontend`).
**Method:** read every page/route/component in `packages/frontend/src`, checked live `robots.txt`/`sitemap.xml`/`llms.txt` against production.
**Not done:** no content was changed. This is read-only.

---

## TL;DR

The site is not lightly stale — it's a different business than the one Austin is running. Three different, invented pricing schemes exist across the codebase (none of them $997/$150/$175/$200). There are live Stripe checkout links that charge real deposits against fake prices for a service (24/7 phone AI receptionist) that can't currently be delivered. There's an entire "Digital Products" product line (4 Gumroad products) that has nothing to do with the business anymore. The homepage's dominant identity is "digital products for entrepreneurs," not "local AI receptionist / web builds for Alabama service businesses." Local SEO is close to zero. `robots.txt`/`sitemap.xml` are fixed and correct as of today.

No fabricated testimonials or client logos were found **attributed to Soft Systems Studio itself** — the one place testimonials/stats appear (the `/demo/*` portfolio pages) is clearly badged "DEMO SITE" and describes fictional example businesses, per a design doc (`PORTFOLIO_CONCEPTS.md`) that predates this audit. The real honesty problem is subtler: an "About" page timeline claiming the company has been serving clients since 2019, and a live checkout flow that will happily take a customer's money for something that doesn't exist yet.

---

## 1. Page-by-page content inventory

### Homepage (`/`, [page.tsx](packages/frontend/src/app/page.tsx))

- **Hero:** "Build Smarter. Launch Faster." — "Ready-to-use templates, AI-powered websites, and intelligent automation for entrepreneurs who refuse to waste time." Subtext: *"No fluff. No $997 courses. Just tools that work."*
- **Stats bar:** `48hr` Website Delivery · `$19–29` Digital Products · `30-Day` Money Back
- **Digital Products section** (4 cards, all link out to Gumroad, `target="_blank"`):
  - **AI Business in a Box** — $29 — "Complete AI agency starter pack" (20 email templates, service packages, client scripts, SOPs)
  - **Solopreneur OS** — $19 — "All-in-one productivity system" (CRM, revenue tracking, content calendar, 90-day roadmap)
  - **AI Prompt Vault** — $14.99 — "200+ battle-tested prompts"
  - **SaaS Launch Kit** — $24 — "Zero to launch playbook"
  - "View All Products" → `softsystemsstudioco.gumroad.com`
- **Website Design section** ("✨ New Service"): "Modern, fast, conversion-optimized websites built in days, not months. Starting at $799."
  - Starter Landing — **$799** — 48hrs — single page, 2 revision rounds
  - Business Website — **$1,997** — 1 week — "Most Popular" — 5-7 pages, CMS, 30-day support
  - Premium Package — **$3,497** — 2 weeks — 10+ pages, e-commerce/booking, 60-day support
  - "How It Works": 10-min intake form → "AI-assisted design + human review" → launch
- **Portfolio ("Example Projects")** — 4 fictional demo sites, each links to `/demo/*`: NeuralFit (SaaS), Apex Plumbing (service business), VoltStore (e-commerce), Creator Studio (personal brand). Framed as style examples ("We adapt to match your brand"), not real client work.
- **AI Automation Services / AI Receptionist:**
  - "24/7 phone answering, appointment booking, and lead capture for local businesses. Never miss a $400 job again."
  - Claims: "Natural voice (not robotic)" · "Bilingual (EN/ES)" · "Calendar integration" · "24/7 availability"
  - Live browser voice demo button ("🎙️ Talk to Our AI Receptionist Now")
  - **"Setup: $997 • Monthly: $197 + usage (~$30-80/mo)"** — a *third* distinct AI receptionist price (see §2)
  - Note: also implies live phone answering exists today — it doesn't (see §7)
- **FAQ:** delivery timelines (48hr/1wk/2wk), "we use AI tools... reviewed by human designers for quality," hosting add-on "$47-97/month," 2/30/60-day post-launch support windows
- **Footer CTA:** "Shop Products" (Gumroad) / "Get a Website" (`/intake`)
- **ChatWidget** greeting: "Ask me about our digital products, website design, or AI automation services!" — points at `NEXT_PUBLIC_API_URL + /api/v1/public/chat`, a backend that (per CLAUDE.md) no longer lives in this repo and may not resolve.

### About (`/about`, [page.tsx](packages/frontend/src/app/about/page.tsx))

- Hero: "Built for Entrepreneurs Who Move Fast." "...for people who are tired of wasting time on courses, templates that don't work, and agencies that take months to deliver."
- **"The Story"** (first person, unattributed to a byline but voice matches Austin):
  - *"I started Soft Systems Studio in 2019..."*
  - *"I'd spent years building automation for Fortune 500 companies... locked behind $50k+ enterprise contracts."*
  - *"Then AI happened. Suddenly, I could build in a weekend what used to take a team of developers 6 months."*
- **Timeline:**
  - **2019** — "Started Building" — "Began helping local businesses with automation and web design"
  - **2023** — "AI Pivot" — "Integrated AI tools to 10x speed and quality of work"
  - **2026** — "Digital Products Launch" — "Released templates and systems to help entrepreneurs move faster"
- **Values:** "Ship Fast, Iterate Faster" / "No Fluff, No Filler" / "AI-Assisted, Human-Approved" / *"Transparent by Default... No $997 courses. 30-day money-back guarantee on everything."*
- **Team section:** "Small team, big output. No bureaucracy, no meetings, just shipping." Single bio card: Austin Hodges, "Founder & Builder" — "Former enterprise automation consultant turned indie builder."
- **What We Do:** Digital Products / Website Design (starting at $799) / AI Automation

### Intake (`/intake`, [intake-form.tsx](packages/frontend/src/app/intake/intake-form.tsx))

- "Get Your Free Quote" — 24-hour response promise
- **A fourth, independent pricing scheme**, radio-button service picker:
  - Website Only — **$2,500** — "Professional 5-page website"
  - AI Receptionist — **$997 + $197/mo** — "Never miss a call again"
  - Complete Package — **$2,997 + $197/mo** — "Website + AI (Save $500)"
- Business-type dropdown (Plumbing, HVAC, Electrical, Roofing, Landscaping, Dental, Med Spa, Legal, Real Estate, Other) and call-volume dropdown — clearly built around local service businesses, which doesn't match the digital-products branding everywhere else.
- Links out to the voice demo ("Try the Voice Demo").

### Demo/portfolio pages (`/demo/apex-plumbing`, `/demo/neuralfit`, `/demo/voltstore`, `/demo/creator-studio`)

All four carry a **"DEMO SITE" badge** and a "Back to Portfolio" link, and each footer states outright it's a demo ("This is a demo website created by Soft Systems Studio," "Demo site for showcase purposes only"). Confirmed against [PORTFOLIO_CONCEPTS.md](PORTFOLIO_CONCEPTS.md), a design brief that predates this audit — these are intentional fictional showcase sites, not disguised as real clients.

That said, the fictional content itself is dense with the exact patterns Austin asked to be flagged if they showed up as real claims — worth knowing what's in there even though it's labeled fiction:
- **Apex Plumbing:** "500+ five-star reviews," "4.9★ Google Rating," "10yr Experience," "TX License #M-41205," "BBB A+ Rated," "EPA Certified," "HomeAdvisor Top Rated," 4 named 5-star reviews with fabricated customer quotes ("Sarah M.," "James R.," etc.), "Serving Austin since 2020" (per the design doc) vs. "excellence since 2015" (in the shipped footer — the two source docs disagree with each other).
- **NeuralFit:** "Trusted by 50,000+ Athletes," "50K+ Active Users," "2M+ Workouts Completed," "4.9★ App Store Rating," "93% Goal Success Rate."
- These are fine as-is (clearly labeled fiction) but confirm with Austin whether the portfolio-demo concept survives the digital-products rework, since it's presentationally tangled up with that section (see §4).

### Digital Products (`/digital-products`, [page.tsx](packages/frontend/src/app/digital-products/page.tsx))

Not a real page — a client-side redirect (`router.replace('/#digital-products')`) that briefly shows a spinner. It exists only as a URL target for the sitemap and any old inbound links.

### Privacy (`/privacy`) / Terms (`/terms`)

Standard boilerplate. "Last updated: February 2026" on both (7 months stale relative to today). Terms states "Setup fees are due upfront before work begins," "Refunds are provided per our 30-day money-back guarantee," "Upon full payment, you own the final deliverables." Privacy names Clerk, Stripe, Resend, Google Analytics as processors — accurate to the stack. Contact email listed as `hello@softsystemsstudiollc.com`, which is *not* the address in `env.ts`'s fallback (`admin@softsystems.studio`) or the Resend reply-to fallback (`softsystemstudioco@gmail.com`) — three different domains/addresses for "contact us" across the codebase; worth confirming which inboxes actually exist and get checked.

### Root docs (not site-facing, but worth knowing about)

- [page-old-backup.tsx](packages/frontend/src/app/page-old-backup.tsx) — dead file, not routed (Next.js App Router only picks up `page.tsx`), but it's a *fifth* pricing scheme sitting in the repo ($2,500 website / $997+$197mo AI / $2,997+$197mo bundle — matches the intake form, not the homepage). Should be deleted as part of cleanup so nobody copies stale numbers from it by mistake.

---

## 2. Pricing accuracy — every price on the site, vs. the real numbers

**Decided pricing:** flat **$997** one-time build fee; retainers **$150 / $175 / $200/mo** (tiers C/B/A, $150 the intended entry ask).

**Nothing on the site matches this.** Worse, the site currently contains **five internally-contradicting pricing schemes**:

| Source | Website price | AI Receptionist price | Notes |
|---|---|---|---|
| Homepage hero/stats | "$19-29" (digital products) | — | |
| Homepage Website Design section | $799 / $1,997 / $3,497 (3 tiers) | — | |
| Homepage AI Services section | — | **Setup $997 · Monthly $197 + usage ($30-80/mo)** | Closest to real number by coincidence, still wrong (retainer should be $150/175/200, not $197+usage) |
| Intake form ([intake-form.tsx:55-74](packages/frontend/src/app/intake/intake-form.tsx#L55)) | **$2,500** | **$997 + $197/mo** | Also: "Complete Package" $2,997 + $197/mo |
| **Live Stripe Payment Links** ([api/intake/route.ts:24-33](packages/frontend/src/app/api/intake/route.ts#L24)) | $2,500 (**$1,250 deposit**) | $997 + $197/mo (**$997 deposit**) | **These are real, working `buy.stripe.com` links wired into the lead-confirmation email — someone can pay today** |
| Dead file `page-old-backup.tsx` | $2,500 | $997 + $197/mo | Not routed, but stale numbers sitting in the repo |
| ROI Calculator ([ROICalculator.tsx:17-19](packages/frontend/src/components/sentient/pricing/ROICalculator.tsx#L17)) | — | hardcodes `aiSetupCost = 997`, `aiMonthlyCost = 197` | Feeds the "your first-year savings" math shown to visitors |

**Highest-priority fix:** the **live Stripe Payment Links** in `api/intake/route.ts`. Right now, if a lead picks "AI Receptionist" on the intake form, the auto-reply email offers a **"Pay Deposit Now"** button for a real `buy.stripe.com` checkout charging a **$997 deposit** against a **$997 + $197/mo** package for **24/7 phone answering** — a product that cannot currently be delivered (see §7). That's not a copy problem, that's a live path to taking someone's money for something that doesn't exist. This should be treated as more urgent than the rest of the pricing cleanup.

Also flag: the phrase **"No fluff. No $997 courses."** appears twice (homepage hero subtext, About page Values section). Once the real build fee becomes $997, this line reads as an unintentional joke/self-own and needs to go regardless of anything else.

---

## 3. Unsupportable / untrue claims (no closed clients yet)

**No fake testimonials or client logos attributed to Soft Systems Studio itself were found.** The only testimonials/stats/reviews on the site live on the `/demo/*` pages, which are clearly labeled fictional ("DEMO SITE" badge + "this is a demo site" footer text on every one). That's a real mitigant — but it doesn't fully close the risk, and there's a separate, more serious problem in the About page.

**Confirmed issues, ranked by severity:**

1. **About page origin story and timeline** ([about/page.tsx:114-135](packages/frontend/src/app/about/page.tsx#L114), [about/page.tsx:45-60](packages/frontend/src/app/about/page.tsx#L45)) — states the company **"started... in 2019"**, spent "years building automation for Fortune 500 companies," and has a timeline entry "2019 — Started Building — Began helping local businesses with automation and web design." If none of that is true (or if it needs softening to match reality), this is the single biggest honesty problem on the site — it's presented as fact in first person, not as a demo, and it's exactly the kind of "years-in-business" overclaim called out in the brief. **Needs a direct answer from Austin: is any of this true, and if not, what's the real founding story to replace it with?**
2. **Live checkout for an undeliverable product** (see §2/§7) — arguably worse than a fake testimonial, because it's not just a claim, it's a transaction someone could actually complete.
3. **"AI-Assisted, Human-Approved"** / **"every product is reviewed, tested, and refined by humans"** ([about/page.tsx:32-36](packages/frontend/src/app/about/page.tsx#L32)) and **"reviewed by human designers for quality"** (homepage FAQ) — plural "humans"/"designers" against a team of one. Soft team-size overclaim.
4. **"Small team, big output"** heading directly above a single-person bio card — reads oddly (there is no team to be "small"), though the copy right below it is honest about being one person.
5. Digital products ($19-$29 templates) carry a "30-Day Money Back" guarantee claim in the stats bar and About Values — worth confirming this is actually honored on Gumroad's side before it stays.

**Not flagged as problems (checked and found honest):**
- The `/demo/*` portfolio pages' reviews/stats — clearly labeled fiction, matches a documented design intent.
- The Austin Hodges bio itself doesn't claim fake credentials — "Former enterprise automation consultant turned indie builder" is vague enough not to be independently checkable, but also isn't a specific false claim like a certification or award.
- No third-party award badges, certification logos, or "as seen in" press claims were found anywhere in the real (non-demo) site.

---

## 4. Digital Products — blast radius (nothing deleted, just mapped)

Austin wants this removed. Here's everywhere it touches:

**Routes / pages**
- [`/digital-products`](packages/frontend/src/app/digital-products/page.tsx) — the redirect page itself
- [`/` (homepage)](packages/frontend/src/app/page.tsx) — full `DIGITAL_PRODUCTS` section (lines 28-61 data, ~262-392 markup), hero copy ("Digital Products · AI Automation · Web Design" badge, stats bar "$19-29" tile), nav item "Products" → `#digital-products`, final CTA "Shop Products"
- [`/about`](packages/frontend/src/app/about/page.tsx) — nav item "Products," "What We Do" card, "Shop Products" CTA
- [`page-old-backup.tsx`](packages/frontend/src/app/page-old-backup.tsx) — dead file, own copy of `DIGITAL_PRODUCTS` array, "Digital Products" nav item and pricing card — irrelevant to production but should go in the same cleanup

**Config / metadata**
- [`sitemap.ts`](packages/frontend/src/app/sitemap.ts) — `/digital-products` entry at **priority 0.95**, the highest of any page except the homepage itself
- [`layout.tsx`](packages/frontend/src/app/layout.tsx) — root `<title>` ("Digital Products, AI Websites & Automation for Entrepreneurs"), meta description ("$19-29" pricing), `keywords` array (5 of 10 keywords are digital-product/template terms), OpenGraph title/description, Twitter card title/description — **the entire site identity in `<head>` is built around digital products**
- [`StructuredData.tsx`](packages/frontend/src/components/StructuredData.tsx) — `ProductListSchema` component takes the `DIGITAL_PRODUCTS` array directly and emits one `schema.org/Product` JSON-LD block per Gumroad product; called from `page.tsx` (`<ProductListSchema products={DIGITAL_PRODUCTS} />`)
- `FAQSchema` — homepage FAQ #4 ("Can I see examples of your work?") and the hosting-pricing FAQ are tangential but tied to the same FAQ array

**External links**
- 5 outbound links to `softsystemsstudioco.gumroad.com` (4 product pages + 1 storefront), all `target="_blank"` — these aren't broken by removal since they're external, but the site stops sending traffic there once the section is gone

**Not touched by digital products, but adjacent and worth a decision:**
- The `/demo/*` portfolio pages and the homepage "Example Projects" section are a separate feature (fictional web-design showcase, not digital products) — confirm whether these stay when digital products goes.

**Nothing here was deleted or modified.**

---

## 5. SEO state

**robots.txt / sitemap.xml — verified live, both correct as of today.**
- `robots.txt`: `Allow: /`, `Disallow: /api/, /sign-in, /sign-up`, correct sitemap pointer. ✅
- `sitemap.xml`: valid XML, 10 URLs, sensible `changefreq`/`priority` values — **except** `/digital-products` at priority 0.95 (see §4: it's a client-side-redirecting stub page holding the site's second-highest crawl priority).

**Metadata**
- Root layout sets a good `title.template` (`%s | Soft Systems Studio`) but only the homepage and About page override `title`/`description` — Privacy and Terms have their own minimal metadata (title only, generic description), Intake and the four `/demo/*` pages have **no page-specific metadata at all** (they're `'use client'` components with no exported `metadata`, so they inherit the root layout's homepage-flavored title/description/OG/Twitter tags verbatim). A search result for `/intake` currently shows the homepage's digital-products title and description.
- **No `alternates.canonical` anywhere** — zero pages set an explicit canonical URL. Low risk today (no real duplicate-content vectors visible) but standard practice, and it means Next isn't doing you any favors on trailing-slash/query-param variants.
- Single Open Graph image for the entire site (`/api/og`, dynamically generated but not shown to vary by route) reused across every page via inheritance.

**Structured data (JSON-LD)** — via [StructuredData.tsx](packages/frontend/src/components/StructuredData.tsx), homepage only:
- `Organization` — name, url, logo, description. `sameAs` is an **empty array with commented-out placeholders** for Twitter/LinkedIn — no social profiles linked.
- `Product` × 4 — the Gumroad digital products (see §4)
- `FAQPage` — the 5 homepage FAQs
- `WebSite` — includes a `SearchAction` pointing at `/?s={search_term_string}`, but **the site has no search feature** — this schema promises Google a site-search box that doesn't exist and will fail if used.
- **No `LocalBusiness` schema anywhere.** No `address`, `geo`, `areaServed`, `telephone`, `priceRange`, or `openingHours` markup exists on the site at all.

**Local SEO — the gap the brief called out, confirmed as real and total.**
- Zero mentions of Alabama, Phenix City, Smiths Station, or Columbus GA anywhere in the codebase (checked page copy, metadata, JSON-LD). The only geography on the entire site is **fictional and wrong**: the `/demo/apex-plumbing` page is set in Austin, Texas ("Austin's Most Trusted Plumber," 12 Texas suburbs listed as service areas) — and because it's crawlable and in the sitemap, it's the only geo-signal a search engine or AI crawler will find for this domain, and it points at the wrong state.
- No NAP (Name/Address/Phone) block exists anywhere — not in the footer, not on About, not in JSON-LD. There's no business phone number published at all (the only `tel:` links on the whole site are the fictional Apex Plumbing demo's).
- No `LocalBusiness`/`ProfessionalService` schema, no Google Business Profile link, no embedded map, no "areas we serve" content for the real service area.
- **This is very likely the single highest-leverage SEO fix available** — a local AI-receptionist/web-build business with zero local signals is invisible to "AI receptionist near me" / "web designer Phenix City" style queries, which is exactly how local buyers search.

**Heading structure** — checked every real route: each has exactly one `<h1>`, and it's a real heading (not decorative). This part is clean.

**Image alt text** — the site has very few actual `<img>`/`next/image` elements (most visuals are CSS gradients/emoji, not images), so the alt-text surface area is small. What exists: logo images use the brand name as `alt` (works, if generic); the fictional `/demo/creator-studio` page's fake headshots have descriptive `alt` text. No missing/empty `alt` attributes found on any real `<img>`.

**Internal linking** — reasonably dense within the homepage (anchor nav, repeated CTAs to `/intake`), but About/Intake/demo pages don't cross-link to each other much, and there's no blog/content section to build topical internal links around at all.

**Performance** — not load-tested as part of this audit; flagging as untested rather than guessing. Worth a Lighthouse/PageSpeed pass once content is settled (no point optimizing performance on copy that's about to change).

---

## 6. AI-search readiness

What actually matters here — checked, not assumed:

- **`llms.txt`** — does not exist. `https://softsystemsstudiollc.com/llms.txt` returns the custom 404 page. Cheap to add once the real copy is settled; low effort, plausible upside as more assistants start checking for it.
- **Server-rendered content** — mostly good. The homepage, About, Privacy, and Terms pages are server components with real content in the initial HTML (an AI crawler that can't run JS still sees the actual copy). **Gap:** the Intake page and all four `/demo/*` pages are `'use client'` components — check whether their content still arrives in the initial server-rendered HTML (Next.js client components are typically still SSR'd on first load, so this is likely fine, but wasn't independently verified with JS disabled) — worth a quick check before relying on it, especially since Intake is one of only two pages above 0.8 sitemap priority.
- **Structured, factual statements** — this is the real gap. An AI answering "does Soft Systems Studio serve Phenix City" or "how much does their AI receptionist cost" needs a clean factual anchor, and right now the site gives it five different prices and zero location facts (§2, §5) — an AI summarizing the site today would either surface the wrong price or refuse to state one, and would have nothing to say about geography at all.
- **Structured data** — see §5; `Organization`/`FAQPage` schema helps AI systems that read JSON-LD, but there's no `LocalBusiness` schema for local-intent queries, which is arguably more valuable for AI search than for classic Google.
- **Clear crawl signals** — `robots.txt` allows AI crawlers by default (no explicit `Disallow` for GPTBot/ClaudeBot/etc., and none is currently needed).

**Bottom line:** the mechanical plumbing (SSR, robots.txt) is mostly fine; the content itself isn't yet in a state an AI could summarize accurately, because the facts it would summarize (price, location, what's actually for sale) are inconsistent or missing.

---

## 7. The AI receptionist — how it's presented now, vs. Austin's decision

**Austin's decision:** present it, let people try the browser demo, publish no price (can only deliver a browser demo today, not a phone line).

**What the site currently does:**
- ✅ The demo itself ([VoiceDemo.tsx](packages/frontend/src/components/VoiceDemo.tsx)) is well-built and honest about what it is: a browser-based LiveKit voice session, no phone number involved, capped at 3 minutes, clear busy/error states. Good component, no changes needed to the mechanism.
- ❌ **Copy around it repeatedly implies live phone service exists today**, not just a browser demo:
  - Homepage: "24/7 **phone** answering, appointment booking, and lead capture" / "✓ 24/7 availability" / "✓ Calendar integration"
  - Intake form service card: "**24/7 AI phone answering**... Calendar integration"
  - None of this is caveated as "browser demo only, phone line not yet available"
- ❌ **A price is published in three places**, contradicting the "publish no price" decision:
  - Homepage AI Services section: "Setup: $997 • Monthly: $197 + usage (~$30-80/mo)"
  - Intake form pricing card: "$997 + $197/mo"
  - ROI Calculator: hardcodes `$997` setup / `$197` monthly into the "your savings" math shown to every visitor
- ❌ **A live Stripe deposit link exists** for this exact undeliverable package (see §2) — this is the sharpest version of the problem: not just copy overclaiming, but a working checkout that could take a $997 deposit from someone expecting 24/7 phone coverage.
- ⚠️ The demo persona is named **"Chattahoochee Auto & Tire"** (in `VoiceDemo.tsx` copy — "Chattahoochee Auto & Tire's AI receptionist will pick up in a moment"). That's a real, geographically-appropriate business name for the Alabama/Georgia area Austin actually serves — worth confirming whether this is a placeholder, a real business Austin has permission to reference, or something that should be genericized, since it's the one specific business name presented as if real anywhere on the live site.

**Net:** the demo mechanism matches the decision; the surrounding copy and the checkout flow don't. This is the same root issue as §2 (pricing) and needs the same fix, but flagged separately because Austin gave an explicit "no price" instruction specifically for this product, and the site currently violates it in three places plus one live transaction.

---

## Prioritized change list

**P0 — stop-the-bleeding (do before anything else, doesn't need the full copy rewrite to fix)**
1. Disable or replace the AI-receptionist Stripe Payment Link in `api/intake/route.ts` — nothing should be able to charge a deposit against a package that can't be delivered.
2. Decide the About-page origin story with Austin and fix or remove the 2019/Fortune-500/timeline claims — this is the one real "is this true" flag in the whole audit.

**P1 — pricing consistency (blocks everything else pricing-related)**
3. Replace all five pricing schemes (homepage ×2, intake form, Stripe links, ROI calculator) with the real numbers: $997 flat build fee, $150/$175/$200 retainer tiers.
4. Remove "No $997 courses" (hero + About) before it becomes self-contradicting.
5. Delete `page-old-backup.tsx` so stale pricing can't get copy-pasted from it again.

**P2 — AI receptionist copy (Austin's explicit "no price, demo only" instruction)**
6. Remove all three published receptionist prices; rewrite "24/7 phone answering" language to be clear it's a browser demo today.
7. Confirm the "Chattahoochee Auto & Tire" demo name is intentional/cleared.

**P3 — digital products removal (once Austin's revamp direction is set)**
8. Execute the removal using the blast-radius map in §4 — route, homepage section, About references, sitemap entry, layout metadata/keywords/OG, `ProductListSchema`/JSON-LD, `page-old-backup.tsx`.
9. Decide whether the `/demo/*` portfolio showcase survives independently (it's a separate feature from digital products).

**P4 — local SEO (the highest-leverage gap, but needs settled copy/NAP first)**
10. Add `LocalBusiness` schema (name, address or service area, phone, `areaServed`, `priceRange`) once Austin confirms what's publishable (a phone number for the site presumably needs to exist first).
11. Add real geo copy: Phenix City / Smiths Station / Columbus GA service-area language, replacing the Austin, TX signal currently coming from the plumbing demo.
12. Fix or genericize the `/demo/apex-plumbing` Texas geography so it's not the site's only geo-signal.

**P5 — SEO/AI-search hygiene (cheap, do alongside the copy rewrite)**
13. Give Intake, Privacy, Terms, and the four `/demo/*` pages their own `title`/`description` metadata instead of inheriting the homepage's.
14. Remove or implement the `WebSite` schema's `SearchAction` (there's no site search).
15. Add `llms.txt` once the factual claims (pricing, location, what's for sale) are settled — no point publishing it before the facts underneath it are fixed.
16. Reconcile the three different "contact us" email addresses (`hello@softsystemsstudiollc.com` in Privacy/Terms vs. `admin@softsystems.studio` fallback vs. `softsystemstudioco@gmail.com` reply-to fallback) to whichever inbox Austin actually checks.
17. Add `alternates.canonical` to pages once URLs are final post-rewrite.

---

## Housekeeping: local folder rename

Checked before attempting anything: `git remote -v` confirms this repo's remote is `SoftSystemsStudio/sss-website`; `git grep` across all tracked files for the string `sss-monorepo-src` returns nothing; there's no `.vercel/project.json` locally (Vercel's link is by Git repo, not local path, per CLAUDE.md); `vercel.json`, `pnpm-workspace.yaml`, and root `package.json` all use relative paths only. Nothing in the repo depends on the local folder's name, so the rename itself is safe in principle.

**Did not complete it.** The actual rename attempt (`mv sss-monorepo-src sss-website` from the parent directory) failed with `Device or resource busy` — something (this session's own tool processes, an editor, a running dev server, etc.) currently holds a handle open inside the directory. Forcing it risked corrupting an in-progress session for no real benefit. Left the folder as `sss-monorepo-src`. To finish this, close anything with the folder open (this Claude Code session included) and run:

```bash
mv "C:/Users/ahodg/projects/sss-monorepo-src" "C:/Users/ahodg/projects/sss-website"
```
