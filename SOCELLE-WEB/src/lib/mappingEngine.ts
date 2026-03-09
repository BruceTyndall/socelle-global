import { supabase } from './supabase';
import { createScopedLogger } from './logger';
import { QUERY_CONFIG, DEFAULT_CATEGORY } from './platformConfig';
import { validateInput, validateOutput, blockedResult, type GuardrailResult } from './analysis/guardrails';
import { withCreditGate } from './analysis/creditGate';
import { fetchSignalsForServiceCategories, type SignalEnrichment } from './analysis/signalEnrichment';

// ══════════════════════════════════════════════════════════════════════════════
// Consolidated Mapping Engine
// Merges the former serviceMappingEngine.ts (scored-similarity mapping) with
// the primary mappingEngine.ts (keyword + semantic/pgvector mapping).
// ══════════════════════════════════════════════════════════════════════════════

const log = createScopedLogger('MappingEngine');

// ── Shared types ─────────────────────────────────────────────────────────────

export interface SpaService {
  service_name: string;
  service_category?: string;
  service_duration?: string;
  service_price?: number;
  service_description?: string;
}

export interface CanonicalProtocol {
  id: string;
  protocol_name: string;
  category: string;
  typical_duration: string | null;
  target_concerns: string[];
  contraindications: string[];
  completion_status: string;
}

export interface ServiceMapping {
  service_name: string;
  service_category: string | null;
  service_duration: string | null;
  service_price: number | null;
  service_description: string | null;
  canonical_protocol_id: string | null;
  match_type: 'Exact' | 'Partial' | 'Candidate' | 'No Match';
  confidence_score: number;
  mapping_notes: string;
  missing_data_flags: string[];
  name_similarity_score: number;
  duration_match_score: number;
  category_match_score: number;
  concern_match_score: number;
  is_seasonally_relevant: boolean;
  seasonal_rationale: string | null;
}

export interface MappingResult {
  serviceId: string;
  serviceName: string;
  category: string;
  solutionType: string;
  solutionReference: string;
  matchType: string;
  confidence: string;
  rationale: string;
  retailAttach: string[];
  cogsStatus: string;
  cogsAmount: number | null;
  pricingGuidance: string;
}

// ── Semantic similarity (pgvector) ───────────────────────────────────────────

interface SemanticMatch {
  id: string;
  protocol_name: string;
  category: string;
  target_concerns: string[];
  similarity: number;
}

/**
 * Get top-K semantically similar protocols for the given service text.
 * Falls back gracefully to [] if embeddings are not yet available.
 */
async function getSemanticProtocolMatches(
  serviceText: string,
  brandId?: string,
): Promise<SemanticMatch[]> {
  try {
    const { data: embeddingData, error: embeddingError } = await supabase.functions.invoke(
      'generate-embeddings',
      { body: { text: serviceText } },
    );

    if (embeddingError || !embeddingData?.embedding) {
      log.warn('Embedding generation failed — falling back to keyword-only', {
        error: embeddingError?.message,
      });
      return [];
    }

    const { data, error } = await supabase.rpc('match_protocols', {
      query_embedding: embeddingData.embedding,
      match_threshold: 0.65,
      match_count: 5,
      p_brand_id: brandId ?? null,
    });

    if (error) {
      log.warn('pgvector match_protocols failed', { error: error.message });
      return [];
    }

    return (data as SemanticMatch[]) ?? [];
  } catch (err) {
    log.warn('Semantic search error', { err });
    return [];
  }
}

// ── Scoring helpers ──────────────────────────────────────────────────────────

/** Map confidence string to numeric score (0-1) */
function confidenceToScore(confidence: string): number {
  switch (confidence) {
    case 'High':   return 1.0;
    case 'Medium': return 0.55;
    default:       return 0.15;
  }
}

/** Blend keyword and semantic scores: 60% keyword, 40% semantic */
function blendScores(keywordConfidence: string, semanticScore: number): string {
  const kw = confidenceToScore(keywordConfidence);
  const blended = kw * 0.6 + semanticScore * 0.4;
  if (blended >= 0.75) return 'High';
  if (blended >= 0.45) return 'Medium';
  return 'Low';
}

