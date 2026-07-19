# PackClair DE Core PWA Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Livrer une PWA française, locale et testée qui importe des commandes CSV, calcule les emballages par colis, rapproche les volumes confirmés par l’opérateur et génère un XML LUCID au moyen d’un sérialiseur testé contre le XSD officiel.

**Architecture:** Un workspace npm garde l’interface dans `apps/web` et réserve `apps/commerce-worker` au plan commercial. Astro pré-rend les pages publiques ; une île React montée sur `/app` contient l’assistant local. Le moteur pur s’exécute dans un Web Worker, les données restent dans IndexedDB via Dexie et seuls des ports abstraits anticipent le backend commercial.

**Tech Stack:** Node 24+, npm 11+, Astro 7.0.7, React 19.2.7, TypeScript 7.0.2, Dexie 4.4.4, PapaParse 5.5.4, Zod 4.4.3, Comlink 4.4.2, Vitest 4.1.10, fast-check 4.9.0, Playwright 1.61.1, xmllint-wasm 5.2.0, @vite-pwa/astro 1.2.0.

## Global Constraints

- Allemagne et LUCID uniquement ; langue initiale française ; clients professionnels français.
- Aucun fichier de commandes, SKU, poids, calcul ou rapport ne quitte le navigateur.
- Arithmétique `bigint` en milligrammes ; aucune valeur monétaire ou masse métier en `number` flottant.
- L’XML utilise exclusivement les masses confirmées auprès de l’opérateur, jamais directement les suggestions calculées.
- V1 : un opérateur ; rapports `HPM1`, `HMM1`, `HJM1` seulement ; `HNM1` et `HAM1` bloqués.
- Un export XML exige un référentiel frais de moins de huit jours ; le calcul reste disponible hors ligne.
- Fichier ≤ 25 Mio, ≤ 100 000 lignes, quantité 1–1 000 000, composant ≤ 100 kg.
- Aucun conseil juridique, dépôt automatique, badge officiel, estimation IA ou OAuth marketplace.
- Chaque tâche suit red → green → refactor, termine par ses tests ciblés puis un commit.

---

### Task 1: Socle Astro/React et harnais de test

**Files:**
- Create: `package.json`
- Create: `apps/web/package.json`
- Create: `apps/web/astro.config.mjs`
- Create: `apps/web/tsconfig.json`
- Create: `apps/web/vitest.config.ts`
- Create: `apps/web/playwright.config.ts`
- Create: `apps/web/src/test/setup.ts`
- Create: `apps/web/src/pages/index.astro`
- Create: `apps/web/src/pages/app.astro`
- Create: `apps/web/src/components/app/PackClairApp.tsx`
- Create: `apps/web/src/styles/global.css`
- Test: `apps/web/src/components/app/PackClairApp.test.tsx`
- Test: `apps/web/tests/e2e/smoke.spec.ts`

**Interfaces:**
- Consumes: aucune.
- Produces: `PackClairApp(): JSX.Element`, workspace `@packclair/web`, root scripts npm `dev`, `preview`, `build`, `check`, `test`, `test:e2e`.

- [ ] **Step 1: Créer les manifestes/configurations et installer**

The root `package.json` is private, declares `"workspaces": ["apps/*"]`, and delegates each script to `@packclair/web`. The web manifest below adds `"name": "@packclair/web"` and the raw scripts `astro dev`, `astro preview`, `astro check && astro build`, `astro check && tsc --noEmit`, `vitest run`, and `playwright test`.

```json
{
  "name": "packclair",
  "private": true,
  "workspaces": ["apps/*"],
  "scripts": {
    "dev": "npm run dev --workspace @packclair/web",
    "preview": "npm run preview --workspace @packclair/web",
    "build": "npm run build --workspace @packclair/web",
    "check": "npm run check --workspace @packclair/web",
    "test": "npm run test --workspace @packclair/web --",
    "test:e2e": "npm run test:e2e --workspace @packclair/web"
  }
}
```

Use the dependency manifest below in `apps/web/package.json`, configure Astro React, jsdom Vitest with `setupFiles: ['src/test/setup.ts']`, and configure Playwright later to test the production preview. Run `npm install` from the repository root.

- [ ] **Step 2: Écrire le test React rouge**

```tsx
import { render, screen } from '@testing-library/react';
import { PackClairApp } from './PackClairApp';

it('annonce la promesse locale', () => {
  render(<PackClairApp />);
  expect(screen.getByRole('heading', { name: /préparer ma déclaration/i })).toBeVisible();
  expect(screen.getByText(/restent sur cet appareil/i)).toBeVisible();
});
```

- [ ] **Step 3: Vérifier l’échec initial**

