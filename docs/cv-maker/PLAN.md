# CVClair — Plan produit & technique : le meilleur créateur de CV français avec IA, 100 % ATS-proof

Date : 2026-07-22
Statut : **M0 et M1 livrés** (2026-07-22) — voir §9
Emplacement : ce dépôt (`business ideas`), workspace `apps/cv` + `packages/cv-schema` + `packages/ats-harness`

---

## 1. Vision

**CVClair** : un créateur de CV en ligne, français d'abord, qui garantit deux choses que les concurrents ne garantissent pas ensemble :

1. **Un CV qui passe les ATS** — non pas « optimisé pour les ATS » en marketing, mais **vérifié par un harnais de test automatisé** qui parse chaque gabarit avec de vrais parseurs avant publication, et qui donne à l'utilisateur un **score ATS mesuré** sur son CV final.
2. **Une IA qui adapte le CV à l'offre d'emploi sans jamais mentir** — l'IA reformule, réordonne et met en avant l'expérience réelle ; un garde-fou de véracité bloque toute invention d'expérience ou de compétence.

Positionnement vie privée (différenciateur majeur en France) : **local-first**. Les données du CV restent dans le navigateur (IndexedDB) ; la synchronisation cloud chiffrée est une option Pro. Slogan : *« Vos données restent chez vous. »*

## 2. Marché et concurrents

Cibles : demandeurs d'emploi francophones (France d'abord), 18–45 ans, du premier emploi au cadre. Canaux d'achat : recherche Google (« créer un CV gratuit », « CV ATS », « faire un CV en ligne »), LinkedIn, bouche-à-oreille écoles/bootcamps.

| Concurrent | Faiblesse exploitée |
|---|---|
| Zety, Resume.io, LiveCareer | « Essai » à ~2 € qui devient un **abonnement caché** difficile à résilier, anglophones d'abord |
| Canva | Beaux gabarits mais souvent **catastrophiques en ATS** (colonnes, zones de texte, graphiques) |
| DoYouBuzz, CVDesignR (FR) | Vieillissants, pas d'IA d'adaptation à l'offre, ATS non prouvé |
| FlowCV | Gratuit et honnête, mais pas français, pas d'IA d'adaptation, pas de score ATS vérifié |
| Jobscan | Score ATS uniquement, pas un créateur de CV |

**Écart de marché** : aucun acteur français ne combine (a) création entièrement gratuite avec **prix unique transparent de 2,99 € au téléchargement** (aucun abonnement caché), (b) gabarits ATS *testés et prouvés*, (c) IA d'adaptation à l'offre avec garde-fou de véracité, (d) confidentialité local-first.

## 3. Gratuit, téléchargement à la carte et Pro

### Gratuit (0 €, sans carte) — tout créer, rien payer avant la fin

- 1 CV actif, 3 gabarits ATS de base
- Éditeur complet (expériences, formation, compétences, langues, accroche)
- **Aperçu plein écran fidèle** du CV à tout moment (le rendu final est visible avant de payer)
- Score ATS **basique** : lint de structure (titres de rubriques, colonnes, polices, coordonnées lisibles) — calculé localement
- 3 adaptations IA offertes (quota serveur, compte requis)
- Stockage local uniquement (IndexedDB), export/import JSON
- **Téléchargement du PDF : 2,99 €** (voir offre à la carte ci-dessous)

### À la carte — 2,99 € par téléchargement (paiement unique, **jamais d'abonnement**)

- Un paiement = le **PDF serveur haute qualité** du CV, texte sélectionnable, sans filigrane
- Re-téléchargements de **ce** CV inclus pendant **7 jours** (marge pour corrections de dernière minute)
- Stripe Checkout : CB, Apple Pay, SEPA ; facture PDF avec TVA
- **Transparence radicale** : le prix de 2,99 € est affiché dès la première étape du parcours et l'aperçu complet est accessible avant paiement — le contraire des « essais » Zety/Resume.io qui mutent en abonnement. C'est le premier argument de confiance de la marque.

### Pro (7,99 €/mois ou 59 €/an — soit 4,92 €/mois, TVA incluse)

- **Téléchargements illimités inclus** (PDF serveur + **DOCX** éditable)
- CV illimités, tous les gabarits (dont gabarits premium FR : cadre, tech, commerce, santé…)
- **IA illimitée** : import de CV existant (PDF/DOCX/LinkedIn), adaptation à l'offre par URL ou texte collé, réécriture de puces, lettre de motivation générée
- **Score ATS complet** : parse multi-moteurs + couverture des mots-clés de l'offre + boucle d'amélioration guidée jusqu'à ≥ 95/100
- Synchronisation cloud chiffrée multi-appareils + historique de versions
- Suivi de candidatures (mini-CRM : offre, statut, relance)

