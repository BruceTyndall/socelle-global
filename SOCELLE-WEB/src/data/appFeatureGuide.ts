export type AppBuildPhase =
  | 'Build 0'
  | 'Build 1'
  | 'Build 2'
  | 'Build 3'
  | 'Build 4'
  | 'Build 5';

export interface AppFeatureGuideItem {
  key: string;
  name: string;
  phase: AppBuildPhase;
  audience: string;
  purpose: string;
  coreFeatures: string[];
  crossHubFlows: string[];
}

export const APP_FEATURE_GUIDE: AppFeatureGuideItem[] = [
  {
    key: 'intelligence',
    name: 'Intelligence App',
    phase: 'Build 1',
    audience: 'Business, Brand, Admin',
    purpose: 'Turn market signals into actionable moves with confidence and provenance.',
    coreFeatures: [
      'Signal table with filtering, sorting, and export',
      'Trend stacks and opportunity estimates',
      'AI tools with server-side credit and rate-limit enforcement',
      'Saved searches, alerts, and detail drill-downs',
    ],
    crossHubFlows: [
      'Signal -> create CRM task/contact note',
      'Signal -> create sales deal',
      'Signal -> launch marketing campaign concept',
    ],
  },
  {
    key: 'crm',
    name: 'CRM App',
    phase: 'Build 2',
    audience: 'Business, Brand sales teams, Operators',
    purpose: 'Manage contacts, companies, activities, and lifecycle actions in one operating view.',
    coreFeatures: [
      'Contacts and companies CRUD with search/filter',
      'Activity timeline, tasks, and lifecycle stages',
      'Booking and order context linked to client records',
      'CSV exports and role-gated access',
    ],
    crossHubFlows: [
      'Booking appointment -> add/create CRM contact',
      'Commerce order -> create CRM follow-up task',
      'Intelligence signal -> CRM task via dispatcher',
    ],
  },
  {
    key: 'education',
    name: 'Education App',
    phase: 'Build 2',
    audience: 'Business teams, Trainers, Brand education teams',
    purpose: 'Deliver training, track learning progress, and certify teams.',
    coreFeatures: [
      'Course library and lesson playback',
      'Quiz scoring and certificate issuance',
      'Progress tracking and staff training views',
      'PDF/CSV learning exports',
    ],
    crossHubFlows: [
      'Signal -> recommend training path',
      'CRM account status -> training assignment queue',
      'Admin analytics -> education adoption insights',
    ],
  },
  {
    key: 'commerce',
    name: 'Commerce App',
    phase: 'Build 2',
    audience: 'Business buyers, Brand operators, Commerce managers',
    purpose: 'Operate product catalog, pricing, inventory, and order workflows.',
    coreFeatures: [
      'Product catalog and inventory controls',
      'Order management and detail workflows',
      'Price and performance reporting',
      'Affiliate-compliant links and badges',
    ],
    crossHubFlows: [
      'Intelligence price signal -> alert workflow',
      'Commerce order -> CRM follow-up and retention tasks',
      'Marketing campaign -> product performance measurement',
    ],
  },
  {
    key: 'sales',
    name: 'Sales App',
    phase: 'Build 2',
    audience: 'Sales reps, Account managers, Operators',
    purpose: 'Run pipelines, deals, and proposal workflows with accountable execution.',
    coreFeatures: [
      'Pipeline and stage tracking',
      'Deal records and activity history',
      'Proposal authoring and PDF output',
      'Revenue and conversion dashboards',
    ],
    crossHubFlows: [
      'Intelligence signal -> create deal',
      'CRM lifecycle changes -> deal updates',
      'Marketing engagement -> sales qualification signals',
    ],
  },
  {
    key: 'marketing',
    name: 'Marketing App',
    phase: 'Build 3',
    audience: 'Marketing teams, Brand teams, Operators',
    purpose: 'Plan and execute compliant, opt-in campaigns with measurable outcomes.',
    coreFeatures: [
      'Campaign planning and scheduling',
      'Audience segments and template management',
      'Calendar and landing-page operations',
      'Campaign analytics and exports',
    ],
    crossHubFlows: [
      'CRM segment -> campaign audience',
      'Intelligence signal -> campaign brief',
      'Commerce performance -> optimization loops',
    ],
  },
  {
    key: 'booking',
    name: 'Booking App',
    phase: 'Build 3',
    audience: 'Front desk, Providers, Operators',
    purpose: 'Manage service menus, staff schedules, and appointments with CRM-native context.',
    coreFeatures: [
      'Appointment calendar and detail workflows',
      'Service and staff management',
      'Client service record linkage',
      'Status updates and reminders',
    ],
    crossHubFlows: [
      'Appointment -> CRM contact/profile',
      'Treatment records -> intelligence-informed recommendations',
      'Booking outcomes -> revenue and retention reporting',
    ],
  },
  {
    key: 'brands',
    name: 'Brands App',
    phase: 'Build 3',
    audience: 'Brand admins, Business buyers',
    purpose: 'Manage brand profiles, portfolio visibility, and channel performance.',
    coreFeatures: [
      'Brand profile and portfolio views',
      'Performance and buyer analytics',
      'Campaign and storefront coordination',
      'Brand-level messaging surfaces',
    ],
    crossHubFlows: [
      'Intelligence trends -> brand strategy actions',
      'Commerce orders -> brand performance feedback',
      'Marketing campaigns -> brand-specific outcomes',
    ],
  },
  {
    key: 'professionals',
    name: 'Professionals App',
    phase: 'Build 3',
    audience: 'Pros, Hiring teams, Operators',
    purpose: 'Maintain professional profiles, credentials, and discoverability.',
    coreFeatures: [
      'Professional profile management',
      'Credential and specialization metadata',
      'Directory search and filtering',
      'Exportable directory views',
    ],
    crossHubFlows: [
      'Education completion -> credential visibility',
      'Booking demand -> staffing and specialization planning',
      'CRM account needs -> talent matching',
    ],
  },
  {
    key: 'notifications',
    name: 'Notification Engine',
    phase: 'Build 3',
    audience: 'All users',
    purpose: 'Send transactional notifications with user preferences and governance.',
    coreFeatures: [
      'Preference controls by channel',
      'Template-based delivery',
      'Transactional alert workflows',
      'Delivery visibility for admins',
    ],
    crossHubFlows: [
      'Saved signal alert -> user notification',
      'Booking updates -> client/staff notifications',
      'Payment and account events -> transactional messaging',
    ],
  },
  {
    key: 'ingredients',
    name: 'Ingredients App',
    phase: 'Build 4',
    audience: 'Educators, Operators, Compliance teams',
    purpose: 'Provide ingredient intelligence, safety context, and formulation references.',
    coreFeatures: [
      'Ingredient library and detail pages',
      'Interaction and compatibility surfaces',
      'Collection curation',
      'Evidence and reference metadata',
    ],
    crossHubFlows: [
      'CRM sensitivities -> recommendation constraints',
      'Education content -> ingredient-backed lessons',
      'Marketing copy -> claims-safe language support',
    ],
  },
  {
    key: 'jobs',
    name: 'Jobs App',
    phase: 'Build 4',
    audience: 'Employers, Candidates, Recruiters',
    purpose: 'Manage beauty-industry jobs, applications, and candidate matching.',
    coreFeatures: [
      'Job posting and listing workflows',
      'Candidate application intake',
      'Role and location filtering',
      'Hiring pipeline visibility',
    ],
    crossHubFlows: [
      'Professional profiles -> candidate matching',
      'Education certifications -> candidate qualification signals',
      'Admin analytics -> hiring health metrics',
    ],
  },
  {
    key: 'events',
    name: 'Events App',
    phase: 'Build 4',
    audience: 'Operators, Brands, Educators, Attendees',
    purpose: 'Coordinate events, registrations, and event-led growth.',
    coreFeatures: [
      'Event listings and detail pages',
      'Registration and attendance tracking',
      'Calendar and event metadata management',
      'Event analytics and exports',
    ],
    crossHubFlows: [
      'Marketing campaigns -> event attendance',
      'CRM contacts -> event invitations and follow-up',
      'Education sessions -> certification progress',
    ],
  },
  {
    key: 'reseller',
    name: 'Reseller App',
    phase: 'Build 4',
    audience: 'Brand teams, Reseller operators',
    purpose: 'Operate reseller relationships, performance, and distribution outcomes.',
    coreFeatures: [
      'Reseller account and revenue views',
      'Client and territory performance',
      'White-label configuration controls',
      'Distribution reporting',
    ],
    crossHubFlows: [
      'Commerce velocity -> reorder and allocation guidance',
      'Sales opportunities -> reseller expansion tasks',
      'Intelligence signals -> region focus adjustments',
    ],
  },
  {
    key: 'authoring-core',
    name: 'Authoring Core',
    phase: 'Build 2',
    audience: 'Platform teams and content-producing hubs',
    purpose: 'Provide shared document model, block system, and publishing primitives.',
    coreFeatures: [
      'Versioned document schema',
      'Shared block rendering contracts',
      'Draft/published/archived states',
      'PDF/image export primitives',
    ],
    crossHubFlows: [
      'Education lessons consume shared blocks',
      'Marketing and sales assets use shared publishing rules',
      'Studio UI builds on top of these primitives',
    ],
  },
  {
    key: 'studio-ui',
    name: 'Authoring Studio UI',
    phase: 'Build 4',
    audience: 'Creators, Marketing, Sales enablement teams',
    purpose: 'Offer visual creation workflows for high-speed content production.',
    coreFeatures: [
      'Three-panel editor and canvas workflows',
      'Template library and brand-kit application',
      'Data-bound creative elements',
      'Multi-format export engine',
    ],
    crossHubFlows: [
      'Intelligence KPIs -> live-bound creative blocks',
      'Marketing campaign assets -> rapid publishing',
      'Sales collateral -> proposal and retailer kit generation',
    ],
  },
  {
    key: 'admin',
    name: 'Admin Hub',
    phase: 'Build 2',
    audience: 'Platform admins, operators',
    purpose: 'Operate platform safety, governance, and system-level control planes.',
    coreFeatures: [
      'System health dashboard',
      'Feature flag controls and rollout management',
      'Audit log search and traceability',
      'Shell and inventory monitoring',
    ],
    crossHubFlows: [
      'Global controls gate edge functions and features',
      'Audit trails cover admin and AI actions',
      'Health metrics monitor feed, AI, and usage systems',
    ],
  },
  {
    key: 'search',
    name: 'Search Engine App',
    phase: 'Build 4',
    audience: 'All users',
    purpose: 'Provide unified discovery across platform data and content.',
    coreFeatures: [
      'Unified query input across hubs',
      'Relevance scoring for content and operational records',
      'Filtered views by hub and entity type',
      'Search observability and quality metrics',
    ],
    crossHubFlows: [
      'Find accounts, signals, campaigns, and docs in one place',
      'Trigger workflows directly from search results',
      'Support analytics via searchable event history',
    ],
  },
  {
    key: 'feed-pipeline',
    name: 'Feed Pipeline App',
    phase: 'Build 1',
    audience: 'Intelligence operations, admins',
    purpose: 'Ingest, deduplicate, and promote external feed data into actionable signals.',
    coreFeatures: [
      'Scheduled ingestion and orchestration',
      'Deduplication and quality checks',
      'Retry logic and dead-letter queue handling',
      'Feed health and freshness monitoring',
    ],
    crossHubFlows: [
      'Pipeline output -> Intelligence market signals',
      'Admin health dashboard -> ingestion reliability',
      'Downstream hubs consume normalized signals',
    ],
  },
  {
    key: 'payments-credits',
    name: 'Payments and Credits App',
    phase: 'Build 1',
    audience: 'Business users, finance ops, admins',
    purpose: 'Manage subscription entitlements, credit balances, and usage enforcement.',
    coreFeatures: [
      'Credit ledger and balance visibility',
      'Server-side deduction before AI execution',
      'Overage blocking and upgrade paths',
      'Stripe webhook tier synchronization',
    ],
    crossHubFlows: [
      'AI tool usage -> credit deduction and ledger',
      'Tier changes -> entitlement updates across hubs',
      'Admin reporting -> usage and cost monitoring',
    ],
  },
  {
    key: 'public-site',
    name: 'Public Site',
    phase: 'Build 1',
    audience: 'Prospects, customers, partners',
    purpose: 'Explain value, capture demand, and route users into the right product journey.',
    coreFeatures: [
      'Prelaunch and conversion surfaces',
      'Public content and stories',
      'Role-specific entry pathways',
      'SEO and schema-enabled discoverability',
    ],
    crossHubFlows: [
      'Qualified leads -> onboarding and CRM',
      'Content surfaces -> education and intelligence entry points',
      'Plan pages -> payments and entitlement onboarding',
    ],
  },
];
