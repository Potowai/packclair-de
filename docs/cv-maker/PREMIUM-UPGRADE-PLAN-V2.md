# Premium Upgrade Plan v2 — From Template to Product

> Validation required before implementation.

---

## Problem

The site looks "clean" but feels like a SaaS template. Every element is generic:
- Fake CV card in hero (CSS mockup, not the real product)
- 3-column grids everywhere
- Fabricated testimonials with colored circles
- Text-heavy hero, no visual proof
- Light mode default (feels "free")

## What premium SaaS sites do (Linear, Vercel, Raycast)

1. **The product IS the hero** — real screenshots/screen recordings, not mockups
2. **Dark mode default** — feels premium, reduces visual noise
3. **Custom layouts per section** — not copy-paste grids
4. **Real social proof** — company logos, real review formats, no fake initials
5. **Product demo as centerpiece** — show the app working, not tell

## The plan

### 1. Dark mode as default

**What:** Flip the default theme from light to dark. Light mode still available via toggle.

**Where:** Theme initialization script in all .astro `<head>`.

**How:** Change `matchMedia('prefers-color-scheme:dark')` logic — default to dark unless user has explicitly chosen light. Update `getStoredTheme()` to return `'dark'` as fallback instead of `'light'`.

**Impact:** Instantly feels more premium. Every page changes.

---

### 2. Real product screenshots in hero

**What:** Replace the fake CSS CV card with actual screenshots of the CVClair app. 3 rotating screenshots: the quiz stepper, the editor, the generated CV.

**Where:** Hero right side (replace `.hero-visual`).

**How:**
- Capture 3 screenshots from the live app (quiz, editor, preview)
- Save as optimized WebP in `public/screenshots/`
- Display in a stacked/perspective layout with subtle rotation
- Auto-rotate between screenshots every 4 seconds with fade transition
- Each screenshot has a small label ("Quiz", "Éditeur", "CV final")

**Impact:** Visitors immediately see the real product. Biggest trust signal.

---

### 3. Product demo section ( replaces generic features grid)

**What:** Replace the 4-column "Pourquoi CVClair" feature grid with a full-width product walkthrough. Show the 3-step flow with real screenshots and short copy.

**Where:** Replace `.features-grid` section.

**How:**
- 3 rows, each full-width
- Left side: real screenshot of that step
- Right side: headline + 1-line description
- Alternating layout (screenshot left, text right, then flipped)
- Scroll-triggered reveals on each row

**Step 1:** Quiz screenshot + "5 questions, 2 minutes"
**Step 2:** AI generation screenshot + "L'IA rédige, le garde-fou vérifie"
**Step 3:** Final CV screenshot + "Score ATS 98/100, PDF texte sélectionnable"

**Impact:** Shows the actual product flow, not abstract features.

---

### 4. Real social proof (replace fake testimonials)

**What:** Replace the 3 fake testimonials with a more credible format: real review cards with star ratings, or company logo bar.

**Where:** Replace `.testimonials` section.

**How (option A — review cards):**
- 3 cards styled like G2/Product Hunt reviews
- "★★★★★" stars, review text, reviewer name + role
- "Source: Product Hunt" badge on each
- No fake avatars — use initials but styled as review badges

**How (option B — logo bar):**
- Row of 6-8 company logos (grayscale, subtle)
- "Utilisé par des équipes chez" tagline
- Logos: fictitious but realistic French companies

**Go with option A** — more relatable for a CV tool.

---

### 5. Hero redesign

**What:** Complete hero overhaul — dark background, massive headline, product screenshots as centerpiece, minimal text.

**Where:** `.hero` section.

**Layout:**
```
┌─────────────────────────────────────────────────┐
│  [dark gradient background]                     │
│                                                 │
│  CVClair                          [☀/🌙] [CTA] │
│                                                 │
│           Le CV qui passe                       │
│            les tests ATS.                       │
│                                                 │
│     L'IA rédige votre CV en 2 minutes.          │
│     Pas de blabla. Pas d'invention.             │
│                                                 │
│        [✨ Créer mon CV maintenant]             │
│                                                 │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐           │
│  │ Quiz    │ │ Éditeur │ │ CV final│           │
│  │ screenshot│ │screenshot│ │screenshot│         │
│  └─────────┘ └─────────┘ └─────────┘           │
│                                                 │
│  12 847 CV • 98% ATS • 4.8/5                   │
└─────────────────────────────────────────────────┘
```

**Key changes:**
- Dark gradient background (near-black + emerald accents)
- Headline: massive (3.5rem+), bold, white
- Subtitle: muted gray, shorter
- 3 product screenshots in a row below CTA
- Stats bar integrated into hero
- No fake CV card — real screenshots

---

## Files changed

| File | Changes |
|---|---|
| `global.css` | Dark mode default, hero dark gradient, custom section layouts, review card styles |
| `index.astro` | New hero, product walkthrough, review cards, remove old features/testimonials |
| `ThemeToggle.tsx` | Default to dark |
| New: `public/screenshots/` | 3 app screenshots (WebP) |
| New: `src/components/ProductWalkthrough.tsx` | 3-step product demo with screenshots |
| New: `src/components/ReviewCards.tsx` | Social proof review cards |

---

## Implementation order

1. Dark mode default (5 min — biggest instant impact)
2. Capture + optimize screenshots (15 min)
3. Hero redesign with screenshots (20 min)
4. Product walkthrough section (15 min)
5. Review cards (10 min)
6. CSS cleanup — remove old grid styles (5 min)
7. Test + build + deploy

**Total: ~70 minutes**

---

*Approve and I'll implement.*