Logique de conversion en trois marches : le gratuit laisse **tout créer** (investissement en temps = engagement) ; le moment de vérité est la fin du parcours → **2,99 € à l'acte**, prix affiché dès le début pour ne jamais trahir ; le Pro cible ceux qui itèrent (multi-CV, IA illimitée, score complet, téléchargements illimités — rentable dès le 3ᵉ téléchargement/mois). L'achat unique ne déclenche **aucun** abonnement.

## 4. Le moteur ATS — « passer parfaitement » est un critère de test, pas un slogan

### 4.1 Règles de gabarit ATS-safe (contrats non négociables)

- Une seule colonne ; aucun tableau, zone de texte, en-tête/pied de page pour le contenu
- Coordonnées dans le corps du document, texte brut
- Titres de rubriques canoniques : `Expérience professionnelle`, `Formation`, `Compétences`, `Langues`, `Profil` (+ alias EN mappés)
- Polices standard embarquées (inter/roboto/source serif), pas d'icônes pour les données, pas de barres de progression de compétences (illisibles par les parseurs → listes textuelles)
- Dates au format `MM/AAAA`, un poste = une ligne de titre + employeur + dates sur lignes prévisibles
- PDF **texte réel** (jamais rasterisé), ordre de lecture correct, liens cliquables

### 4.2 Harnais de vérification ATS (`packages/ats-harness`)

Chaque gabarit doit passer ce pipeline en CI avant d'être publié :

1. **Fixtures en or** : 10 CV synthétiques représentatifs (junior, cadre, reconversion, secteurs variés) rendus dans chaque gabarit.
2. **Extraction multi-moteurs** : Apache Tika, pdfminer.six, parseur open-source OpenResume ; en benchmark périodique, API d'essai de parseurs commerciaux (Affinda, Sovren) et instances de démo d'ATS hébergés (Greenhouse/Lever).
3. **Précision de champ** : nom, e-mail, téléphone, rubriques, postes, dates, compétences — extraction ≥ 98 % exacte sur le jeu en or, sinon le gabarit ne peut pas shipper (test Vitest en gate).
4. **Lint de structure** : règles de la section 4.1 exprimées en assertions automatiques sur le HTML/CSS source et sur le texte extrait.
5. **Couverture de mots-clés** : pour une offre donnée, pourcentage des compétences exigées présentes dans le CV (alimente le score utilisateur).

Le **score ATS utilisateur** = 50 % parseabilité structurelle + 50 % couverture de mots-clés de l'offre cible. La boucle « améliorer » propose des corrections concrètes jusqu'à ≥ 95/100.

## 5. Pipeline IA

Schéma interne unique : `CVSchema` (Zod, inspiré de JSON Resume + extensions FR : `permis`, `mobilité`, `photo` optionnelle jamais exigée).

