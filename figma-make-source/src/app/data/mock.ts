// Socelle Mock Data — simulates live API feeds

export interface KPI {
  id: string;
  value: number;
  unit: string;
  label: string;
  delta: number;
  confidence: number;
  updatedAt: Date;
}

export interface Signal {
  id: string;
  name: string;
  category: string;
  trend: 'up' | 'down' | 'neutral';
  trendValue: number;
  confidence: number;
  updatedAt: Date;
  sparkline: number[];
  source: string;
}

export interface Brand {
  id: string;
  name: string;
  category: string;
  adoption: number;
  isNew: boolean;
  isFeatured: boolean;
  image: string;
  description: string;
  signals: number;
  updatedAt: Date;
}

export interface EventItem {
  id: string;
  title: string;
  type: 'Conference' | 'Masterclass' | 'Activation' | 'Webinar';
  date: string;
  location: string;
  attendees: number;
  isFeatured: boolean;
  image: string;
  description: string;
}

export interface Job {
  id: string;
  title: string;
  department: string;
  location: string;
  type: 'Full-time' | 'Part-time' | 'Contract';
  salaryRange: string;
  isFeatured: boolean;
  postedAt: Date;
  description: string;
  tags: string[];
}

const ago = (minutes: number) => new Date(Date.now() - minutes * 60 * 1000);

export const platformKPIs: KPI[] = [
  { id: 'k1', value: 2847, unit: '', label: 'Brands Verified', delta: 12.4, confidence: 97, updatedAt: ago(2) },
  { id: 'k2', value: 18423, unit: '', label: 'Practitioner Buyers', delta: 8.7, confidence: 94, updatedAt: ago(5) },
  { id: 'k3', value: 4.2, unit: 'M', label: 'Monthly GMV', delta: 23.1, confidence: 91, updatedAt: ago(3) },
  { id: 'k4', value: 847, unit: 'K', label: 'Daily Signals Ingested', delta: 15.6, confidence: 96, updatedAt: ago(1) },
  { id: 'k5', value: 99.7, unit: '%', label: 'Platform Uptime', delta: 0.1, confidence: 99, updatedAt: ago(1) },
  { id: 'k6', value: 342, unit: '', label: 'Intelligence Sources', delta: 5.2, confidence: 93, updatedAt: ago(8) },
];

export const signals: Signal[] = [
  { id: 's1', name: 'Peptide Complex Demand Surge', category: 'Ingredients', trend: 'up', trendValue: 34.2, confidence: 96, updatedAt: ago(3), sparkline: [12, 15, 14, 18, 22, 28, 34, 31, 38, 42], source: 'Market Intelligence' },
  { id: 's2', name: 'Retinol Reformulation Wave', category: 'R&D', trend: 'up', trendValue: 18.7, confidence: 92, updatedAt: ago(7), sparkline: [20, 22, 21, 24, 26, 25, 28, 30, 32, 35], source: 'Clinical Data' },
  { id: 's3', name: 'Korean Beauty Protocol Adoption', category: 'Treatments', trend: 'up', trendValue: 27.4, confidence: 89, updatedAt: ago(12), sparkline: [8, 10, 12, 15, 18, 20, 24, 26, 30, 33], source: 'Buyer Signals' },
  { id: 's4', name: 'Medical-Grade SPF Migration', category: 'Sun Care', trend: 'up', trendValue: 15.3, confidence: 94, updatedAt: ago(5), sparkline: [30, 32, 31, 33, 35, 34, 36, 38, 40, 42], source: 'Purchase Data' },
  { id: 's5', name: 'Niacinamide Supply Tightening', category: 'Supply Chain', trend: 'down', trendValue: -8.2, confidence: 87, updatedAt: ago(45), sparkline: [50, 48, 47, 45, 42, 40, 38, 36, 35, 33], source: 'Supplier Network' },
  { id: 's6', name: 'LED Therapy Device Spend', category: 'Devices', trend: 'up', trendValue: 41.6, confidence: 91, updatedAt: ago(9), sparkline: [5, 8, 12, 15, 20, 25, 30, 35, 40, 45], source: 'Procurement Data' },
  { id: 's7', name: 'Clean Beauty Certification Growth', category: 'Compliance', trend: 'up', trendValue: 22.1, confidence: 95, updatedAt: ago(15), sparkline: [18, 20, 22, 24, 26, 28, 30, 33, 35, 38], source: 'Regulatory Feed' },
  { id: 's8', name: 'Exosome Therapy Interest Spike', category: 'Emerging', trend: 'up', trendValue: 67.3, confidence: 78, updatedAt: ago(20), sparkline: [2, 3, 5, 8, 12, 18, 28, 40, 55, 68], source: 'Search Intelligence' },
  { id: 's9', name: 'Hyaluronic Acid Price Stabilization', category: 'Ingredients', trend: 'neutral', trendValue: 1.2, confidence: 93, updatedAt: ago(6), sparkline: [40, 41, 40, 42, 41, 40, 41, 42, 41, 42], source: 'Market Intelligence' },
  { id: 's10', name: 'Medspa Insurance Premium Rise', category: 'Business', trend: 'down', trendValue: -5.8, confidence: 88, updatedAt: ago(30), sparkline: [25, 26, 28, 30, 32, 34, 35, 36, 37, 38], source: 'Industry Feed' },
];