Run: `npm test -- src/components/app/PackClairApp.test.tsx`  
Expected: FAIL, module `./PackClairApp` absent.

- [ ] **Step 4: Créer le composant et les pages minimales**

```json
{
  "name": "@packclair/web",
  "private": true,
  "type": "module",
  "engines": { "node": ">=24" },
  "scripts": {
    "dev": "astro dev", "preview": "astro preview",
    "build": "astro check && astro build",
    "check": "astro check && tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:e2e": "playwright test"
  },
  "dependencies": {
    "@astrojs/react": "6.0.1", "@vite-pwa/astro": "1.2.0", "astro": "7.0.7",
    "comlink": "4.4.2", "dexie": "4.4.4", "papaparse": "5.5.4",
    "react": "19.2.7", "react-dom": "19.2.7", "zod": "4.4.3"
  },
  "devDependencies": {
    "@astrojs/check": "0.9.9", "@axe-core/playwright": "4.12.1",
    "@playwright/test": "1.61.1", "@testing-library/jest-dom": "6.9.1",
    "@testing-library/dom": "10.4.1", "@testing-library/react": "16.3.2",
    "@testing-library/user-event": "14.6.1",
    "@types/node": "26.1.1", "@types/papaparse": "5.5.2", "@types/react": "19.2.17",
    "@types/react-dom": "19.2.3", "fast-check": "4.9.0", "jsdom": "29.1.1",
    "fake-indexeddb": "6.2.5", "typescript": "7.0.2", "vitest": "4.1.10",
    "xmllint-wasm": "5.2.0"
  }
}
```

Create `PackClairApp.tsx` with one `<main>`, the tested heading, the local-data sentence and a primary button. Import `@testing-library/jest-dom/vitest` from the setup file and import `global.css` from both pages.

- [ ] **Step 5: Vérifier le socle**

Run: `npm test -- src/components/app/PackClairApp.test.tsx && npm run build`  
Expected: test PASS; Astro build creates `apps/web/dist/index.html` and `apps/web/dist/app/index.html`.

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json apps/web
git commit -m "feat: scaffold PackClair local PWA"
```

### Task 2: Référentiel LUCID et fenêtres de déclaration

**Files:**
- Create: `apps/web/src/domain/regulatory/materials.ts`
- Create: `apps/web/src/domain/regulatory/operators.ts`
- Create: `apps/web/src/domain/regulatory/report-window.ts`
- Create: `apps/web/src/domain/regulatory/reference-set.ts`
- Test: `apps/web/src/domain/regulatory/report-window.test.ts`

**Interfaces:**
- Produces: `MaterialCode`, `ReportType`, `SYSTEM_OPERATORS`, `evaluateReportWindow(input): ReportWindowResult`, `canonicalizeReportPeriod(input): { periodFrom: string; periodTo: string }`, `REFERENCE_SET_VERSION`.

- [ ] **Step 1: Écrire les tests de dates limites**

```ts
const fullYear = { periodFromMonth: 1, periodToMonth: 12 };
expect(evaluateReportWindow({ type: 'HPM1', reportYear: 2027, todayBerlin: '2026-12-31', ...fullYear }).allowed).toBe(true);
expect(evaluateReportWindow({ type: 'HPM1', reportYear: 2026, todayBerlin: '2026-12-31', ...fullYear }).allowed).toBe(false);
expect(evaluateReportWindow({ type: 'HJM1', reportYear: 2025, todayBerlin: '2026-05-15', ...fullYear }).allowed).toBe(true);
expect(evaluateReportWindow({ type: 'HJM1', reportYear: 2025, todayBerlin: '2026-05-16', ...fullYear })).toMatchObject({ allowed: false, requiredUnsupportedType: 'HNM1' });
expect(evaluateReportWindow({ type: 'HMM1', reportYear: 2026, periodFromMonth: 4, periodToMonth: 6, todayBerlin: '2026-07-12' }).allowed).toBe(true);
expect(canonicalizeReportPeriod({ reportYear: 2028, periodFromMonth: 2, periodToMonth: 2 })).toEqual({ periodFrom: '2028-02-01', periodTo: '2028-02-29' });
```

- [ ] **Step 2: Vérifier l’échec**

Run: `npm test -- src/domain/regulatory/report-window.test.ts`  
Expected: FAIL, `evaluateReportWindow` absent.

- [ ] **Step 3: Implémenter les types et données figées**

```ts
export type MaterialCode = '10000'|'20000'|'30000'|'40000'|'50000'|'60000'|'70000'|'80000';
export type ReportType = 'HPM1'|'HMM1'|'HJM1';
export type ReportWindowResult = { allowed: true } | { allowed: false; reason: string; requiredUnsupportedType?: 'HNM1' };
export const REFERENCE_SET_VERSION = 'lucid-if-1.0+xml-guide-1.2+report-guide-2025-02+xsd-c6a3d5c5542e';
```

Implement string-date rules from the tests. `HPM1` and `HJM1` require January–December; `HMM1` accepts a non-empty month interval within the current year. Canonicalize the first date to the first day and the second date to the actual last day of its month.

Freeze these guide XML 1.2 entries verbatim as readonly `{ id, name }` values and reject any non-listed ID with a `Set` lookup:

```ts
[
  ['DE6005779374130', 'Interzero Circular Solutions Germany GmbH'],
  ['DE6005973594801', 'Reclay Systems GmbH'],
  ['DE6006382012686', 'RKD Recycling Kontor Dual GmbH & Co. KG'],
  ['DE6004919627351', 'Der Grüne Punkt – Duales System Deutschland GmbH'],
  ['DE6005906579671', 'Landbell AG für Rückhol-Systeme'],
  ['DE6005959764031', 'Noventiz Dual GmbH'],
  ['DE6007094250999', 'Zentek GmbH & Co. KG'],
  ['DE6007086225568', 'Veolia Umweltservice Dual GmbH'],
  ['DE6007168805143', 'ELS Europäische LizenzierungsSysteme GmbH'],
  ['DE6004738522858', 'BellandVision GmbH'],
  ['DE6004844021815', 'PreZero Dual GmbH'],
  ['DE6007780383579', 'EKO-PUNKT GmbH & Co. KG'],
  ['DE6257129182400', 'Recycling Dual GmbH'],
  ['DE6161328237553', 'Interzero Recycling Alliance GmbH // Lizenzero'],
  ['DE6229413357273', 'Altera System GmbH']
] as const;
```

The current contact page lists fewer operators than the still-published XML guide. Record that divergence in `reference-set.ts` as `reviewRequiredReason`, but do not silently remove IDs needed for historical reports.

- [ ] **Step 4: Vérifier**

Run: `npm test -- src/domain/regulatory && npm run check`  
Expected: PASS; no TypeScript diagnostic.

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/domain/regulatory
git commit -m "feat: encode LUCID reference rules"
```

