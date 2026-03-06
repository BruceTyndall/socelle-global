> **DEPRECATED — 2026-03-06**
> This file is no longer authoritative. Replaced by:
> - `SOCELLE-WEB/docs/build_tracker.md` (sole WO authority per CLAUDE.md §D)
>
> Do not reference this file as authority. See `/.claude/CLAUDE.md` §B FAIL 1.

---

# PHASE2_WORK_ORDER.md
## SOCELLE — Next.js Marketing Site Build
### Multi-Agent Execution Specification

**Status:** Ready to deploy once Phase 0 decisions are confirmed
**Depends on:** SOCELLE_PLAYBOOK.md (copy source), SOCELLE_CURSORRULES.md (animation + visual reference)
**Produces:** A standalone Next.js 14 marketing site deployed to Vercel
**Estimated build time:** 7–10 days with agents running in parallel

---

## ⚠️ PHASE 0 PRE-FLIGHT CHECKLIST

**No agent should start work until all five decisions below are confirmed.** These are not defaults — they require explicit owner confirmation. Check each box before deploying agents.

```
[ ] D1 — Color system confirmed: deep sage (#2D5A4E) + warm brass (#C4956A)
         as platform palette [RECOMMENDED in Playbook Section J]

[ ] D2 — Architecture confirmed: Next.js marketing site is a SEPARATE
         codebase from the existing React platform (not a migration — a
         new repo, new deployment, cross-links to /brand/apply and
         /portal/signup on the React platform)

[ ] D3 — CTA destination confirmed: "Get early access" resolves to:
         [ ] /early-access (email capture page, built in Agent 4)
         [ ] /portal/signup (directs to existing React platform)
         [ ] Dual split: "For brands" → /brand/apply | "For buyers" → /portal/signup
         PICK ONE — agents need a hard URL target

[ ] D4 — Professional email active: hello@socelle.com DNS and inbox
         confirmed live (not gmail)

[ ] D5 — Typography confirmed: Instrument Serif (headlines) + Satoshi (body)
         [RECOMMENDED in Playbook Section J — supersedes Playfair Display + Inter]
```

Once all five boxes are checked: deploy agents in wave order below.

---

## AGENT DEPENDENCY MAP

```
Wave 1 (sequential — no parallel):
  Agent 1: Scaffold → Agent 2: Design System

Wave 2 (after Wave 1):
  Agent 3: Nav + Layout

Wave 3 (all parallel, after Agent 3 complete):
  Agent 4: Homepage
  Agent 5: For Brands Page
  Agent 6: For Buyers Page
  Agent 7: How It Works Page
  Agent 8: Pricing + About Pages
  Agent 9: Vertical Landing Pages (Spa, Medspa, Salon)

Wave 4 (after ALL Wave 3 agents complete):
  Agent 10: SEO + Metadata

Wave 5 (final, after Agent 10):
  Agent 11: QA + Accessibility
```

**Why this order matters:**
- Agents 4–9 all depend on the design system tokens and root layout
- Running them before Agent 3 completes means building on an undefined foundation
- Agent 10 needs all pages to exist before generating sitemap and auditing metadata
- Agent 11 cannot sign off until the site is complete and SEO is wired

---

## RULES FOR ALL AGENTS

These apply to every agent in this work order. No exceptions.

**Copy rules:**
- All website copy comes VERBATIM from `SOCELLE_PLAYBOOK.md` Section H
- Do not improvise, paraphrase, or improve any copy
- Do not add placeholder copy — if copy is missing for a section, leave a `{TODO: add copy here}` comment and continue
- Section references are provided per agent below

**Architecture rules:**
- This is a MARKETING SITE ONLY — no auth, no portal, no logged-in state
- External links to the React platform use the full URL or an env variable `NEXT_PUBLIC_PLATFORM_URL`
- No dashboard, no e-commerce, no CMS, no blog, no chat widget, no cookie banner (per CURSORRULES)

**Animation rules:**
- ALL 7 CURSORRULES techniques must be implemented — see technique specs below
- Never animate `width`, `height`, `top`, or `left` — only `transform` and `opacity`
- Always include `will-change: transform` on animated elements
- All animations must be disabled when `prefers-reduced-motion: reduce` is set
- Mobile: disable 3D tilt and magnetic button — use CSS hover lift only
- Use Framer Motion for state-based animations; GSAP for scroll-driven animations

**Performance rules:**
- Total JS bundle < 300KB compressed (excluding fonts)
- Import only `gsap` core + `ScrollTrigger` — no Draggable, MorphSVG, or other plugins
- Use `next/image` for all images with WebP/AVIF
- Preload Instrument Serif, swap Satoshi

**Do not touch:**
- The existing React platform codebase (`/src/`)
- Any Supabase configuration
- Any Stripe configuration
- `PHASE1_WORK_ORDER.md` or `SOCELLE_PLAYBOOK.md`

---

## THE 7 ANIMATION TECHNIQUES (Reference for all agents)

These are the exact implementations from CURSORRULES. All agents building pages must use these.

### Technique 1 — Smooth Scroll (Lenis)
*Implemented once in layout.tsx by Agent 3. All other agents inherit it.*

```tsx
// app/layout.tsx
'use client'
import Lenis from 'lenis'
import { useEffect } from 'react'

export default function RootLayout({ children }) {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    })
    function raf(time) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }
    requestAnimationFrame(raf)
    return () => lenis.destroy()
  }, [])
  return <html><body>{children}</body></html>
}
```

### Technique 2 — Scroll-Triggered Reveals (GSAP)
*Implemented as a reusable hook by Agent 3. Add `data-reveal` to any element.*

```tsx
// hooks/useScrollReveal.ts
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export function useScrollReveal(containerRef) {
  useGSAP(() => {
    const elements = containerRef.current?.querySelectorAll('[data-reveal]')
    if (!elements) return

    elements.forEach((el, i) => {
      gsap.fromTo(el,
        { opacity: 0, y: 40, filter: 'blur(8px)' },
        {
          opacity: 1, y: 0, filter: 'blur(0px)',
          duration: 1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
          delay: i * 0.1,
        }
      )
    })
  }, { scope: containerRef })
}
```

**prefers-reduced-motion override (add to globals.css):**
```css
@media (prefers-reduced-motion: reduce) {
  [data-reveal] {
    opacity: 1 !important;
    transform: none !important;
    filter: none !important;
  }
}
```

### Technique 3 — Pinned Scroll Section
*Implemented as `PinnedSection.tsx` by Agent 3. Used by Agents 4 and 7.*

