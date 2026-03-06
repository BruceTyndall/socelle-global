import { supabase } from './supabase';

export interface ParsedService {
  name: string;
  duration?: number;
  price?: number;
  category?: string;
  rawText: string;
}

export interface ProtocolMatch {
  service: ParsedService;
  protocol: {
    id: string;
    name: string;
    duration: number;
    category: string;
    description: string | null;
  };
  matchScore: number;
  matchReasons: string[];
}

export interface GapOpportunity {
  protocol: {
    id: string;
    name: string;
    duration: number;
    category: string;
    description: string | null;
  };
  reason: string;
  estimatedRevenue?: number;
}

export interface RetailAttach {
  service: ParsedService;
  products: Array<{
    id: string;
    name: string;
    category: string;
    size: string | null;
    usage: string | null;
  }>;
}

export interface MenuValidationResult {
  valid: boolean;
  error?: string;
  quality: 'ok' | 'low' | 'invalid';
}

/**
 * validateMenuInput — Synchronous pre-check before running analysis.
 * Hard-blocks if text is too short or too few services are detected.
 * Returns quality='low' for borderline menus that may yield limited results.
 */
export function validateMenuInput(text: string): MenuValidationResult {
  const trimmed = text.trim();

  if (trimmed.length <= 100) {
    return {
      valid: false,
      error: 'Your menu text is too short. Please paste your full menu.',
      quality: 'invalid',
    };
  }

  // Use parseMenuText (hoisted — declared below) to count services
  const services = parseMenuText(trimmed);

  if (services.length <= 3) {
    return {
      valid: false,
      error: "We couldn't detect enough services. Try adding more service names.",
      quality: 'invalid',
    };
  }

  // Borderline: passes hard checks but may produce limited results
  const isLowQuality = services.length <= 6 || trimmed.length <= 300;

  return {
    valid: true,
    quality: isLowQuality ? 'low' : 'ok',
  };
}

export async function runMenuAnalysis(
  planId: string,
  brandId: string,
  menuText: string
): Promise<void> {
  const parsedServices = parseMenuText(menuText);

  const [protocols, products, assets] = await Promise.all([
    fetchBrandProtocols(brandId),
    fetchBrandProducts(brandId),
    fetchBrandAssets(brandId),
  ]);

  const protocolMatches = matchServicesToProtocols(parsedServices, protocols);
  const gaps = identifyGaps(parsedServices, protocols, protocolMatches);
  const retailAttach = generateRetailAttach(parsedServices, products, protocolMatches);
  const activationAssets = organizeAssets(assets);

  const overview = {
    totalServices: parsedServices.length,
    servicesWithMatches: protocolMatches.length,
    servicesWithoutMatches: parsedServices.length - protocolMatches.length,
    gapOpportunities: gaps.length,
    services: parsedServices,
    brandFitScore: calculateFitScore(parsedServices, protocolMatches),
  };

  await saveOutputs(planId, {
    overview,
    protocol_matches: protocolMatches,
    gaps,
    retail_attach: retailAttach,
    activation_assets: activationAssets,
  });

  const { error: statusError } = await supabase
    .from('plans')
    .update({ status: 'ready', updated_at: new Date().toISOString() })
    .eq('id', planId);

  if (statusError) {
    throw new Error(`Failed to mark plan ready: ${statusError.message}`);
  }
}

function parseMenuText(text: string): ParsedService[] {
  const services: ParsedService[] = [];
  const lines = text.split('\n').filter((line) => line.trim().length > 0);

  const servicePatterns = [
    /^(.+?)\s*[-–—]\s*(\d+)\s*min(?:ute)?s?\s*[-–—]?\s*\$?(\d+(?:\.\d{2})?)?/i,
    /^(.+?)\s*\$(\d+(?:\.\d{2})?)\s*[-–—]?\s*(\d+)?\s*min/i,
    /^(.+?)\s*\((\d+)\s*min(?:ute)?s?\)/i,
    /^(.+?)\s+(\d{2,3})\s*min/i,
  ];

  for (const line of lines) {
    let matched = false;

    for (const pattern of servicePatterns) {
      const match = line.match(pattern);
      if (match) {
        const service: ParsedService = {
          name: match[1].trim(),
          rawText: line,
        };

        if (match[2]) {
          const num = parseInt(match[2]);
          if (num > 10 && num < 500) {
            service.duration = num;
          } else if (match[3]) {
            service.price = parseFloat(match[2]);
            service.duration = parseInt(match[3]);
          }
        }

        if (match[3] && !service.price) {
          const num = parseFloat(match[3]);
          if (num > 10) {
            service.price = num;
          }
        }

        service.category = inferCategory(service.name);
        services.push(service);
        matched = true;
        break;
      }
    }

    if (!matched && line.length > 3 && line.length < 100) {
      services.push({
        name: line.trim(),
        rawText: line,
        category: inferCategory(line),
      });
    }
  }

  return services;
}

