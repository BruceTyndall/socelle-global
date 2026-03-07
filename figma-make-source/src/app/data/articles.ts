export interface Author {
  name: string;
  role: string;
  avatar: string;
}

/*
 * ═══════════════════════════════════════════════════════════════════
 * SUPABASE INTEGRATION NOTES — Articles / Intelligence Feed
 * ═══════════════════════════════════════════════════════════════════
 *
 * TABLES NEEDED:
 *
 *   articles
 *   ─────────────────────────────────────────────────────────────
 *   id            uuid        PK, default gen_random_uuid()
 *   slug          text        UNIQUE, NOT NULL — URL-safe slug
 *   title         text        NOT NULL
 *   subtitle      text
 *   category      text        NOT NULL — 'Market Signal' | 'Brand Intel' | 'Clinical Data' | 'Regulatory' | 'Event'
 *   tag           text        — secondary label (e.g. 'Injectables', 'Compliance')
 *   image_url     text        — hero image URL (Supabase Storage or external)
 *   author_id     uuid        FK → authors.id
 *   published_at  timestamptz — NULL = draft; set by admin to publish
 *   read_time     int2        — estimated minutes
 *   excerpt       text        — 1-2 sentence preview for cards
 *   body          jsonb       — array of content blocks (see "Rich Body" below)
 *   signal_label  text        — e.g. 'Neurotoxin Demand'
 *   signal_value  text        — e.g. '+23.1%'
 *   is_featured   boolean     default false
 *   created_at    timestamptz default now()
 *   updated_at    timestamptz default now()
 *
 *   authors
 *   ─────────────────────────────────────────────────────────────
 *   id            uuid        PK
 *   name          text        NOT NULL
 *   role          text        — 'Clinical Intelligence Lead', etc.
 *   avatar_url    text        — Supabase Storage bucket: 'author-avatars'
 *   bio           text
 *   created_at    timestamptz default now()
 *
 *   article_categories (optional — or just use a CHECK constraint)
 *   ─────────────────────────────────────────────────────────────
 *   slug          text        PK — 'market-signal', 'brand-intel', etc.
 *   label         text        — 'Market Signal', 'Brand Intel'
 *   color_class   text        — Tailwind class string for badges
 *   sort_order    int2
 *
 * RICH BODY FORMAT:
 *   Store article.body as JSONB array of typed blocks so the admin
 *   can produce richer content over time without schema changes:
 *
 *   [
 *     { "type": "paragraph", "text": "..." },
 *     { "type": "quote", "text": "...", "attribution": "Dr. Smith" },
 *     { "type": "image", "url": "...", "caption": "...", "alt": "..." },
 *     { "type": "callout", "text": "...", "variant": "warning" },
 *     { "type": "heading", "text": "...", "level": 2 },
 *     { "type": "signal_embed", "signal_id": "uuid" }
 *   ]
 *
 *   The current mock stores body as string[], which maps directly to
 *   an array of { type: "paragraph", text: string } blocks. When you
 *   migrate, parse the JSONB and render each block type in ArticleDetail.
 *
 * ROW LEVEL SECURITY (RLS):
 *   — Public read:  SELECT WHERE published_at IS NOT NULL AND published_at <= now()
 *   — Admin write:  INSERT/UPDATE/DELETE WHERE auth.jwt() ->> 'role' = 'admin'
 *   — Draft access:  SELECT WHERE auth.jwt() ->> 'role' = 'admin' (sees all, including drafts)
 *
 * STORAGE BUCKETS:
 *   — 'article-images' — hero images, inline images
 *   — 'author-avatars' — author headshots
 *   Both should be public-read, admin-write.
 *
 * QUERIES TO REPLACE MOCK DATA:
 *
 *   // Fetch published articles (feed listing)
 *   const { data } = await supabase
 *     .from('articles')
 *     .select('*, author:authors(*)')
 *     .not('published_at', 'is', null)
 *     .lte('published_at', new Date().toISOString())
 *     .order('published_at', { ascending: false })
 *     .limit(20);
 *
 *   // Fetch single article by slug
 *   const { data } = await supabase
 *     .from('articles')
 *     .select('*, author:authors(*)')
 *     .eq('slug', slug)
 *     .not('published_at', 'is', null)
 *     .single();
 *
 *   // Fetch related articles (same category, excluding current)
 *   const { data } = await supabase
 *     .from('articles')
 *     .select('slug, title, category, image_url, read_time, published_at')
 *     .eq('category', currentArticle.category)
 *     .neq('slug', currentArticle.slug)
 *     .not('published_at', 'is', null)
 *     .order('published_at', { ascending: false })
 *     .limit(3);
 *
 *   // Fetch categories (for filter pills)
 *   const { data } = await supabase
 *     .from('article_categories')
 *     .select('*')
 *     .order('sort_order');
 *
 *   // Fetch ticker items (most recent N articles, lightweight)
 *   const { data } = await supabase
 *     .from('articles')
 *     .select('title, category, published_at')
 *     .not('published_at', 'is', null)
 *     .order('published_at', { ascending: false })
 *     .limit(10);
 *
 * REALTIME (optional — for the live ticker):
 *   Subscribe to new inserts on the articles table so the ticker
 *   updates without a page refresh:
 *
 *   supabase
 *     .channel('articles-realtime')
 *     .on('postgres_changes', {
 *       event: 'INSERT',
 *       schema: 'public',
 *       table: 'articles',
 *       filter: 'published_at=not.is.null',
 *     }, (payload) => {
 *       // Prepend to ticker items, trigger re-render
 *     })
 *     .subscribe();
 *
 * PAGINATION:
 *   The feed should use cursor-based pagination on published_at:
 *     .lt('published_at', lastArticle.published_at)
 *     .limit(12)
 *   Wire this to a "Load more" button or IntersectionObserver
 *   for infinite scroll in ArticleFeed.tsx.
 *
 * FULL-TEXT SEARCH (future):
 *   ALTER TABLE articles ADD COLUMN fts tsvector
 *     GENERATED ALWAYS AS (to_tsvector('english', title || ' ' || coalesce(subtitle,'') || ' ' || coalesce(excerpt,''))) STORED;
 *   CREATE INDEX articles_fts_idx ON articles USING gin(fts);
 *   Query: .textSearch('fts', searchQuery)
 *
 * ADMIN PORTAL INTEGRATION:
 *   Your admin portal should use the Supabase JS client with the
 *   service_role key (server-side only) or an authenticated admin
 *   session. Key admin operations:
 *
 *   — Create draft:      INSERT with published_at = NULL
 *   — Publish:           UPDATE SET published_at = now()
 *   — Unpublish:         UPDATE SET published_at = NULL
 *   — Schedule:          UPDATE SET published_at = future timestamp
 *   — Feature/unfeature: UPDATE SET is_featured = true/false
 *   — Image upload:      supabase.storage.from('article-images').upload(...)
 *   — Slug generation:   Auto-generate from title, check uniqueness
 *
 * FIELD MAPPING — Frontend (camelCase) → Supabase (snake_case):
 *   image       → image_url
 *   author      → JOIN authors ON articles.author_id = authors.id
 *   publishedAt → published_at
 *   readTime    → read_time
 *   relatedSignal.label → signal_label
 *   relatedSignal.value → signal_value
 *   isFeatured  → is_featured
 *
 *   function mapArticle(row: SupabaseArticleRow): Article {
 *     return {
 *       slug: row.slug,
 *       title: row.title,
 *       subtitle: row.subtitle,
 *       category: row.category,
 *       tag: row.tag,
 *       image: row.image_url,
 *       author: { name: row.author.name, role: row.author.role, avatar: row.author.avatar_url },
 *       publishedAt: row.published_at,
 *       readTime: row.read_time,
 *       excerpt: row.excerpt,
 *       body: (row.body as ContentBlock[]).filter(b => b.type === 'paragraph').map(b => b.text),
 *       relatedSignal: row.signal_label ? { label: row.signal_label, value: row.signal_value } : undefined,
 *       isFeatured: row.is_featured,
 *     };
 *   }
 *
 * MIGRATION PATH:
 *   1. Create tables + RLS policies in Supabase dashboard or via migration
 *   2. Seed with current mock data (this file) as initial articles
 *   3. Create a lib/supabase.ts client file
 *   4. Replace the exports below with async fetch functions
 *   5. Update ArticleFeed.tsx and ArticleDetail.tsx to use
 *      useEffect/useState (or React Router loaders) for data fetching
 *   6. Add loading skeletons to both pages
 *   7. Connect admin portal CRUD to the same tables
 *
 * ═══════════════════════════════════════════════════════════════════
 */