```tsx
// components/PinnedSection.tsx
import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export function PinnedSection({ steps }) {
  const sectionRef = useRef(null)

  useGSAP(() => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top top',
        end: '+=300%',
        pin: true,
        scrub: 1,
      }
    })

    // Animate each step in/out
    steps.forEach((_, i) => {
      if (i > 0) {
        tl.fromTo(`.step-${i}`,
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0 }
        ).to(`.step-${i - 1}`, { opacity: 0, y: -30 }, '<')
      }
    })
  }, { scope: sectionRef })

  return (
    <section ref={sectionRef} className="relative h-screen overflow-hidden">
      {steps.map((step, i) => (
        <div
          key={i}
          className={`step-${i} absolute inset-0 flex items-center justify-center ${i > 0 ? 'opacity-0' : ''}`}
        >
          <div className="max-w-2xl">
            <span className="text-[120px] font-display text-border leading-none">
              {String(i + 1).padStart(2, '0')}
            </span>
            <h3 className="text-4xl font-display text-primary">{step.title}</h3>
            <p className="text-lg text-secondary mt-4">{step.body}</p>
          </div>
        </div>
      ))}
    </section>
  )
}
```

**Mobile:** On screens < 768px, replace pinned section with standard vertical scroll — no pin, just stacked steps with `data-reveal`.

### Technique 4 — 3D Card Tilt (Framer Motion)
*Implemented as `FeatureCards.tsx` by Agent 3. Used by Agents 4, 5, 6.*

```tsx
// components/FeatureCards.tsx
import { useState } from 'react'
import { motion } from 'framer-motion'

function TiltCard({ children }) {
  const [rotate, setRotate] = useState({ x: 0, y: 0 })

  return (
    <motion.div
      className="card"
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect()
        const x = (e.clientX - rect.left) / rect.width - 0.5
        const y = (e.clientY - rect.top) / rect.height - 0.5
        setRotate({ x: y * 8, y: x * -8 })
      }}
      onMouseLeave={() => setRotate({ x: 0, y: 0 })}
      animate={{
        rotateX: rotate.x,
        rotateY: rotate.y,
      }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      style={{ perspective: '1000px', transformStyle: 'preserve-3d' }}
    >
      {children}
    </motion.div>
  )
}
```

**CSS for cards (add to globals.css):**
```css
.card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 20px;
  transition: box-shadow 0.4s ease;
  will-change: transform;
}
.card:hover {
  box-shadow:
    0 20px 40px rgba(0,0,0,0.08),
    0 8px 16px rgba(0,0,0,0.04);
}
@media (hover: none) {
  /* Disable tilt on touch devices */
  .card { transform: none !important; }
}
```

### Technique 5 — Gradient Mesh Background
*Implemented in globals.css by Agent 2. Apply class `gradient-bg` to hero and CTA sections.*

```css
/* globals.css */
.gradient-bg {
  background:
    radial-gradient(ellipse at 20% 50%, var(--accent-soft) 0%, transparent 50%),
    radial-gradient(ellipse at 80% 20%, var(--glow) 0%, transparent 40%),
    radial-gradient(ellipse at 50% 80%, var(--accent-warm) 0%, transparent 45%),
    var(--background);
  background-size: 200% 200%;
  animation: gradientShift 20s ease-in-out infinite;
}

.gradient-bg-dark {
  background:
    radial-gradient(ellipse at 20% 50%, rgba(196, 149, 106, 0.08) 0%, transparent 50%),
    radial-gradient(ellipse at 80% 20%, rgba(45, 90, 78, 0.06) 0%, transparent 40%),
    var(--dark-bg);
  background-size: 200% 200%;
  animation: gradientShift 20s ease-in-out infinite;
}

@keyframes gradientShift {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

@media (prefers-reduced-motion: reduce) {
  .gradient-bg,
  .gradient-bg-dark {
    animation: none;
    background-position: 0% 50%;
  }
}
```

### Technique 6 — Split-Text Hero Reveal (GSAP)
*Implemented in `Hero.tsx` by Agent 3. Used only on homepage hero.*

```tsx
// components/Hero.tsx — split-text headline
import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'

export function HeroHeadline({ text }: { text: string }) {
  const ref = useRef(null)

  useGSAP(() => {
    gsap.fromTo('.hero-char',
      { opacity: 0, filter: 'blur(10px)', y: 20 },
      {
        opacity: 1, filter: 'blur(0px)', y: 0,
        duration: 0.6,
        stagger: 0.03,
        ease: 'power2.out',
        delay: 0.3,
      }
    )
  }, { scope: ref })

  return (
    <h1 ref={ref} className="font-display text-display leading-tight tracking-tight">
      {text.split('').map((char, i) => (
        <span
          key={i}
          className="hero-char inline-block"
          style={{ opacity: 0, filter: 'blur(10px)' }}
        >
          {char === ' ' ? '\u00A0' : char}
        </span>
      ))}
    </h1>
  )
}
```

**prefers-reduced-motion:** If reduced motion is preferred, render headline as a single element with no animation (no split, no stagger).

### Technique 7 — Magnetic Button (GSAP)
*Implemented as `MagneticButton.tsx` by Agent 3. Used on primary CTAs.*

```tsx
// components/MagneticButton.tsx
import { useRef } from 'react'
import gsap from 'gsap'

interface MagneticButtonProps {
  children: React.ReactNode
  className?: string
  href?: string
  onClick?: () => void
}

export function MagneticButton({ children, className, href, onClick }: MagneticButtonProps) {
  const ref = useRef<HTMLButtonElement | HTMLAnchorElement>(null)

  const handleMouseMove = (e: React.MouseEvent) => {
    const btn = ref.current
    if (!btn) return
    const rect = btn.getBoundingClientRect()
    const x = e.clientX - rect.left - rect.width / 2
    const y = e.clientY - rect.top - rect.height / 2
    gsap.to(btn, {
      x: x * 0.3,
      y: y * 0.3,
      duration: 0.4,
      ease: 'power2.out',
    })
  }

  const handleMouseLeave = () => {
    gsap.to(ref.current, {
      x: 0,
      y: 0,
      duration: 0.6,
      ease: 'elastic.out(1, 0.3)',
    })
  }

  const sharedProps = {
    onMouseMove: handleMouseMove,
    onMouseLeave: handleMouseLeave,
    className,
  }

  if (href) {
    return (
      <a ref={ref as React.Ref<HTMLAnchorElement>} href={href} {...sharedProps}>
        {children}
      </a>
    )
  }

  return (
    <button ref={ref as React.Ref<HTMLButtonElement>} onClick={onClick} {...sharedProps}>
      {children}
    </button>
  )
}
```

**Mobile / touch:** Magnetic effect fires only if `window.matchMedia('(hover: hover)').matches` — disable entirely on touch screens.

---

## COLOR SYSTEM TOKENS (globals.css — implemented by Agent 2)

```css
:root {
  /* Backgrounds */
  --background:     #FAFAF8;
  --surface:        #F4F2EF;
  --surface-raised: #FFFFFF;
  --border:         #E8E5DF;
  --border-hover:   #D4D0C8;

  /* Text */
  --text-primary:   #1A1A1A;
  --text-secondary: #6B6560;
  --text-tertiary:  #9C968F;

  /* Brand */
  --accent:         #2D5A4E;   /* deep sage — primary CTAs */
  --accent-soft:    #D6E5DF;   /* sage backgrounds */
  --accent-hover:   #3D7A6A;   /* sage hover state */
  --accent-warm:    #C4956A;   /* warm brass — badges, highlights */
  --glow:           #F0E6D8;   /* warm gradient glow */

  /* Dark sections */
  --dark-bg:        #141413;
  --dark-surface:   #1E1E1C;
  --dark-text:      #F4F2EF;
  --dark-accent:    #C4956A;   /* brass replaces sage on dark */
  --dark-muted:     #8A847C;
}
```

