import { useState } from 'react';
import {
  GraduationCap,
  Video,
  FileText,
  Award,
  Eye,
  CheckCircle,
  Plus,
  Search,
} from 'lucide-react';
import { Badge, StatCard, Card, CardHeader, CardTitle, Button, Input } from '../../../components/ui';
import { getBrandEducation } from '../../../lib/intelligence/adminIntelligence';

const TYPE_ICONS: Record<string, typeof GraduationCap> = {
  Course: GraduationCap,
  Video: Video,
  'PDF Guide': FileText,
  Webinar: Video,
};

export default function HubEducation() {
  const items = getBrandEducation();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [toast, setToast] = useState<string | null>(null);

  const types = ['all', ...Array.from(new Set(items.map(i => i.type)))];

  const filtered = items.filter(i => {
    const matchesSearch = i.title.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === 'all' || i.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const totalViews = items.reduce((s, i) => s + i.views, 0);
  const totalCompletions = items.reduce((s, i) => s + i.completions, 0);
  const totalCE = items.reduce((s, i) => s + i.ceCredits, 0);
  const avgCompletion = items.length > 0 ? Math.round((totalCompletions / totalViews) * 100) : 0;

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className="space-y-4">
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-graphite text-white text-sm font-sans px-4 py-2.5 rounded-lg shadow-lg">
          {toast}
        </div>
      )}

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Content" value={items.length} icon={GraduationCap} />
        <StatCard label="Total Views" value={totalViews.toLocaleString()} icon={Eye} />
        <StatCard label="Completion Rate" value={`${avgCompletion}%`} icon={CheckCircle} iconBg="bg-emerald-50" iconColor="text-emerald-600" />
        <StatCard label="CE Credits Offered" value={totalCE.toFixed(1)} icon={Award} iconBg="bg-amber-50" iconColor="text-amber-600" />
      </div>

      {/* Filters + Action */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          {types.map(t => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-3 py-1.5 text-xs font-medium font-sans rounded-full border transition-colors ${
                typeFilter === t
                  ? 'bg-graphite text-white border-graphite'
                  : 'bg-white text-graphite/60 border-accent-soft hover:border-graphite hover:text-graphite'
              }`}
            >
              {t === 'all' ? 'All Types' : t}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <div className="w-56">
            <Input
              placeholder="Search content..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              iconLeft={<Search className="w-4 h-4" />}
            />
          </div>
          <Button
            size="sm"
            iconLeft={<Plus className="w-4 h-4" />}
            onClick={() => showToast('Associate Content feature coming in Wave 6')}
          >
            Associate Content
          </Button>
        </div>
      </div>

      {/* Content List */}
      <div className="bg-white rounded-xl border border-accent-soft divide-y divide-accent-soft/50">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <GraduationCap className="w-10 h-10 text-accent-soft mb-3" />
            <p className="text-sm font-sans text-graphite/60">No education content matches your filters.</p>
          </div>
        ) : (
          filtered.map((item, idx) => {
            const Icon = TYPE_ICONS[item.type] || FileText;
            const completionRate = item.views > 0 ? Math.round((item.completions / item.views) * 100) : 0;
            return (
              <div key={idx} className="flex items-center gap-4 p-4 hover:bg-background/50 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-accent-soft flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-graphite" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-graphite font-sans text-sm">{item.title}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <Badge variant="navy">{item.type}</Badge>
                    {item.ceCredits > 0 && (
                      <Badge variant="gold">{item.ceCredits} CE Credits</Badge>
                    )}
                  </div>
                </div>
                <div className="hidden sm:flex items-center gap-6 text-right">
                  <div>
                    <p className="text-xs text-graphite/60 font-sans">Views</p>
                    <p className="text-sm font-semibold text-graphite font-sans">{item.views.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-graphite/60 font-sans">Completions</p>
                    <p className="text-sm font-semibold text-graphite font-sans">{item.completions.toLocaleString()}</p>
                  </div>
                  <div className="w-20">
                    <p className="text-xs text-graphite/60 font-sans mb-1">Rate</p>
                    <div className="w-full h-1.5 bg-accent-soft rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${completionRate >= 70 ? 'bg-emerald-500' : completionRate >= 40 ? 'bg-amber-500' : 'bg-red-500'}`}
                        style={{ width: `${completionRate}%` }}
                      />
                    </div>
                    <p className="text-xs font-semibold text-graphite font-sans mt-0.5">{completionRate}%</p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* CE Distribution Summary */}
      <Card>
        <CardHeader>
          <CardTitle>CE Credit Distribution</CardTitle>
        </CardHeader>
        <div className="space-y-3">
          {items
            .filter(i => i.ceCredits > 0)
            .sort((a, b) => b.ceCredits - a.ceCredits)
            .map((item, idx) => {
              const maxCE = Math.max(...items.map(i => i.ceCredits));
              const pct = (item.ceCredits / maxCE) * 100;
              return (
                <div key={idx} className="flex items-center gap-3">
                  <p className="text-xs text-graphite/60 font-sans w-48 truncate flex-shrink-0">{item.title}</p>
                  <div className="flex-1 h-2 bg-accent-soft/40 rounded-full overflow-hidden">
                    <div className="h-full bg-accent rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                  <p className="text-xs font-semibold text-graphite font-sans w-12 text-right">{item.ceCredits}</p>
                </div>
              );
            })}
        </div>
      </Card>
    </div>
  );
}
