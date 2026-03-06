import { supabase } from './supabase';

interface BackbarProduct {
  product_id: string | null;
  product_name: string;
  protocol_name: string;
  quantity: number | null;
  notes: string;
  missing_data: string[];
}

interface RetailProduct {
  product_id: string;
  product_name: string;
  msrp: number | null;
  wholesale: number | null;
  suggested_quantity: number | null;
  attached_to_service: string;
  rationale: string;
}

async function getProtocolProducts(planId: string): Promise<BackbarProduct[]> {
  const { data: planItems } = await supabase
    .from('rollout_plan_items')
    .select(`
      protocol_name,
      rollout_plan_items:implementation_readiness(canonical_protocol_id)
    `)
    .eq('rollout_plan_id', planId);

  if (!planItems) return [];

  const backbarProducts: BackbarProduct[] = [];
  const processedProtocols = new Set<string>();

  for (const item of planItems) {
    const protocolId = (item as any).rollout_plan_items?.canonical_protocol_id;
    if (!protocolId || processedProtocols.has(protocolId)) continue;

    processedProtocols.add(protocolId);

    const { data: stepProducts } = await supabase
      .from('canonical_protocol_step_products')
      .select(`
        *,
        canonical_protocol_steps!inner(canonical_protocol_id)
      `)
      .eq('canonical_protocol_steps.canonical_protocol_id', protocolId)
      .eq('product_type', 'BACKBAR');

    if (stepProducts) {
      for (const sp of stepProducts) {
        const missingData: string[] = [];
        if (!sp.product_id) missingData.push('product_id');
        if (!sp.usage_amount) missingData.push('usage_amount');

        backbarProducts.push({
          product_id: sp.product_id,
          product_name: sp.product_name,
          protocol_name: (item as any).protocol_name || 'Unknown Protocol',
          quantity: null,
          notes: sp.notes || '',
          missing_data: missingData
        });
      }
    }
  }

  return backbarProducts;
}

async function getRetailProducts(_planId: string, spaMenuId: string): Promise<RetailProduct[]> {
  const { data: recommendations } = await supabase
    .from('retail_attach_recommendations')
    .select(`
      *,
      retail_products(product_name, msrp, wholesale),
      service_mapping:spa_service_mapping(service_name),
      gap:service_gap_analysis(gap_description)
    `)
    .eq('spa_menu_id', spaMenuId)
    .eq('admin_approved', true)
    .order('rank');

  if (!recommendations) return [];

  return recommendations.map((rec: any) => ({
    product_id: rec.retail_product_id,
    product_name: rec.retail_products?.product_name || 'Unknown Product',
    msrp: rec.retail_products?.msrp || null,
    wholesale: rec.retail_products?.wholesale || null,
    suggested_quantity: null,
    attached_to_service: rec.service_mapping?.service_name || rec.gap?.gap_description || 'Multiple Services',
    rationale: rec.rationale || 'Recommended based on protocol alignment'
  }));
}

async function getSeasonalLaunchWindow(): Promise<{ month: string; theme: string } | null> {
  const currentMonth = new Date().getMonth() + 1;
  const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1;

  const { data } = await supabase
    .from('marketing_calendar')
    .select('month_name, theme')
    .eq('year', 2026)
    .in('month', [currentMonth, nextMonth])
    .limit(1)
    .single();

  if (data) {
    return {
      month: data.month_name,
      theme: data.theme
    };
  }

  return null;
}

function generateSetupChecklist(_totalServices: number, _hasTraining: boolean): any[] {
  return [
    {
      category: 'Facility Preparation',
      items: [
        { task: 'Designate treatment rooms', completed: false, notes: '' },
        { task: 'Install required equipment (facial beds, steamers, etc.)', completed: false, notes: '' },
        { task: 'Set up product storage and backbar', completed: false, notes: '' },
        { task: 'Arrange retail display area', completed: false, notes: '' }
      ]
    },
    {
      category: 'Product Inventory',
      items: [
        { task: 'Receive and verify backbar product shipment', completed: false, notes: '' },
        { task: 'Receive and verify retail product shipment', completed: false, notes: '' },
        { task: 'Organize products per protocol requirements', completed: false, notes: '' },
        { task: 'Stock treatment rooms', completed: false, notes: '' }
      ]
    },
    {
      category: 'Staff Setup',
      items: [
        { task: 'Assign staff to service categories', completed: false, notes: '' },
        { task: 'Distribute protocol manuals', completed: false, notes: '' },
        { task: 'Review contraindications and safety protocols', completed: false, notes: '' }
      ]
    }
  ];
}

function generateTrainingChecklist(trainingHours: number): any[] {
  return [
    {
      category: 'Core Training',
      items: [
        { task: `Complete ${trainingHours.toFixed(1)} hours of protocol training`, completed: false, notes: '', hours: trainingHours },
        { task: 'Review all protocol step-by-step guides', completed: false, notes: '' },
        { task: 'Practice product application techniques', completed: false, notes: '' },
        { task: 'Complete safety and contraindication training', completed: false, notes: '' }
      ]
    },
    {
      category: 'Certification',
      items: [
        { task: 'Pass protocol knowledge assessment', completed: false, notes: '' },
        { task: 'Demonstrate practical proficiency', completed: false, notes: '' },
        { task: 'Receive certification (if required)', completed: false, notes: '' }
      ]
    }
  ];
}