**Rules (enforced by Agent 11 QA):**
- No `#FFFFFF` for backgrounds — use `--surface-raised` only for elevated cards
- No `#000000` for text — use `--text-primary` (#1A1A1A)
- `--accent` (sage) for all CTAs, active states, links on light backgrounds
- `--dark-accent` (brass) for all CTAs and highlights on dark backgrounds
- `--accent-warm` used sparingly — badges, category labels, premium markers only

---

## TYPOGRAPHY TOKENS (globals.css — implemented by Agent 2)

```css
:root {
  --font-display: 'Instrument Serif', serif;
  --font-body:    'Satoshi', 'DM Sans', sans-serif;
  --font-mono:    'JetBrains Mono', monospace;
}
```

**Font loading (app/layout.tsx — implemented by Agent 1):**
```tsx
// Use next/font or link tag in <head>
// Instrument Serif: Google Fonts
// Satoshi: Fontshare (https://api.fontshare.com/v2/css?f[]=satoshi@400,500,600&display=swap)
```

**Rules:**
- All headlines: Instrument Serif, font-weight 400 (regular). Never bold. Never italic.
- All body text: Satoshi, font-weight 400. Emphasis: 500. Labels: 600.
- Line-height: 1.65 body, 1.1 display
- Letter-spacing: -0.02em headlines, 0 body, 0.12em labels
- Max body line-width: `max-w-[60ch]` or `max-w-[38rem]`

---

## TAILWIND CONFIG (tailwind.config.ts — implemented by Agent 2)

```ts
import type { Config } from 'tailwindcss'

export default {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background:    'var(--background)',
        surface:       'var(--surface)',
        'surface-raised': 'var(--surface-raised)',
        border:        'var(--border)',
        primary:       'var(--text-primary)',
        secondary:     'var(--text-secondary)',
        tertiary:      'var(--text-tertiary)',
        accent:        'var(--accent)',
        'accent-soft': 'var(--accent-soft)',
        'accent-hover':'var(--accent-hover)',
        'accent-warm': 'var(--accent-warm)',
        'dark-bg':     'var(--dark-bg)',
        'dark-surface':'var(--dark-surface)',
        'dark-text':   'var(--dark-text)',
        'dark-accent': 'var(--dark-accent)',
        'dark-muted':  'var(--dark-muted)',
      },
      fontFamily: {
        display: ['Instrument Serif', 'serif'],
        body:    ['Satoshi', 'DM Sans', 'sans-serif'],
        mono:    ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        card:       '0 1px 4px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.04)',
        'card-hover': '0 20px 40px rgba(0,0,0,0.08), 0 8px 16px rgba(0,0,0,0.04)',
        panel:      '0 2px 8px rgba(0,0,0,0.06)',
        elevated:   '0 8px 24px rgba(0,0,0,0.08)',
        modal:      '0 16px 48px rgba(0,0,0,0.12)',
      },
      fontSize: {
        'display-xs': ['clamp(2rem, 4vw, 2.5rem)',    { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'display-sm': ['clamp(2.5rem, 5vw, 3.25rem)', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'display-md': ['clamp(3rem, 6vw, 4rem)',       { lineHeight: '1.06', letterSpacing: '-0.02em' }],
        'display-lg': ['clamp(3.5rem, 7vw, 5rem)',     { lineHeight: '1.04', letterSpacing: '-0.025em' }],
        'display-xl': ['clamp(4rem, 8vw, 6.5rem)',     { lineHeight: '1.02', letterSpacing: '-0.03em' }],
        label:        ['0.6875rem', { lineHeight: '1', letterSpacing: '0.12em', fontWeight: '600' }],
      },
      spacing: {
        section: 'clamp(5rem, 10vw, 8rem)',
      },
    },
  },
} satisfies Config
```

---

## AGENT 1 — PROJECT SCAFFOLD

**Objective:** Initialize the Next.js 14 marketing site repo with all dependencies, folder structure, and Vercel deployment.

**Prerequisite:** Phase 0 decisions confirmed. New repo created (not inside the React platform repo).

**Commands to run in sequence:**

```bash
npx create-next-app@latest socelle-marketing \
  --typescript \
  --tailwind \
  --app \
  --no-src-dir \
  --import-alias "@/*"

cd socelle-marketing

npm install gsap @gsap/react framer-motion lenis react-helmet-async
```

**Folder structure to create (beyond Next.js defaults):**

```
app/
  layout.tsx                 # Root layout — Lenis init, font loading
  page.tsx                   # Homepage — placeholder "under construction" until Agent 4
  globals.css                # Placeholder — Agent 2 fills this
  for-brands/
    page.tsx                 # Placeholder
  for-buyers/
    page.tsx                 # Placeholder
  how-it-works/
    page.tsx                 # Placeholder
  pricing/
    page.tsx                 # Placeholder
  about/
    page.tsx                 # Placeholder
  insights/
    page.tsx                 # Placeholder
  solutions/
    spa/page.tsx             # Placeholder
    medspa/page.tsx          # Placeholder
    salon/page.tsx           # Placeholder
components/
  Nav.tsx                    # Placeholder
  Hero.tsx                   # Placeholder
  PinnedSection.tsx          # Placeholder
  FeatureCards.tsx           # Placeholder
  DarkSection.tsx            # Placeholder
  CTASection.tsx             # Placeholder
  MagneticButton.tsx         # Placeholder
  CountUp.tsx                # Placeholder
  Footer.tsx                 # Placeholder
hooks/
  useScrollReveal.ts         # Placeholder
  useSmoothScroll.ts         # Placeholder
  useMagnetic.ts             # Placeholder
public/
  favicon.svg                # Copy from existing platform /public/favicon.svg if complete
  og-image.png               # Placeholder — final in Agent 10
```

**Environment variables (.env.local):**

```bash
NEXT_PUBLIC_PLATFORM_URL=https://app.socelle.com    # or current platform domain
NEXT_PUBLIC_BRAND_APPLY_URL=/brand/apply            # adjust if platform domain differs
NEXT_PUBLIC_BUYER_SIGNUP_URL=/portal/signup
```

**Vercel setup:**
1. `vercel` CLI: `npx vercel --yes`
2. Connect to staging domain (e.g., `marketing.socelle.com` or `preview.socelle.com`)
3. Set env variables in Vercel dashboard to match `.env.local`

**Definition of done:**
```
[ ] npx create-next-app ran without errors
[ ] All packages installed: gsap @gsap/react framer-motion lenis react-helmet-async
[ ] All folders and placeholder files created
[ ] npm run dev starts at localhost:3000 with no errors
[ ] npm run typecheck passes
[ ] Vercel deployment URL active and accessible
[ ] No Tailwind purge warnings
```

---

## AGENT 2 — DESIGN SYSTEM

**Objective:** Implement the full design token system in `globals.css` and `tailwind.config.ts`.

**Prerequisite:** Agent 1 complete.

**Scope:** `app/globals.css`, `tailwind.config.ts`

**Step 1 — globals.css**

Replace the default Tailwind globals.css entirely with:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* ── CSS Custom Properties ─────────────────────────────────────── */
:root {
  --background:       #FAFAF8;
  --surface:          #F4F2EF;
  --surface-raised:   #FFFFFF;
  --border:           #E8E5DF;
  --border-hover:     #D4D0C8;

  --text-primary:     #1A1A1A;
  --text-secondary:   #6B6560;
  --text-tertiary:    #9C968F;

  --accent:           #2D5A4E;
  --accent-soft:      #D6E5DF;
  --accent-hover:     #3D7A6A;
  --accent-warm:      #C4956A;
  --glow:             #F0E6D8;

  --dark-bg:          #141413;
  --dark-surface:     #1E1E1C;
  --dark-text:        #F4F2EF;
  --dark-accent:      #C4956A;
  --dark-muted:       #8A847C;
}

/* ── Base Reset ─────────────────────────────────────────────────── */
*, *::before, *::after { box-sizing: border-box; }

html {
  background-color: var(--background);
  color: var(--text-primary);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

body {
  font-family: var(--font-body);
  font-size: 1rem;
  line-height: 1.65;
  background-color: var(--background);
  color: var(--text-primary);
  overflow-x: hidden;
}

/* ── Typography ─────────────────────────────────────────────────── */
h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-display);
  font-weight: 400;
  line-height: 1.1;
  letter-spacing: -0.02em;
}