/** Jaccard + substring similarity between two strings (0-100) */
function calculateStringSimilarity(str1: string, str2: string): number {
  const s1 = str1.toLowerCase().trim();
  const s2 = str2.toLowerCase().trim();

  if (s1 === s2) return 100;

  const s1Words = s1.split(/\s+/);
  const s2Words = s2.split(/\s+/);

  const s1Set = new Set(s1Words);
  const s2Set = new Set(s2Words);

  const intersection = new Set([...s1Set].filter(x => s2Set.has(x)));
  const union = new Set([...s1Set, ...s2Set]);

  const jaccardSimilarity = (intersection.size / union.size) * 100;

  if (s1.includes(s2) || s2.includes(s1)) {
    return Math.max(jaccardSimilarity, 85);
  }

  return Math.round(jaccardSimilarity);
}

function parseDuration(durationStr: string | null | undefined): number | null {
  if (!durationStr) return null;

  const matches = durationStr.match(/(\d+)/);
  if (matches) {
    return parseInt(matches[1]);
  }
  return null;
}

function calculateDurationMatch(serviceDuration: string | null, protocolDuration: string | null): number {
  const serviceMinutes = parseDuration(serviceDuration);
  const protocolMinutes = parseDuration(protocolDuration);

  if (!serviceMinutes || !protocolMinutes) return 0;

  const difference = Math.abs(serviceMinutes - protocolMinutes);

  if (difference === 0) return 100;
  if (difference <= 5) return 90;
  if (difference <= 10) return 75;
  if (difference <= 15) return 50;
  if (difference <= 30) return 25;

  return 0;
}

/** Extract skin-concern keywords from free-form text (broader list for scored mapping) */
function extractConcernsFromText(text: string): string[] {
  const concernKeywords = [
    'acne', 'aging', 'anti-aging', 'wrinkle', 'fine lines',
    'hydration', 'dehydration', 'dryness', 'moisture',
    'sensitivity', 'sensitive', 'redness', 'rosacea',
    'brightening', 'pigmentation', 'dark spots', 'discoloration',
    'congestion', 'pores', 'oily', 'oil control',
    'detox', 'purifying', 'clarifying',
    'soothing', 'calming', 'relaxation',
    'firmness', 'lifting', 'tightening',
    'exfoliation', 'resurfacing', 'renewal',
  ];

  const lowerText = text.toLowerCase();
  const foundConcerns: string[] = [];

  for (const keyword of concernKeywords) {
    if (lowerText.includes(keyword)) {
      foundConcerns.push(keyword);
    }
  }

  return foundConcerns;
}

function calculateConcernMatch(
  serviceText: string,
  protocolConcerns: string[]
): number {
  const serviceConcerns = extractConcernsFromText(serviceText);

  if (serviceConcerns.length === 0 || protocolConcerns.length === 0) {
    return 0;
  }

  const matches = serviceConcerns.filter(sc =>
    protocolConcerns.some(pc =>
      pc.toLowerCase().includes(sc.toLowerCase()) ||
      sc.toLowerCase().includes(pc.toLowerCase())
    )
  );

  if (matches.length === 0) return 0;

  const matchRatio = matches.length / Math.max(serviceConcerns.length, protocolConcerns.length);
  return Math.round(matchRatio * 100);
}

async function checkSeasonalRelevance(
  protocolName: string
): Promise<{ isRelevant: boolean; rationale: string | null }> {
  const currentMonth = new Date().getMonth() + 1;
  const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1;
  const thirdMonth = nextMonth === 12 ? 1 : nextMonth + 1;

  const { data: marketingData } = await supabase
    .from('marketing_calendar')
    .select('month_name, theme, featured_protocols')
    .eq('year', 2026)
    .in('month', [currentMonth, nextMonth, thirdMonth]);

  if (!marketingData || marketingData.length === 0) {
    return { isRelevant: false, rationale: null };
  }

  for (const monthData of marketingData) {
    if (monthData.featured_protocols.some((fp: string) =>
      fp.toLowerCase().includes(protocolName.toLowerCase()) ||
      protocolName.toLowerCase().includes(fp.toLowerCase())
    )) {
      return {
        isRelevant: true,
        rationale: `Featured in ${monthData.month_name} marketing calendar (${monthData.theme})`
      };
    }
  }

  return { isRelevant: false, rationale: null };
}

