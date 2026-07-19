import { SYSTEM_OPERATORS } from './operators';
import { MATERIAL_CODES } from './materials';
import { REPORT_TYPES } from './report-types';

export const REFERENCE_SET_VERSION =
  'lucid-if-1.0+xml-guide-1.2+report-guide-2025-02+xsd-c6a3d5c5542e';

export const REFERENCE_SET_RETRIEVED_AT = '2026-07-12';

export const REFERENCE_SET_SOURCES: Readonly<Record<string, string>> = {
  XSD: 'https://www.verpackungsregister.org/fileadmin/LUCID/Hersteller_Datenmeldung_Schema.xsd',
  XML_GUIDE: 'https://www.verpackungsregister.org/en/registration/find-out-about-registrations/using-an-xml-interface-to-upload-your-data',
  REPORT_GUIDE: 'https://www.verpackungsregister.org/fileadmin/files/Erklaermaterialien/Guideline_data_reporting.pdf',
  XSD_SHA256: 'c6a3d5c5542e0c51a28e90f2da2181d2819419f0a521abeec9df6e89f60911c0'
};

export const REVIEW_REQUIRED_REASON =
  'Le guide XML 1.2 référence 15 opérateurs ; la page contact publique actuelle en liste moins. ' +
  'Les identifiants figés sont conservés pour les rapports historiques et ne sont pas retirés silencieusement.';

export const FROZEN_OPERATORS = SYSTEM_OPERATORS;
export const FROZEN_MATERIALS = MATERIAL_CODES;
export const FROZEN_REPORT_TYPES = REPORT_TYPES;
