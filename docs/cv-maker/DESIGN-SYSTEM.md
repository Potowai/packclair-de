# CVClair Design System

> Awaiting validation before implementation.

---

## 1. Brand Identity

**Vibe:** Minimal Swiss — ultra-clean white space, tight typography, subtle shadows. Think Stripe, Linear, Vercel. Professional, trustworthy, fast-feeling.

**Primary color:** Emerald `#059669` — fresh, growth, success. Stands out from the sea of blue CV makers.

**Brand promise on screen:** "Your CV gets you hired. We make sure it passes."

---

## 2. Color Palette

### Light Mode (default)

| Token | Hex | Usage |
|---|---|---|
| `--bg` | `#fafafa` | Page background |
| `--surface` | `#ffffff` | Cards, modals, inputs |
| `--surface-hover` | `#f4f4f5` | Card hover, input focus bg |
| `--border` | `#e4e4e7` | Default borders |
| `--border-focus` | `#059669` | Focus rings |
| `--text-primary` | `#18181b` | Headings, primary text |
| `--text-secondary` | `#71717a` | Labels, secondary text |
| `--text-muted` | `#a1a1aa` | Placeholders, hints |
| `--primary` | `#059669` | CTAs, links, active states |
| `--primary-hover` | `#047857` | CTA hover |
| `--primary-light` | `#ecfdf5` | Primary tint backgrounds |
| `--primary-ring` | `rgba(5,150,105,0.15)` | Focus rings |
| `--danger` | `#dc2626` | Errors, destructive |
| `--danger-light` | `#fef2f2` | Error banners |
| `--warning` | `#d97706` | Warnings, alerts |
| `--warning-light` | `#fffbeb` | Warning banners |
| `--success` | `#059669` | Success states |
| `--success-light` | `#ecfdf5` | Success banners |

### Dark Mode

| Token | Hex | Usage |
|---|---|---|
| `--bg` | `#09090b` | Page background |
| `--surface` | `#18181b` | Cards, modals |
| `--surface-hover` | `#27272a` | Card hover |
| `--border` | `#27272a` | Default borders |
| `--border-focus` | `#10b981` | Focus rings (brighter emerald) |
| `--text-primary` | `#fafafa` | Headings |
| `--text-secondary` | `#a1a1aa` | Labels |
| `--text-muted` | `#71717a` | Placeholders |
| `--primary` | `#10b981` | CTAs (brighter for dark bg) |
| `--primary-hover` | `#34d399` | CTA hover |
| `--primary-light` | `rgba(16,185,129,0.1)` | Primary tint |
| `--primary-ring` | `rgba(16,185,129,0.2)` | Focus rings |
| `--danger` | `#f87171` | Errors |
| `--danger-light` | `rgba(248,113,113,0.1)` | Error banners |
| `--warning` | `#fbbf24` | Warnings |
| `--warning-light` | `rgba(251,191,36,0.1)` | Warning banners |

---

## 3. Typography

**Font stack:** `Inter, system-ui, -apple-system, sans-serif`

No custom font loading — system fonts for instant rendering and PWA performance.

| Token | Size | Weight | Line-height | Usage |
|---|---|---|---|---|
| `--text-xs` | `0.75rem` (12px) | 500 | 1.4 | Badges, step labels |
| `--text-sm` | `0.875rem` (14px) | 400 | 1.5 | Secondary text, hints |
| `--text-base` | `1rem` (16px) | 400 | 1.5 | Body text, inputs |
| `--text-lg` | `1.125rem` (18px) | 500 | 1.4 | Subtitles |
| `--text-xl` | `1.25rem` (20px) | 600 | 1.3 | Section headings |
| `--text-2xl` | `1.5rem` (24px) | 700 | 1.25 | Page titles |
| `--text-3xl` | `2rem` (32px) | 700 | 1.2 | Hero title |
| `--text-4xl` | `2.5rem` (40px) | 700 | 1.15 | Landing hero |

**Letter spacing:** headings `-0.02em`, body `0`, labels `+0.01em`

---

## 4. Spacing Scale

Base unit: `4px`

| Token | Value |
|---|---|
| `--space-1` | `4px` |
| `--space-2` | `8px` |
| `--space-3` | `12px` |
| `--space-4` | `16px` |
| `--space-5` | `20px` |
| `--space-6` | `24px` |
| `--space-8` | `32px` |
| `--space-10` | `40px` |
| `--space-12` | `48px` |
| `--space-16` | `64px` |

---

## 5. Border Radius

| Token | Value | Usage |
|---|---|---|
| `--radius-sm` | `6px` | Inputs, small elements |
| `--radius-md` | `8px` | Cards, buttons |
| `--radius-lg` | `12px` | Modals, large cards |
| `--radius-xl` | `16px` | Feature cards |
| `--radius-full` | `9999px` | Avatars, badges, pills |

---

## 6. Shadows

Minimal, layered — never more than 2 layers.

| Token | Light Mode | Usage |
|---|---|---|
| `--shadow-xs` | `0 1px 2px rgba(0,0,0,0.04)` | Subtle lift |
| `--shadow-sm` | `0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)` | Cards |
| `--shadow-md` | `0 4px 6px rgba(0,0,0,0.04), 0 2px 4px rgba(0,0,0,0.03)` | Dropdowns |
| `--shadow-lg` | `0 10px 15px rgba(0,0,0,0.04), 0 4px 6px rgba(0,0,0,0.03)` | Modals |
| `--shadow-focus` | `0 0 0 3px var(--primary-ring)` | Focus rings |