export const brands: Brand[] = [
  { id: 'b1', name: 'Dermatica Pro', category: 'Clinical Skincare', adoption: 87, isNew: false, isFeatured: true, image: '', description: 'Medical-grade formulations for professional environments', signals: 24, updatedAt: ago(4) },
  { id: 'b2', name: 'Lumière Botanicals', category: 'Botanical Science', adoption: 72, isNew: true, isFeatured: false, image: '', description: 'Plant-derived actives with clinical validation', signals: 18, updatedAt: ago(8) },
  { id: 'b3', name: 'SkinIntel Labs', category: 'R&D Platform', adoption: 64, isNew: false, isFeatured: false, image: '', description: 'AI-powered ingredient analysis and formulation', signals: 31, updatedAt: ago(12) },
  { id: 'b4', name: 'Veridian Aesthetics', category: 'Professional Devices', adoption: 91, isNew: false, isFeatured: false, image: '', description: 'Next-gen LED and RF devices for medspa protocols', signals: 15, updatedAt: ago(6) },
  { id: 'b5', name: 'Aura Clinical', category: 'Treatment Systems', adoption: 78, isNew: true, isFeatured: false, image: '', description: 'Complete clinical treatment protocols with training', signals: 22, updatedAt: ago(10) },
  { id: 'b6', name: 'PeptideVault', category: 'Ingredients', adoption: 69, isNew: false, isFeatured: false, image: '', description: 'Proprietary peptide complexes for anti-aging', signals: 19, updatedAt: ago(15) },
];

export const events: EventItem[] = [
  { id: 'e1', title: 'Socelle Intelligence Summit 2026', type: 'Conference', date: '2026-04-15', location: 'New York, NY', attendees: 1200, isFeatured: true, image: '', description: 'The premier gathering for professional beauty intelligence. Three days of market data, clinical insights, and networking.' },
  { id: 'e2', title: 'Advanced Peptide Protocols', type: 'Masterclass', date: '2026-03-28', location: 'Los Angeles, CA', attendees: 85, isFeatured: false, image: '', description: 'Hands-on training for peptide-based treatment protocols.' },
  { id: 'e3', title: 'Brand Discovery: Spring Launch', type: 'Activation', date: '2026-04-02', location: 'Miami, FL', attendees: 340, isFeatured: false, image: '', description: 'Exclusive preview of 24 new brands entering the platform.' },
  { id: 'e4', title: 'Clinical Data in Practice', type: 'Webinar', date: '2026-03-20', location: 'Virtual', attendees: 2100, isFeatured: false, image: '', description: 'How to use Socelle intelligence data to inform buying decisions and treatment planning.' },
  { id: 'e5', title: 'Medspa Business Masterclass', type: 'Masterclass', date: '2026-05-10', location: 'Chicago, IL', attendees: 120, isFeatured: false, image: '', description: 'Financial planning and growth strategies for medspa owners.' },
  { id: 'e6', title: 'European Esthetics Forum', type: 'Conference', date: '2026-06-22', location: 'London, UK', attendees: 800, isFeatured: false, image: '', description: 'Cross-Atlantic perspectives on professional beauty trends.' },
];

