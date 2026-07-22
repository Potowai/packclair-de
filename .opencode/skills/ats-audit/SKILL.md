---
name: ats-audit
description: Use when auditing a CV (JSON CVSchema, rendered HTML, or PDF) for ATS compatibility, when working on CV templates in apps/cv, on the PDF/DOCX export pipeline, or on the AI generation pipeline. Runs the packages/ats-harness lint rules, field-accuracy checks, and keyword-coverage score, then reports a graded report with concrete fixes.
---

# ATS Audit

Audits a CV against the CVClair ATS harness. Any task touching templates, PDF/DOCX export, or the AI pipeline is **not done** until this audit passes.

## Inputs

- A `CVSchema` JSON file (see `packages/cv-schema`), or
- A rendered template HTML file (from `apps/cv` preview route), or
- A PDF (once the server renderer exists — M2).

## Procedure

1. Ensure the CV JSON validates: parse it with `CVSchema` from `packages/cv-schema`. If it does not validate, report the Zod issues and stop — an invalid CV cannot be audited.
2. Run the harness (Vitest suite doubles as the CLI):
   - `npm run test --workspace @cvclair/ats-harness` — full gate (fixtures × templates).
   - For a single file, run the audit entry point once built: `node packages/ats-harness/dist/cli.js <cv.json|cv.html>` (M4). Until then, write a focused Vitest test that imports `lintCv`, `extractFields`, and `keywordCoverage` from `@cvclair/ats-harness` and run it.
3. Evaluate against the gates:
   - **Lint**: 0 errors (warnings reported but acceptable).
   - **Field accuracy**: extraction of name, email, phone, sections, jobs, dates, skills ≥ 98 % on the golden fixtures.
   - **Keyword coverage** (when a job posting is provided): report % of required keywords present; target ≥ 95 combined score.

## The 20 lint rules (contract — keep in sync with packages/ats-harness/src/lint.ts)

Structure: single column; no tables for content; no text boxes; no headers/footers for content; contact info in body; canonical section headings (`Profil`, `Expérience professionnelle`, `Formation`, `Compétences`, `Langues`); sections in predictable order; one job = title + employer + dates on dedicated lines; dates `MM/AAAA`; no two-digits years; no icons/glyphs as data; no skill progress bars (text lists only); lists use real `<li>`; links are real `<a>`; fonts standard and embedded; font size ≥ 10pt equivalent; contrast sufficient; real text (never images); logical reading order (DOM order = visual order); no unusual unicode bullets.

## Report format

- Score (0–100) = 50 % structure lint + 50 % keyword coverage (or lint-only when no posting).
- List every violation with: rule id, location (section/field), and the concrete fix.
- End with a pass/fail verdict against the gates above.
