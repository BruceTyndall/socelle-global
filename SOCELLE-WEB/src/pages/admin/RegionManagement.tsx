// ── Admin Region Management ───────────────────────────────────────
// WO-23: International Expansion Infrastructure
// Admin page for managing supported regions, locales, currencies,
// and viewing regional compliance requirements.

import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  Globe,
  Shield,
  AlertTriangle,
  Info,
  Plus,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  Clock,
  Search as SearchIcon,
  Users,
  Building2,
  TrendingUp,
} from 'lucide-react';
import {
  getRegionStats,
  getAllCompliance,
  LOCALE_INFO,
  CURRENCY_INFO,
  SUPPORTED_LOCALES,
  SUPPORTED_CURRENCIES,
} from '../../lib/i18n';
import type { ComplianceInfo, RegionStats } from '../../lib/i18n';

// ── Helpers ───────────────────────────────────────────────────────

function complianceStatusBadge(status: RegionStats['complianceStatus']) {
  switch (status) {
    case 'compliant':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
          <CheckCircle2 className="w-3 h-3" /> Compliant
        </span>
      );
    case 'review':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
          <AlertTriangle className="w-3 h-3" /> Under Review
        </span>
      );
    case 'pending':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-pro-cream text-pro-warm-gray border border-pro-stone">
          <Clock className="w-3 h-3" /> Pending
        </span>
      );
  }
}

function severityIcon(severity: string) {
  switch (severity) {
    case 'critical':
      return <Shield className="w-4 h-4 text-red-500 flex-shrink-0" />;
    case 'warning':
      return <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />;
    default:
      return <Info className="w-4 h-4 text-blue-500 flex-shrink-0" />;
  }
}

// ── Component ─────────────────────────────────────────────────────