// ── Scored-similarity mapping (from former serviceMappingEngine) ─────────────

/**
 * Map a single SpaService against completed canonical protocols using
 * weighted name/duration/category/concern scoring.
 */
export async function mapServiceToProtocol(
  service: SpaService,
  _spaType: 'medspa' | 'spa' | 'hybrid' = 'spa'
): Promise<ServiceMapping> {
  const { data: completedProtocols, error } = await supabase
    .from('canonical_protocols')
    .select('*')
    .in('completion_status', ['steps_complete', 'fully_complete']);

  if (error || !completedProtocols || completedProtocols.length === 0) {
    return {
      service_name: service.service_name,
      service_category: service.service_category || null,
      service_duration: service.service_duration || null,
      service_price: service.service_price || null,
      service_description: service.service_description || null,
      canonical_protocol_id: null,
      match_type: 'No Match',
      confidence_score: 0,
      mapping_notes: 'No completed canonical protocols available for mapping',
      missing_data_flags: ['no_canonical_data'],
      name_similarity_score: 0,
      duration_match_score: 0,
      category_match_score: 0,
      concern_match_score: 0,
      is_seasonally_relevant: false,
      seasonal_rationale: null
    };
  }

  let bestMatch: CanonicalProtocol | null = null;
  let bestScores = {
    name: 0,
    duration: 0,
    category: 0,
    concern: 0,
    total: 0
  };

  const serviceSearchText = `${service.service_name} ${service.service_description || ''}`;

  for (const protocol of completedProtocols) {
    const nameScore = calculateStringSimilarity(service.service_name, protocol.protocol_name);
    const durationScore = calculateDurationMatch(
      service.service_duration ?? null,
      protocol.typical_duration,
    );
    const categoryScore = 0;
    const concernScore = calculateConcernMatch(serviceSearchText, protocol.target_concerns);

    const weights = {
      name: 0.50,
      duration: 0.20,
      category: 0.20,
      concern: 0.10
    };

    const totalScore = (
      nameScore * weights.name +
      durationScore * weights.duration +
      categoryScore * weights.category +
      concernScore * weights.concern
    );

    if (totalScore > bestScores.total) {
      bestMatch = protocol;
      bestScores = {
        name: nameScore,
        duration: durationScore,
        category: categoryScore,
        concern: concernScore,
        total: Math.round(totalScore)
      };
    }
  }

  if (!bestMatch) {
    return {
      service_name: service.service_name,
      service_category: service.service_category || null,
      service_duration: service.service_duration || null,
      service_price: service.service_price || null,
      service_description: service.service_description || null,
      canonical_protocol_id: null,
      match_type: 'No Match',
      confidence_score: 0,
      mapping_notes: 'No suitable canonical protocol match found',
      missing_data_flags: [],
      name_similarity_score: 0,
      duration_match_score: 0,
      category_match_score: 0,
      concern_match_score: 0,
      is_seasonally_relevant: false,
      seasonal_rationale: null
    };
  }

  const missingDataFlags: string[] = [];
  if (bestMatch.completion_status === 'steps_complete') {
    missingDataFlags.push('protocol_not_fully_complete');
  }
  if (bestScores.duration < 50 && service.service_duration && bestMatch.typical_duration) {
    missingDataFlags.push('duration_mismatch');
  }
  if (bestScores.category < 50 && service.service_category) {
    missingDataFlags.push('category_mismatch');
  }

  let matchType: 'Exact' | 'Partial' | 'Candidate' | 'No Match';
  if (bestScores.total >= 90) {
    matchType = 'Exact';
  } else if (bestScores.total >= 70) {
    matchType = 'Partial';
  } else if (bestScores.total >= 40) {
    matchType = 'Candidate';
  } else {
    matchType = 'No Match';
  }

  const mappingNotesParts: string[] = [];
  mappingNotesParts.push(`Matched to "${bestMatch.protocol_name}"`);
  mappingNotesParts.push(`Name similarity: ${bestScores.name}%`);
  if (bestScores.duration > 0) {
    mappingNotesParts.push(`Duration alignment: ${bestScores.duration}%`);
  }
  if (bestScores.category > 0) {
    mappingNotesParts.push(`Category match: ${bestScores.category}%`);
  }
  if (bestScores.concern > 0) {
    mappingNotesParts.push(`Concern overlap: ${bestScores.concern}%`);
  }
  if (missingDataFlags.length > 0) {
    mappingNotesParts.push(`Flags: ${missingDataFlags.join(', ')}`);
  }

  const seasonalCheck = await checkSeasonalRelevance(bestMatch.protocol_name);
  if (seasonalCheck.isRelevant && bestScores.total >= 70) {
    bestScores.total = Math.min(100, bestScores.total + 5);
  }

  return {
    service_name: service.service_name,
    service_category: service.service_category || null,
    service_duration: service.service_duration || null,
    service_price: service.service_price || null,
    service_description: service.service_description || null,
    canonical_protocol_id: bestMatch.id,
    match_type: matchType,
    confidence_score: bestScores.total,
    mapping_notes: mappingNotesParts.join('. '),
    missing_data_flags: missingDataFlags,
    name_similarity_score: bestScores.name,
    duration_match_score: bestScores.duration,
    category_match_score: bestScores.category,
    concern_match_score: bestScores.concern,
    is_seasonally_relevant: seasonalCheck.isRelevant,
    seasonal_rationale: seasonalCheck.rationale
  };
}

