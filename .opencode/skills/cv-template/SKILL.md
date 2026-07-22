---
name: cv-template
description: Use when creating or modifying a CV template in apps/cv/src/templates (HTML/CSS/React rendering of a CVSchema). Enforces the ATS-safe template contract and the required tests — a template only exists if it is tested against the ats-harness.
---

# CV Template Scaffolding

Tout gabarit CVClair suit un contrat non négociable et ne peut être mergé qu'avec ses tests.

## Où vivent les gabarits

- `apps/cv/src/templates/<name>/Template.tsx` — composant React pur : `({ cv: CV }) => JSX.Element`.
- `apps/cv/src/templates/<name>/template.css` — styles du gabarit (police standard, une colonne).
- `apps/cv/src/templates/index.ts` — registre : id, nom d'affichage FR, tier (`free` | `pro`).
- Page d'aperçu : `apps/cv/src/pages/app/apercu.astro` rend le gabarit sélectionné via le registre.

## Contrat ATS-safe (voir ats-audit pour la liste complète des 20 règles)

1. Une seule colonne ; aucun `<table>`, aucune mise en page par flottants/position absolue pour le contenu.
2. Coordonnées en texte brut dans le corps (jamais en `<header>`/`<footer>` détaché du flux).
3. Titres de rubriques canoniques : `Profil`, `Expérience professionnelle`, `Formation`, `Compétences`, `Langues` (un `<h2>` par rubrique, texte exact).
4. Un poste = `<h3>` titre + ligne employeur + ligne dates `MM/AAAA`.
5. Listes en `<ul>/<li>` ; liens en `<a href>` ; aucune icône porteuse de donnée ; aucune barre de progression de compétences.
6. Police système/web standard (inter, roboto, source-serif), corps ≥ 10 pt, contraste AA.
7. Ordre du DOM = ordre visuel de lecture.
8. Aucune `@media print` nécessaire pour rester lisible ; la page d'aperçu n'embarque **pas** de feuille print (le téléchargement est un produit payant — voir PLAN §3).

## Tests obligatoires avant « terminé »

1. Rendre les 10 fixtures en or (`packages/ats-harness/src/fixtures`) dans le gabarit : test Vitest de snapshot/structure.
2. `lintCv` de `@cvclair/ats-harness` : 0 erreur sur chaque fixture rendue.
3. Précision d'extraction ≥ 98 % (harnais).
4. e2e Playwright : sélection du gabarit → aperçu conforme ; axe : 0 violation bloquante.

## Règle

La skill **ats-audit** doit passer sur le gabarit avant de considérer la tâche terminée. Un gabarit sans test est supprimé, pas corrigé « plus tard ».