### Task 3: Moteur de calcul par expédition et instantanés reproductibles

**Files:**
- Create: `apps/web/src/domain/calculation/types.ts`
- Create: `apps/web/src/domain/calculation/mass.ts`
- Create: `apps/web/src/domain/calculation/calculate.ts`
- Create: `apps/web/src/domain/calculation/reconcile.ts`
- Test: `apps/web/src/domain/calculation/calculate.test.ts`
- Test: `apps/web/src/domain/calculation/properties.test.ts`

**Interfaces:**
- Consumes: `MaterialCode`, `ReportType`, `REFERENCE_SET_VERSION`.
- Produces: `calculatePackaging(input): CalculationSnapshot`, `roundSuggestionToGrams(mg): bigint`, `reconcileConfirmedTotals(snapshot, confirmed): Reconciliation`.

- [ ] **Step 1: Écrire les tests métier rouges**

```ts
const cardboard = (mg: bigint): MaterialMasses => ({
  '10000': 0n, '20000': mg, '30000': 0n, '40000': 0n,
  '50000': 0n, '60000': 0n, '70000': 0n, '80000': 0n
});
const mugProfile = { id: 'mug@1', logicalId: 'mug', revision: 1, kind: 'product', sku: 'MUG', massesMg: cardboard(10_000n) } as const;
const cardProfile = { id: 'card@1', logicalId: 'card', revision: 1, kind: 'product', sku: 'CARD', massesMg: cardboard(4_000n) } as const;
const parcelProfile = { id: 'parcel@1', logicalId: 'parcel', revision: 1, kind: 'shipment', sku: null, massesMg: cardboard(10_000n) } as const;
const snapshot = calculatePackaging({
  sourceKey: 'etsy', accountKey: 'shop-a', batchIds: ['b1'],
  createdAt: '2026-07-12T10:00:00.000Z', trustedDateBerlin: '2026-07-12',
  profileRevisions: [mugProfile, cardProfile, parcelProfile],
  lines: [
    { orderId: 'A', lineId: '1', shipmentId: 'S1', sku: 'MUG', quantity: 2n },
    { orderId: 'A', lineId: '2', shipmentId: 'S1', sku: 'CARD', quantity: 1n }
  ],
  shipments: [{ shipmentId: 'S1', parcelCount: 2n, profileRevisionId: 'parcel@1' }]
});
expect(snapshot.calculatedMg['20000']).toBe(44_000n);
expect(snapshot.profileRevisionIds).toEqual(['mug@1', 'card@1', 'parcel@1']);
```