/**
 * Analyze an entire spa menu: map each service, persist results, return summary.
 */
export async function analyzeSpaMenu(
  spaMenuId: string,
  services: SpaService[],
  spaType: 'medspa' | 'spa' | 'hybrid' = 'spa'
): Promise<{ mappings: ServiceMapping[]; summary: any; signalEnrichment: SignalEnrichment | null }> {
  const mappings: ServiceMapping[] = [];

  for (const service of services) {
    const mapping = await mapServiceToProtocol(service, spaType);
    mappings.push(mapping);

    await supabase.from('spa_service_mapping').insert({
      spa_menu_id: spaMenuId,
      service_name: mapping.service_name,
      service_category: mapping.service_category,
      service_duration: mapping.service_duration,
      service_price: mapping.service_price,
      service_description: mapping.service_description,
      canonical_protocol_id: mapping.canonical_protocol_id,
      match_type: mapping.match_type,
      confidence_score: mapping.confidence_score,
      mapping_notes: mapping.mapping_notes,
      missing_data_flags: mapping.missing_data_flags,
      name_similarity_score: mapping.name_similarity_score,
      duration_match_score: mapping.duration_match_score,
      category_match_score: mapping.category_match_score,
      concern_match_score: mapping.concern_match_score,
      is_seasonally_relevant: mapping.is_seasonally_relevant,
      seasonal_rationale: mapping.seasonal_rationale
    });
  }

  await supabase
    .from('spa_menus')
    .update({
      analysis_status: 'completed',
      last_analyzed_at: new Date().toISOString()
    })
    .eq('id', spaMenuId);

  // Live signal enrichment
  const serviceCategories = [...new Set(services.map((s) => s.service_category).filter(Boolean) as string[])];
  let signalEnrichment: SignalEnrichment | null = null;
  try {
    signalEnrichment = await fetchSignalsForServiceCategories(serviceCategories);
    log.info('Signals fetched for spa menu analysis', {
      signalCount: signalEnrichment.signalCount,
    });
  } catch {
    log.warn('Signal enrichment failed in analyzeSpaMenu');
  }

  const summary = {
    total_services: mappings.length,
    exact_matches: mappings.filter(m => m.match_type === 'Exact').length,
    partial_matches: mappings.filter(m => m.match_type === 'Partial').length,
    candidates: mappings.filter(m => m.match_type === 'Candidate').length,
    no_matches: mappings.filter(m => m.match_type === 'No Match').length,
    average_confidence: Math.round(
      mappings.reduce((sum, m) => sum + m.confidence_score, 0) / mappings.length
    ),
    seasonally_relevant: mappings.filter(m => m.is_seasonally_relevant).length
  };

  return { mappings, summary, signalEnrichment };
}

// ── Keyword + semantic mapping (primary engine) ──────────────────────────────

