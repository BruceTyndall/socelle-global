import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import {
  Code,
  ChevronDown,
  ChevronRight,
  Lock,
  Zap,
  ArrowRight,
  Copy,
  Check,
  BookOpen,
  Shield,
  Clock,
} from 'lucide-react';
import MainNav from '../../components/MainNav';
import BlockReveal from '../../components/motion/BlockReveal';
import WordReveal from '../../components/motion/WordReveal';
import SiteFooter from '../../components/sections/SiteFooter';
import { getApiEndpoints } from '../../lib/api/mockApiData';
import type { ApiEndpoint } from '../../lib/api/types';

// ── Method badge colors (mineral) ───────────────────────────────────
const METHOD_COLORS: Record<string, string> = {
  GET: 'bg-signal-up/10 text-signal-up',
  POST: 'bg-accent/10 text-accent',
  PUT: 'bg-signal-warn/10 text-signal-warn',
  DELETE: 'bg-signal-down/10 text-signal-down',
};

// ── Tier badge labels ───────────────────────────────────────────────
const TIER_LABELS: Record<string, string> = {
  starter: 'Starter+',
  professional: 'Professional+',
  enterprise: 'Enterprise',
};

const TIER_BADGE: Record<string, string> = {
  starter: 'bg-mn-surface text-[rgba(30,37,43,0.62)]',
  professional: 'bg-accent/10 text-accent',
  enterprise: 'bg-signal-warn/10 text-signal-warn',
};

// ── Code examples ───────────────────────────────────────────────────
const CODE_EXAMPLES = {
  curl: `curl -X GET "https://api.socelle.com/v1/intelligence/signals?category=skincare&limit=10" \\
  -H "Authorization: Bearer sk_live_your_api_key" \\
  -H "Content-Type: application/json"`,
  javascript: `const response = await fetch(
  "https://api.socelle.com/v1/intelligence/signals?category=skincare&limit=10",
  {
    headers: {
      "Authorization": "Bearer sk_live_your_api_key",
      "Content-Type": "application/json",
    },
  }
);

const data = await response.json();
console.log(data.data); // Array of intelligence signals`,
  python: `import requests

response = requests.get(
    "https://api.socelle.com/v1/intelligence/signals",
    params={"category": "skincare", "limit": 10},
    headers={
        "Authorization": "Bearer sk_live_your_api_key",
        "Content-Type": "application/json",
    },
)

data = response.json()
print(data["data"])  # List of intelligence signals`,
};

type CodeLang = keyof typeof CODE_EXAMPLES;

// ── Nav sections ────────────────────────────────────────────────────
const NAV_SECTIONS = [
  { id: 'authentication', label: 'Authentication', icon: Lock },
  { id: 'base-url', label: 'Base URL', icon: BookOpen },
  { id: 'endpoints', label: 'Endpoints', icon: Zap },
  { id: 'rate-limiting', label: 'Rate Limiting', icon: Clock },
  { id: 'examples', label: 'Code Examples', icon: Code },
];