Also assert that the same `shipmentId` shared by two orders counts once, conflicting shipment definitions throw `DomainError('SHIPMENT_CONFLICT')`, a missing shipment identifier requires a persisted mono-parcel attestation, and changing current profiles cannot alter or change the byte-for-byte recalculation of a stored snapshot.

- [ ] **Step 2: Vérifier l’échec**

Run: `npm test -- src/domain/calculation`  
Expected: FAIL, calculation modules absent.

- [ ] **Step 3: Implémenter le calcul minimal**

```ts
export type MaterialMasses = Readonly<Record<MaterialCode, bigint>>;
export type PackagingProfileRevision = Readonly<{
  id: string; logicalId: string; revision: number; kind: 'product'|'shipment'; sku: string|null; massesMg: MaterialMasses;
}>;
export type OrderLine = Readonly<{ orderId: string; lineId?: string; shipmentId: string|null; sku: string; quantity: bigint }>;
export type Shipment = Readonly<{ shipmentId: string; parcelCount: bigint; profileRevisionId: string }>;
export type MonoParcelAttestation = Readonly<{ batchId: string; acceptedAt: string; profileRevisionId: string }>;
export type LineContribution = Readonly<{ lineKey: string; profileRevisionId: string; quantity: bigint; massesMg: MaterialMasses }>;
export type ShipmentContribution = Readonly<{ shipmentKey: string; profileRevisionId: string; parcelCount: bigint; massesMg: MaterialMasses }>;
export type CalculationSnapshot = Readonly<{
  id: string; createdAt: string; trustedDateBerlin: string; engineVersion: '1'; referenceSetVersion: string;
  sourceKey: string; accountKey: string; batchIds: readonly string[];
  profileSnapshots: readonly PackagingProfileRevision[]; lineContributions: readonly LineContribution[];
  shipmentContributions: readonly ShipmentContribution[]; calculatedMg: MaterialMasses;
}>;
```

Use direct SKU-to-`kind: 'product'` lookups and `Map`/`Set` keyed by `sourceKey/accountKey/orderId/lineId` and `sourceKey/accountKey/shipmentId`; multiply only after bounds checks. If shipment IDs are absent, synthesize one shipment per order only after matching a `MonoParcelAttestation`. Reconciliation parses confirmed kg strings (`/^\d{1,15},\d{3}$/`) to integer grams, compares them with the PackClair suggestion and requires a reason for every difference. It produces either `{ ok: true; value: ReadyDeclaration }` or `{ ok: false; blockers: DeclarationBlocker[] }`; the ready value contains the full period, exactly one operator, confirmation timestamp, confirmed masses and all motivated differences.

- [ ] **Step 4: Ajouter les propriétés et vérifier**

Use fast-check to prove row-order independence, aggregation associativity and non-negative totals.  
Run: `npm test -- src/domain/calculation`  
Expected: all examples and 100 property runs PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/domain/calculation
git commit -m "feat: calculate versioned packaging totals"
```

### Task 4: Import CSV minimisé et sûr

**Files:**
- Create: `apps/web/src/domain/import/types.ts`
- Create: `apps/web/src/domain/import/decode.ts`
- Create: `apps/web/src/domain/import/normalize.ts`
- Create: `apps/web/src/domain/import/overlap.ts`
- Create: `apps/web/src/domain/export/safe-csv.ts`
- Test: `apps/web/src/domain/import/import.test.ts`
- Test: `apps/web/src/domain/export/safe-csv.test.ts`
- Create: `apps/web/src/domain/import/__fixtures__/orders-utf8.csv`
- Create: `apps/web/src/domain/import/__fixtures__/orders-utf16le.csv`
- Create: `apps/web/src/domain/import/__fixtures__/orders-win1252.csv`

**Interfaces:**
- Produces: `CsvPreview`, `ImportBatch`, `OverlapResult`, `previewCsv(bytes, options): CsvPreview`, `normalizeBatch(preview, mapping): ImportBatch`, `detectOverlap(existing, candidate): OverlapResult`, `escapeSpreadsheetCell(value): string`.

- [ ] **Step 1: Écrire les tests rouges**

Assert UTF-8, BOM UTF-16LE/BE and user-confirmed Windows-1252 previews; comma, semicolon and tab delimiters; quoted newlines; ten-row preview limit; explicit `DD/MM/YYYY` mapping; preservation of SKU `00042`; rejection of ambiguous date without format; normalization of `DE`, `Germany`, `Deutschland` and `Allemagne`; rejection of ambiguous destinations; 25 Mio/100 000-row limits; duplicate hash and overlapping composite keys; and `escapeSpreadsheetCell('=1+1') === "'=1+1"`.

- [ ] **Step 2: Vérifier l’échec**

Run: `npm test -- src/domain/import src/domain/export`  
Expected: FAIL, APIs absent.

- [ ] **Step 3: Implémenter le pipeline**

```ts
export type CsvMapping = Readonly<{
  sourceKey: string; accountKey: string; orderId: string; lineId?: string; shipmentId?: string;
  parcelCount?: string; shippingProfile?: string; orderDate: string; country: string; sku: string; quantity: string;
  status?: string; includedStatuses?: readonly string[];
  dateFormat: 'YYYY-MM-DD'|'DD/MM/YYYY'|'MM/DD/YYYY'; defaultOneParcelPerOrder: boolean;
}>;
export type CsvPreview = Readonly<{
  encoding: 'utf-8'|'utf-16le'|'utf-16be'|'windows-1252'; requiresEncodingConfirmation: boolean;
  delimiter: ','|';'|'\t'; headers: readonly string[]; rows: readonly Readonly<Record<string,string>>[];
  totalRows: number; retainedColumns: readonly string[];
}>;
export type OverlapResult =
  | { decision: 'DUPLICATE_FILE'; existingBatchId: string }
  | { decision: 'PARTIAL_OVERLAP'; keys: readonly string[] }
  | { decision: 'APPEND_ALLOWED' }
  | { decision: 'REPLACE_BATCH_REQUIRED'; reason: 'NO_STABLE_LINE_ID'|'OVERLAPPING_PERIOD' };