const CATEGORIES = [
  'FACIALS',
  'FACIAL ENHANCEMENTS / ADD-ONS',
  'ADVANCED / CORRECTIVE FACIALS',
  'MASSAGE THERAPY',
  'BODY SCRUBS / POLISHES',
  'BODY WRAPS / BODY TREATMENTS',
  'HAND & FOOT TREATMENTS',
  'HYDROTHERAPY / RITUALS',
  'ONCOLOGY-SAFE SERVICES',
  'SEASONAL / LIMITED SERVICES',
  'MED-SPA TREATMENTS',
];

const MEDSPA_KEYWORDS = [
  'chemical peel', 'peel', 'glycolic', 'salicylic', 'tca',
  'botox', 'dysport', 'filler', 'injectable', 'dermal filler',
  'microneedling', 'collagen induction', 'micro-needling',
  'laser', 'ipl', 'bbl', 'photofacial', 'laser resurfacing', 'rf', 'radiofrequency',
  'lip filler', 'lip enhancement', 'lip augmentation',
];

export async function performServiceMapping(menuId: string): Promise<MappingResult[]> {
  const { data: menu, error: menuError } = await supabase
    .from('spa_menus')
    .select('*')
    .eq('id', menuId)
    .maybeSingle();

  if (menuError || !menu) {
    throw new Error('Menu not found');
  }

  // Parallelize all reference data queries
  const [protocolsRes, proProductsRes, retailProductsRes, costsRes, medspaTreatmentsRes, medspaProductsRes] = await Promise.all([
    supabase.from('canonical_protocols').select('*'),
    supabase.from('pro_products').select('*'),
    supabase.from('retail_products').select('*'),
    supabase.from('treatment_costs').select('*'),
    supabase.from('medspa_treatments').select('*').limit(QUERY_CONFIG.MEDSPA_LIMIT),
    supabase.from('medspa_products').select('*').limit(QUERY_CONFIG.MEDSPA_LIMIT),
  ]);

  const protocols = protocolsRes.data;
  const proProducts = proProductsRes.data;
  const retailProducts = retailProductsRes.data;
  const costs = costsRes.data;
  const medspaTreatments = medspaTreatmentsRes.data ?? [];
  const medspaProducts = medspaProductsRes.data ?? [];

  if (protocolsRes.error) log.warn('Failed to load protocols', { error: protocolsRes.error.message });
  if (proProductsRes.error) log.warn('Failed to load pro products', { error: proProductsRes.error.message });
  if (retailProductsRes.error) log.warn('Failed to load retail products', { error: retailProductsRes.error.message });
  if (costsRes.error) log.warn('Failed to load treatment costs', { error: costsRes.error.message });

  const parsedServices = parseMenuData(menu.raw_menu_data || '');

  const results: MappingResult[] = [];

  for (const service of parsedServices) {
    const serviceData = {
      menu_id: menuId,
      service_name: service.name,
      category: service.category,
      duration: service.duration,
      price: service.price,
      description: service.description,
      keywords: service.keywords,
    };

    const { data: insertedService, error: serviceError } = await supabase
      .from('spa_services')
      .insert([serviceData])
      .select()
      .single();

    if (serviceError || !insertedService) {
      log.warn('Failed to insert service, skipping', { service: service.name, error: serviceError?.message });
      continue;
    }

    // ── Keyword mapping (existing) ──
    const mapping = findBestMapping(service, protocols || [], proProducts || [], medspaTreatments || []);

    // ── Semantic mapping (pgvector) — runs in parallel with retail/cogs ──
    const serviceText = `${service.name} ${service.description || ''} ${service.keywords.join(' ')}`;
    const semanticMatches = await getSemanticProtocolMatches(serviceText);

    // Blend: if semantic found a better match, upgrade confidence
    if (semanticMatches.length > 0 && mapping.solutionType === 'Protocol') {
      const topSemantic = semanticMatches[0];
      const blendedConfidence = blendScores(mapping.confidence, topSemantic.similarity);
      if (blendedConfidence !== mapping.confidence) {
        mapping.confidence = blendedConfidence;
        mapping.rationale += ` (semantic similarity: ${(topSemantic.similarity * 100).toFixed(0)}%)`;
      }
    } else if (semanticMatches.length > 0 && mapping.solutionType === 'Custom-Built') {
      // Semantic found a protocol that keyword matching missed
      const topSemantic = semanticMatches[0];
      if (topSemantic.similarity >= 0.75) {
        mapping.solutionType = 'Protocol';
        mapping.solutionReference = topSemantic.protocol_name;
        mapping.matchType = 'Semantic Match';
        mapping.confidence = blendScores('Low', topSemantic.similarity);
        mapping.rationale = `Semantic similarity match (${(topSemantic.similarity * 100).toFixed(0)}%) — no keyword overlap found`;
        mapping.customBuildDetails = null;
        mapping.pricingGuidance = 'Align with protocol positioning for this treatment category.';
      }
    }

    const retailAttach = findRetailAttach(mapping, retailProducts || [], medspaProducts || []);
    const cogs = calculateCOGS(mapping, costs || []);

    const mappingData = {
      service_id: insertedService.id,
      solution_type: mapping.solutionType,
      solution_reference: mapping.solutionReference,
      match_type: mapping.matchType,
      confidence: mapping.confidence,
      rationale: mapping.rationale,
      custom_build_details: mapping.customBuildDetails,
      retail_attach: retailAttach,
      cogs_status: cogs.status,
      cogs_amount: cogs.amount,
      pricing_guidance: mapping.pricingGuidance,
    };

    await supabase.from('service_mappings').insert([mappingData]);

    results.push({
      serviceId: insertedService.id,
      serviceName: service.name,
      category: service.category,
      solutionType: mapping.solutionType,
      solutionReference: mapping.solutionReference,
      matchType: mapping.matchType,
      confidence: mapping.confidence,
      rationale: mapping.rationale,
      retailAttach,
      cogsStatus: cogs.status,
      cogsAmount: cogs.amount,
      pricingGuidance: mapping.pricingGuidance,
    });
  }

  await supabase
    .from('spa_menus')
    .update({ parse_status: 'parsed' })
    .eq('id', menuId);

  return results;
}