/* ── Card ───────────────────────────────────────────────────────── */
.card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 20px;
  transition: box-shadow 0.4s ease;
  will-change: transform;
}
.card:hover {
  box-shadow:
    0 20px 40px rgba(0,0,0,0.08),
    0 8px 16px rgba(0,0,0,0.04);
}

/* ── Gradient Mesh ──────────────────────────────────────────────── */
.gradient-bg {
  background:
    radial-gradient(ellipse at 20% 50%, var(--accent-soft) 0%, transparent 50%),
    radial-gradient(ellipse at 80% 20%, var(--glow) 0%, transparent 40%),
    radial-gradient(ellipse at 50% 80%, rgba(196, 149, 106, 0.12) 0%, transparent 45%),
    var(--background);
  background-size: 200% 200%;
  animation: gradientShift 20s ease-in-out infinite;
}

.gradient-bg-dark {
  background:
    radial-gradient(ellipse at 20% 50%, rgba(196, 149, 106, 0.08) 0%, transparent 50%),
    radial-gradient(ellipse at 80% 20%, rgba(45, 90, 78, 0.06) 0%, transparent 40%),
    var(--dark-bg);
  background-size: 200% 200%;
  animation: gradientShift 20s ease-in-out infinite;
}

@keyframes gradientShift {
  0%, 100% { background-position: 0% 50%; }
  50%       { background-position: 100% 50%; }
}

/* ── Text Reveal ────────────────────────────────────────────────── */
[data-text-reveal] {
  clip-path: inset(0 0 100% 0);
  transition: clip-path 0.8s cubic-bezier(0.77, 0, 0.175, 1);
}
[data-text-reveal].revealed {
  clip-path: inset(0 0 0% 0);
}

/* ── Section Container ──────────────────────────────────────────── */
.section-container {
  width: 100%;
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 clamp(1.5rem, 5vw, 4rem);
}

/* ── Label Style ────────────────────────────────────────────────── */
.label {
  font-family: var(--font-body);
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--accent-warm);
}

/* ── Skip to content ────────────────────────────────────────────── */
.skip-to-content {
  position: absolute;
  top: -100%;
  left: 1rem;
  z-index: 200;
  background: var(--accent);
  color: white;
  padding: 0.75rem 1.25rem;
  border-radius: 0 0 8px 8px;
  font-size: 0.875rem;
  font-weight: 600;
  transition: top 0.2s;
}
.skip-to-content:focus { top: 0; }

/* ── Reduced Motion ─────────────────────────────────────────────── */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
  [data-reveal] {
    opacity: 1 !important;
    transform: none !important;
    filter: none !important;
  }
  .gradient-bg, .gradient-bg-dark { animation: none; }
}
```

**Step 2 — tailwind.config.ts**

Replace with the full config from the TAILWIND CONFIG section above in this document.

**Step 3 — Font loading**

Add to `app/layout.tsx` `<head>`:
```tsx
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
<link
  href="https://fonts.googleapis.com/css2?family=Instrument+Serif&display=swap"
  rel="stylesheet"
/>
<link
  href="https://api.fontshare.com/v2/css?f[]=satoshi@400,500,600&display=swap"
  rel="stylesheet"
/>
```

Add CSS variables to `:root`:
```css
--font-display: 'Instrument Serif', serif;
--font-body:    'Satoshi', 'DM Sans', sans-serif;
```

**Definition of done:**
```
[ ] All CSS custom properties defined in :root
[ ] Tailwind config extended with all color, font, shadow, and fontSize tokens
[ ] .gradient-bg and .gradient-bg-dark classes produce correct animated mesh
[ ] .card class produces correct hover shadow
[ ] [data-reveal] elements animate correctly on scroll
[ ] prefers-reduced-motion tested: all animations disabled, content fully visible
[ ] Fonts load: Instrument Serif + Satoshi visible in browser dev tools
[ ] No Tailwind purge warnings
[ ] npm run typecheck passes
```

---

## AGENT 3 — NAV + ROOT LAYOUT

**Objective:** Build the glassmorphic navigation, root layout with Lenis, and all shared components and hooks.

**Prerequisite:** Agent 2 complete.

**Scope:**
- `app/layout.tsx` (Lenis, fonts, skip link)
- `components/Nav.tsx`
- `components/Hero.tsx` (HeroHeadline component)
- `components/PinnedSection.tsx`
- `components/FeatureCards.tsx` (TiltCard)
- `components/MagneticButton.tsx`
- `components/CountUp.tsx`
- `components/Footer.tsx`
- `hooks/useScrollReveal.ts`
- `hooks/useSmoothScroll.ts`
- `hooks/useMagnetic.ts`

**Nav specification:**

```tsx
// components/Nav.tsx
'use client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { MagneticButton } from './MagneticButton'

gsap.registerPlugin(ScrollTrigger)