```

Decode BOMs first, then fatal UTF-8, then require a user-confirmed Windows-1252 preview. Compute a SHA-256 over original bytes but do not retain the file name or original bytes. Persist only mapped fields, the explicit include/exclude status decision, normalized `DE` destination and any mono-parcel attestation. Without stable line IDs, create batch-local line keys and allow append only when date ranges are strictly disjoint; otherwise return `REPLACE_BATCH_REQUIRED`. Neutralize spreadsheet-leading characters in every diagnostic and summary CSV.

- [ ] **Step 4: Vérifier**

Run: `npm test -- src/domain/import src/domain/export && npm run check`  
Expected: PASS including hostile fixtures.

- [x] **Step 5: Commit**

```bash
git add apps/web/src/domain/import apps/web/src/domain/export
git commit -m "feat: add privacy-safe CSV import"
```

### Task 5: Sérialiseur XML et validation XSD indépendante

**Files:**
- Create: `apps/web/src/domain/xml/types.ts`
- Create: `apps/web/src/domain/xml/serialize.ts`
- Create: `apps/web/src/domain/xml/freshness.ts`
- Create: `apps/web/src/domain/export/summary-csv.ts`
- Create: `apps/web/src/domain/export/audit-report.ts`
- Create: `apps/web/src/domain/export/file-names.ts`
- Create: `apps/web/regulatory/lucid/1.0/Hersteller_Datenmeldung_Schema.xsd`
- Create: `apps/web/regulatory/lucid/1.0/manifest.json`
- Test: `apps/web/src/domain/xml/serialize.test.ts`
- Test: `apps/web/src/domain/xml/xsd.test.ts`
- Test: `apps/web/src/domain/export/report-files.test.ts`

**Interfaces:**
- Consumes: `ReadyDeclaration` created by reconciliation; closed `ReportType`, `MaterialCode` and operator whitelist.
- Produces: `serializeLucidXml(report: ReadyDeclaration): Uint8Array`, `evaluateExportPolicy(input): ExportDecision`, `createSummaryCsv`, `createAuditHtml`, `createExportFileNames`.

- [ ] **Step 1: Écrire les tests rouges**

```ts
const bytes = serializeLucidXml({
  type: 'HMM1', periodFrom: '2026-01-01', periodTo: '2026-12-31',
  operatorId: 'DE6005779374130', confirmedGrams: { '20000': 26500n, '50000': 7500n },
  operatorConfirmedAt: '2026-07-12', referenceSetVersion: REFERENCE_SET_VERSION
});
expect([...bytes.slice(0, 3)]).toEqual([0xef, 0xbb, 0xbf]);
expect(new TextDecoder().decode(bytes)).toContain('<Mass>26,500</Mass>');
```

Assert zero omission, `NO_NONZERO_MATERIAL` for an all-zero report, XML escaping by construction, unavailable HJM1 after 15 May, unknown or multiple operator rejection, stale reference rejection at age eight days, reference-version mismatch, unsupported report/material rejection at runtime, and xmllint-wasm `valid === true` for downloaded bytes. Add mass cases `0n`, `999_999_999_999_999_999n`, overflow, negative and duplicate material; rendered values always match `^\d{1,15},\d{3}$` with no thousands separator. The report-file test asserts deterministic ASCII names, spreadsheet formula neutralization, HTML escaping, motivated differences and full snapshot/version metadata.

- [ ] **Step 2: Vérifier l’échec**

Run: `npm test -- src/domain/xml`  
Expected: FAIL, serializer absent.

- [ ] **Step 3: Vendorer les ressources officielles et implémenter**

Download the XSD from `https://www.verpackungsregister.org/fileadmin/LUCID/Hersteller_Datenmeldung_Schema.xsd`, verify its exact SHA-256 `c6a3d5c5542e0c51a28e90f2da2181d2819419f0a521abeec9df6e89f60911c0`, and store hash, source URL, retrieval date and XML guide version in `manifest.json`. A changed download fails the task and sets the future runtime state to `review_required`; it is never accepted automatically.

