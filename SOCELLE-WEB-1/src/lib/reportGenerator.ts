import { supabase } from './supabase';

export interface GeneratedReports {
  mappingTable: string;
  gapSummary: string;
  executiveSummary: string;
  followUpEmail: string;
}

export interface ReportContext {
  repName?: string;
  repTitle?: string;
  repEmail?: string;
}

export async function generateReports(
  menuId: string,
  context: ReportContext = {}
): Promise<GeneratedReports> {
  // Use spa_service_mapping (the actual schema used by all analysis engines)
  const { data: mappings } = await supabase
    .from('spa_service_mapping')
    .select('*')
    .eq('spa_menu_id', menuId);

  // Derive the spa name from the menu upload or plan
  const { data: menuUpload } = await supabase
    .from('menu_uploads')
    .select('raw_text, plan_id')
    .eq('id', menuId)
    .maybeSingle();

  // Try to get the spa name from the linked plan
  let spaName = 'Your Spa';
  if (menuUpload?.plan_id) {
    const { data: plan } = await supabase
      .from('plans')
      .select('name')
      .eq('id', menuUpload.plan_id)
      .maybeSingle();
    if (plan?.name) spaName = plan.name;
  }

  if (!mappings) {
    throw new Error('Unable to load mapping data');
  }

  // Build a services array from mappings for report generation
  const services = (mappings || []).map((m: any) => ({
    id: m.id,
    service_name: m.service_name,
    category: m.service_category || m.inferred_category || 'General',
  }));

  const mappingTable = generateMappingTable(services, mappings);
  const gapSummary = generateGapSummary(services, mappings);
  const executiveSummary = generateExecutiveSummary(spaName, services, mappings);
  const followUpEmail = generateFollowUpEmail(spaName, services, mappings, context);

  return {
    mappingTable,
    gapSummary,
    executiveSummary,
    followUpEmail,
  };
}

function generateMappingTable(_services: any[], mappings: any[]): string {
  const header = [
    'Spa Service',
    'Category',
    'Naturopathica Protocol',
    'Match Type',
    'Match Score',
    'Confidence',
    'Rationale',
  ];

  const rows = mappings.map((mapping) => {
    if (!mapping.service_name) return null;

    const matchScore = mapping.match_score != null
      ? `${Math.round(mapping.match_score)}%`
      : '—';

    return [
      mapping.service_name || '—',
      mapping.service_category || mapping.inferred_category || '—',
      mapping.protocol_name || '—',
      mapping.match_type || '—',
      matchScore,
      mapping.match_confidence || mapping.confidence || '—',
      mapping.match_rationale || mapping.rationale || '—',
    ];
  }).filter(Boolean);

  const colWidths = header.map((_, i) =>
    Math.max(
      header[i].length,
      ...rows.map(row => (row as string[])[i]?.length || 0)
    )
  );

  const formatRow = (row: string[]) =>
    row.map((cell, i) => cell.padEnd(colWidths[i])).join(' | ');

  const separator = colWidths.map(w => '-'.repeat(w)).join('-+-');

  return [
    formatRow(header),
    separator,
    ...rows.map(row => formatRow(row as string[])),
  ].join('\n');
}

function generateGapSummary(services: any[], mappings: any[]): string {
  const categories = new Set(services.map(s => s.category?.toUpperCase()).filter(Boolean));
  const allCategories = [
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
  ];

  const missingCategories = allCategories.filter(cat => !categories.has(cat));
  const lowConfidenceMappings = mappings.filter(
    m => (m.match_confidence || m.confidence || '').toLowerCase() === 'low'
  );

  let summary = 'GAP & EXPANSION SUMMARY\n';
  summary += '='.repeat(60) + '\n\n';

  summary += 'IDENTIFIED GAPS:\n\n';

  if (missingCategories.length > 0) {
    summary += `1. Missing Service Categories (${missingCategories.length}):\n`;
    missingCategories.forEach((cat, i) => {
      summary += `   ${i + 1}. ${cat}\n`;
      summary += `      Why it matters: Expands menu diversity and revenue streams\n`;
      summary += `      Impact tier: Medium to High Revenue\n\n`;
    });
  }

  if (lowConfidenceMappings.length > 0) {
    summary += `\n2. Services Requiring Custom Development (${lowConfidenceMappings.length}):\n`;
    lowConfidenceMappings.slice(0, 5).forEach((mapping, i) => {
      summary += `   ${i + 1}. ${mapping.service_name || 'Unknown'}\n`;
      summary += `      Gap: ${mapping.match_rationale || mapping.rationale || 'No direct protocol match'}\n`;
      summary += `      Recommended solution: ${mapping.protocol_name || 'Custom PRO product treatment'}\n`;
      summary += `      Impact tier: Strategic\n\n`;
    });
  }

  summary += '\nRECOMMENDED EXPANSIONS:\n\n';
  summary += '1. Advanced Treatment Protocols\n';
  summary += '   Opportunity: Introduce results-driven protocols for premium positioning\n';
  summary += '   Commercial impact: 20-30% higher ticket pricing\n\n';

  summary += '2. Retail Attach Program\n';
  summary += '   Opportunity: Systematic retail recommendations for every service\n';
  summary += '   Commercial impact: 15-25% incremental revenue per treatment\n\n';

  summary += '3. Seasonal Service Rotation\n';
  summary += '   Opportunity: Limited-time offerings drive urgency and trial\n';
  summary += '   Commercial impact: Menu freshness and media-worthy launches\n';

  return summary;
}

