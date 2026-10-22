# PackClair DE

> *Local-first, la confidentialité avant tout.*

PackClair DE est une **PWA** de gestion des déclarations d'emballage (LUCID) pour
les entreprises françaises. L'ensemble tourne **local-first** : les données restent
sur le poste tant que possible, et rien n'est envoyé à un serveur tiers.

## Fonctionnalités

- Déclaration d'emballages conforme au format LUCID
- Fonctionnement hors-ligne, synchronisation optionnelle
- Interface PWA installable
- Aucune donnée envoyée à un service tiers par défaut

## Stack

- **TypeScript**
- **PWA** (manifest + service worker)
- **Netlify** — hébergement
- Organisation en monorepo : `apps/` (application) et `packages/` (bibliothèques partagées)

## Démarrage

```bash
npm install
npm run dev
```

## Documentation

- `docs/cv-maker/` — générateur de CV
- `docs/superpowers/` — notes de conception

## Licence

MIT