export interface Article {
  slug: string;
  title: string;
  subtitle: string;
  category: string;
  tag: string;
  image: string;
  author: Author;
  publishedAt: string;
  readTime: number;
  excerpt: string;
  body: string[];
  relatedSignal?: { label: string; value: string };
  isFeatured?: boolean;
}

const AUTHORS: Record<string, Author> = {
  elena: {
    name: 'Elena Vasquez',
    role: 'Clinical Intelligence Lead',
    avatar: 'https://images.unsplash.com/photo-1586710743864-260430279452?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=80',
  },
  marcus: {
    name: 'Marcus Chen',
    role: 'Market Signals Editor',
    avatar: 'https://images.unsplash.com/photo-1769962568274-cf73ea02f7ca?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=80',
  },
  socelle: {
    name: 'Socelle Intelligence',
    role: 'Editorial Desk',
    avatar: '',
  },
};

export const articles: Article[] = [
  {
    slug: 'neurotoxin-demand-surges-q1-2026',
    title: 'Neurotoxin Demand Surges 23% in Q1 — Driven by Gen Z Micro-Dosing Protocols',
    subtitle: 'A generation rewriting the treatment playbook is pulling neurotoxin volume to record highs. The data shows why, and what it means for procurement.',
    category: 'Market Signal',
    tag: 'Injectables',
    image: 'https://images.unsplash.com/photo-1601839777132-b3f4e455c369?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080',
    author: AUTHORS.marcus,
    publishedAt: '2026-03-07T08:30:00Z',
    readTime: 7,
    excerpt: 'Neurotoxin orders across verified medspa accounts surged 23.1% in Q1 2026 compared to Q4 2025, marking the sharpest single-quarter acceleration since Socelle began tracking the category.',
    body: [
      'Neurotoxin orders across verified medspa accounts surged 23.1% in Q1 2026 compared to Q4 2025, marking the sharpest single-quarter acceleration since Socelle began tracking the category. The driver isn\'t volume from existing patients — it\'s an entirely new demand cohort.',
      'Patients aged 22–29 now represent 31% of all neurotoxin treatment bookings, up from 19% twelve months ago. The protocol shift is decisive: practitioners report that this cohort overwhelmingly requests "micro-dosing" — lower unit counts distributed across broader injection sites, optimized for subtle movement preservation rather than full immobilization.',
      'The clinical implications are real. Micro-dosing protocols typically use 15–25 units per session versus the traditional 40–60 units, but treatment frequency has nearly doubled — from every 4–6 months to every 8–12 weeks. The net effect on procurement: per-patient annual spend is up 34%, and reorder velocity for toxin SKUs has accelerated across every region we track.',
      '"This isn\'t a trend. It\'s a structural shift in how the next generation thinks about maintenance," says Dr. Rachel Simone, a Manhattan-based facial plastic surgeon whose Gen Z bookings are up 41% year-over-year. "They\'re not waiting for lines to form. They\'re preventing them from ever appearing."',
      'For brands and distributors, the message is clear: the micro-dosing cohort demands clinical education, nuanced dilution guidance, and predictable supply at the lower-unit price points. Allergan, Revance, and Evolus have each adjusted their practitioner education materials in the last 90 days to address the protocol shift — a signal that the manufacturers see this as permanent.',
      'Socelle\'s procurement data confirms the regional spread is uniform. Southeast clinics led the curve in Q4 2025, but West Coast and Northeast accounts have converged. The only lagging region is the Midwest, where Gen Z appointment mix remains below 20% — a gap that regional distributors should view as an acquisition opportunity.',
    ],
    relatedSignal: { label: 'Neurotoxin Demand', value: '+23.1%' },
    isFeatured: true,
  },
  {
    slug: 'revance-dtc-medspa-partnerships',
    title: 'Revance Expands DTC Partnerships with 12 New Medspa Networks Across the Southeast',
    subtitle: 'The DAXXIFY maker\'s channel strategy gets more aggressive — and more direct.',
    category: 'Brand Intel',
    tag: 'Partnerships',
    image: 'https://images.unsplash.com/photo-1696497327679-6417a353e61c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080',
    author: AUTHORS.elena,
    publishedAt: '2026-03-07T06:15:00Z',
    readTime: 5,
    excerpt: 'Revance Therapeutics has signed direct partnership agreements with 12 multi-location medspa networks in the Southeast, bypassing traditional distributor channels in its most aggressive direct-to-clinic push to date.',
    body: [
      'Revance Therapeutics has signed direct partnership agreements with 12 multi-location medspa networks in the Southeast, bypassing traditional distributor channels in its most aggressive direct-to-clinic push to date.',
      'The partnerships cover approximately 87 individual clinic locations across Florida, Georgia, Tennessee, and the Carolinas, representing an estimated $4.2M in annual toxin procurement. Each agreement includes volume-based pricing tiers, dedicated clinical education support, and co-branded patient acquisition marketing — a bundle designed to undercut the traditional distributor value proposition.',
      'This is the second phase of Revance\'s DTC strategy, which began quietly in Q3 2025 with three pilot networks in South Florida. Socelle\'s intelligence feeds first flagged the pattern when we detected unusual reorder velocities from non-distributor accounts — a signal that the traditional supply chain was being circumvented.',
      'For independent medspas not affiliated with these networks, the competitive implications are direct: the partner clinics will have preferential pricing on DAXXIFY that may not be available through standard distributor catalogs. Practitioners sourcing through traditional channels should monitor their landed cost per unit carefully over the next 60 days.',
    ],
    relatedSignal: { label: 'Revance DTC Volume', value: '+87 clinics' },
  },
  {
    slug: 'fda-clears-biostimulator-collagen-pathway',
    title: 'FDA Clears Next-Gen Biostimulator Collagen Pathway — Phase III Data Exceeds Endpoints',
    subtitle: 'The regulatory green light that could reshape the filler category entirely.',
    category: 'Clinical Data',
    tag: 'Regulatory',
    image: 'https://images.unsplash.com/photo-1633095073245-c37482182d4c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080',
    author: AUTHORS.socelle,
    publishedAt: '2026-03-06T22:00:00Z',
    readTime: 6,
    excerpt: 'The FDA has issued clearance for a novel biostimulatory collagen pathway mechanism, following Phase III trial results that exceeded primary and secondary endpoints by statistically significant margins.',
    body: [
      'The FDA has issued clearance for a novel biostimulatory collagen pathway mechanism, following Phase III trial results that exceeded primary and secondary endpoints by statistically significant margins. The approval creates a new regulatory classification for collagen-stimulating injectables that operate through a fundamentally different mechanism than existing HA or CaHA fillers.',
      'The Phase III data, drawn from a 1,247-patient, double-blind, multi-center trial, showed 78% of subjects achieving clinically meaningful improvement at 12 months — compared to 52% in the active comparator arm. More significantly, collagen density measurements via high-frequency ultrasound showed sustained neocollagenesis at 18 months post-treatment, suggesting durability that current biostimulators have struggled to demonstrate.',
      'For practitioners, this represents a genuine category expansion rather than a competitive substitution. The mechanism targets Type I and Type III collagen synthesis simultaneously — a dual pathway that existing poly-L-lactic acid and calcium hydroxylapatite products do not address. Early-adopter clinics that establish protocol expertise will have a meaningful first-mover advantage.',
      'Socelle will track adoption curves, practitioner sentiment, and competitive pricing dynamics as the product enters commercial distribution. Expect our first procurement signal report within 30 days of launch.',
    ],
    relatedSignal: { label: 'Biostimulator Interest', value: '+156%' },
  },
  {
    slug: 'prejuvenation-spending-under-30',
    title: 'Prejuvenation Spending by Patients Under 30 Up 41% Year-Over-Year',
    subtitle: 'The preventive aesthetics economy is no longer emerging — it\'s arrived.',
    category: 'Market Signal',
    tag: 'Demographics',
    image: 'https://images.unsplash.com/photo-1758520145147-c30bc656f314?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080',
    author: AUTHORS.marcus,
    publishedAt: '2026-03-06T14:00:00Z',
    readTime: 8,
    excerpt: 'Total aesthetic treatment spending by patients under 30 increased 41% year-over-year, with the average annual spend per patient reaching $3,847 — a figure that now exceeds the 30–39 cohort for the first time in Socelle tracking history.',
    body: [
      'Total aesthetic treatment spending by patients under 30 increased 41% year-over-year, with the average annual spend per patient reaching $3,847 — a figure that now exceeds the 30–39 cohort for the first time in Socelle tracking history.',
      'The category composition tells the real story. Under-30 spending is concentrated in three protocol families: neurotoxin micro-dosing (accounting for 38% of spend), skin quality treatments like microneedling with growth factors (27%), and energy-based devices for preventive skin tightening (19%). Traditional volumizing fillers represent less than 8% of the under-30 mix — a mirror opposite of the 45+ cohort\'s spending allocation.',
      'The behavior pattern is what practitioners should internalize: this generation treats aesthetics as maintenance, not correction. They budget for treatments the way previous generations budgeted for gym memberships or high-end skincare. The typical under-30 patient visits their practitioner 6.2 times per year — nearly double the 3.4 visits averaged across all age groups.',
      'For practice economics, the math is compelling. Higher visit frequency compensates for lower per-visit ticket: under-30 patients generate $3,847 annually vs. $4,210 for the 40–54 cohort, but their retention rates are dramatically better — 89% rebook within 90 days, compared to 61% for older cohorts. The lifetime value calculation tilts decisively toward younger patients.',
      'Medspas that haven\'t adjusted their marketing, scheduling, and protocol menus for the prejuvenation cohort are leaving revenue on the table. The data is no longer ambiguous.',
    ],
    relatedSignal: { label: 'Under-30 Spend', value: '+41% YoY' },
  },
  {
    slug: 'allergan-reformulated-ha-filler-line-2026',
    title: 'Allergan Aesthetics Announces Reformulated Hyaluronic Acid Filler Line for 2026',
    subtitle: 'The Juvederm franchise gets its most significant reformulation in a decade.',
    category: 'Brand Intel',
    tag: 'Product Launch',
    image: 'https://images.unsplash.com/photo-1696497327679-6417a353e61c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080',
    author: AUTHORS.elena,
    publishedAt: '2026-03-06T10:30:00Z',
    readTime: 5,
    excerpt: 'Allergan Aesthetics has confirmed a comprehensive reformulation of its Juvederm hyaluronic acid filler portfolio, scheduled for phased commercial launch beginning Q3 2026.',
    body: [
      'Allergan Aesthetics has confirmed a comprehensive reformulation of its Juvederm hyaluronic acid filler portfolio, scheduled for phased commercial launch beginning Q3 2026. The reformulation represents the first major technology update to the franchise since the VYCROSS platform was introduced over a decade ago.',
      'Key technical changes include a proprietary cross-linking technology that Allergan claims improves tissue integration by 40%, reduced swelling profiles in clinical testing, and extended durability projections. The reformulated line will maintain the existing product naming architecture (Voluma, Vollure, Volbella) but with a "Next" designation during the transition period.',
      'For practitioners, the reformulation means retraining. Injection technique adjustments will be required, and Allergan is planning a national education tour beginning in Q2. Early-access practitioners who participate in the training program will receive preferential launch pricing — a detail worth tracking for procurement planning.',
      'Socelle\'s competitive intelligence team is monitoring how Galderma, Revance, and Evolus respond. The reformulation puts pressure on every filler manufacturer to articulate their technology narrative with renewed clarity. Expect pricing dynamics to shift as the launch approaches.',
    ],
    relatedSignal: { label: 'HA Filler Category', value: 'Reformulation' },
  },
  {
    slug: 'california-ab-1742-injector-supervision',
    title: 'California AB-1742 Tightens Nurse Injector Supervision Ratios — Effective July 1',
    subtitle: 'The regulation that will reshape clinic staffing models across the state.',
    category: 'Regulatory',
    tag: 'Compliance',
    image: 'https://images.unsplash.com/photo-1633095073245-c37482182d4c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080',
    author: AUTHORS.socelle,
    publishedAt: '2026-03-05T18:00:00Z',
    readTime: 6,
    excerpt: 'California Assembly Bill 1742 mandates a maximum 3:1 nurse-to-physician supervision ratio for cosmetic injectable procedures, down from the current de facto standard of 5:1 or higher in many multi-provider clinics.',
    body: [
      'California Assembly Bill 1742 mandates a maximum 3:1 nurse-to-physician supervision ratio for cosmetic injectable procedures, down from the current de facto standard of 5:1 or higher in many multi-provider clinics. The bill, signed in January, takes effect July 1, 2026.',
      'The operational impact is significant. Socelle\'s analysis of California medspa staffing data suggests that approximately 34% of multi-provider clinics currently operate above the new 3:1 threshold. These clinics face a binary choice: hire additional supervising physicians or reduce nurse injector capacity. Either path compresses margins.',
      'For solo practitioners and small clinics already within the ratio, the regulation is a competitive advantage. Their capacity remains unchanged while larger competitors absorb restructuring costs. The period between now and July 1 represents a window for compliant clinics to capture patients who may experience scheduling disruptions at larger practices.',
      'Industry observers expect other states to watch California\'s implementation closely. Arizona, Florida, and Texas have similar legislative frameworks under committee review. Practitioners outside California should monitor their state medical board guidance proactively.',
      'Socelle will publish a compliance tracker with state-by-state supervision ratio regulations and pending legislation updates on the Intelligence feed.',
    ],
    relatedSignal: { label: 'CA Supervision', value: '3:1 Ratio' },
  },
  {
    slug: 'glp-1-body-contouring-adjacency',
    title: 'GLP-1 Body Contouring Adjacency Drives 18% Lift in Combination Protocol Bookings',
    subtitle: 'Weight loss drugs aren\'t killing aesthetics — they\'re creating a new protocol category.',
    category: 'Market Signal',
    tag: 'Emerging',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080',
    author: AUTHORS.marcus,
    publishedAt: '2026-03-05T12:00:00Z',
    readTime: 9,
    excerpt: 'Medspas reporting GLP-1-adjacent body contouring protocols saw an 18% increase in combination treatment bookings in Q1 2026, as practitioners develop post-weight-loss treatment pathways that address skin laxity, volume loss, and body sculpting.',
    body: [
      'Medspas reporting GLP-1-adjacent body contouring protocols saw an 18% increase in combination treatment bookings in Q1 2026, as practitioners develop post-weight-loss treatment pathways that address skin laxity, volume loss, and body sculpting.',
      'The narrative that GLP-1 agonists would cannibalize the aesthetics industry has proven exactly wrong. Patients losing significant weight through semaglutide and tirzepatide are arriving at medspas with a new set of concerns — and willingness to spend.',
      'The most common combination protocols include radiofrequency skin tightening (booked alongside 67% of GLP-1-adjacent consults), biostimulator injections for facial volume restoration (43%), and non-invasive body contouring to address residual fat deposits (38%). The average per-patient spend on combination protocols is $6,200 per treatment cycle — nearly double the standard body contouring ticket.',
      'Practitioners who have built dedicated GLP-1-adjacent consultation pathways report 73% conversion rates from consult to treatment. The key insight: these patients are highly motivated, clinically informed (they\'re already managing a prescription medication), and budgeting for aesthetic maintenance as part of their overall transformation.',
      'The procurement implications are direct. Demand for RF devices, biostimulatory injectables, and medical-grade body care SKUs is rising in lockstep with the GLP-1 patient pipeline. Practitioners should review their device and injectables inventory through this lens.',
    ],
    relatedSignal: { label: 'GLP-1 Adjacent', value: '+18% bookings' },
  },
  {
    slug: 'amorepacific-professional-channel-entry',
    title: 'Amorepacific Enters the Professional Channel with Clinical-Grade SKUs',
    subtitle: 'The K-beauty giant makes its medspa play — and it\'s more clinical than cosmetic.',
    category: 'Brand Intel',
    tag: 'New to Network',
    image: 'https://images.unsplash.com/photo-1610880751259-336abcd99bd7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080',
    author: AUTHORS.elena,
    publishedAt: '2026-03-04T16:00:00Z',
    readTime: 5,
    excerpt: 'Korean beauty conglomerate Amorepacific has launched a dedicated professional-channel division targeting U.S. medspas and dermatology practices, debuting with a 14-SKU clinical skincare line formulated specifically for post-procedure recovery.',
    body: [
      'Korean beauty conglomerate Amorepacific has launched a dedicated professional-channel division targeting U.S. medspas and dermatology practices, debuting with a 14-SKU clinical skincare line formulated specifically for post-procedure recovery and professional treatment protocols.',
      'The product line — branded as "Amore Clinical" rather than under any existing consumer brand — includes post-laser recovery serums, injectable-adjacent skin prep formulations, and a peptide-complex treatment system designed for in-office use. Each SKU carries clinical trial documentation meeting U.S. practitioner standards, a deliberate departure from the marketing-led approach typical of K-beauty consumer launches.',
      'Amorepacific\'s market intelligence is sound. Korean beauty protocols have shown 27.4% growth in U.S. practitioner adoption over the past 12 months, driven largely by glass skin and skin-barrier-first treatment philosophies. By entering the professional channel with clinical rather than cosmetic positioning, Amorepacific avoids competing with its own consumer brands while addressing a genuine gap in the professional product landscape.',
      'Socelle will publish a full brand profile with clinical documentation assessment, competitive positioning analysis, and early practitioner adoption signals within 14 days of distribution launch.',
    ],
    relatedSignal: { label: 'K-Beauty Professional', value: '+27.4%' },
  },
  {
    slug: 'exosome-therapy-meta-analysis',
    title: 'Exosome Therapy Meta-Analysis Shows 2.4x Improvement in Skin Quality Metrics vs. PRP',
    subtitle: 'The evidence is accumulating — and it\'s starting to shift clinical consensus.',
    category: 'Clinical Data',
    tag: 'Research',
    image: 'https://images.unsplash.com/photo-1743338960176-02107775b73d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080',
    author: AUTHORS.elena,
    publishedAt: '2026-03-04T09:00:00Z',
    readTime: 8,
    excerpt: 'A comprehensive meta-analysis spanning 23 clinical studies and 4,847 patients shows exosome-based skin rejuvenation therapies producing 2.4x improvement in composite skin quality metrics compared to platelet-rich plasma (PRP) treatments.',
    body: [
      'A comprehensive meta-analysis spanning 23 clinical studies and 4,847 patients shows exosome-based skin rejuvenation therapies producing 2.4x improvement in composite skin quality metrics compared to platelet-rich plasma (PRP) treatments.',
      'The analysis, aggregated from published and pre-print studies conducted between 2023 and 2025, measured outcomes across four dimensions: skin texture improvement, hydration levels, elasticity, and patient satisfaction scores. Exosome therapies outperformed PRP on all four metrics, with the most pronounced advantage in texture improvement (2.8x) and patient satisfaction (2.1x).',
      'The durability data is equally compelling. At 6 months post-treatment, exosome-treated skin maintained 71% of peak improvement versus 43% for PRP. At 12 months, the gap widened further: 58% vs. 29%. For practitioners, this translates to a stronger clinical narrative for patient retention — better results that last longer justify the premium pricing.',
      'The regulatory landscape remains complex. Exosome products are classified differently across FDA, EMA, and Asian regulatory frameworks, and practitioners must navigate sourcing carefully. Socelle\'s compliance team flags exosome sourcing as one of the highest-risk procurement categories currently — not because the science is questionable, but because product quality variance between suppliers is extreme.',
      'Our recommendation: practitioners interested in adding exosome protocols should source exclusively from suppliers with published lot-level potency data and third-party purity testing. We\'ll be updating our supplier verification criteria for the exosome category in the next Intelligence report.',
    ],
    relatedSignal: { label: 'Exosome Interest', value: '+67.3%' },
  },
  {
    slug: 'intelligence-summit-miami-2026',
    title: 'Socelle Intelligence Summit Miami — What to Expect',
    subtitle: 'Three days of market data, clinical evidence, and the practitioners who shape what\'s next.',
    category: 'Event',
    tag: 'Summit 2026',
    image: 'https://images.unsplash.com/photo-1610207928705-0ecd72bd4b6e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080',
    author: AUTHORS.socelle,
    publishedAt: '2026-03-03T12:00:00Z',
    readTime: 4,
    excerpt: 'The inaugural Socelle Intelligence Summit brings together 1,200 practitioners, brand leaders, and clinical researchers for three days of data-driven programming in Miami Beach, April 15–17.',
    body: [
      'The inaugural Socelle Intelligence Summit brings together 1,200 practitioners, brand leaders, and clinical researchers for three days of data-driven programming in Miami Beach, April 15–17.',
      'Unlike traditional aesthetics conferences that rely on sponsored keynotes and vendor booths, the Intelligence Summit is structured around Socelle\'s real-time market data. Each session pairs a clinical topic with the procurement and market signal data that contextualizes it — so practitioners leave not just with technique knowledge, but with actionable buying intelligence.',
      'Confirmed programming includes the Q1 Market Intelligence Briefing (a live walkthrough of the data powering this feed), a practitioner panel on navigating the GLP-1 body contouring adjacency, and a hands-on peptide protocol masterclass led by three of the highest-rated practitioners in the Socelle network.',
      'Early-bird registration closes March 28. Priority access is available to existing Socelle network members. If you\'re reading this feed, you\'re already in the network — check your dashboard for your personalized registration link.',
    ],
    relatedSignal: { label: 'Summit Registrations', value: '847 / 1,200' },
  },
];

