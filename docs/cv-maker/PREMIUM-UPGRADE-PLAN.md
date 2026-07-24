# Premium Upgrade Plan — CVClair

> Validation required before implementation.

---

## What changes

| # | Upgrade | Effort | Impact |
|---|---|---|---|
| 1 | Google Fonts (Inter loaded properly) | 5 min | Fonts render consistently everywhere |
| 2 | Gradient mesh hero | 10 min | Instant "premium" first impression |
| 3 | Scroll reveal animations | 20 min | Elements fade/slide in as you scroll |
| 4 | Animated stats counter | 15 min | "12 847 CV générés" counting up |
| 5 | Interactive before/after CV | 25 min | Drag slider: bad CV → CVClair CV |
| 6 | Sticky glass header | 10 min | Header blurs on scroll |
| 7 | Micro-interactions | 15 min | Button ripple, card tilt, hover lifts |
| 8 | Smooth dark mode | 5 min | 300ms cross-fade instead of instant |
| 9 | Floating hero shapes | 10 min | Subtle geometric shapes behind hero |
| 10 | Social proof bar | 10 min | "12 847 CV • 4.8/5 • 98% score moyen" |

---

## 1. Google Fonts

**What:** Load Inter 400/500/600/700 via `<link>` in head. Remove system fallback as primary.

**Where:** All `.astro` pages `<head>`.

**How:** `<link rel="preconnect" href="https://fonts.googleapis.com">` + `<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">`

---

## 2. Gradient Mesh Hero

**What:** Replace flat `--bg` hero background with a subtle emerald gradient mesh using CSS `radial-gradient` layers.

**Where:** `.hero` class in `global.css`.

**How:**
```css
.hero {
  background:
    radial-gradient(ellipse at 20% 50%, rgba(5,150,105,0.08) 0%, transparent 50%),
    radial-gradient(ellipse at 80% 20%, rgba(16,185,129,0.06) 0%, transparent 50%),
    var(--bg);
}
```
Dark mode: adjust opacities.

---

## 3. Scroll Reveal Animations

**What:** Elements with `.reveal` class fade + slide up when they enter the viewport.

**Where:** Landing page sections (features, testimonials, pricing, CTA).

**How:**
- CSS: `.reveal { opacity: 0; transform: translateY(24px); transition: opacity 0.6s ease, transform 0.6s ease; }` `.reveal.visible { opacity: 1; transform: translateY(0); }`
- JS: IntersectionObserver on `.reveal` elements, toggling `.visible` class.
- Add `RevealOnScroll.astro` script in `<head>` of all pages.

---

## 4. Animated Stats Counter

**What:** Numbers that count up when scrolled into view: "12 847 CV générés", "20 règles ATS", "98% score moyen".

**Where:** Below the hero, as a horizontal stat bar.

**How:**
- 3 stat blocks in a flex row.
- JS: IntersectionObserver triggers `animateCount(el, target, duration)` — increments number with `requestAnimationFrame`.
- CSS: large bold number + small label below.

---

## 5. Interactive Before/After CV

**What:** A drag-slider showing a "bad" CV (Canva-style, columns, icons) vs a CVClair CV (clean, ATS-safe). Users drag a handle to compare.

**Where:** Between the live demo and the features section.

**How:**
- Two overlapping divs (bad CV left, good CV right).
- A draggable handle (mouse + touch events).
- `clip-path: inset(0 ${percent}% 0 0)` on the right side to reveal/hide.
- CSS transition on the handle for smooth feel.
- Static images of two CVs (rendered once, saved as styled divs — no actual image needed, just HTML/CSS).

---

## 6. Sticky Glass Header

**What:** Header gets `backdrop-filter: blur(12px)` + semi-transparent background on scroll.

**Where:** `.header` class in `global.css`.

**How:**
- CSS: `.header.scrolled { background: rgba(250,250,250,0.85); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); }`
- JS: `window.addEventListener('scroll', ...)` toggles `.scrolled` class when `scrollY > 10`.
- Dark mode: `rgba(9,9,11,0.85)`.

---

## 7. Micro-interactions

**What:** Button ripple on click, card tilt on hover, smooth focus rings.

**Where:** All buttons, feature cards, pricing cards.

**How:**
- **Button ripple:** CSS `::after` pseudo-element with radial gradient, `transform: scale(0)` on click via JS class toggle.
- **Card tilt:** CSS `perspective(800px)` + `transform: rotateX(2deg) rotateY(-1deg)` on hover (subtle, 200ms).
- **Focus rings:** Already have `--shadow-focus`. Add `transition` on all interactive elements.

---

## 8. Smooth Dark Mode

**What:** `transition: background 0.3s, color 0.3s` on `body` and all color variables.

**Where:** Already partially done. Just ensure `* { transition: background 0.3s, color 0.3s, border-color 0.3s; }` is scoped correctly (not on everything, just color-related properties).

**How:** Add `transition` to `:root` variables and key elements.

---

## 9. Floating Hero Shapes

**What:** 2-3 subtle geometric shapes (circles, rounded rects) floating behind the hero with slow CSS animation.

**Where:** Inside `.hero`, as decorative `div`s.

**How:**
- `position: absolute` shapes with `opacity: 0.06` (emerald), `border-radius: 50%`.
- `@keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-20px); } }`
- Different animation delays for each shape.

---

## 10. Social Proof Bar

**What:** Horizontal bar with animated stats: "12 847 CV générés • 4.8/5 note • 98% score ATS moyen".

**Where:** Below the hero stats, above the demo section.

**How:**
- Flex row, centered, with dot separators.
- Numbers animate on scroll (reuse counter from #4).
- Small, muted text — not competing with hero CTA.

---

## Implementation order

1. Google Fonts (instant visual improvement)
2. Gradient mesh hero (biggest "cheap → premium" jump)
3. Smooth dark mode (polish)
4. Sticky glass header (navigation feel)
5. Scroll reveals (content becomes alive)
6. Animated stats + social proof bar (credibility)
7. Floating hero shapes (depth)
8. Micro-interactions (finishing touch)
9. Interactive before/after (wow moment)

---

## Files changed

| File | Changes |
|---|---|
| All `.astro` `<head>` | Google Fonts link |
| `global.css` | Gradient hero, glass header, reveal classes, animations, micro-interactions |
| `index.astro` | Hero shapes, stats bar, social proof, `.reveal` classes on sections |
| New: `src/scripts/reveal.ts` | IntersectionObserver for scroll reveals + counter animation |
| New: `src/components/BeforeAfterCV.tsx` | Interactive comparison slider |

---

*Approve this plan and I'll implement all 10 upgrades.*