export default function RegionManagement() {
  const regionStats = getRegionStats();
  const allCompliance = getAllCompliance();

  const [expandedRegion, setExpandedRegion] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Compute totals
  const totalBusinesses = regionStats.reduce((sum, r) => sum + r.activeBusinesses, 0);
  const totalBrands = regionStats.reduce((sum, r) => sum + r.activeBrands, 0);
  const totalRegions = regionStats.length;
  const compliantRegions = regionStats.filter((r) => r.complianceStatus === 'compliant').length;

  // Filter compliance by search
  const filteredCompliance = searchQuery
    ? allCompliance.filter(
        (c) =>
          c.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.countryCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.rules.some((r) => r.title.toLowerCase().includes(searchQuery.toLowerCase())),
      )
    : allCompliance;

  const toggleRegion = (code: string) => {
    setExpandedRegion((prev) => (prev === code ? null : code));
  };

  return (
    <>
      <Helmet>
        <title>Region Management | Socelle Admin</title>
      </Helmet>

      <div className="space-y-8">
        {/* ── Header ─────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-serif text-pro-navy flex items-center gap-2">
              <Globe className="w-6 h-6 text-pro-gold" />
              Region Management
            </h1>
            <p className="text-pro-warm-gray font-sans mt-1">
              Manage supported regions, locales, currencies, and compliance requirements.
            </p>
          </div>
          <button
            disabled
            className="inline-flex items-center gap-2 px-4 py-2 bg-pro-navy/40 text-white rounded-lg font-sans text-sm cursor-not-allowed"
            title="Region creation coming in a future release"
          >
            <Plus className="w-4 h-4" />
            Add Region
          </button>
        </div>

        {/* ── Summary Stats ──────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Active Regions', value: totalRegions, icon: Globe, color: 'text-pro-gold' },
            { label: 'Total Businesses', value: totalBusinesses.toLocaleString(), icon: Building2, color: 'text-pro-navy' },
            { label: 'Total Brands', value: totalBrands.toLocaleString(), icon: TrendingUp, color: 'text-green-600' },
            { label: 'Compliant Regions', value: `${compliantRegions}/${totalRegions}`, icon: Shield, color: 'text-emerald-600' },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl border border-pro-stone p-4">
              <div className="flex items-center gap-2 mb-2">
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
                <span className="text-xs font-medium text-pro-warm-gray font-sans uppercase tracking-wider">
                  {stat.label}
                </span>
              </div>
              <p className="text-2xl font-serif text-pro-charcoal">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* ── Supported Locales & Currencies ─────────────────────── */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Locales */}
          <div className="bg-white rounded-xl border border-pro-stone p-5">
            <h2 className="text-lg font-serif text-pro-navy mb-4">Supported Locales</h2>
            <div className="space-y-2">
              {SUPPORTED_LOCALES.map((code) => {
                const info = LOCALE_INFO[code];
                return (
                  <div
                    key={code}
                    className="flex items-center justify-between px-3 py-2 rounded-lg bg-pro-ivory/50 border border-pro-stone/50"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-full bg-pro-navy/10 flex items-center justify-center text-xs font-bold text-pro-navy font-mono uppercase">
                        {code}
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-pro-charcoal font-sans">{info.label}</p>
                        <p className="text-xs text-pro-warm-gray font-sans">{info.nativeLabel}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-pro-warm-gray font-mono">{info.defaultCurrency}</span>
                      {code === 'en' ? (
                        <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-pro-gold/20 text-pro-gold rounded-full">
                          Default
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-pro-cream text-pro-warm-gray rounded-full">
                          Stub
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Currencies */}
          <div className="bg-white rounded-xl border border-pro-stone p-5">
            <h2 className="text-lg font-serif text-pro-navy mb-4">Supported Currencies</h2>
            <div className="space-y-2">
              {SUPPORTED_CURRENCIES.map((code) => {
                const info = CURRENCY_INFO[code];
                return (
                  <div
                    key={code}
                    className="flex items-center justify-between px-3 py-2 rounded-lg bg-pro-ivory/50 border border-pro-stone/50"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-full bg-pro-gold/10 flex items-center justify-center text-sm font-bold text-pro-gold">
                        {info.symbol}
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-pro-charcoal font-sans">{info.name}</p>
                        <p className="text-xs text-pro-warm-gray font-mono">{info.code}</p>
                      </div>
                    </div>
                    <span className="text-xs text-pro-warm-gray font-sans">
                      {info.decimals} decimals
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Region Stats Table ─────────────────────────────────── */}
        <div className="bg-white rounded-xl border border-pro-stone overflow-hidden">
          <div className="px-5 py-4 border-b border-pro-stone">
            <h2 className="text-lg font-serif text-pro-navy">Platform Regions</h2>
            <p className="text-xs text-pro-warm-gray font-sans mt-1">
              User distribution and compliance status by region
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm font-sans">
              <thead>
                <tr className="border-b border-pro-stone bg-pro-ivory/50">
                  <th className="text-left px-5 py-3 text-xs font-bold uppercase tracking-wider text-pro-warm-gray">
                    Region
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-bold uppercase tracking-wider text-pro-warm-gray">
                    Locale
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-bold uppercase tracking-wider text-pro-warm-gray">
                    Currency
                  </th>
                  <th className="text-right px-5 py-3 text-xs font-bold uppercase tracking-wider text-pro-warm-gray">
                    <Users className="w-3.5 h-3.5 inline mr-1" />Users
                  </th>
                  <th className="text-right px-5 py-3 text-xs font-bold uppercase tracking-wider text-pro-warm-gray">
                    Businesses
                  </th>
                  <th className="text-right px-5 py-3 text-xs font-bold uppercase tracking-wider text-pro-warm-gray">
                    Brands
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-bold uppercase tracking-wider text-pro-warm-gray">
                    Compliance
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-pro-stone/50">
                {regionStats.map((region) => (
                  <tr key={region.countryCode} className="hover:bg-pro-ivory/30 transition-colors">
                    <td className="px-5 py-3 font-medium text-pro-charcoal">{region.country}</td>
                    <td className="px-5 py-3 text-pro-warm-gray font-mono text-xs">{region.locale}</td>
                    <td className="px-5 py-3 text-pro-warm-gray font-mono text-xs">{region.currency}</td>
                    <td className="px-5 py-3 text-right text-pro-charcoal">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-20 h-1.5 bg-pro-stone/30 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-pro-navy rounded-full"
                            style={{ width: `${region.userPercentage}%` }}
                          />
                        </div>
                        <span className="text-xs font-mono w-10 text-right">{region.userPercentage}%</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-right text-pro-charcoal">
                      {region.activeBusinesses.toLocaleString()}
                    </td>
                    <td className="px-5 py-3 text-right text-pro-charcoal">
                      {region.activeBrands.toLocaleString()}
                    </td>
                    <td className="px-5 py-3">{complianceStatusBadge(region.complianceStatus)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Regional Compliance Rules ──────────────────────────── */}
        <div className="bg-white rounded-xl border border-pro-stone overflow-hidden">
          <div className="px-5 py-4 border-b border-pro-stone flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-lg font-serif text-pro-navy flex items-center gap-2">
                <Shield className="w-5 h-5 text-pro-gold" />
                Regional Compliance Rules
              </h2>
              <p className="text-xs text-pro-warm-gray font-sans mt-1">
                Regulatory requirements for professional beauty products by region
              </p>
            </div>
            <div className="relative">
              <SearchIcon className="w-4 h-4 text-pro-warm-gray absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search regulations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 w-64 rounded-lg border border-pro-stone text-sm font-sans placeholder:text-pro-warm-gray/60 focus:outline-none focus:ring-2 focus:ring-pro-navy/20 focus:border-pro-navy/40"
              />
            </div>
          </div>

          <div className="divide-y divide-pro-stone/50">
            {filteredCompliance.map((region: ComplianceInfo) => {
              const isExpanded = expandedRegion === region.countryCode;
              return (
                <div key={region.countryCode}>
                  <button
                    onClick={() => toggleRegion(region.countryCode)}
                    className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-pro-ivory/30 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-full bg-pro-navy/10 flex items-center justify-center text-xs font-bold text-pro-navy font-mono">
                        {region.countryCode}
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-pro-charcoal font-sans">
                          {region.country}
                        </p>
                        <p className="text-xs text-pro-warm-gray font-sans">
                          {region.region} · {region.rules.length} rules · Updated {region.lastUpdated}
                        </p>
                      </div>
                    </div>
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-pro-warm-gray" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-pro-warm-gray" />
                    )}
                  </button>
                  {isExpanded && (
                    <div className="px-5 pb-4 space-y-3">
                      {region.rules.map((rule) => (
                        <div
                          key={rule.id}
                          className="flex gap-3 p-3 rounded-lg bg-pro-ivory/50 border border-pro-stone/50"
                        >
                          {severityIcon(rule.severity)}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="text-sm font-semibold text-pro-charcoal font-sans">
                                {rule.title}
                              </p>
                              <span
                                className={`px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded ${
                                  rule.severity === 'critical'
                                    ? 'bg-red-50 text-red-600'
                                    : rule.severity === 'warning'
                                    ? 'bg-amber-50 text-amber-600'
                                    : 'bg-blue-50 text-blue-600'
                                }`}
                              >
                                {rule.severity}
                              </span>
                            </div>
                            <p className="text-xs text-pro-warm-gray font-sans leading-relaxed">
                              {rule.description}
                            </p>
                            <p className="text-xs text-pro-warm-gray/70 font-sans mt-1">
                              Authority: {rule.authority}
                              {rule.url && (
                                <>
                                  {' · '}
                                  <a
                                    href={rule.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-pro-navy underline hover:text-pro-gold transition-colors"
                                  >
                                    Reference
                                  </a>
                                </>
                              )}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {filteredCompliance.length === 0 && (
              <div className="px-5 py-12 text-center">
                <SearchIcon className="w-8 h-8 text-pro-warm-gray/40 mx-auto mb-3" />
                <p className="text-sm text-pro-warm-gray font-sans">
                  No compliance rules match &ldquo;{searchQuery}&rdquo;
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