export function Nav() {
  const navRef = useRef(null)
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    let lastScrollY = 0

    ScrollTrigger.create({
      start: 8,
      onUpdate: (self) => {
        setIsScrolled(self.scroll() > 8)
        if (self.scroll() > 100) {
          // Hide on scroll-down, show on scroll-up
          gsap.to(navRef.current, {
            y: self.direction === 1 ? '-100%' : '0%',
            duration: 0.3,
            ease: 'power2.out',
          })
        }
      },
    })
  }, [])

  return (
    <nav
      ref={navRef}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'backdrop-blur-[16px] saturate-180 bg-background/80 border-b border-border/40'
          : 'bg-transparent'
      }`}
    >
      {/* Skip to content */}
      <a href="#main" className="skip-to-content">Skip to content</a>

      <div className="section-container flex items-center justify-between h-16 lg:h-18">
        {/* Logo */}
        <Link href="/" className="font-display text-xl text-primary">
          socelle<span className="text-accent-warm">.</span>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-8">
          <Link href="/for-brands" className="text-sm font-body text-secondary hover:text-primary transition-colors">
            For Brands
          </Link>
          <Link href="/for-buyers" className="text-sm font-body text-secondary hover:text-primary transition-colors">
            For Buyers
          </Link>
          <Link href="/how-it-works" className="text-sm font-body text-secondary hover:text-primary transition-colors">
            How It Works
          </Link>
          <Link href="/pricing" className="text-sm font-body text-secondary hover:text-primary transition-colors">
            Pricing
          </Link>
        </div>

        {/* CTA */}
        <div className="hidden md:block">
          <MagneticButton
            href={process.env.NEXT_PUBLIC_BRAND_APPLY_URL}
            className="inline-flex items-center px-5 py-2.5 bg-accent text-white rounded-full text-sm font-body font-semibold hover:bg-accent-hover transition-colors min-h-[44px]"
          >
            Get early access
          </MagneticButton>
        </div>

        {/* Mobile CTA (no hamburger — simplified per CURSORRULES) */}
        <div className="md:hidden">
          <Link
            href={process.env.NEXT_PUBLIC_BRAND_APPLY_URL || '/'}
            className="inline-flex items-center px-4 py-2 bg-accent text-white rounded-full text-sm font-semibold min-h-[44px]"
          >
            Get started
          </Link>
        </div>
      </div>
    </nav>
  )
}
```

**Footer specification:**

Minimal. Logo, copyright, 3 links. No heavy structure.

```tsx
// components/Footer.tsx
import Link from 'next/link'

export function Footer() {
  return (
    <footer className="bg-background border-t border-border py-12">
      <div className="section-container flex flex-col md:flex-row items-center justify-between gap-6">
        <Link href="/" className="font-display text-xl text-primary">
          socelle<span className="text-accent-warm">.</span>
        </Link>
        <p className="text-sm font-body text-tertiary order-last md:order-none">
          © {new Date().getFullYear()} Socelle. All rights reserved.
        </p>
        <div className="flex gap-8 text-sm font-body text-secondary">
          <Link href="/privacy" className="hover:text-primary transition-colors">Privacy</Link>
          <Link href="/terms" className="hover:text-primary transition-colors">Terms</Link>
          <a href="mailto:hello@socelle.com" className="hover:text-primary transition-colors">Contact</a>
        </div>
      </div>
    </footer>
  )
}
```

**Root layout:**

```tsx
// app/layout.tsx
'use client'
import Lenis from 'lenis'
import { useEffect } from 'react'
import { Nav } from '@/components/Nav'
import { Footer } from '@/components/Footer'
import './globals.css'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    })
    function raf(time: number) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }
    requestAnimationFrame(raf)
    return () => lenis.destroy()
  }, [])

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Instrument+Serif&display=swap" rel="stylesheet" />
        <link href="https://api.fontshare.com/v2/css?f[]=satoshi@400,500,600&display=swap" rel="stylesheet" />
      </head>
      <body>
        <Nav />
        <main id="main">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
```

**All hooks:** Implement from Technique 1–7 code blocks earlier in this document.

**Definition of done:**
```
[ ] Nav renders on all pages (inherited from layout)
[ ] Nav is transparent on load, glassmorphic on scroll
[ ] Nav hides on scroll-down (>100px), shows on scroll-up
[ ] Mobile nav has 44px minimum touch targets
[ ] Skip-to-content link functional
[ ] Lenis smooth scroll active — verify with console log on init
[ ] Footer renders correctly at all viewports
[ ] All hooks created (useScrollReveal, useSmoothScroll, useMagnetic)
[ ] All shared components created (Hero, PinnedSection, FeatureCards, MagneticButton, CountUp, Footer)
[ ] MagneticButton disabled on touch devices
[ ] prefers-reduced-motion tested: nav animations disabled
[ ] npm run typecheck passes with zero errors
```

---

## AGENT 4 — HOMEPAGE

**Objective:** Build the complete homepage with all sections and all 7 animation techniques.

**Prerequisite:** Agent 3 complete.

**Scope:** `app/page.tsx`

**Copy source:** `SOCELLE_PLAYBOOK.md` → Section H → "HOMEPAGE COPY" subsection. Use verbatim. Do not modify.

**Section build order:**

### 4a. Hero
- Background: `gradient-bg` class (Technique 5)
- Headline: Use `HeroHeadline` component (Technique 6) with headline from Playbook Section H
- Subhead: fades up with `data-reveal` 0.4s after headline completes
- CTA buttons: primary = `MagneticButton` (Technique 7) → "Get early access" → D3 confirmed destination; secondary = ghost button → `/for-buyers`
- Stat pills row: 3 minimal stat indicators (use pre-launch appropriate values from Playbook Section H)
- No stock photography — use abstract CSS element (floating card outline, grid pattern, or SVG geometry for visual interest)

### 4b. Platform Split — For Brands / For Buyers
- Two cards side by side, full-width
- Each card: `TiltCard` component (Technique 4)
- Cards enter with stagger `data-reveal` (Technique 2)
- Left card: "For brands" — headline, 3 bullets, CTA → `/for-brands`
- Right card: "For buyers" — headline, 3 bullets, CTA → `/for-buyers`

### 4c. Comparison Table
- 3-column: "General wholesale" | "Brand portals" | "Socelle"
- Socelle column highlighted with `--accent-soft` background and top border in `--accent`
- Copy from Playbook Section H

### 4d. How It Works (Pinned)
- Use `PinnedSection` component (Technique 3)
- Three steps: Discover / Order / Grow
- Mobile: replace pin with vertical stacked `data-reveal` steps
- Step body copy from Playbook Section H

### 4e. Social Proof (Dark Section)
- `gradient-bg-dark` class
- `CountUp` component for any numeric stats (when real stats exist — otherwise use text-only claims from Playbook Section H)
- Testimonial card slot: placeholder until real quotes available — use CSS outline/dashed box with `{TODO: Add testimonial}` comment, NOT a fake quote
- Step number in brass (`--dark-accent`)

### 4f. Final CTA
- `gradient-bg` class
- Large headline from Playbook Section H
- `MagneticButton` (Technique 7) → "Get early access"
- Secondary text link → platform app URL

**Definition of done:**
```
[ ] All sections render at 1440px, 1280px, 768px, 390px
[ ] All 7 techniques active and functional
[ ] Pinned section: pins correctly on desktop, stacks on mobile
[ ] Hero text reveals character-by-character on load
[ ] MagneticButton tracks cursor on desktop only
[ ] All copy matches Playbook Section H — no improvised copy
[ ] No fake testimonials or fabricated stats
[ ] Lighthouse Performance ≥ 90 (desktop)
[ ] prefers-reduced-motion: all animations off, all content visible
[ ] No TypeScript errors
```

---

