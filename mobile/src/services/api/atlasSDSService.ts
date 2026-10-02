/**
 * Atlas SDS Service
 * Loads full Safety Data Sheet for a material number.
 * Endpoint: GET /v4/safetydata/{system}/{country}/{language}/{materialNumber}
 *
 * Mirrors Ionic SDSService.loadFullSDSDataByMaterialNumberBySystemCountryLanguage()
 * Tries primary system (NEX) then falls back to P24 if 404/error.
 */

import atlasClient from '@services/api/atlasClient';

// ─── SafetyDataSheet types (matching Ionic types.ts) ────────────────────────

export interface ArticleDetailHeader {
  articleName: string;
  articleNumber: string;
  logoCompany: string;
  reportVersion: string;
  revisionDate: string;
}

export interface ArticleSectionTwo {
  hazardPictograms: string[];
  hazardPictogramIcons: string[];
  signalWord: string[];
  hazardStatements: string[];
  hazardStatementsSec?: string[];
  otherHazards?: string[];
  precautionaryStatements: {
    prevention: string[];
    response: string[];
    storage: string[];
    disposal: string[];
  };
  emergencySummary: string[];
  hazardClassification: string[];
}

export interface ArticleSectionOne {
  cas: string;
  articleName: string;
  articleNumber: string;
  productName?: string;
  synonyms?: string[];
  identifiedUses?: string[];
  manufacturerName?: string;
  manufacturerAddress?: string;
  emergencyPhone?: string;
  productCode?: string;
  [key: string]: any;
}

export interface ArticleSectionThree {
  formula?: string;
  molar?: string;
  compositions?: Array<{
    componentName?: string;
    casNumber?: string;
    percentage?: string;
    einecs?: string;
    [key: string]: any;
  }>;
  [key: string]: any;
}

export interface ArticleSectionFour {
  generalInstructions?: string[];
  eyeContact?: string[];
  skinContact?: string[];
  inhalation?: string[];
  ingestion?: string[];
  protectionForFirstAiders?: string[];
  symptomsEffects?: string[];
  immediateAttentionRequired?: string;
}

export interface ArticleSectionFive {
  suitableExtinguishingMedia?: string[];
  unsuitableExtinguishingMedia?: string[];
  hazardousCombustionProducts?: string[];
  specialEquipment?: string[];
  furtherInformation?: string[];
}

export interface ArticleSectionSix {
  personalPrecautions?: string[];
  environmentalPrecautions?: string[];
  methodsCleanup?: string[];
  preventiveMeasures?: string[];
}

export interface ArticleSectionSeven {
  handlingPrecautions?: string[];
  storageConditions?: string[];
  incompatibleMaterials?: string[];
  storageTemperature?: string;
  storageClass?: string;
}

export interface ArticleSectionEight {
  componentExposureLimits?: Array<{
    component?: string;
    twaPpm?: string;
    twaMgM3?: string;
    stelPpm?: string;
    stelMgM3?: string;
    [key: string]: any;
  }>;
  engineeringMeasures?: string[];
  respiratoryProtection?: string[];
  handProtection?: string[];
  eyeFaceProtection?: string[];
  skinBodyProtection?: string[];
  hygieneRecommendations?: string[];
}

export interface ArticleSectionNine {
  form?: string;
  color?: string;
  odor?: string;
  ph?: string;
  meltingPoint?: string;
  boilingPoint?: string;
  flashPoint?: string;
  evaporationRate?: string;
  flammability?: string;
  upperExplosiveLimit?: string;
  lowerExplosiveLimit?: string;
  vapourPressure?: string;
  vapourDensity?: string;
  relativeDensity?: string;
  waterSolubility?: string;
  autoIgnitionTemperature?: string;
  decompositionTemperature?: string;
  viscosity?: string;
  logPow?: string;
  otherInformation?: string[];
}

export interface ArticleSectionTen {
  reactivity?: string[];
  chemicalStability?: string[];
  hazardousPolymerization?: string;
  conditionsToAvoid?: string[];
  incompatibleMaterials?: string[];
  hazardousDecompositionProducts?: string[];
}

export interface ArticleSectionEleven {
  routesOfExposure?: string[];
  acuteToxicity?: Array<{
    routeOfAdministration?: string;
    species?: string;
    value?: string;
    unit?: string;
    [key: string]: any;
  }>;
  skinCorrosionIrritation?: string[];
  seriousEyeDamage?: string[];
  respiratorySensitization?: string[];
  skinSensitization?: string[];
  germCellMutagenicity?: string[];
  carcinogenicity?: string[];
  reproductiveToxicity?: string[];
  singleExposure?: string[];
  repeatedExposure?: string[];
  aspirationHazard?: string[];
  additionalInformation?: string[];
}

export interface ArticleSectionTwelve {
  toxicity?: Array<{
    organism?: string;
    value?: string;
    unit?: string;
    duration?: string;
    [key: string]: any;
  }>;
  persistenceDegradability?: string[];
  bioaccumulativePotential?: string[];
  mobilityInSoil?: string[];
  otherAdverseEffects?: string[];
}

export interface ArticleSectionThirteen {
  wasteDisposalMethods?: string[];
  contamPackageDisposal?: string[];
  additionalInformation?: string[];
}

export interface ArticleSectionFifteen {
  safetyHealthEnvironmentalRegulations?: string[];
  chemicalSafetyAssessment?: string;
  nationalRegulations?: string[];
  euRegulations?: string[];
}

export interface SafetyDataSheet {
  id: string;
  header: ArticleDetailHeader;
  section_one: ArticleSectionOne;
  section_two: ArticleSectionTwo;
  section_three: ArticleSectionThree;
  section_four: ArticleSectionFour;
  section_five: ArticleSectionFive;
  section_six: ArticleSectionSix;
  section_seven: ArticleSectionSeven;
  section_eight: ArticleSectionEight;
  section_nine: ArticleSectionNine;
  section_ten: ArticleSectionTen;
  section_eleven: ArticleSectionEleven;
  section_twelve: ArticleSectionTwelve;
  section_thirteen: ArticleSectionThirteen;
  section_fourteen: any;
  section_fifteen: ArticleSectionFifteen;
  section_sixteen: any;
}

// Atlas uses these two systems; NEX is the preferred default (matches Ionic defaultSystemsIndex=1)
const SYSTEMS = ['NEX', 'P24'] as const;
const DEFAULT_VALIDITY_AREA = 'EU';
const DEFAULT_LANGUAGE = 'EN';

async function fetchSDS(
  materialNumber: string,
  system: string,
  country: string,
  language: string,
): Promise<SafetyDataSheet> {
  // Ionic path: {baseUrl}/v4/safetydata/{system}/PUBLIC/{country}/{language}/{materialNumber}
  const path = `/v4/safetydata/${system}/PUBLIC/${country}/${language}/${materialNumber}`;
  const response = await atlasClient.get<SafetyDataSheet>(path);
  return response.data;
}

export async function loadSDS(
  materialNumber: string,
  system: string,
  country = DEFAULT_VALIDITY_AREA,
  language = DEFAULT_LANGUAGE,
): Promise<SafetyDataSheet> {
  try {
    return await fetchSDS(materialNumber, system, country, language);
  } catch {
    // Fallback: try the other system
    const fallback = SYSTEMS.find(s => s !== system) ?? SYSTEMS[0];
    return fetchSDS(materialNumber, fallback, country, language);
  }
}