function inferCategory(serviceName: string): string {
  const lower = serviceName.toLowerCase();

  if (
    lower.includes('facial') ||
    lower.includes('face') ||
    lower.includes('skin') ||
    lower.includes('cleansing') ||
    lower.includes('peel')
  ) {
    return 'Facial';
  }

  if (
    lower.includes('body') ||
    lower.includes('wrap') ||
    lower.includes('scrub') ||
    lower.includes('exfoliation')
  ) {
    return 'Body';
  }

  if (lower.includes('massage') || lower.includes('therapeutic')) {
    return 'Massage';
  }

  if (lower.includes('hand') || lower.includes('foot') || lower.includes('manicure') || lower.includes('pedicure')) {
    return 'Hands & Feet';
  }

  if (lower.includes('eye') || lower.includes('lip')) {
    return 'Eye & Lip';
  }

  return 'Other';
}

async function fetchBrandProtocols(brandId: string) {
  const { data, error } = await supabase
    .from('canonical_protocols')
    .select('id, protocol_name, duration_minutes, service_category, protocol_description, completion_status')
    .eq('brand_id', brandId)
    .in('completion_status', ['steps_complete', 'fully_complete']);

  if (error) throw error;

  return (data || []).map((p) => ({
    id: p.id,
    name: p.protocol_name,
    duration: p.duration_minutes || 60,
    category: p.service_category || 'Other',
    description: p.protocol_description,
  }));
}

async function fetchBrandProducts(brandId: string) {
  const { data, error } = await supabase
    .from('pro_products')
    .select('id, product_name, category, product_size, usage_instructions')
    .eq('brand_id', brandId);

  if (error) throw error;

  return (data || []).map((p) => ({
    id: p.id,
    name: p.product_name,
    category: p.category || 'Other',
    size: p.product_size,
    usage: p.usage_instructions,
  }));
}

async function fetchBrandAssets(brandId: string) {
  const { data, error } = await supabase
    .from('brand_assets')
    .select('id, asset_name, asset_type, service_category, asset_url')
    .eq('brand_id', brandId);

  if (error) throw error;

  return data || [];
}

function matchServicesToProtocols(
  services: ParsedService[],
  protocols: any[]
): ProtocolMatch[] {
  const matches: ProtocolMatch[] = [];

  for (const service of services) {
    const serviceLower = service.name.toLowerCase();
    const serviceCategory = service.category;

    let bestMatch: any = null;
    let bestScore = 0;
    let matchReasons: string[] = [];

    for (const protocol of protocols) {
      let score = 0;
      const reasons: string[] = [];
      const protocolLower = protocol.name.toLowerCase();

      if (protocol.category === serviceCategory) {
        score += 30;
        reasons.push(`Category match: ${protocol.category}`);
      }

      const serviceWords = serviceLower.split(/\s+/);
      const protocolWords = protocolLower.split(/\s+/);

      let wordMatches = 0;
      for (const word of serviceWords) {
        if (
          word.length > 3 &&
          protocolWords.some((pw: string) => pw.includes(word) || word.includes(pw))
        ) {
          wordMatches++;
        }
      }

      if (wordMatches > 0) {
        score += wordMatches * 20;
        reasons.push(`${wordMatches} keyword match(es)`);
      }

      if (service.duration && protocol.duration) {
        const durationDiff = Math.abs(service.duration - protocol.duration);
        if (durationDiff <= 15) {
          score += 15;
          reasons.push(`Duration compatible (${protocol.duration} min)`);
        } else if (durationDiff <= 30) {
          score += 5;
        }
      }

      if (score > bestScore && score >= 30) {
        bestScore = score;
        bestMatch = protocol;
        matchReasons = reasons;
      }
    }

    if (bestMatch) {
      matches.push({
        service,
        protocol: bestMatch,
        matchScore: bestScore,
        matchReasons,
      });
    }
  }

  return matches;
}