## AGENT 5 — FOR BRANDS PAGE

**Objective:** Build the `/for-brands` conversion page.

**Prerequisite:** Agent 3 complete.

**Scope:** `app/for-brands/page.tsx`

**Copy source:** `SOCELLE_PLAYBOOK.md` → Section H → "FOR BRANDS PAGE COPY" subsection.

**Section order:**

1. **Hero** — `gradient-bg`, headline + subhead + trust bar + dual CTA
   - Primary CTA: "Apply as a brand" → `NEXT_PUBLIC_BRAND_APPLY_URL`
   - Secondary: "See how it works" → `/how-it-works`
2. **Problem section** — "The problem we're solving for you" — scroll reveal text
3. **Features** — 6 `TiltCard` cards with stagger reveal, icon + title + body
4. **Economics** — Three-step commission flow: Sell → Keep 92% → We keep 8%
   - Visual: horizontal 3-step flow on desktop, vertical on mobile
5. **FAQ** — 6 questions, Framer Motion accordion (`AnimatePresence` for expand/collapse)
6. **Final CTA** — Sage background, headline, magnetic button

**Framer Motion accordion:**
```tsx
import { AnimatePresence, motion } from 'framer-motion'
// Each FAQ item wraps answer in:
<AnimatePresence>
  {open && (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="overflow-hidden"
    >
      {answer}
    </motion.div>
  )}
</AnimatePresence>
```

**Definition of done:**
```
[ ] All sections render correctly at all viewports
[ ] CTA links to correct platform URL
[ ] FAQ accordion opens/closes smoothly with Framer Motion
[ ] Scroll reveals active on all sections
[ ] All copy from Playbook Section H — no improvised copy
[ ] No TypeScript errors
```

---

## AGENT 6 — FOR BUYERS PAGE

**Objective:** Build the `/for-buyers` conversion page.

**Prerequisite:** Agent 3 complete.

**Scope:** `app/for-buyers/page.tsx`

**Copy source:** `SOCELLE_PLAYBOOK.md` → Section H → "FOR BUYERS PAGE COPY" subsection.

**Section order:**

1. **Hero** — headline + subhead + CTA
   - Primary CTA: "Create free account" → `NEXT_PUBLIC_BUYER_SIGNUP_URL`
2. **Problem section** — buyer-perspective pain points (scroll reveal)
3. **Features** — 6 `TiltCard` features with stagger reveal
4. **Verification explainer** — "Who qualifies?" — styled info block
   - Licensed salons, spas, medspas, estheticians, cosmetologists
   - Clean bullet list in serif-accented style
5. **FAQ** — 4 questions, Framer Motion accordion
6. **Final CTA** — "The professional beauty marketplace built for you"

**Definition of done:** Same criteria as Agent 5, adjusted for buyer-side CTA destinations.

---

## AGENT 7 — HOW IT WORKS PAGE

**Objective:** Build the `/how-it-works` page with a pinned scroll section as the primary feature.

**Prerequisite:** Agent 3 complete.

**Scope:** `app/how-it-works/page.tsx`, `components/PinnedSection.tsx` (if not yet complete from Agent 3)

**Copy source:** `SOCELLE_PLAYBOOK.md` → Section H → "HOW IT WORKS PAGE COPY" subsection.

**Page structure:**

1. **Page intro** — short hero section: eyebrow + headline + 1-sentence subhead. No animation — just clean and fast.

2. **The Pinned Section** (centerpiece — Technique 3)

```
Three steps, pinned in sequence:

Step 01 — Discover
"Brands list their professional products.
Buyers browse and discover what fits their practice."
[Abstract visual: a simple card grid animation]

Step 02 — Order
"Buyers add to cart across multiple brands.
One checkout, one order confirmation."
[Abstract visual: cart + multi-brand indicator]

Step 03 — Grow
"Both sides build direct wholesale relationships.
Data flows both ways. Reorders take seconds."
[Abstract visual: connected nodes or relationship graph — pure CSS]
```

Step number styling:
- Number: `--text-tertiary` when inactive → `--accent` when active
- Transition: scrub (tied to scroll)

**Mobile treatment:** On `< 768px`, disable pin entirely. Render as three stacked sections with large numbers, scrolling normally. Add `data-reveal` to each for fade-in.

3. **Closing CTA** — Brief. "Ready to get started?" + dual buttons.

**Definition of done:**
```
[ ] Pinned section functional at 1440px, 1280px
[ ] Pin disabled and replaced with vertical scroll at 768px and below
[ ] Step numbers change from muted to accent as step activates
[ ] Scrub is smooth (scrub: 1, not scrub: true)
[ ] Abstract visuals are CSS-only (no images, no video, no Three.js)
[ ] All copy from Playbook Section H
[ ] No TypeScript errors
```

---

## AGENT 8 — PRICING + ABOUT PAGES

**Objective:** Build both pages with updated copy from the Playbook.

**Prerequisite:** Agent 3 complete.

**Scope:** `app/pricing/page.tsx`, `app/about/page.tsx`

**Copy source for both:** `SOCELLE_PLAYBOOK.md` → Section H → "PRICING PAGE COPY" and "ABOUT PAGE COPY" subsections.

### Pricing Page (`app/pricing/page.tsx`)

**Hero headline:** "Simple economics. No catch."
**Structure:**
1. Hero — headline + subhead
2. Two-column split: Brand pricing (left) / Buyer pricing (right)
   - Brand: "8% commission on completed orders. No subscription. No setup fee."
   - Buyer: "$0. Free forever. No catch."
3. How the numbers work — the 92/8 split explained plainly, 3-step visual
4. FAQ accordion — 6 questions from Playbook Section H (use Framer Motion, same pattern as Agent 5)
5. CTA — minimal, linked to apply

**Keep from existing React platform:** The FAQ content and commission structure are already well-written in the existing codebase (`Pricing.tsx`). Import the Q&A content from Playbook Section H but keep the same honest, direct tone.

### About Page (`app/about/page.tsx`)