Implement a fixed element builder which emits no namespace and exactly this ordering (repeating only `Material` for sorted, unique, non-zero modern materials):

```xml
<?xml version="1.0"?>
<Root>
  <VersionNoInterface>1.0</VersionNoInterface>
  <PackagingTypeCode>V</PackagingTypeCode>
  <TypeOfReportCode>HMM1</TypeOfReportCode>
  <ReportingPeriodFrom>2026-01-01</ReportingPeriodFrom>
  <ReportingPeriodTo>2026-12-31</ReportingPeriodTo>
  <ListOfSystemOperators>
    <SystemOperator>
      <SystemOperatorID>DE6005779374130</SystemOperatorID>
      <ListOfMaterials>
        <Material>
          <MaterialCode>20000</MaterialCode>
          <Mass>26,500</Mass>
        </Material>
      </ListOfMaterials>
    </SystemOperator>
  </ListOfSystemOperators>
</Root>
```

Prepend UTF-8 BOM bytes after serialization. Reject `39000`, `49000`, `79000`, `HNM1`, `HAM1`, negative masses, arbitrary free-text element names, periods spanning years, any declaration not produced by reconciliation, and any declaration whose trusted date/window/reference/entitlement policy is not exportable.

- [ ] **Step 4: Valider les octets**

Run: `npm test -- src/domain/xml && npm run check`  
Expected: PASS; xmllint-wasm returns no validation errors for all three supported report types.

- [x] **Step 5: Commit**

```bash
git add apps/web/src/domain/xml apps/web/src/domain/export apps/web/regulatory/lucid
git commit -m "feat: generate tested LUCID XML"
```

### Task 6: Stockage local, révisions et sauvegardes

**Files:**
- Create: `apps/web/src/storage/database.ts`
- Create: `apps/web/src/storage/repository.ts`
- Create: `apps/web/src/storage/backup.ts`
- Create: `apps/web/src/storage/persistence.ts`
- Test: `apps/web/src/storage/repository.test.ts`
- Test: `apps/web/src/storage/backup.test.ts`

**Interfaces:**
- Consumes: normalized imports, immutable profile/snapshot types and `ReadyDeclaration`.
- Produces: `LocalRepository`, `createProfileRevision`, `saveImportAtomically`, `saveSnapshot`, `saveDeclaration`, `exportBackup`, `restoreBackup`, `clearAllLocalData`, `getPersistenceStatus`.

- [ ] **Step 1: Écrire les tests rouges**

Use fake-indexeddb to assert immutable profile revisions, atomic rollback on invalid import, exact snapshot restoration, v1→v2 migration rollback, future-schema rejection, quota error mapping, total erasure and backup round-trip. The test must prove JSON serialization contains decimal strings rather than native `bigint` and reconverts them exactly.

- [ ] **Step 2: Vérifier l’échec**

Run: `npm test -- src/storage`  
Expected: FAIL, storage modules absent.

- [ ] **Step 3: Implémenter Dexie v1**

```ts
db.version(1).stores({
  profileRevisions: '&id, logicalId, [logicalId+revision]',
  batches: '&id, hash, [sourceKey+accountKey], periodFrom, periodTo',
  orderLines: '&key, batchId, orderId, shipmentId, sku',
  shipments: '&key, batchId, shipmentId',
  snapshots: '&id, createdAt, referenceSetVersion',
  declarations: '&id, createdAt, snapshotId, reportType, reportYear',
  mappingPresets: '&id, [sourceKey+accountKey]',
  settings: '&key'
});
```

Define every persisted entity with all indexed fields before declaring this schema. Wrap imports in `db.transaction('rw', ...)`, call `navigator.storage.persist()` when available, report quota/eviction risk, and use a Zod-versioned JSON wire format where every quantity/mass is a canonical unsigned decimal string. Restore validates and converts into a staging transaction before replacing live tables; any error leaves live data untouched. Expose backup reminders after the first import, each declaration and 90 days, and block durable-history claims when persistence is unavailable.

- [ ] **Step 4: Vérifier**