// ── Endpoint Card ───────────────────────────────────────────────────
function EndpointCard({ endpoint }: { endpoint: ApiEndpoint }) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyResponse = () => {
    navigator.clipboard.writeText(endpoint.responseExample);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white/60 backdrop-blur-[12px] border border-white/30 rounded-2xl overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-6 py-4 hover:bg-mn-surface/50 transition-colors text-left"
      >
        <div className="flex items-center gap-3 flex-wrap">
          <span
            className={`inline-block px-2.5 py-1 rounded-lg text-xs font-bold font-mono uppercase tracking-wide ${METHOD_COLORS[endpoint.method]}`}
          >
            {endpoint.method}
          </span>
          <code className="text-sm font-mono text-graphite">{endpoint.path}</code>
          <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-sans font-semibold ${TIER_BADGE[endpoint.tier]}`}>
            {TIER_LABELS[endpoint.tier]}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-[rgba(30,37,43,0.62)] hidden md:block font-sans">{endpoint.summary}</span>
          {expanded ? (
            <ChevronDown className="w-4 h-4 text-[rgba(30,37,43,0.42)] flex-shrink-0" />
          ) : (
            <ChevronRight className="w-4 h-4 text-[rgba(30,37,43,0.42)] flex-shrink-0" />
          )}
        </div>
      </button>

      {expanded && (
        <div className="border-t border-[rgba(30,37,43,0.06)] px-6 py-5 space-y-5">
          <p className="text-sm text-[rgba(30,37,43,0.62)] font-sans leading-relaxed">
            {endpoint.description}
          </p>

          {/* Parameters table */}
          {endpoint.params.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-graphite mb-3 font-sans">Parameters</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[rgba(30,37,43,0.08)]">
                      <th className="text-left py-2 pr-4 font-semibold text-graphite font-sans">Name</th>
                      <th className="text-left py-2 pr-4 font-semibold text-graphite font-sans">Type</th>
                      <th className="text-left py-2 pr-4 font-semibold text-graphite font-sans">Required</th>
                      <th className="text-left py-2 font-semibold text-graphite font-sans">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {endpoint.params.map((param) => (
                      <tr key={param.name} className="border-b border-[rgba(30,37,43,0.04)]">
                        <td className="py-2 pr-4">
                          <code className="text-xs font-mono text-accent bg-accent/[0.06] px-1.5 py-0.5 rounded">
                            {param.name}
                          </code>
                        </td>
                        <td className="py-2 pr-4 text-xs text-[rgba(30,37,43,0.42)] font-mono">{param.type}</td>
                        <td className="py-2 pr-4">
                          {param.required ? (
                            <span className="text-xs font-semibold text-signal-warn">Required</span>
                          ) : (
                            <span className="text-xs text-[rgba(30,37,43,0.42)]">Optional</span>
                          )}
                        </td>
                        <td className="py-2 text-xs text-[rgba(30,37,43,0.62)] font-sans">{param.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Response example */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-graphite font-sans">Response Example</h4>
              <button
                onClick={handleCopyResponse}
                className="flex items-center gap-1.5 text-xs text-[rgba(30,37,43,0.42)] hover:text-graphite transition-colors font-sans"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
            <pre className="bg-mn-dark text-[#F7F5F2] rounded-2xl p-5 text-xs font-mono overflow-x-auto leading-relaxed">
              {endpoint.responseExample}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Page ───────────────────────────────────────────────────────
export default function ApiDocs() {
  const endpoints = getApiEndpoints();
  const [activeTab, setActiveTab] = useState<CodeLang>('curl');
  const [activeSection, setActiveSection] = useState('authentication');

  const codeTabs: { key: CodeLang; label: string }[] = [
    { key: 'curl', label: 'cURL' },
    { key: 'javascript', label: 'JavaScript' },
    { key: 'python', label: 'Python' },
  ];

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-mn-bg font-sans">
      <Helmet>
        <title>API Documentation | Socelle Intelligence</title>
        <meta
          name="description"
          content="Explore the Socelle Intelligence API. License professional beauty market signals, trend data, brand analytics, and custom reports programmatically."
        />
        <link rel="canonical" href="https://socelle.com/api/docs" />
      </Helmet>
      <MainNav />

      {/* ── Hero ──────────────────────────────────────── */}
      <section className="relative py-20 lg:py-28 overflow-hidden">
        <div className="section-container text-center">
          <BlockReveal>
            <p className="mn-eyebrow mb-5">Developer API</p>
          </BlockReveal>
          <WordReveal
            text="API Documentation"
            as="h1"
            className="font-sans font-semibold text-hero text-graphite mb-6 justify-center"
          />
          <BlockReveal delay={200}>
            <p className="text-graphite/60 font-sans text-body-lg max-w-2xl mx-auto leading-relaxed">
              License professional beauty market intelligence programmatically. Access real-time signals,
              trend analytics, brand performance data, and custom reports through a simple REST API.
            </p>
          </BlockReveal>
          <BlockReveal delay={300}>
            <div className="flex items-center justify-center gap-4 mt-10">
              <Link to="/api/pricing" className="btn-mineral-dark">
                Get API Access
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </BlockReveal>
        </div>
      </section>

      {/* ── Tab-style section nav ──────────────────────────────────── */}
      <div className="sticky top-14 z-40 bg-white/80 backdrop-blur-lg border-b border-[rgba(30,37,43,0.08)]">
        <div className="section-container">
          <div className="flex gap-1 overflow-x-auto py-2">
            {NAV_SECTIONS.map((sec) => {
              const Icon = sec.icon;
              return (
                <button
                  key={sec.id}
                  onClick={() => scrollToSection(sec.id)}
                  className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-sans font-medium whitespace-nowrap transition-all ${
                    activeSection === sec.id
                      ? 'bg-[#1F2428] text-[#F7F5F2]'
                      : 'text-[rgba(30,37,43,0.62)] hover:bg-mn-surface hover:text-graphite'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {sec.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="section-container py-16 space-y-16">
        {/* ── Authentication ──────────────────────────── */}
        <section id="authentication">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-accent/10 flex items-center justify-center">
              <Lock className="w-5 h-5 text-accent" />
            </div>
            <h2 className="font-sans text-subsection text-graphite">Authentication</h2>
          </div>
          <div className="bg-white/60 backdrop-blur-[12px] border border-white/30 rounded-2xl p-6 space-y-4">
            <p className="text-sm text-[rgba(30,37,43,0.62)] font-sans leading-relaxed">
              All API requests require authentication via a Bearer token in the{' '}
              <code className="text-xs font-mono bg-mn-surface px-1.5 py-0.5 rounded text-accent">
                Authorization
              </code>{' '}
              header. API keys are provisioned when you subscribe to an API plan and can be managed
              from your dashboard.
            </p>
            <div className="bg-mn-dark rounded-2xl p-4">
              <code className="text-sm font-mono text-[#F7F5F2]">
                Authorization: Bearer sk_live_your_api_key
              </code>
            </div>
            <div className="flex items-start gap-3 bg-signal-warn/[0.06] border border-signal-warn/20 rounded-2xl p-4">
              <Shield className="w-5 h-5 text-signal-warn flex-shrink-0 mt-0.5" />
              <p className="text-sm text-graphite font-sans">
                Keep your API key secure. Do not expose it in client-side code or public repositories.
                If compromised, rotate your key immediately from the API dashboard.
              </p>
            </div>
          </div>
        </section>

        {/* ── Base URL ────────────────────────────────── */}
        <section id="base-url">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-accent/10 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-accent" />
            </div>
            <h2 className="font-sans text-subsection text-graphite">Base URL</h2>
          </div>
          <div className="bg-white/60 backdrop-blur-[12px] border border-white/30 rounded-2xl p-6">
            <div className="bg-mn-dark rounded-2xl p-4">
              <code className="text-sm font-mono text-[#F7F5F2]">
                https://api.socelle.com
              </code>
            </div>
            <p className="text-sm text-[rgba(30,37,43,0.62)] font-sans mt-3">
              All endpoints are relative to this base URL. The API uses HTTPS exclusively and returns
              JSON responses.
            </p>
          </div>
        </section>

        {/* ── Endpoints ───────────────────────────────── */}
        <section id="endpoints">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-accent/10 flex items-center justify-center">
              <Zap className="w-5 h-5 text-accent" />
            </div>
            <h2 className="font-sans text-subsection text-graphite">Endpoints</h2>
          </div>
          <p className="text-sm text-[rgba(30,37,43,0.62)] font-sans mb-6">
            Click any endpoint to expand its full documentation, including parameters and response examples.
          </p>
          <div className="space-y-3">
            {endpoints.map((ep) => (
              <EndpointCard key={ep.id} endpoint={ep} />
            ))}
          </div>
        </section>

        {/* ── Rate Limiting ───────────────────────────── */}
        <section id="rate-limiting">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-accent/10 flex items-center justify-center">
              <Clock className="w-5 h-5 text-accent" />
            </div>
            <h2 className="font-sans text-subsection text-graphite">Rate Limiting</h2>
          </div>
          <div className="bg-white/60 backdrop-blur-[12px] border border-white/30 rounded-2xl p-6 space-y-4">
            <p className="text-sm text-[rgba(30,37,43,0.62)] font-sans leading-relaxed">
              Rate limits are enforced per API key on a per-minute sliding window. When you exceed your
              rate limit, the API returns a{' '}
              <code className="text-xs font-mono bg-mn-surface px-1.5 py-0.5 rounded text-accent">
                429 Too Many Requests
              </code>{' '}
              status with a{' '}
              <code className="text-xs font-mono bg-mn-surface px-1.5 py-0.5 rounded text-accent">
                Retry-After
              </code>{' '}
              header indicating when to retry.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[rgba(30,37,43,0.08)]">
                    <th className="text-left py-3 pr-6 font-semibold text-graphite font-sans">Tier</th>
                    <th className="text-left py-3 pr-6 font-semibold text-graphite font-sans">Requests/Minute</th>
                    <th className="text-left py-3 font-semibold text-graphite font-sans">Monthly Quota</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-[rgba(30,37,43,0.04)]">
                    <td className="py-3 pr-6 text-graphite font-sans">Starter</td>
                    <td className="py-3 pr-6 font-mono text-sm">30</td>
                    <td className="py-3 font-mono text-sm">10,000</td>
                  </tr>
                  <tr className="border-b border-[rgba(30,37,43,0.04)]">
                    <td className="py-3 pr-6 text-graphite font-sans">Professional</td>
                    <td className="py-3 pr-6 font-mono text-sm">120</td>
                    <td className="py-3 font-mono text-sm">100,000</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-6 text-graphite font-sans">Enterprise</td>
                    <td className="py-3 pr-6 font-mono text-sm">600+</td>
                    <td className="py-3 font-mono text-sm">Unlimited</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-sm text-[rgba(30,37,43,0.62)] font-sans">
              Rate limit headers are included in every response:{' '}
              <code className="text-xs font-mono bg-mn-surface px-1.5 py-0.5 rounded text-accent">
                X-RateLimit-Limit
              </code>
              ,{' '}
              <code className="text-xs font-mono bg-mn-surface px-1.5 py-0.5 rounded text-accent">
                X-RateLimit-Remaining
              </code>
              ,{' '}
              <code className="text-xs font-mono bg-mn-surface px-1.5 py-0.5 rounded text-accent">
                X-RateLimit-Reset
              </code>
              .
            </p>
          </div>
        </section>

        {/* ── Code Examples ───────────────────────────── */}
        <section id="examples">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-accent/10 flex items-center justify-center">
              <Code className="w-5 h-5 text-accent" />
            </div>
            <h2 className="font-sans text-subsection text-graphite">Code Examples</h2>
          </div>
          <div className="bg-white/60 backdrop-blur-[12px] border border-white/30 rounded-2xl overflow-hidden">
            {/* Tab bar */}
            <div className="flex border-b border-[rgba(30,37,43,0.06)]">
              {codeTabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-5 py-3 text-sm font-semibold font-sans transition-colors ${
                    activeTab === tab.key
                      ? 'text-accent border-b-2 border-accent bg-accent/[0.04]'
                      : 'text-[rgba(30,37,43,0.42)] hover:text-graphite'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <pre className="bg-mn-dark text-[#F7F5F2] p-6 text-sm font-mono overflow-x-auto leading-relaxed rounded-b-card">
              {CODE_EXAMPLES[activeTab]}
            </pre>
          </div>
        </section>

        {/* ── CTA ─────────────────────────────────────── */}
        <section className="text-center py-8">
          <BlockReveal>
            <div className="bg-mn-dark rounded-section p-12 text-center">
              <h2 className="font-sans font-semibold text-subsection text-[#F7F5F2] mb-4">Ready to integrate?</h2>
              <p className="text-[rgba(247,245,242,0.55)] font-sans mb-8 max-w-lg mx-auto">
                Choose a plan that fits your data needs and start pulling professional beauty intelligence
                into your applications today.
              </p>
              <Link to="/api/pricing" className="btn-mineral-dark">
                Get API Access
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </BlockReveal>
        </section>
      </div>

      {/* ── Footer ──────────────────────────────────────────────────── */}
      <SiteFooter />
    </div>
  );
}