**Structure:**
1. Hero — "The professional beauty supply chain is broken." (hero headline — keep this; it's strong)
2. The problem — 4 numbered problem cards (same content as existing About.tsx — it works)
3. What we're building — 3-phase roadmap cards (Phase 1 active, 2 and 3 future)
4. Our principles — 4 cards with gold-bar top accent
5. Team section — **No placeholder, no fake bio.** Use Playbook Section H interim team language verbatim until real team content is ready
6. CTA — "Join us."

**Definition of done:**
```
[ ] Both pages render at all viewports
[ ] FAQ accordion functional on Pricing (Framer Motion)
[ ] About team section uses Playbook interim language — no "Team profiles coming soon" placeholder
[ ] All copy from Playbook Section H
[ ] No placeholder content visible to users
[ ] No TypeScript errors
```

---

## AGENT 9 — VERTICAL LANDING PAGES

**Objective:** Build three SEO-targeted vertical landing pages.

**Prerequisite:** Agent 3 complete.

**Scope:**
- `app/solutions/spa/page.tsx`
- `app/solutions/medspa/page.tsx`
- `app/solutions/salon/page.tsx`

**Copy source:** `SOCELLE_PLAYBOOK.md` → Section H → "VERTICAL PAGES COPY" and Section I → vertical messaging guidelines.
**Do not reuse homepage copy verbatim** — adapt to vertical context per Playbook instructions.

### Each vertical page structure:

1. **Hero** — vertical-specific headline + subhead
   - Spa: "Every professional spa brand, wholesale."
   - Medspa: "The wholesale marketplace built for medspas."
   - Salon: "Your brands. One order. No portals."
2. **Problem** — 3 vertical-specific pain points
3. **Platform benefits** — tailored to that buyer type (3 `TiltCard` cards)
4. **Brand showcase** — placeholder grid: "Brands available in this category coming soon" — styled as a dashed outline grid, NOT fake brand names
5. **Testimonial slot** — same pattern as homepage: CSS placeholder, no fake quotes
6. **CTA** — "Create free account" → `NEXT_PUBLIC_BUYER_SIGNUP_URL`

### SEO metadata per page (see Agent 10 for full SEO implementation):
- `/solutions/spa`: title "Wholesale Spa Products for Professional Buyers | Socelle"
- `/solutions/medspa`: title "Professional Skincare Wholesale for Medspas | Socelle"
- `/solutions/salon`: title "Wholesale Hair & Beauty for Professional Salons | Socelle"

**Definition of done:**
```
[ ] Three pages render with unique copy for each vertical
[ ] No homepage copy copy-pasted verbatim
[ ] No fake brand names or fake testimonials
[ ] CTAs point to correct destinations
[ ] All scroll reveals functional
[ ] No TypeScript errors
```

---

## AGENT 10 — SEO + METADATA

**Objective:** Implement full SEO infrastructure across all marketing site pages.

**Prerequisite:** Agents 4–9 all complete (all pages must exist before sitemap generation).

**Scope:** All `app/*/page.tsx` files, `app/layout.tsx`, `public/sitemap.xml`, `public/robots.txt`

**Copy source for metadata:** `SOCELLE_PLAYBOOK.md` → Section H → "METADATA — All Public Pages" and Section K → SEO keyword strategy.

### Step 1 — Per-page metadata (Next.js App Router)

In each `page.tsx`, export a `metadata` object:

```tsx
// Example: app/page.tsx (Homepage)
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Socelle — The Professional Commerce Platform for Beauty & Wellness',
  description: 'Verified wholesale marketplace for professional beauty brands, salons, spas, and medspas. Browse brands, order wholesale, and grow your business.',
  openGraph: {
    title: 'Socelle — The Professional Commerce Platform',
    description: 'One marketplace for professional beauty. Verified brands, wholesale pricing, one order.',
    url: 'https://socelle.com',
    siteName: 'Socelle',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Socelle — The Professional Commerce Platform',
    description: 'One marketplace for professional beauty. Verified brands, wholesale pricing, one order.',
    images: ['/og-image.png'],
  },
  alternates: {
    canonical: 'https://socelle.com',
  },
}
```

Apply unique title + description to every page. No two pages should share the same title or description. Reference Playbook Section H metadata tables for all values.

### Step 2 — JSON-LD Organization schema (Homepage only)

```tsx
// In app/page.tsx, add to <head> via script tag or next-seo:
const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Socelle',
  url: 'https://socelle.com',
  description: 'The professional commerce platform for beauty and wellness.',
  contactPoint: {
    '@type': 'ContactPoint',
    email: 'hello@socelle.com',
    contactType: 'customer support',
  },
}
```

### Step 3 — Sitemap

Create `public/sitemap.xml`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://socelle.com/</loc><priority>1.0</priority></url>
  <url><loc>https://socelle.com/for-brands</loc><priority>0.9</priority></url>
  <url><loc>https://socelle.com/for-buyers</loc><priority>0.9</priority></url>
  <url><loc>https://socelle.com/how-it-works</loc><priority>0.8</priority></url>
  <url><loc>https://socelle.com/pricing</loc><priority>0.8</priority></url>
  <url><loc>https://socelle.com/about</loc><priority>0.7</priority></url>
  <url><loc>https://socelle.com/insights</loc><priority>0.7</priority></url>
  <url><loc>https://socelle.com/solutions/spa</loc><priority>0.7</priority></url>
  <url><loc>https://socelle.com/solutions/medspa</loc><priority>0.7</priority></url>
  <url><loc>https://socelle.com/solutions/salon</loc><priority>0.7</priority></url>
  <url><loc>https://socelle.com/privacy</loc><priority>0.3</priority></url>
  <url><loc>https://socelle.com/terms</loc><priority>0.3</priority></url>
</urlset>
```

### Step 4 — robots.txt

Create `public/robots.txt`:

```
User-agent: *
Allow: /
Sitemap: https://socelle.com/sitemap.xml
Disallow: /api/
```

### Step 5 — OG image

Create `public/og-image.png` — 1200×630px.
Design: Deep sage background (#2D5A4E) + "socelle." in Instrument Serif (white) + tagline in Satoshi (white/70) + warm brass decorative element.
If PNG tooling isn't available: use SVG at `public/og-image.svg` and convert with `sharp` or `imagemagick`.

**Definition of done:**
```
[ ] All pages have unique title + description (no duplicates)
[ ] All pages have OG + Twitter card metadata
[ ] All pages have canonical URL
[ ] Homepage has JSON-LD Organization schema
[ ] sitemap.xml accessible at /sitemap.xml
[ ] robots.txt accessible at /robots.txt
[ ] og-image.png/svg exists and is referenced correctly
[ ] No debvaihello@gmail.com in any page metadata or content
[ ] Google Rich Results Test validates structured data
```

---

## AGENT 11 — QA + ACCESSIBILITY

**Objective:** Full quality assurance pass across the complete marketing site.

**Prerequisite:** Agent 10 complete (site must be fully built before QA).

**Scope:** All pages, all viewports, cross-browser

**Run `npm run build` first. Fix all TypeScript and build errors before running any checks below.**

### Performance Checklist

```
[ ] Lighthouse Performance ≥ 90 — all pages, desktop
[ ] Lighthouse Performance ≥ 75 — all pages, mobile
[ ] First Contentful Paint < 1.5s (desktop)
[ ] Largest Contentful Paint < 2.5s (desktop)
[ ] Total JS bundle < 300KB compressed (excluding fonts)
    Verify: npx source-map-explorer .next/static/chunks/*.js
[ ] Fonts load correctly: Instrument Serif + Satoshi
[ ] All images use next/image with WebP/AVIF
[ ] No unused GSAP plugins imported (only gsap + ScrollTrigger)
```

### Animation Checklist

```
[ ] Lenis smooth scroll active (verify: scroll feels buttery, not native)
[ ] Hero headline: character-by-character deblur reveal on load
[ ] Scroll reveals: [data-reveal] elements animate in on scroll
[ ] Pinned section: pins at correct scroll position, transitions between steps
[ ] Pinned section: disabled on mobile (< 768px), replaced with vertical scroll
[ ] 3D card tilt: active on desktop hover, disabled on touch devices
[ ] Gradient mesh: animate on hero and CTA sections, subtle and not distracting
[ ] Magnetic button: pulls toward cursor on desktop, disabled on touch
[ ] Nav: transparent on load, glassmorphic on scroll, hides on scroll-down, shows on scroll-up
[ ] Dark sections use --dark-accent (brass, #C4956A) not --accent (sage)
```

### Accessibility Checklist

```
[ ] prefers-reduced-motion: ALL animations disabled, all content fully visible
[ ] Skip-to-content link present and functional (focus to #main)
[ ] All images have descriptive alt text
[ ] Semantic HTML: section, nav, main, article, header, footer used correctly
[ ] Color contrast ≥ 4.5:1 for body text (verify with axe or browser dev tools)
[ ] Color contrast ≥ 3:1 for large text (≥ 24px or 18.5px bold)
[ ] All interactive elements: visible focus state (outline or ring)
[ ] All interactive elements: minimum 44×44px touch target
[ ] Form inputs (if any): associated labels
[ ] No content hidden behind animations — all readable if JS fails
[ ] Keyboard navigation: Tab through all interactive elements in logical order
[ ] ARIA roles added where semantic HTML is insufficient
```

### Content Checklist

```
[ ] No debvaihello@gmail.com on any page
[ ] No "vite.svg" references
[ ] No placeholder text visible: "TODO", "Coming soon", "Team profiles coming soon"
[ ] No fake testimonials or fabricated quotes
[ ] No fictional statistics presented as real data
[ ] All CTAs point to correct destinations per Phase 0 D3 decision
[ ] All internal links resolve (no 404s)
[ ] Footer links resolve: /privacy, /terms, mailto:hello@socelle.com
[ ] Logo links to /
[ ] Sitemap accessible at /sitemap.xml
[ ] robots.txt accessible at /robots.txt
```

### Browser + Viewport Checklist

```
[ ] Chrome (latest): all pages, all sections
[ ] Safari (latest): check Lenis compatibility, check backdrop-filter
[ ] Firefox (latest): check backdrop-filter fallback
[ ] Mobile: 375px, 390px, 428px (iPhone SE, iPhone 14, iPhone 14 Pro Max)
[ ] Tablet: 768px
[ ] Desktop: 1280px, 1440px, 1920px
```

### Visual Checklist

```
[ ] No pure white (#FFFFFF) backgrounds — only #FAFAF8 or #F4F2EF
[ ] No pure black (#000000) text — only #1A1A1A or CSS variables
[ ] All headlines: Instrument Serif, font-weight 400
[ ] All body text: Satoshi
[ ] No Playfair Display or Inter fonts loaded
[ ] Gold accent (--accent-warm #C4956A) on dark sections only
[ ] Sage (--accent #2D5A4E) on light sections only
[ ] Consistent section spacing throughout
```

**Definition of done:** All checklist items pass. Any item that cannot pass must be documented in `QA_EXCEPTIONS.md` with:
- Item that failed
- Why it was not fixable
- Proposed resolution timeline

---

## POST-BUILD VERIFICATION COMMANDS

After all agents complete, run these from the repo root:

```bash
# TypeScript — must be zero errors
npm run typecheck

# Build — must succeed with no errors
npm run build

# Bundle size check
npx source-map-explorer .next/static/chunks/*.js --no-border-checks

# Check for remaining placeholder email
grep -r "debvaihello\|gmail\.com" app/ components/ public/

# Check for vite references
grep -r "vite" app/ public/

# Check for placeholder copy
grep -r "TODO\|Coming soon\|Lorem ipsum" app/ components/

# Check for pure white/black backgrounds (CSS smell)
grep -r "#ffffff\|#FFFFFF\|#000000\|#000" app/ components/ --include="*.tsx" --include="*.css"

# Confirm all env variables are set
cat .env.local

# Verify sitemap exists
cat public/sitemap.xml

# Verify robots.txt exists
cat public/robots.txt
```

---

## WHAT AGENTS MUST NOT DO

These are hard constraints. Any agent that takes these actions must revert them immediately.

**Architecture:**
- Do not modify any files in the React platform (`/src/`, `/supabase/`, `netlify.toml`)
- Do not create a monorepo — the marketing site is a standalone repo
- Do not install any dependencies not listed in this document
- Do not add Three.js, WebGL, Spline embeds, or any 3D library

**Copy:**
- Do not write or modify any copy — all copy comes from `SOCELLE_PLAYBOOK.md` Section H
- Do not add placeholder copy like "Lorem ipsum" or "Content coming soon" in user-visible elements
- Do not add fake testimonials, fake brand names, or fictional statistics

**Content:**
- Do not reference DEBVAI in any public-facing content
- Do not use `debvaihello@gmail.com` in any context — only `hello@socelle.com`
- Do not disclose that the team section is a placeholder — use Playbook interim language
- Do not disclose that brand content is not yet live — design placeholders to look structural, not apologetic

**Assets:**
- Do not import images from the internet or use stock photo URLs in production code
- Do not add video embeds or auto-playing media of any kind
- Do not add a carousel or slider — use pinned scroll instead

**Performance:**
- Do not import full GSAP library — only `gsap` core + `ScrollTrigger`
- Do not add analytics, chat widgets, or third-party scripts without explicit owner authorization

---

## TIMELINE ESTIMATE

| Wave | Agents | Start | End | Duration |
|------|--------|-------|-----|----------|
| Pre-flight | Phase 0 decisions | Day 0 | Day 1 | 1 day |
| Wave 1 | Agents 1 + 2 | Day 1 | Day 2 | 1–2 days |
| Wave 2 | Agent 3 | Day 2 | Day 3 | 1 day |
| Wave 3 | Agents 4–9 (parallel) | Day 3 | Day 7 | 4–5 days |
| Wave 4 | Agent 10 | Day 7 | Day 8 | 1 day |
| Wave 5 | Agent 11 | Day 8 | Day 10 | 2 days |

**Total: 10 days from Phase 0 confirmation to QA pass.**
This assumes one agent per task running concurrently in Wave 3. If agents are sequential, add 6 days.

---

## CROSS-REFERENCES

| Need | Where to find it |
|------|-----------------|
| All website copy | `SOCELLE_PLAYBOOK.md` → Section H |
| SEO keyword strategy | `SOCELLE_PLAYBOOK.md` → Section K |
| Color system rationale | `SOCELLE_PLAYBOOK.md` → Section J |
| Positioning + messaging | `SOCELLE_PLAYBOOK.md` → Sections D, I |
| Vertical messaging | `SOCELLE_PLAYBOOK.md` → Section I |
| Animation techniques (full) | `SOCELLE_CURSORRULES.md` |
| Phase 1 fixes (existing React site) | `PHASE1_WORK_ORDER.md` |
| React platform code | `/src/` (do not modify) |

---

*PHASE2_WORK_ORDER.md — SOCELLE Next.js marketing site build*
*Produced from SOCELLE_PLAYBOOK.md + SOCELLE_CURSORRULES.md*
*Ready to deploy once Phase 0 pre-flight decisions are confirmed*
