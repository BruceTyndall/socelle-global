import { supabase } from './supabase';

export interface SchemaRequirement {
  table: string;
  requiredColumns: string[];
  description: string;
  critical: boolean;
}

export interface SchemaHealthResult {
  table: string;
  description: string;
  status: 'PASS' | 'WARN' | 'FAIL';
  critical: boolean;
  tableExists: boolean;
  missingColumns: string[];
  message: string;
  suggestedFix?: string;
}

export const SCHEMA_REQUIREMENTS: SchemaRequirement[] = [
  {
    table: 'spa_menus',
    requiredColumns: ['id', 'spa_name', 'spa_type', 'upload_date', 'created_at'],
    description: 'Core spa menu uploads',
    critical: true
  },
  {
    table: 'spa_service_mapping',
    requiredColumns: ['id', 'spa_menu_id', 'service_name', 'canonical_protocol_id', 'confidence_score'],
    description: 'Service-to-protocol mappings',
    critical: true
  },
  {
    table: 'service_gap_analysis',
    requiredColumns: ['id', 'spa_menu_id', 'gap_type', 'recommended_protocol_id', 'priority_level'],
    description: 'Identified service gaps',
    critical: true
  },
  {
    table: 'canonical_protocols',
    requiredColumns: ['id', 'protocol_name', 'category', 'completion_status'],
    description: 'Canonical protocol library',
    critical: true
  },
  {
    table: 'pro_products',
    requiredColumns: ['id', 'product_name', 'category', 'pro_price'],
    description: 'PRO/backbar products',
    critical: false
  },
  {
    table: 'retail_products',
    requiredColumns: ['id', 'product_name', 'category', 'msrp'],
    description: 'Retail products',
    critical: false
  },
  {
    table: 'spa_leads',
    requiredColumns: ['id', 'spa_name', 'lead_status', 'spa_menu_id'],
    description: 'Sales pipeline leads',
    critical: true
  },
  {
    table: 'phased_rollout_plans',
    requiredColumns: ['id', 'spa_menu_id', 'plan_name', 'total_services'],
    description: 'Implementation rollout plans',
    critical: false
  },
  {
    table: 'retail_attach_recommendations',
    requiredColumns: ['id', 'service_mapping_id', 'retail_product_id', 'confidence_score'],
    description: 'AI retail attach recommendations',
    critical: false
  },
  {
    table: 'spa_menu_summaries',
    requiredColumns: ['spa_menu_id', 'total_services', 'total_gaps'],
    description: 'Aggregated spa menu metrics (VIEW)',
    critical: false
  }
];

async function checkTableExists(tableName: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from(tableName)
      .select('*')
      .limit(0);

    return !error || !error.message.includes('does not exist');
  } catch {
    return false;
  }
}

async function getTableColumns(tableName: string): Promise<string[]> {
  try {
    const { data } = await supabase
      .rpc('get_table_columns', { table_name: tableName })
      .single();

    if (data) {
      return data as string[];
    }

    const { data: sampleRow } = await supabase
      .from(tableName)
      .select('*')
      .limit(1)
      .maybeSingle();

    return sampleRow ? Object.keys(sampleRow) : [];
  } catch {
    return [];
  }
}

export async function runSchemaHealthCheck(): Promise<SchemaHealthResult[]> {
  const results: SchemaHealthResult[] = [];

  for (const requirement of SCHEMA_REQUIREMENTS) {
    const tableExists = await checkTableExists(requirement.table);

    if (!tableExists) {
      results.push({
        table: requirement.table,
        description: requirement.description,
        status: requirement.critical ? 'FAIL' : 'WARN',
        critical: requirement.critical,
        tableExists: false,
        missingColumns: requirement.requiredColumns,
        message: `Table "${requirement.table}" does not exist`,
        suggestedFix: `Create the ${requirement.table} table with columns: ${requirement.requiredColumns.join(', ')}`
      });
      continue;
    }

    const existingColumns = await getTableColumns(requirement.table);
    const missingColumns = requirement.requiredColumns.filter(
      col => !existingColumns.includes(col)
    );

    if (missingColumns.length > 0) {
      results.push({
        table: requirement.table,
        description: requirement.description,
        status: requirement.critical ? 'FAIL' : 'WARN',
        critical: requirement.critical,
        tableExists: true,
        missingColumns,
        message: `Missing columns: ${missingColumns.join(', ')}`,
        suggestedFix: `ALTER TABLE ${requirement.table} ADD COLUMN ${missingColumns.map(c => `${c} TYPE`).join(', ')};`
      });
    } else {
      results.push({
        table: requirement.table,
        description: requirement.description,
        status: 'PASS',
        critical: requirement.critical,
        tableExists: true,
        missingColumns: [],
        message: 'All required columns present'
      });
    }
  }

  return results;
}

export function getHealthSummary(results: SchemaHealthResult[]) {
  const failures = results.filter(r => r.status === 'FAIL');
  const warnings = results.filter(r => r.status === 'WARN');
  const passes = results.filter(r => r.status === 'PASS');

  return {
    overallStatus: failures.length > 0 ? 'FAIL' : warnings.length > 0 ? 'WARN' : 'PASS',
    failureCount: failures.length,
    warningCount: warnings.length,
    passCount: passes.length,
    totalChecks: results.length,
    criticalIssues: failures.filter(f => f.critical).length
  };
}
