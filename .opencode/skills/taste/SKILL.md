---
name: taste
description: Use when reviewing or redesigning UI/UX for aesthetics, conversion, trust, and modern visual polish. Applies minimalist design, clear visual hierarchy, consistent spacing, generous whitespace, thoughtful micro-animations, and conversion-focused layout. Follows CVClair brand (primary #1a4f8a, sans-serif Inter, subtle shadows, card-based layouts).
---

# Taste — CVClair Design Guidelines

## Brand
- Primary: `#1a4f8a` (deep trustworthy blue)
- Background: `#f6f7f9` (cool light grey)
- Card: white, 8px radius, subtle shadow `0 2px 12px rgba(20, 30, 45, 0.08)`
- Text: `#20242a` body, `#5a6572` secondary, `#1a4f8a` links
- CTA: filled blue `#1a4f8a`, hover `#153f6e`
- Danger: `#a33333`

## Typography
- Font: Inter, system-ui, sans-serif
- Headings: bold, short line-height
- Body: 1rem, line-height 1.5

## Layout Principles
- Maximum width for content: 720px (editor/quiz), 820px (preview)
- Generous whitespace: 1rem+ padding, 1.5-2rem section spacing
- Card-based sections with subtle separation
- Mobile-first: stack on narrow, grid where helpful

## Stepper UI
- 5-6 steps maximum
- Step indicator at top: numbered circles (white number on primary circle, grey for future steps)
- Active step: filled primary circle with bold label
- Completed step: checkmark or filled with accent
- Connecting line between circles (light grey, turn primary when completed)
- Smooth slide/fade transitions between steps (CSS: `transition: opacity 0.3s, transform 0.3s;`)
- Progress bar below step circles (thin, primary gradient fill)

## Conversion
- Primary CTA buttons: filled, large, prominent, clear action text
- Secondary actions: text links or outlined buttons
- Trust signals visible throughout: "Vos données restent sur votre appareil", "Sans carte bancaire", "3 générations offertes"
- Error states: warm amber banner, not red (less alarming)
- Loading state: pulsing dots or skeleton

## Animation Principles
- Subtle and purposeful, never distracting
- Page transitions: 300ms ease
- Button hover: background darken or lift (transform: translateY(-1px))
- No auto-play, no parallax, no heavy JS animations (CSS transitions only)