function generateLaunchChecklist(totalServices: number): any[] {
  return [
    {
      category: 'Menu & Marketing',
      items: [
        { task: `Update spa menu with ${totalServices} new/verified services`, completed: false, notes: '' },
        { task: 'Create service descriptions for booking system', completed: false, notes: '' },
        { task: 'Train front desk on new offerings', completed: false, notes: '' },
        { task: 'Prepare promotional materials', completed: false, notes: '' },
        { task: 'Schedule soft launch with test clients', completed: false, notes: '' }
      ]
    },
    {
      category: 'Retail Integration',
      items: [
        { task: 'Set retail pricing and display', completed: false, notes: '' },
        { task: 'Train staff on product recommendations', completed: false, notes: '' },
        { task: 'Create take-home care instructions', completed: false, notes: '' }
      ]
    }
  ];
}

export async function generateOpeningOrder(_planId: string, spaMenuId: string): Promise<string | null> {
  const planId = _planId;
  const { data: plan, error: planError } = await supabase
    .from('phased_rollout_plans')
    .select('*')
    .eq('id', planId)
    .single();

  if (planError || !plan) {
    console.error('generateOpeningOrder: rollout plan not found for planId:', planId, planError);
    return null;
  }

  const backbarProducts = await getProtocolProducts(planId);
  const retailProducts = await getRetailProducts(planId, spaMenuId);
  const seasonalWindow = await getSeasonalLaunchWindow();

  const uniqueBackbar = Array.from(
    new Map(backbarProducts.map(p => [p.product_name, p])).values()
  );

  const missingData: string[] = [];
  if (uniqueBackbar.some(p => p.missing_data.length > 0)) {
    missingData.push('backbar_quantities');
  }
  if (retailProducts.some(p => p.msrp === null)) {
    missingData.push('retail_pricing');
  }

  // Estimate backbar investment: look up pro_products wholesale prices for matched products
  let estimatedBackbarInvestment: number | null = null;
  let estimatedRetailInvestment: number | null = null;

  const backbarProductNames = uniqueBackbar
    .map(p => p.product_name)
    .filter(Boolean);

  if (backbarProductNames.length > 0) {
    const { data: proProductPrices } = await supabase
      .from('pro_products')
      .select('product_name, wholesale')
      .in('product_name', backbarProductNames);

    if (proProductPrices && proProductPrices.length > 0) {
      const totalBackbar = proProductPrices.reduce((sum, p) => sum + (p.wholesale || 0), 0);
      estimatedBackbarInvestment = totalBackbar > 0 ? totalBackbar : null;
    }
  }

  if (retailProducts.length > 0 && retailProducts.every(p => p.wholesale !== null)) {
    estimatedRetailInvestment = retailProducts.reduce((sum, p) => sum + (p.wholesale || 0), 0);
  }

  const setupChecklist = generateSetupChecklist(plan.total_services, plan.total_training_hours > 0);
  const trainingChecklist = generateTrainingChecklist(plan.total_training_hours || 0);
  const launchChecklist = generateLaunchChecklist(plan.total_services);

  const sourceTrace = {
    rollout_plan_id: planId,
    backbar_products_count: uniqueBackbar.length,
    retail_products_count: retailProducts.length,
    data_sources: [
      'canonical_protocol_step_products',
      'retail_attach_recommendations',
      'marketing_calendar'
    ],
    quantity_estimation: 'wholesale price lookup from pro_products table',
    algorithm_version: '1.0',
    generated_at: new Date().toISOString()
  };

  const { data: order, error } = await supabase
    .from('opening_orders')
    .insert({
      rollout_plan_id: planId,
      spa_menu_id: spaMenuId,
      backbar_products: uniqueBackbar,
      retail_products: retailProducts,
      estimated_backbar_investment: estimatedBackbarInvestment,
      estimated_retail_investment: estimatedRetailInvestment,
      total_estimated_investment: (estimatedBackbarInvestment || 0) + (estimatedRetailInvestment || 0) || null,
      setup_checklist: setupChecklist,
      training_checklist: trainingChecklist,
      launch_checklist: launchChecklist,
      recommended_launch_window: seasonalWindow?.month || 'Flexible - no seasonal constraints',
      seasonal_rationale: seasonalWindow ? `Aligns with ${seasonalWindow.theme} marketing theme` : null,
      source_trace: sourceTrace,
      missing_data_flags: missingData
    })
    .select()
    .single();

  if (error || !order) {
    console.error('Error creating opening order:', error);
    return null;
  }

  return order.id;
}

export async function regenerateOpeningOrder(planId: string, spaMenuId: string): Promise<void> {
  await supabase
    .from('opening_orders')
    .delete()
    .eq('rollout_plan_id', planId);

  await generateOpeningOrder(planId, spaMenuId);
}