1. **Import** : PDF/DOCX/JSON → extraction texte → LLM → `CVSchema` validé par Zod (retry sur échec de validation).
2. **Analyse d'offre** : URL ou texte collé → extraction des exigences (compétences, diplômes, expérience, mots-clés exacts) en français.
3. **Adaptation** : le LLM réordonne les rubriques, reformule les puces (verbes d'action, résultats quantifiés), intègre les mots-clés **uniquement si véridiques**.
4. **Garde-fou de véracité** : diff automatique des affirmations (chiffres, diplômes, technologies, employeurs) entre CV source et CV généré ; toute affirmation nouvelle non sourcée est supprimée ou signalée à l'utilisateur pour confirmation explicite. Tests property-based (fast-check) sur ce diff.
5. **Boucle score** : génération → harnais ATS → si < 95, corrections ciblées → nouvelle passe (max 3 itérations).
6. **Lettre de motivation** (Pro) : générée depuis `CVSchema` + offre, ton français professionnel, vouvoiement.

Modèles : route serveur Astro (`/api/ai/*`) → Anthropic Claude (français excellent) avec sorties structurées ; prompts français d'abord ; ~3–6 k tokens entrée / 1–2 k sortie par adaptation → coût marginal < 0,03 €, viable dans le quota gratuit de 3 adaptations. Les appels IA ne reçoivent que le CV structuré, jamais plus que nécessaire (minimisation RGPD), avec consentement explicite et case « ne pas utiliser l'IA ».

## 6. Spécificités françaises

- **Conventions CV FR** : 1 page (2 pour cadres expérimentés), accroche courte, rubriques attendues, photo/âge/adresse **optionnels et jamais exigés** (loi anti-discrimination), `Permis B`, niveaux de langue CECRL (A1–C2).
- **ATS répandus en France** : Workday, SmartRecruiters, Taleo, Greenhouse, Lever, Teamtailor + acteurs FR (Flatchr, Beetween) — le harnais cible le plus petit dénominateur commun.
- **Légal** : RGPD/CNIL (local-first = minimisation par conception ; DPA avec le fournisseur LLM ; registre des traitements), mentions légales, CGU/CGV, TVA 20 %, factures PDF, droit de rétractation contenu numérique (renonciation expresse à l'exécution immédiate), bandeau cookies conforme CNIL (ex. tarteaucitron).
- **Paiement** : Stripe — CB, SEPA, Apple Pay ; deux produits distincts : **paiement unique 2,99 €** (Stripe Checkout, aucun abonnement créé) et **abonnement Pro** (Stripe Billing, essai 7 jours, résiliation en 2 clics — attendu par les utilisateurs FR, bon pour la confiance).

## 7. Architecture technique

Nouveau workspace dans ce monorepo, même stack éprouvée que PackClair :

- `apps/cv` — Astro 5 (pages publiques pré-rendues + île React 19 pour `/app`), TypeScript, Dexie (IndexedDB), Zod, Comlink (worker de scoring local), @vite-pwa/astro (PWA hors-ligne), Vitest + fast-check + Testing Library, Playwright (+ axe) e2e.
- `apps/api` (ou routes serveur Astro en mode hybrid) — endpoints `/api/ai/*` (quota gratuit + Pro) et `/api/billing/*` (webhooks Stripe). Node 24.
- `packages/ats-harness` — parseurs, lint, fixtures en or, score (section 4.2), utilisable en CI, dans l'app (lint local) et par la skill `ats-audit`.
- `packages/cv-schema` — `CVSchema` Zod partagé app/api/harnais + migrations Dexie.
- Rendu PDF : gratuit = **aperçu écran uniquement** (HTML/CSS print identique au rendu final, mais sans accès au fichier) ; le téléchargement est toujours un **PDF serveur** (Chromium/Playwright headless → texte réel, pixel-parfait) délivré après paiement unique 2,99 € ou via Pro ; DOCX depuis le même schéma (Pro). L'impression navigateur est volontairement désactivée sur l'aperçu (sinon le paiement est contournable) — l'aperçu reste une page HTML dédiée sans feuille de style print.
- Auth : magic link e-mail (better-auth ou équivalent) — uniquement pour quota IA gratuit/Pro ; l'éditeur marche sans compte.
- i18n : `fr` par défaut, `en` prêt dès la V1.1 ; SEO : pages statiques Astro (`/cv-ats`, `/modele-cv/...`, blog).

Flux de données : tout l'éditeur et le lint ATS tournent **en local** ; seuls l'IA, le score complet et la facturation touchent le serveur.

## 8. Plan d'utilisation des skills OpenCode

Lors de l'implémentation, charger la skill intégrée **`customize-opencode`** (elle gouverne la création de skills/agents/config opencode) puis créer :

| Artefact | Rôle |
|---|---|
| `.opencode/skills/ats-audit/SKILL.md` | Exécute le harnais ATS sur un CV (JSON/PDF) : extraction, précision de champs, lint structure, couverture mots-clés ; rend un rapport noté et les corrections. Utilisée à chaque travail sur gabarit ou moteur d'export. |
| `.opencode/skills/french-cv-style/SKILL.md` | Base de règles éditoriales FR : rubriques, accroche, vouvoiement, quantification des résultats, anti-discrimination, ton recruteur français. Référencée par toute génération de contenu ou de prompts IA. |
| `.opencode/skills/cv-template/SKILL.md` | Scaffolding d'un nouveau gabarit ATS-safe : structure HTML/CSS print, test de lint, fixture en or, gate de parse CI — un gabarit n'existe que s'il est testé. |
| `.opencode/agents/cv-reviewer.md` | Sous-agent « recruteur français » : relit contenu et puces, note clarté/impact, signale clichés et fautes. |
| Commande `/cv-score` | Raccourci vers `ats-audit` sur le CV courant. |

Règle de projet : toute tâche touchant gabarits, export PDF/DOCX ou pipeline IA **doit** passer par `ats-audit` avant d'être considérée terminée — c'est ce qui rend la promesse « passe les ATS » vérifiable.

## 9. Feuille de route

| Jalon | Contenu | Critères d'acceptation |
|---|---|---|
| **M0 — Plan** ✅ | Ce document, scaffold `apps/cv` + `packages/cv-schema` + `packages/ats-harness`, 3 skills + agent `cv-reviewer` + commande `/cv-score` sous `.opencode/` | Fait le 2026-07-22 : workspaces verts (`check:cv`, `test:cv`, `build:cv`), skills rédigées (effet après redémarrage d'opencode) |
| **M1 — MVP éditeur** ✅ | Éditeur complet (identité, accroche, expériences, formation, compétences, langues CECRL), 3 gabarits ATS (classique/moderne/compact), aperçu écran fidèle, stockage Dexie local-first, PWA, landing avec prix affichés, score ATS local en direct | Fait le 2026-07-22 : gate CI 3 gabarits × 10 fixtures (lint 0 erreur + extraction ≥ 98 %) = 30 tests ; e2e créer→remplir→aperçu < 10 min + score 100/100 en navigateur réel ; axe 0 violation bloquante. Décision d'implémentation : schéma « brouillon » (`cvBrouillonSchema`) pour la saisie, validation stricte réservée à l'aperçu/téléchargement |
| **M2 — Téléchargement payant 2,99 €** (2 sem.) | Rendu PDF serveur (Chromium), Stripe Checkout paiement unique, re-téléchargements 7 jours, facture TVA | e2e : payer en mode test → recevoir le PDF serveur ; parse fixture ≥ 98 % sur le PDF serveur ; webhooks idempotents ; aucun abonnement créé |
| **M3 — IA** (3 sem.) | Import CV→schéma, analyse d'offre, adaptation + garde-fou véracité, 3 usages gratuits | Tests Zod sur sorties structurées ; diff de véracité à 0 faux positif sur jeu de test ; quota serveur appliqué |
| **M4 — Score ATS complet** (2 sem.) | `packages/ats-harness` complet, score utilisateur, boucle d'amélioration | Gate CI sur gabarits ; score reproductible ; rapport actionnable |
| **M5 — Pro & abonnement** (2 sem.) | Stripe Billing (abo + essai 7 j), auth magic link, cloud sync chiffré, DOCX, lettre de motivation, téléchargements illimités | Webhook testé e2e ; facture PDF TVA ; sync chiffrée (serveur aveugle) |
| **M6 — Lancement** (2 sem.) | Pages SEO, blog ATS, mentions légales/CGV, Product Hunt + LinkedIn FR | Lighthouse ≥ 95 ; 0 faute a11y bloquante (axe) ; premiers 100 inscrits |

Méthode : chaque tâche en red → green → refactor, tests ciblés puis commit (convention du dépôt, cf. plans `docs/superpowers/`).

## 10. KPIs et risques

KPIs : activation (CV terminé jusqu'à l'aperçu < 10 min) ≥ 40 % ; **conversion aperçu→achat 2,99 € ≥ 10 %** ; conversion acheteur→Pro 10–15 % à 6 mois ; score ATS médian des CV téléchargés ≥ 90 ; churn Pro < 6 %/mois ; trafic SEO sur « CV ATS ».

Risques :

- **Surpromesse légale** : communiquer « testé contre N parseurs, score mesuré », jamais « garanti à 100 % » ; la vérité du produit est le harnais, publié en méthodologie.
- **Perception du paywall au téléchargement** : le prix de 2,99 € est affiché dès la première étape du parcours (jamais de surprise en fin de parcours), l'aperçu complet précède le paiement, et l'achat unique ne crée **aucun** abonnement — c'est ce qui nous distingue des pratiques Zety.
- **Coût LLM** : quota gratuit strict (3), cache d'analyses d'offres, modèle le moins cher qui passe les evals de qualité FR.
- **Hallucination IA** : le garde-fou de véracité est bloquant et testé en property-based.
- **Concurrence** : vitesse d'exécution sur M1–M3 ; le fossé défensif est le harnais ATS public + la confiance vie privée.

## 11. Prochaines actions immédiates

1. Scaffolder `apps/cv` + `packages/cv-schema` (reprendre la config PackClair : astro.config, tsconfig, vitest, playwright).
2. Charger la skill `customize-opencode` et créer les artefacts de la section 8.
3. Rédiger les 10 fixtures en or de CV et les 20 premières règles de lint ATS.
4. Spike : gabarit HTML/CSS → PDF serveur Chromium → parse pdfminer, pour verrouiller la chaîne de rendu ATS-safe ; puis spike Stripe Checkout en mode test pour le paiement unique 2,99 € (vérifier qu'aucun abonnement n'est créé).
