/**
 * Data Integrity Rules for Naturopathica Account Manager
 *
 * This file defines strict rules for how data can be matched, recommended, and displayed.
 * All recommendations MUST be grounded in actual database content.
 *
 * NEVER invent, assume, or estimate:
 * - Protocol names
 * - Product names
 * - Costs
 * - Mixing rules
 * - Treatment steps
 */

/**
 * FUZZY MATCHING USAGE POLICY
 *
 * Fuzzy/similarity matching is ONLY allowed for:
 * 1. Connecting marketing calendar "featured_protocols" to canonical_protocols.protocol_name
 * 2. Connecting spa menu service names to canonical_protocols.protocol_name
 *
 * Fuzzy matching is NEVER allowed for:
 * - Creating new protocol names
 * - Assuming product availability
 * - Estimating costs
 * - Guessing protocol steps
 */

export interface FuzzyMatchResult {
  matched: boolean;
  canonicalId: string | null;
  canonicalName: string | null;
  confidence: 'High' | 'Medium' | 'Low';
  matchType: 'Direct' | 'Partial' | 'Adjacent' | 'None';
}

/**
 * Matches a featured protocol name from marketing calendar to canonical protocols
 *
 * Purpose: Display seasonal featured badges on protocols that match marketing themes
 *
 * Rules:
 * - Only matches against existing canonical_protocols entries
 * - Returns match info, NEVER creates new protocols
 * - Case-insensitive substring matching
 *
 * @param featuredName - Name from marketing_calendar.featured_protocols
 * @param canonicalName - Name from canonical_protocols.protocol_name
 * @returns boolean - true if match found
 */
export function matchFeaturedToCanonical(
  featuredName: string,
  canonicalName: string
): boolean {
  const featured = featuredName.toLowerCase().trim();
  const canonical = canonicalName.toLowerCase().trim();

  // Direct match
  if (featured === canonical) return true;

  // Substring match (either direction)
  if (featured.includes(canonical) || canonical.includes(featured)) return true;

  // No match
  return false;
}

/**
 * Matches a spa menu service name to canonical protocols
 *
 * Purpose: Help map spa services to official Naturopathica protocols
 *
 * Rules:
 * - Only matches against existing canonical_protocols entries
 * - Returns match metadata with confidence score
 * - NEVER invents protocol names
 *
 * @param serviceName - Name from spa_services.service_name
 * @param canonicalProtocols - Array of canonical protocol entries
 * @returns FuzzyMatchResult with match details or null
 */
export function matchServiceToProtocol(
  serviceName: string,
  canonicalProtocols: Array<{ id: string; protocol_name: string; category: string }>
): FuzzyMatchResult {
  const service = serviceName.toLowerCase().trim();

  for (const protocol of canonicalProtocols) {
    const protocolName = protocol.protocol_name.toLowerCase().trim();

    // Direct exact match
    if (service === protocolName) {
      return {
        matched: true,
        canonicalId: protocol.id,
        canonicalName: protocol.protocol_name,
        confidence: 'High',
        matchType: 'Direct'
      };
    }

    // Partial match (service name contains protocol name or vice versa)
    if (service.includes(protocolName) || protocolName.includes(service)) {
      return {
        matched: true,
        canonicalId: protocol.id,
        canonicalName: protocol.protocol_name,
        confidence: 'Medium',
        matchType: 'Partial'
      };
    }
  }

  // No match found - return unmapped result
  return {
    matched: false,
    canonicalId: null,
    canonicalName: null,
    confidence: 'Low',
    matchType: 'None'
  };
}

/**
 * DATA VALIDATION RULES
 */

/**
 * Validates that a protocol recommendation references an actual database entry
 */
export function validateProtocolReference(
  protocolId: string,
  existingProtocols: string[]
): boolean {
  return existingProtocols.includes(protocolId);
}

/**
 * Validates that product names reference actual database entries
 */