function identifyGaps(
  services: ParsedService[],
  protocols: any[],
  matches: ProtocolMatch[]
): GapOpportunity[] {
  const matchedProtocolIds = new Set(matches.map((m) => m.protocol.id));
  const gaps: GapOpportunity[] = [];

  const serviceCategoriesOffered = new Set(services.map((s) => s.category));

  for (const protocol of protocols) {
    if (!matchedProtocolIds.has(protocol.id)) {
      let reason = '';

      if (!serviceCategoriesOffered.has(protocol.category)) {
        reason = `New service category: ${protocol.category}`;
      } else {
        reason = `Additional ${protocol.category} offering`;
      }

      gaps.push({
        protocol,
        reason,
        estimatedRevenue: estimateRevenue(protocol),
      });
    }
  }

  return gaps.slice(0, 10);
}

function estimateRevenue(protocol: any): number {
  const basePriceMap = {
    Facial: 120,
    Body: 140,
    Massage: 100,
    'Hands & Feet': 50,
    'Eye & Lip': 60,
    Other: 80,
  } as const;

  const basePrice =
    basePriceMap[protocol.category as keyof typeof basePriceMap] ?? 80;

  const durationMultiplier = (protocol.duration || 60) / 60;
  return Math.round(basePrice * durationMultiplier);
}

function generateRetailAttach(
  services: ParsedService[],
  products: any[],
  _matches: ProtocolMatch[]
): RetailAttach[] {
  const attachments: RetailAttach[] = [];

  for (const service of services) {
    const category = service.category || '';
    const relevantProducts = products.filter(
      (p) =>
        p.category === category ||
        p.name.toLowerCase().includes(category.toLowerCase()) ||
        (service.name.toLowerCase().includes('facial') && p.category === 'Facial')
    );

    if (relevantProducts.length > 0) {
      attachments.push({
        service,
        products: relevantProducts.slice(0, 3),
      });
    }
  }

  return attachments;
}

function organizeAssets(assets: any[]) {
  const organized: Record<string, any[]> = {
    'Education & Training': [],
    Merchandising: [],
    'Social & Marketing': [],
    'Print Collateral': [],
    Other: [],
  };

  for (const asset of assets) {
    const type = asset.asset_type || 'Other';

    if (type.toLowerCase().includes('training') || type.toLowerCase().includes('education')) {
      organized['Education & Training'].push(asset);
    } else if (type.toLowerCase().includes('merchandis')) {
      organized['Merchandising'].push(asset);
    } else if (type.toLowerCase().includes('social') || type.toLowerCase().includes('marketing')) {
      organized['Social & Marketing'].push(asset);
    } else if (type.toLowerCase().includes('print') || type.toLowerCase().includes('collateral')) {
      organized['Print Collateral'].push(asset);
    } else {
      organized['Other'].push(asset);
    }
  }

  return organized;
}

function calculateFitScore(services: ParsedService[], matches: ProtocolMatch[]): number {
  if (services.length === 0) return 0;
  const matchRate = matches.length / services.length;
  const avgMatchQuality = matches.length > 0
    ? matches.reduce((sum, m) => sum + m.matchScore, 0) / matches.length / 100
    : 0;
  return Math.round((matchRate * 0.6 + avgMatchQuality * 0.4) * 100);
}

async function saveOutputs(planId: string, outputs: Record<string, any>) {
  for (const [type, data] of Object.entries(outputs)) {
    const { error } = await supabase.from('business_plan_outputs').insert({
      plan_id: planId,
      output_type: type,
      output_data: data,
    });
    if (error) {
      throw new Error(`saveOutputs failed for type "${type}": ${error.message}`);
    }
  }
}