export const jobs: Job[] = [
  { id: 'j1', title: 'Senior Data Engineer — Intelligence Platform', department: 'Engineering', location: 'New York, NY', type: 'Full-time', salaryRange: '$165K–$210K', isFeatured: true, postedAt: ago(60 * 24 * 2), description: 'Architect and scale the intelligence pipeline — 847K daily signals from 342 integrated sources. You\'ll build the system that tells the professional aesthetics industry what\'s happening, and what\'s next.', tags: ['Python', 'Spark', 'Kafka', 'AWS'] },
  { id: 'j2', title: 'Brand Partnership Manager', department: 'Business Development', location: 'Los Angeles, CA', type: 'Full-time', salaryRange: '$120K–$155K', isFeatured: false, postedAt: ago(60 * 24 * 5), description: 'Own the relationship lifecycle for emerging and established skincare brands entering the Socelle network. You\'ll negotiate terms, onboard new partners, and translate brand narratives into data-rich profiles.', tags: ['Partnerships', 'Beauty Industry', 'Account Management'] },
  { id: 'j3', title: 'Clinical Content Strategist', department: 'Editorial', location: 'Remote', type: 'Full-time', salaryRange: '$95K–$125K', isFeatured: false, postedAt: ago(60 * 24 * 3), description: 'Translate clinical research, ingredient science, and market data into editorial content that practitioners trust. You\'ll define the voice of Socelle\'s intelligence reports and brand profiles.', tags: ['Content Strategy', 'Clinical Writing', 'Skincare Science'] },
  { id: 'j4', title: 'Product Designer — Marketplace', department: 'Design', location: 'New York, NY', type: 'Full-time', salaryRange: '$140K–$175K', isFeatured: false, postedAt: ago(60 * 24 * 1), description: 'Design the interfaces where practitioners discover, evaluate, and source professional skincare. Own the end-to-end experience from signal feed to procurement.', tags: ['Figma', 'Design Systems', 'B2B', 'Data Visualization'] },
  { id: 'j5', title: 'Medspa Account Executive', department: 'Sales', location: 'Miami, FL', type: 'Full-time', salaryRange: '$85K–$130K + Commission', isFeatured: false, postedAt: ago(60 * 24 * 7), description: 'Build and manage a book of medspa accounts across the Southeast. You\'ll introduce practitioners to the platform, run demos, and close deals with clinic owners and medical directors.', tags: ['SaaS Sales', 'Aesthetics', 'Hunter Role'] },
  { id: 'j6', title: 'ML Engineer — Signal Processing', department: 'Engineering', location: 'Remote', type: 'Full-time', salaryRange: '$180K–$230K', isFeatured: false, postedAt: ago(60 * 24 * 4), description: 'Build the models that detect ingredient demand surges, pricing anomalies, and competitive shifts from raw market data. You\'ll work at the intersection of NLP, time-series forecasting, and domain-specific knowledge graphs.', tags: ['PyTorch', 'NLP', 'Time Series', 'MLOps'] },
  { id: 'j7', title: 'Head of Growth Marketing', department: 'Marketing', location: 'New York, NY', type: 'Full-time', salaryRange: '$155K–$195K', isFeatured: false, postedAt: ago(60 * 24 * 1), description: 'Define and execute the acquisition strategy for both sides of the marketplace — practitioner buyers and independent brands. You\'ll own paid, organic, lifecycle, and event-driven channels.', tags: ['Growth', 'Paid Media', 'Lifecycle', 'B2B Marketing'] },
  { id: 'j8', title: 'Frontend Engineer — Design Systems', department: 'Engineering', location: 'Remote', type: 'Full-time', salaryRange: '$145K–$185K', isFeatured: false, postedAt: ago(60 * 24 * 3), description: 'Own and evolve the component library powering every surface of Socelle — from real-time signal dashboards to brand profile pages. React, TypeScript, and an obsession with craft required.', tags: ['React', 'TypeScript', 'Tailwind', 'Design Systems'] },
  { id: 'j9', title: 'Clinical Intelligence Analyst', department: 'Intelligence', location: 'Remote', type: 'Full-time', salaryRange: '$90K–$120K', isFeatured: false, postedAt: ago(60 * 24 * 6), description: 'Analyze clinical trial data, ingredient research, and regulatory filings to produce the evidence layer behind every brand and product on the platform. Your work becomes the trust signal practitioners rely on.', tags: ['Clinical Research', 'Data Analysis', 'Regulatory'] },
  { id: 'j10', title: 'Senior Backend Engineer — Marketplace', department: 'Engineering', location: 'New York, NY', type: 'Full-time', salaryRange: '$170K–$215K', isFeatured: false, postedAt: ago(60 * 24 * 2), description: 'Design and build the transactional infrastructure — procurement workflows, pricing engines, and compliance verification systems that medspas depend on for every order.', tags: ['Go', 'PostgreSQL', 'gRPC', 'Distributed Systems'] },
  { id: 'j11', title: 'Events & Community Manager', department: 'Marketing', location: 'Los Angeles, CA', type: 'Full-time', salaryRange: '$80K–$105K', isFeatured: false, postedAt: ago(60 * 24 * 8), description: 'Produce Socelle\'s event calendar — from intimate masterclasses to the annual Intelligence Summit. You\'ll manage logistics, speaker relations, and the editorial programming that makes each gathering worth attending.', tags: ['Event Production', 'Community', 'Beauty Industry'] },
  { id: 'j12', title: 'Data Visualization Designer', department: 'Design', location: 'Remote', type: 'Full-time', salaryRange: '$125K–$160K', isFeatured: false, postedAt: ago(60 * 24 * 5), description: 'Transform complex market signals, adoption curves, and clinical evidence into visual narratives that practitioners can read at a glance. D3, Recharts, and editorial design sensibility required.', tags: ['D3.js', 'Data Viz', 'Editorial Design', 'Figma'] },
  { id: 'j13', title: 'Brand Onboarding Specialist', department: 'Operations', location: 'Miami, FL', type: 'Full-time', salaryRange: '$70K–$90K', isFeatured: false, postedAt: ago(60 * 24 * 10), description: 'Guide new brands through verification, profile creation, and their first 90 days on the platform. You\'ll ensure every listing meets Socelle\'s standards for clinical documentation and editorial quality.', tags: ['Onboarding', 'Quality Assurance', 'Brand Relations'] },
  { id: 'j14', title: 'DevOps / Platform Engineer', department: 'Engineering', location: 'Remote', type: 'Full-time', salaryRange: '$155K–$200K', isFeatured: false, postedAt: ago(60 * 24 * 4), description: 'Own the infrastructure that keeps 847K daily signals flowing — Kubernetes clusters, CI/CD pipelines, observability, and the 99.7% uptime SLA that practitioners depend on.', tags: ['Kubernetes', 'Terraform', 'AWS', 'Observability'] },
  { id: 'j15', title: 'Freelance Photographer — Brand Content', department: 'Editorial', location: 'New York, NY', type: 'Contract', salaryRange: '$800–$1,500/day', isFeatured: false, postedAt: ago(60 * 24 * 12), description: 'Shoot editorial product photography and brand portraits for Socelle\'s platform listings and marketing. Beauty/fashion editorial book required. Ongoing project basis.', tags: ['Photography', 'Editorial', 'Beauty', 'Contract'] },
];

export function formatTimeAgo(date: Date): string {
  const now = Date.now();
  const diff = now - date.getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function getFreshnessColor(date: Date): string {
  const minutes = (Date.now() - date.getTime()) / 60000;
  if (minutes < 60) return 'text-[#5F8A72]';
  if (minutes < 1440) return 'text-[#A97A4C]';
  return 'text-[#8E6464]';
}

export function getFreshnessDot(date: Date): string {
  const minutes = (Date.now() - date.getTime()) / 60000;
  if (minutes < 60) return 'bg-[#5F8A72]';
  if (minutes < 1440) return 'bg-[#A97A4C]';
  return 'bg-[#8E6464]';
}