function generateExecutiveSummary(spaName: string, services: any[], mappings: any[]): string {
  const highConfidence = mappings.filter(m =>
    (m.match_confidence || m.confidence || '').toLowerCase() === 'high'
  ).length;
  const mediumConfidence = mappings.filter(m =>
    (m.match_confidence || m.confidence || '').toLowerCase() === 'medium'
  ).length;
  const lowConfidence = mappings.filter(m =>
    (m.match_confidence || m.confidence || '').toLowerCase() === 'low'
  ).length;
  const protocolMappings = mappings.filter(m => m.match_type === 'Exact' || m.match_type === 'Partial').length;
  const customMappings = mappings.filter(m => m.match_type === 'Candidate' || m.match_type === 'No Match').length;

  const totalRetailOpps = protocolMappings; // Every matched protocol has retail attach potential

  let summary = `EXECUTIVE PROSPECT SUMMARY: ${spaName}\n`;
  summary += '='.repeat(60) + '\n\n';

  summary += `• Analyzed ${services.length} services across ${new Set(services.map(s => s.category)).size} categories\n\n`;

  summary += `• ${highConfidence} services have Direct Protocol Fits, ${mediumConfidence} have Partial Fits, and ${lowConfidence} require Custom Development\n\n`;

  summary += `• ${protocolMappings} services can be immediately addressed with existing Naturopathica protocols\n\n`;

  summary += `• ${customMappings} services present opportunities for custom-built treatments using PRO product library\n\n`;

  summary += `• ${totalRetailOpps} services have clear retail attach recommendations, creating systematic home-care revenue\n\n`;

  summary += `• Menu positioning opportunities identified in ${Math.ceil(services.length * 0.3)} services for premium pricing strategy\n\n`;

  summary += `• Key differentiators: Clean formulations, results-driven protocols, and spa-to-home continuity strengthen brand partnership value\n\n`;

  summary += `• Next step: Protocol review session and discovery box to demonstrate product quality and treatment outcomes\n`;

  return summary;
}

function generateFollowUpEmail(
  spaName: string,
  services: any[],
  mappings: any[],
  context: ReportContext = {}
): string {
  const highConfidenceMappings = mappings.filter(m =>
    (m.match_confidence || m.confidence || '').toLowerCase() === 'high'
  );
  const customOpportunities = mappings.filter(m =>
    m.match_type === 'Candidate' || m.match_type === 'No Match'
  );

  const repName = context.repName || 'Your Naturopathica Account Manager';
  const repTitle = context.repTitle || 'Naturopathica Account Manager';
  const repEmail = context.repEmail ? `\n${context.repEmail}` : '';

  let email = `Subject: Naturopathica Solutions for ${spaName} - Service Mapping Complete\n\n`;
  email += `Hi,\n\n`;

  email += `I've completed a full analysis of your ${services.length}-service menu. Here's what we found:\n\n`;

  if (highConfidenceMappings.length > 0) {
    email += `${highConfidenceMappings.length} services have direct protocol matches ready to implement immediately.\n\n`;
  }

  if (customOpportunities.length > 0) {
    email += `${customOpportunities.length} services present opportunities for custom-built treatments using our PRO product line.\n\n`;
  }

  email += `Key opportunities for ${spaName}:\n`;
  email += `- Elevate results-driven positioning with proven Naturopathica protocols\n`;
  email += `- Create systematic retail attach for every treatment\n`;
  email += `- Differentiate with clean, efficacious formulations\n\n`;

  email += `I'd like to walk you through the full mapping and send a discovery box so you can experience the product quality firsthand.\n\n`;

  email += `When can we schedule 30 minutes this week?\n\n`;

  email += `Best,\n${repName}\n${repTitle}${repEmail}`;

  return email;
}