Run: `npm test -- src/storage && npm run check`  
Expected: PASS; failed restore leaves previous data intact.

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/storage
git commit -m "feat: persist PackClair data locally"
```

### Task 7: Assistant React complet et calculateur gratuit

**Files:**
- Modify: `apps/web/src/components/app/PackClairApp.tsx`
- Create: `apps/web/src/components/app/app-reducer.ts`
- Create: `apps/web/src/components/app/steps/ContextStep.tsx`
- Create: `apps/web/src/components/app/steps/ImportStep.tsx`
- Create: `apps/web/src/components/app/steps/ProfileStep.tsx`
- Create: `apps/web/src/components/app/steps/ShipmentStep.tsx`
- Create: `apps/web/src/components/app/steps/CalculationStep.tsx`
- Create: `apps/web/src/components/app/steps/OperatorConfirmationStep.tsx`
- Create: `apps/web/src/components/app/steps/ExportStep.tsx`
- Create: `apps/web/src/components/app/DataSafetyPanel.tsx`
- Create: `apps/web/src/components/calculator/FreeCalculator.tsx`
- Create: `apps/web/src/app/ports/domain-worker.ts`
- Create: `apps/web/src/app/ports/entitlement-gateway.ts`
- Create: `apps/web/src/app/ports/reference-status-gateway.ts`
- Create: `apps/web/src/app/ports/download-gateway.ts`
- Create: `apps/web/src/workers/domain.worker.ts`
- Test: `apps/web/src/components/app/PackClairApp.flow.test.tsx`

**Interfaces:**
- Consumes: injected `DomainWorkerApi`, `LocalRepository`, `EntitlementGateway`, `ReferenceStatusGateway`, trusted clock and `DownloadGateway` ports.
- Produces: accessible seven-step wizard, free manual calculator, HTML audit report, safe summary CSV, backup/restore/erase controls and real downloads.

- [ ] **Step 1: Écrire le parcours utilisateur rouge**

With user-event and explicit port fakes: choose `HMM1`, 2026, April–June and one operator from a trusted `2026-07-12` response; import a fixture; inspect and map required columns; attest one parcel/order; create missing SKU and parcel profiles; calculate; enter operator-confirmed `26,500`; verify an unexplained mismatch blocks export; add a reason; then expect the XML download callback to receive BOM-prefixed bytes with a fresh signed entitlement/reference response. Also test stale, offline, `review_required`, entitlement-expired, 31 December and 15/16 May states.

- [ ] **Step 2: Vérifier l’échec**

Run: `npm test -- src/components/app/PackClairApp.flow.test.tsx`  
Expected: FAIL, wizard steps absent.

- [ ] **Step 3: Implémenter le reducer et les écrans**

```ts
type AppStep = 'context'|'import'|'profiles'|'shipments'|'calculation'|'operator'|'export';
type AppState = Readonly<{ step: AppStep; reportContext?: ReportContext; batchId?: string; snapshotId?: string; blockingErrors: readonly string[] }>;
type EntitlementClaimsV1 = Readonly<{
  plan: 'pro'; referenceSetVersion: string; xmlExportFreshUntil: string; expiresAt: string;
  graceUntil: string; entitlementVersion: number; signature: string;
}>;
type EntitlementResolution =
  | { status: 'free' }
  | { status: 'active'|'grace'; claims: EntitlementClaimsV1 }
  | { status: 'expired'|'invalid'|'offline_unavailable'; reason: string };
interface EntitlementGateway {
  resolve(signal?: AbortSignal): Promise<EntitlementResolution>;
  refresh(signal?: AbortSignal): Promise<EntitlementResolution>;
  clear(): Promise<void>;
}
type ReferenceStatus = Readonly<{
  status: 'fresh'|'stale'|'review_required'|'offline_unavailable';
  trustedTodayBerlin?: string; referenceSetVersion?: string; checkedAt?: string;
}>;
```

Implement a `FreeEntitlementGateway`; no backend belongs in this task. `PackClairApp` receives all ports through props/context so jsdom never requires a real Worker or network. `DomainWorkerApi` exposes `previewCsv`, `normalizeBatch`, `calculatePackaging`, `reconcileConfirmedTotals` and `serializeLucidXml`; the production adapter uses Comlink and the worker must not import `fetch`, XHR, WebSocket or beacon APIs.

Each step has one primary action, a visible back action, a progress label, focus placement on the new heading, inline errors linked with `aria-describedby`, `aria-live` announcements and no color-only status. The import screen previews ten rows, lists retained columns, requires confirmation for uncertain encoding and persists mono-parcel/status decisions. `DataSafetyPanel` shows persistence/quota, backup/restore/erase and required reminders. The free calculator accepts manual masses and displays suggestions but never generates a user XML.

- [ ] **Step 4: Vérifier le flux et l’accessibilité unitaire**

Run: `npm test -- src/components src/domain src/storage`  
Expected: PASS; no act warning.

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/components apps/web/src/app apps/web/src/workers
git commit -m "feat: build the local reporting wizard"
```

