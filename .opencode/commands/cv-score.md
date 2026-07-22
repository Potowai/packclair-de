---
description: Audit ATS d'un CV (JSON CVSchema ou HTML rendu) et rapport noté avec corrections. Usage : /cv-score <chemin-du-cv> [chemin-offre-d-emploi.txt]
agent: build
---

Charge la skill `ats-audit` et audite le CV fourni : $ARGUMENTS

1. Premier argument = chemin du CV (`.json` CVSchema ou `.html` rendu). Deuxième argument optionnel = fichier texte d'une offre d'emploi pour la couverture de mots-clés.
2. Valide le JSON contre `CVSchema` (`packages/cv-schema`) si applicable ; sinon audite le HTML avec `lintCv` et `extractFields` de `@cvclair/ats-harness`.
3. Calcule le score (50 % lint structure + 50 % couverture mots-clés si offre fournie, sinon lint seul).
4. Rend le rapport au format de la skill : score, violations (règle, emplacement, correction), verdict pass/fail (seuil 95/100).