function parseMenuData(rawData: string) {
  const services: Array<{
    name: string;
    category: string;
    duration: string | null;
    price: number | null;
    description: string | null;
    keywords: string[];
  }> = [];

  const lines = rawData.split('\n').filter(line => line.trim());
  let currentCategory = DEFAULT_CATEGORY;

  for (const line of lines) {
    const categoryMatch = CATEGORIES.find(cat =>
      line.toUpperCase().includes(cat)
    );

    if (categoryMatch) {
      currentCategory = categoryMatch;
      continue;
    }

    const durationMatch = line.match(/(\d+)\s*(min|minute|hr|hour)/i);
    const priceMatch = line.match(/\$(\d+(?:\.\d{2})?)/);

    const cleanedName = line
      .replace(/\$\d+(?:\.\d{2})?/g, '')
      .replace(/\d+\s*(min|minute|hr|hour)/gi, '')
      .trim();

    if (cleanedName.length > 3 && !CATEGORIES.some(cat => cleanedName.toUpperCase().includes(cat))) {
      const keywords = extractKeywords(cleanedName);

      const isMedSpa = MEDSPA_KEYWORDS.some(keyword =>
        cleanedName.toLowerCase().includes(keyword)
      );

      const finalCategory = isMedSpa ? 'MED-SPA TREATMENTS' : currentCategory;

      services.push({
        name: cleanedName,
        category: finalCategory,
        duration: durationMatch ? durationMatch[0] : null,
        price: priceMatch ? parseFloat(priceMatch[1]) : null,
        description: line,
        keywords,
      });
    }
  }

  return services;
}

function extractKeywords(text: string): string[] {
  const keywords: string[] = [];
  const concernKeywords = [
    'aging', 'anti-aging', 'wrinkle', 'hydration', 'hydrating', 'dehydration',
    'acne', 'blemish', 'sensitive', 'sensitivity', 'redness', 'calming',
    'brightening', 'dull', 'radiance', 'glow', 'detox', 'purifying',
    'firming', 'lifting', 'collagen', 'elasticity', 'exfoliation',
    'deep cleanse', 'pore', 'congestion',
  ];

  const lowerText = text.toLowerCase();
  for (const keyword of concernKeywords) {
    if (lowerText.includes(keyword)) {
      keywords.push(keyword);
    }
  }

  return keywords;
}

