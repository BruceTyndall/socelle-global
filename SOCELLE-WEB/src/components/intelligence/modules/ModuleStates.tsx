// ── ModuleStates — V2-INTEL-01 ───────────────────────────────────────
// Shared loading, empty, and error states for intelligence module wrappers.
// DEMO badge per SOCELLE anti-shell + LIVE/DEMO truth rules.

import { AlertCircle, Loader2 } from 'lucide-react';

interface ModuleLoadingProps {
  label?: string;
  dark?: boolean;
}

export function ModuleLoading({ label = 'Loading data...', dark = false }: ModuleLoadingProps) {
  const bg = dark ? 'bg-[#1F2428]' : 'bg-[#FAF9F7]';
  const text = dark ? 'text-[#F7F5F2]/50' : 'text-[#141418]/50';
  return (
    <section className={`${bg} py-14 lg:py-20`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-center gap-3">
        <Loader2 className={`w-5 h-5 animate-spin ${text}`} />
        <span className={`text-sm ${text}`}>{label}</span>
      </div>
    </section>
  );
}

interface ModuleEmptyProps {
  label?: string;
  dark?: boolean;
}

export function ModuleEmpty({ label = 'No data available yet.', dark = false }: ModuleEmptyProps) {
  const bg = dark ? 'bg-[#1F2428]' : 'bg-[#FAF9F7]';
  const text = dark ? 'text-[#F7F5F2]/40' : 'text-[#141418]/40';
  return (
    <section className={`${bg} py-14 lg:py-20`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <p className={`text-sm ${text}`}>{label}</p>
      </div>
    </section>
  );
}

interface ModuleErrorProps {
  message?: string;
  dark?: boolean;
}

export function ModuleError({ message = 'Unable to load module data.', dark = false }: ModuleErrorProps) {
  const bg = dark ? 'bg-[#1F2428]' : 'bg-[#FAF9F7]';
  const text = dark ? 'text-[#8E6464]' : 'text-[#8E6464]';
  return (
    <section className={`${bg} py-14 lg:py-20`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-center gap-2">
        <AlertCircle className={`w-4 h-4 ${text}`} />
        <span className={`text-sm ${text}`}>{message}</span>
      </div>
    </section>
  );
}

interface DemoBadgeProps {
  dark?: boolean;
}

export function DemoBadge({ dark = false }: DemoBadgeProps) {
  return (
    <span
      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
        dark
          ? 'bg-[#A97A4C]/20 text-[#A97A4C]'
          : 'bg-[#A97A4C]/10 text-[#A97A4C]'
      }`}
    >
      DEMO
    </span>
  );
}

interface LiveBadgeProps {
  dark?: boolean;
}

export function LiveBadge({ dark = false }: LiveBadgeProps) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#5F8A72] opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-[#5F8A72]" />
      </span>
      <span
        className="text-[#5F8A72] text-[10px] tracking-[0.25em] uppercase"
        style={{ fontFamily: 'var(--font-mono)' }}
      >
        LIVE
      </span>
    </span>
  );
}
