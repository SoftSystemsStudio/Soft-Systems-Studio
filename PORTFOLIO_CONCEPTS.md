# Portfolio Website Concepts

Supersedes the original four tech-startup-flavored concepts (NeuralFit,
Apex Plumbing, VoltStore, Creator Studio), replaced 2026-09 because they
spoke to nobody on Austin's actual lead list (see `SITE-AUDIT-2026-09.md`
and the "Rebuild the portfolio demo section" session). Austin sells to
local businesses around Phenix City, AL and Columbus, GA, overwhelmingly
automotive/trades — these three demos match that market and each solves a
different design problem so the set reads as range, not one template
reused three times.

All three live under `/demo/<slug>` in `packages/frontend/src/app/demo/`,
carry a persistent "Demo Site" badge and a "Back to Portfolio" link, use
real Pexels photography (credited in each footer), and are built around
fictional businesses with invented names checked against real Phenix
City/Columbus-area businesses before use.

---

## 1. Kettle & Grain Coffee Co. — Coffee Shop

**Slug:** `/demo/kettle-and-grain`

**Design problem:** sells atmosphere, not urgency. No phone-first CTA, no
countdown, no emergency framing — the opposite pull from the auto-repair
demo.

**Style:** Editorial and unhurried. Deep forest-green dark theme
(`#132018` base, `#C99A44` warm gold accent) rather than the cliché warm
cream + brass palette. Display face is Cormorant Garamond (heritage,
justified by the genuinely editorial/heritage brief), body is Manrope.

**Structure:** full-bleed photo hero → asymmetric stat strip (days open,
roaster relationships, drinks on the board, as real data not fake
process steps) → atmosphere section (image + sensory copy) → grouped
menu (espresso / drip / pastries, priced) → image gallery → hours &
location.

---

## 2. Ironwood Auto & Tire — Auto Repair

**Slug:** `/demo/ironwood-auto`

**Design problem:** the biggest slice of Austin's real lead list (9 of
top 15 no-website prospects are auto/tire shops). Urgency-driven,
phone-first, has to work for someone standing in a parking lot with a
dead car.

**Style:** Bold and high-contrast. Near-black (`#0B0C0E`) with a single
safety-orange accent (`#F2551E`). Display face is Anton (condensed,
heavy), paired with JetBrains Mono for stat numerals and Work Sans for
body copy.

**Structure:** urgency bar with a real phone link → hero with a phone CTA
above the fold → services bento (asymmetric, not six equal cards) → trust
panel with organic (non-round) stats → short reviews → hours/location →
a sticky mobile "Call Now" bar, because most of these prospects are found
on a phone.

---

## 3. Green Bench Lawn & Landscape — Lawn Care & Landscaping

**Slug:** `/demo/green-bench`

**Design problem:** trades, but a different problem than auto repair —
portfolio-driven and seasonal rather than emergency-driven. Sells
finished work and a reliable weekly relationship, not a same-day fix.

**Style:** Light theme (the other two are dark, so this carries the
contrast), olive/brick/paper family (`#F4F5F0` cool paper, `#B5502E`
brick accent) rather than the beige-and-brass premium-consumer default.
Display face is Outfit, body is Karla.

**Structure:** full-bleed hero of a finished yard → "recent work" image
grid captioned by project type, not by fictional client → a genuine
seasonal timeline (spring cleanup → growing season → fall cleanup →
winterizing — numbered because it's an actual sequence) → services grid
→ one short quote → service-area contact section.

---

## Image sourcing

All photography is real, sourced from the Pexels API and downloaded into
`packages/frontend/public/images/demo/<slug>/`. No AI-generated people or
premises. Photographer credits appear in each page's footer.