### Task 8: Pages publiques, PWA, confidentialité et vérification navigateur

**Files:**
- Modify: `apps/web/astro.config.mjs`
- Modify: `apps/web/playwright.config.ts`
- Modify: `apps/web/src/pages/index.astro`
- Create: `apps/web/src/layouts/GuideLayout.astro`
- Create: `apps/web/src/content.config.ts`
- Create: `apps/web/src/content/guides/calculateur-emballages-lucid.md`
- Create: `apps/web/src/content/guides/lucid-allemagne-vendeur-francais.md`
- Create: `apps/web/src/content/guides/declaration-emballages-allemagne-etsy.md`
- Create: `apps/web/src/content/guides/creer-xml-lucid.md`
- Create: `apps/web/src/pages/calculateur/index.astro`
- Create: `apps/web/src/pages/guides/[id].astro`
- Create: `apps/web/public/manifest.webmanifest`
- Create: `apps/web/public/icons/icon.svg`
- Create: `apps/web/public/icons/icon-192.png`
- Create: `apps/web/public/icons/icon-512.png`
- Create: `apps/web/public/icons/icon-maskable-512.png`
- Create: `apps/web/public/_headers`
- Test: `apps/web/tests/e2e/core-flow.spec.ts`
- Test: `apps/web/tests/e2e/privacy-offline.spec.ts`
- Test: `apps/web/tests/e2e/accessibility.spec.ts`

**Interfaces:**
- Consumes: free calculator and app route.
- Produces: prerendered French acquisition pages, installable offline app, browser verification evidence.

- [ ] **Step 1: Écrire les tests E2E rouges**

Test that all five public URLs return unique H1/title/description; `/app` completes the fixture flow; axe reports zero serious/critical violation; keyboard focus and zoom 200% remain usable; and desktop/mobile screenshots render without overflow. Build a closed request allowlist after the app shell loads, assert import/calculation/reconciliation/XML add zero network requests, and reject any URL/body/header containing plaintext, URL/base64 encoded, hashed or derived fixture order/SKU values. After one online load, an offline context reloads `/app`, opens a stored snapshot and permits XML only while cached signed entitlement and reference freshness are still valid. Assert downloaded XML bytes, summary CSV, audit HTML and ASCII names.

- [ ] **Step 2: Vérifier l’échec**

Run: `npm run test:e2e`  
Expected: FAIL for missing pages and service worker.

- [ ] **Step 3: Implémenter les pages et la PWA**

Configure `@vite-pwa/astro` with `registerType: 'autoUpdate'`, `navigateFallback: '/app/'`, precache of the shell and worker chunk, cache-first immutable static assets, network-first HTML, and a strict exclusion for `/api/**`. Expose a visible update/reload state and test a cache/schema migration. The French manifest references 192, 512 and maskable 512 PNG icons and passes an installability assertion.

Use `public/_headers` for Cloudflare headers: CSP compatible with the built output and without `unsafe-eval`, `object-src 'none'`, `base-uri 'none'`, `frame-ancestors 'none'`; plus `Referrer-Policy: strict-origin-when-cross-origin`, restrictive `Permissions-Policy`, and `X-Content-Type-Options: nosniff`. Configure Playwright `webServer.command` as `npm run build && npm run preview -- --host 127.0.0.1`, `reuseExistingServer: false`, and projects for Chromium, Firefox and WebKit. Each page cites the official ZSVR/Commission URL from the spec, shows “Dernière revue : 12 juillet 2026”, links to `/calculateur/`, and avoids any claim of certification.

- [ ] **Step 4: Vérification complète**

Run: `npm ci && npm test && npm run build && npx playwright install chromium firefox webkit && npm run test:e2e && npm audit --audit-level=high`  
Expected: unit/property/XSD tests PASS; Astro build PASS; Chromium, Firefox, WebKit, offline, privacy, visual and axe tests PASS; no high/critical audit finding.

- [ ] **Step 5: Commit**

```bash
git add apps/web/astro.config.mjs apps/web/src apps/web/public apps/web/tests/e2e
git commit -m "feat: ship PackClair beta PWA"
```

## Plan self-review checklist

- Spec coverage: core calculation, multi-parcel identity, confirmation operator, report windows, reference freshness, XML/XSD, local persistence, backup, minimization, free funnel, offline and accessibility are each assigned above.
- Deferred by explicit boundary: Stripe/Worker/D1/Resend, legal identity and production deployment belong to the commerce and launch plans.
- Type check command after every task: `npm run check`.