Dark mode: shadows removed (use border instead: `1px solid var(--border)`).

---

## 7. Components

### Buttons

| Variant | Style |
|---|---|
| **Primary** | `bg: var(--primary)`, `color: white`, `radius: var(--radius-md)`, `padding: 10px 20px`, `font-weight: 600`, `transition: all 0.15s` |
| **Secondary** | `bg: transparent`, `border: 1.5px solid var(--border)`, `color: var(--text-primary)` |
| **Ghost** | `bg: transparent`, `color: var(--text-secondary)`, no border |
| **Danger** | `bg: var(--danger)`, `color: white` |

Hover: `transform: translateY(-1px)`, `box-shadow: var(--shadow-sm)`
Active: `transform: translateY(0)`
Disabled: `opacity: 0.5`, `cursor: not-allowed`

### Inputs

```
border: 1.5px solid var(--border)
radius: var(--radius-sm)
padding: 10px 14px
font: inherit
transition: border-color 0.15s, box-shadow 0.15s
```

Focus: `border-color: var(--primary)`, `box-shadow: var(--shadow-focus)`
Error: `border-color: var(--danger)`

### Cards

```
background: var(--surface)
border: 1px solid var(--border)
radius: var(--radius-lg)
padding: var(--space-6)
```

Hover (optional): `box-shadow: var(--shadow-sm)`

### Stepper

- 5 numbered circles, 36px diameter
- Active: `bg: var(--primary)`, `color: white`, `box-shadow: var(--primary-ring)`
- Completed: `bg: var(--primary)`, `color: white`, checkmark icon
- Future: `border: 2px solid var(--border)`, `color: var(--text-muted)`
- Connecting line: `height: 2px`, `background: var(--border)`, completed turns `var(--primary)`
- Labels below: `font-size: var(--text-xs)`, `font-weight: 500`

### Progress Bar

- Height: `3px`
- Track: `var(--border)`
- Fill: `var(--primary)`, `transition: width 0.4s ease`

---

## 8. Layout

### Page widths

| Context | Max-width |
|---|---|
| Landing hero | `680px` (centered text) |
| Landing grid | `1000px` |
| Quiz stepper | `640px` |
| Editor | `720px` |
| Preview | `800px` |

### Grid

CSS Grid for landing cards, Flexbox for everything else.

### Spacing between sections

`var(--space-16)` (64px) on landing, `var(--space-8)` (32px) in app.

---

## 9. Landing Page Layout

**Above the fold (hero) — GET THEM TO QUIZ:**

```
┌─────────────────────────────────────────┐
│                                         │
│  CVClair                    [dark mode] │
│                                         │
│  ─────────────────────────────────────  │
│                                         │
│     Your CV gets you hired.             │
│     We make sure it passes ATS.         │
│                                         │
│     [✨ Generate my CV with AI →]       │
│                                         │
│     Free to create · 2.99€ to download  │
│     No subscription · No card required  │
│                                         │
│  ─────────────────────────────────────  │
│                                         │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐  │
│  │  ✓ ATS  │ │  ✓ AI   │ │  ✓ Your │  │
│  │  tested │ │  honest │ │  data   │  │
│  └─────────┘ └─────────┘ └─────────┘  │
│                                         │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐  │
│  │ Gratuif │ │2.99€    │ │ Pro     │  │
│  │ 0€      │ │/CV      │ │7.99€/mo │  │
│  │         │ │         │ │         │  │
│  │[Commencer]│ │[Créer] │ │[Découvrir]│ │
│  └─────────┘ └─────────┘ └─────────┘  │
│                                         │
│  Footer · Mentions légales              │
└─────────────────────────────────────────┘
```

Key: **Massive primary CTA** above the fold. Minimal copy. 3 trust badges. 3 pricing cards. Done.

---

## 10. Dark Mode Implementation

- Use `prefers-color-scheme: dark` media query as default
- Toggle button in header (sun/moon icon)
- Store preference in `localStorage`
- CSS custom properties swap via `[data-theme="dark"]` selector on `<html>`
- All colors via CSS variables — theme swap is instant

---

## 11. Animations

| Element | Animation |
|---|---|
| Page transitions | `opacity 0.2s ease` |
| Step content | `fadeSlideIn 0.3s ease` (18px translate) |
| Button hover | `transform translateY(-1px) 0.15s ease` |
| Focus rings | `box-shadow 0.15s ease` |
| Progress bar | `width 0.4s ease` |
| Spinner | `rotate 0.7s linear infinite` |

No heavy JS animations. CSS only. No parallax. No auto-play.

---

## 12. Responsive Breakpoints

| Breakpoint | Width | Behavior |
|---|---|---|
| Mobile | `< 640px` | Single column, stacked elements, full-width buttons |
| Tablet | `640px - 1024px` | 2-column grids, some side-by-side |
| Desktop | `> 1024px` | Full layout, max-widths apply |

---

*This document is the source of truth for the CVClair redesign. All components, pages, and interactions must follow these rules.*