/*
 * ═══════════════════════════════════════════════════════════════════
 * SUPABASE SWAP POINT — Replace these sync functions with async
 * ═══════════════════════════════════════════════════════════════════
 *
 * When Supabase is connected, replace getArticleBySlug and
 * getRelatedArticles with async versions that query the DB.
 * Use React Router loaders or useEffect + useState in the pages.
 *
 * Example with React Router loader (preferred):
 *
 *   // In routes.ts:
 *   {
 *     path: 'intelligence/feed/:slug',
 *     Component: ArticleDetail,
 *     loader: async ({ params }) => {
 *       const { data: article } = await supabase
 *         .from('articles')
 *         .select('*, author:authors(*)')
 *         .eq('slug', params.slug)
 *         .not('published_at', 'is', null)
 *         .single();
 *       if (!article) throw new Response('Not Found', { status: 404 });
 *       return { article: mapArticle(article) };
 *     },
 *   }
 *
 *   // In ArticleDetail.tsx:
 *   import { useLoaderData } from 'react-router';
 *   const { article } = useLoaderData() as { article: Article };
 *
 * ═══════════════════════════════════════════════════════════════════
 */
export function getArticleBySlug(slug: string): Article | undefined {
  return articles.find((a) => a.slug === slug);
}

export function getRelatedArticles(slug: string, count = 3): Article[] {
  const current = articles.find((a) => a.slug === slug);
  if (!current) return articles.slice(0, count);
  return articles
    .filter((a) => a.slug !== slug)
    .sort((a, b) => {
      const aMatch = a.category === current.category ? 1 : 0;
      const bMatch = b.category === current.category ? 1 : 0;
      return bMatch - aMatch;
    })
    .slice(0, count);
}

export const ARTICLE_CATEGORIES = ['All', ...Array.from(new Set(articles.map((a) => a.category)))];
