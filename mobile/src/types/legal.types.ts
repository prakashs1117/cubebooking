/**
 * Legal Content Types
 * Types for Privacy Policy and Terms of Service content
 */

export interface LegalSection {
  id: string;
  order: number;
  title: string;
  content: string;
  icon?: string;
}

export interface LegalLanguageContent {
  title: string;
  lastUpdatedLabel: string;
  lastUpdatedDate: string;
  sections: LegalSection[];
}

export interface LegalDocument {
  version: string;
  lastUpdated: string;
  languages: {
    en: LegalLanguageContent;
    fr: LegalLanguageContent;
    ar: LegalLanguageContent;
    [key: string]: LegalLanguageContent;
  };
}

export type LegalDocumentType = 'privacy' | 'terms';

export interface LegalContentResponse {
  success: boolean;
  data: LegalDocument | null;
  error?: string;
  source: 'json' | 'api' | 'cache';
  timestamp: string;
}

/**
 * API Response types for future API integration
 */
export interface ApiLegalSection {
  section_id: string;
  section_order: number;
  section_title: string;
  section_content: string;
  section_icon?: string;
}

export interface ApiLegalDocument {
  document_type: 'privacy_policy' | 'terms_of_service';
  document_version: string;
  last_updated: string;
  language: string;
  title: string;
  last_updated_label: string;
  last_updated_date: string;
  sections: ApiLegalSection[];
}

export interface ApiLegalResponse {
  success: boolean;
  data: ApiLegalDocument[];
  message?: string;
  timestamp: string;
}