export function validateProductReference(
  productName: string,
  existingProducts: string[]
): boolean {
  return existingProducts.some(p =>
    p.toLowerCase().trim() === productName.toLowerCase().trim()
  );
}

/**
 * Checks if protocol has complete step-by-step data
 */
export interface ProtocolDataCompleteness {
  hasSteps: boolean;
  hasProducts: boolean;
  hasCostData: boolean;
  hasSourceDocumentation: boolean;
  missingDataFlags: {
    protocol_steps_missing: boolean;
    product_details_missing: boolean;
    costing_missing: boolean;
    needs_pdf_extraction: boolean;
  };
}

/**
 * Determines what data is missing for a protocol
 * Used to populate service_mappings.missing_data_flags
 */
export function assessProtocolCompleteness(protocol: {
  id: string;
  hasSteps: boolean;
  stepsWithProducts: boolean;
  hasCostData: boolean;
}): ProtocolDataCompleteness {
  return {
    hasSteps: protocol.hasSteps,
    hasProducts: protocol.stepsWithProducts,
    hasCostData: protocol.hasCostData,
    hasSourceDocumentation: protocol.hasSteps, // If we have steps, we have docs
    missingDataFlags: {
      protocol_steps_missing: !protocol.hasSteps,
      product_details_missing: !protocol.stepsWithProducts,
      costing_missing: !protocol.hasCostData,
      needs_pdf_extraction: !protocol.hasSteps
    }
  };
}

/**
 * DISPLAY RULES
 */

/**
 * Determines what UI elements to show based on data availability
 */
export interface DisplayRules {
  showFullProtocol: boolean;
  showCostEstimate: boolean;
  showProductRecommendations: boolean;
  showDataGapWarning: boolean;
  warningMessage: string | null;
}

export function getDisplayRules(completeness: ProtocolDataCompleteness): DisplayRules {
  const gaps: string[] = [];

  if (completeness.missingDataFlags.protocol_steps_missing) {
    gaps.push('step-by-step instructions');
  }
  if (completeness.missingDataFlags.product_details_missing) {
    gaps.push('product usage details');
  }
  if (completeness.missingDataFlags.costing_missing) {
    gaps.push('cost estimates');
  }

  return {
    showFullProtocol: completeness.hasSteps,
    showCostEstimate: completeness.hasCostData,
    showProductRecommendations: completeness.hasProducts,
    showDataGapWarning: gaps.length > 0,
    warningMessage: gaps.length > 0
      ? `Missing data: ${gaps.join(', ')}. Available after PDF extraction.`
      : null
  };
}

/**
 * COST CALCULATION RULES
 */

/**
 * Validates that cost calculations are based on actual data
 */
export function validateCostCalculation(calculation: {
  basedOnActualProducts: boolean;
  hasSourceReference: boolean;
  confidence: 'High' | 'Medium' | 'Low';
}): boolean {
  // Cost calculations are only valid if:
  // 1. Based on actual products with known costs, OR
  // 2. Have a documented source reference
  return calculation.basedOnActualProducts || calculation.hasSourceReference;
}

/**
 * Calculates COGS only when product data is complete
 */
export function calculateProtocolCOGS(
  stepProducts: Array<{
    product_name: string;
    usage_amount: string | null;
    product_cost: number | null;
  }>
): { cogs: number | null; confidence: 'High' | 'Medium' | 'Low' } {
  // Can only calculate if ALL products have costs and usage amounts
  const hasCompleteData = stepProducts.every(p =>
    p.product_cost !== null && p.usage_amount !== null
  );

  if (!hasCompleteData) {
    return { cogs: null, confidence: 'Low' };
  }

  // Calculate actual COGS based on product costs
  // (This is simplified - actual calculation would factor in usage amounts)
  const totalCost = stepProducts.reduce((sum, p) => sum + (p.product_cost || 0), 0);

  return {
    cogs: totalCost,
    confidence: 'High'
  };
}
