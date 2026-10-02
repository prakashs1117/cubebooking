/**
 * FAQ Types
 * Types for Frequently Asked Questions
 */

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  tags: string[];
  order: number;
  icon?: string;
}

export interface FAQCategory {
  id: string;
  name: string;
  icon: string;
  order: number;
}

export interface FAQData {
  version: string;
  lastUpdated: string;
  categories: FAQCategory[];
  items: FAQItem[];
}

export interface FAQLanguageData {
  categories: FAQCategory[];
  items: FAQItem[];
}

export interface FAQDocument {
  version: string;
  lastUpdated: string;
  languages: {
    en: FAQLanguageData;
    fr: FAQLanguageData;
    ar: FAQLanguageData;
    [key: string]: FAQLanguageData;
  };
}

export interface FAQResponse {
  success: boolean;
  data: FAQDocument | null;
  error?: string;
  source: 'json' | 'api' | 'cache';
  timestamp: string;
}

/**
 * API Response types for future API integration
 */
export interface ApiFAQItem {
  faq_id: string;
  question: string;
  answer: string;
  category_id: string;
  tags: string[];
  display_order: number;
  icon?: string;
}

export interface ApiFAQCategory {
  category_id: string;
  category_name: string;
  category_icon: string;
  display_order: number;
}

export interface ApiFAQResponse {
  success: boolean;
  data: {
    categories: ApiFAQCategory[];
    items: ApiFAQItem[];
  };
  message?: string;
  timestamp: string;
}