function findBestMapping(service: any, protocols: any[], proProducts: any[], medspaTreatments: any[]) {
  let bestMatch = {
    solutionType: 'Custom-Built',
    solutionReference: `Custom ${service.category} Treatment`,
    matchType: 'Adjacent Opportunity',
    confidence: 'Low',
    rationale: 'No direct protocol match found. Custom treatment recommended using PRO products.',
    customBuildDetails: null as any,
    pricingGuidance: 'Consider 15-25% premium over base service pricing',
  };

  if (service.category === 'MED-SPA TREATMENTS' && medspaTreatments.length > 0) {
    for (const medspaT of medspaTreatments) {
      const treatmentKeywords = medspaT.treatment_name.toLowerCase().split(/\s+/);
      const serviceNameLower = service.name.toLowerCase();

      const keywordMatch = treatmentKeywords.some((kw: string) =>
        kw.length > 3 && serviceNameLower.includes(kw)
      );

      if (keywordMatch) {
        const preProducts = medspaT.pre_treatment_products || [];
        const postProducts = medspaT.post_treatment_products || [];
        const retailExt = medspaT.retail_extension || [];

        bestMatch = {
          solutionType: 'Med-Spa Protocol',
          solutionReference: medspaT.treatment_name,
          matchType: 'Direct Fit',
          confidence: 'High',
          rationale: `${medspaT.why_popular} Pre-treatment: ${preProducts.join(', ')}. Post-treatment: ${postProducts.join(', ')}.`,
          customBuildDetails: {
            preProducts,
            postProducts,
            retailExtension: retailExt,
          },
          pricingGuidance: 'Med-spa premium pricing. Post-treatment retail attach critical for revenue optimization.',
        };
        break;
      }
    }

    if (bestMatch.solutionType !== 'Med-Spa Protocol') {
      bestMatch.rationale = 'Med-spa service detected but no exact treatment match. Consider pre/post care protocol using med-spa product line.';
      bestMatch.confidence = 'Medium';
    }

    return bestMatch;
  }

  for (const protocol of protocols) {
    const concernOverlap = service.keywords.filter((kw: string) =>
      protocol.target_concerns.some((concern: string) =>
        concern.toLowerCase().includes(kw) || kw.includes(concern.toLowerCase())
      )
    ).length;

    const categoryMatch = service.category === protocol.category;

    if (categoryMatch && concernOverlap >= 2) {
      bestMatch = {
        solutionType: 'Protocol',
        solutionReference: protocol.protocol_name,
        matchType: 'Direct Fit',
        confidence: 'High',
        rationale: `Strong match based on category and ${concernOverlap} overlapping concerns: ${service.keywords.join(', ')}`,
        customBuildDetails: null,
        pricingGuidance: 'Align with protocol positioning. Consider premium tier pricing for this proven treatment.',
      };
      break;
    } else if (concernOverlap >= 1) {
      bestMatch = {
        solutionType: 'Protocol',
        solutionReference: protocol.protocol_name,
        matchType: 'Partial Fit',
        confidence: 'Medium',
        rationale: `Partial match based on shared concerns: ${service.keywords.join(', ')}`,
        customBuildDetails: null,
        pricingGuidance: 'Position as specialized treatment with 10-20% premium',
      };
    }
  }

  if (bestMatch.solutionType === 'Custom-Built' && proProducts.length > 0) {
    const relevantProducts = proProducts.filter((product: any) =>
      service.keywords.some((kw: string) =>
        product.product_function.toLowerCase().includes(kw)
      )
    ).slice(0, 3);

    if (relevantProducts.length > 0) {
      bestMatch.customBuildDetails = {
        products: relevantProducts.map((p: any) => p.product_name),
        steps: ['Cleanse', 'Treatment Application', 'Massage/Technique', 'Final Product'],
      };
      bestMatch.rationale = `Custom treatment using ${relevantProducts.length} PRO products targeting: ${service.keywords.join(', ')}`;
      bestMatch.confidence = 'Medium';
    }
  }

  return bestMatch;
}

function findRetailAttach(mapping: any, retailProducts: any[], medspaProducts: any[]): string[] {
  if (mapping.solutionType === 'Med-Spa Protocol' && mapping.customBuildDetails?.retailExtension) {
    return mapping.customBuildDetails.retailExtension;
  }

  if (mapping.solutionType === 'Med-Spa Protocol' && medspaProducts.length > 0) {
    const postTreatmentProducts = medspaProducts.filter((p: any) =>
      p.medspa_application.includes('POST-TREATMENT') || p.medspa_application.includes('AT-HOME')
    ).filter((p: any) => p.priority === 'CRITICAL' || p.priority === 'HIGH');

    return postTreatmentProducts.slice(0, 2).map((p: any) => p.product_name);
  }

  if (retailProducts.length === 0) return [];

  const matchingProducts = retailProducts.filter((product: any) => {
    if (mapping.customBuildDetails?.products) {
      return mapping.customBuildDetails.products.some((proName: string) =>
        product.target_concerns.some((concern: string) =>
          proName.toLowerCase().includes(concern.toLowerCase())
        )
      );
    }
    return false;
  });

  return matchingProducts.slice(0, 2).map((p: any) => p.product_name);
}

function calculateCOGS(mapping: any, costs: any[]) {
  if (mapping.solutionType === 'Protocol') {
    const protocolCost = costs.find(
      (c: any) => c.item_type === 'protocol' && c.item_reference === mapping.solutionReference
    );

    if (protocolCost?.cost_per_unit) {
      return { status: 'Known', amount: protocolCost.cost_per_unit };
    }
  }

  if (mapping.customBuildDetails?.products) {
    let totalCost = 0;
    let hasAllCosts = true;

    for (const productName of mapping.customBuildDetails.products) {
      const productCost = costs.find(
        (c: any) => c.item_type === 'product' && c.item_reference === productName
      );

      if (productCost?.cost_per_unit && productCost?.typical_usage_amount) {
        totalCost += productCost.cost_per_unit * productCost.typical_usage_amount;
      } else {
        hasAllCosts = false;
      }
    }

    if (hasAllCosts && totalCost > 0) {
      return { status: 'Known', amount: totalCost };
    } else if (totalCost > 0) {
      return { status: 'Partial', amount: totalCost };
    }
  }

  return { status: 'Unknown', amount: null };
}

// ── Guarded Mapping ─────────────────────────────────────────────────────────

/**
 * Guarded service mapping — validates input, checks credits, runs mapping,
 * wraps output with guardrail metadata.
 */
export async function performGuardedServiceMapping(
  menuId: string,
  userId: string,
  inputText?: string,
): Promise<GuardrailResult<{ results: MappingResult[] }>> {
  // 1. Guardrail input check (use menu ID as context if no raw text)
  const textToCheck = inputText ?? menuId;
  const inputCheck = validateInput(textToCheck, 'mappingEngine');
  if (!inputCheck.valid) {
    return blockedResult('mappingEngine', inputCheck.blockReason ?? 'Invalid input.');
  }

  // 2. Credit gate + execution
  const results = await withCreditGate(userId, 'mappingEngine', async () => {
    return performServiceMapping(menuId);
  });

  // 3. Wrap output
  return validateOutput({ results }, 'mappingEngine', [
    'canonical_protocols',
    'spa_menus',
    'pro_products',
    'medspa_treatments',
    'market_signals',
  ]);
}

/**
 * Guarded spa menu analysis — validates input, checks credits, runs analysis,
 * wraps output with guardrail metadata.
 */
export async function analyzeGuardedSpaMenu(
  spaMenuId: string,
  services: SpaService[],
  userId: string,
  spaType: 'medspa' | 'spa' | 'hybrid' = 'spa',
): Promise<GuardrailResult<{ mappings: ServiceMapping[]; summary: Record<string, unknown>; signalEnrichment: SignalEnrichment | null }>> {
  // Build a representative text from services for guardrail check
  const inputText = services.map((s) => s.service_name).join(', ');
  const inputCheck = validateInput(inputText, 'mappingEngine');
  if (!inputCheck.valid) {
    return blockedResult('mappingEngine', inputCheck.blockReason ?? 'Invalid input.');
  }

  const result = await withCreditGate(userId, 'mappingEngine', async () => {
    return analyzeSpaMenu(spaMenuId, services, spaType);
  });

  return validateOutput(result, 'mappingEngine', [
    'canonical_protocols',
    'spa_service_mapping',
    'market_signals',
  ]);
}
