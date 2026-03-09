import { useState, useEffect } from 'react';
import { Link, Outlet, useParams, useLocation, Navigate, useNavigate } from 'react-router-dom';
import {
  User,
  Package,
  BookOpen,
  GraduationCap,
  ShoppingBag,
  Users,
  BarChart2,
  Settings,
  ChevronLeft,
  Building2,
  ExternalLink,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Badge } from '../../components/ui';

const HUB_TABS = [
  { path: 'profile',    label: 'Profile',    icon: User },
  { path: 'products',   label: 'Products',   icon: Package },
  { path: 'protocols',  label: 'Protocols',  icon: BookOpen },
  { path: 'education',  label: 'Education',  icon: GraduationCap },
  { path: 'orders',     label: 'Orders',     icon: ShoppingBag },
  { path: 'retailers',  label: 'Retailers',  icon: Users },
  { path: 'analytics',  label: 'Analytics',  icon: BarChart2 },
  { path: 'settings',   label: 'Settings',   icon: Settings },
];

interface Brand {
  id: string;
  name: string;
  slug: string;
  status: string;
  is_published?: boolean;
  logo_url?: string | null;
  theme?: { colors?: { primary?: string; accent?: string } } | null;
}

export default function BrandHub() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const [brand, setBrand] = useState<Brand | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id || id === 'new') { setLoading(false); return; }
    supabase
      .from('brands')
      .select('id, name, slug, status, is_published, logo_url, theme')
      .eq('id', id)
      .single()
      .then(({ data }) => {
        setBrand(data);
        setLoading(false);
      });
  }, [id]);

  if (!id || id === 'new') {
    // Render BrandAdminEditor directly for new brand
    return <Navigate to="/admin/brands" replace />;
  }

  const isPublished = brand?.status === 'active' || brand?.is_published;
  const accentColor = brand?.theme?.colors?.accent || brand?.theme?.colors?.primary || '#1E3A5F';

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 bg-accent-soft rounded animate-pulse" />
        <div className="h-32 bg-white rounded-xl border border-accent-soft animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Brand header */}
      <div className="bg-white rounded-xl border border-accent-soft overflow-hidden">
        <div className="h-1.5" style={{ backgroundColor: accentColor }} />
        <div className="flex items-center gap-4 px-5 py-4">
          <button
            onClick={() => navigate('/admin/brands')}
            className="p-1.5 rounded-lg text-graphite/60 hover:text-graphite hover:bg-accent-soft transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
            style={{ backgroundColor: accentColor }}
          >
            {brand ? brand.name.charAt(0) : <Building2 className="w-5 h-5" />}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="font-sans text-xl text-graphite truncate">
                {brand?.name ?? 'Brand'}
              </h1>
              <Badge variant={isPublished ? 'green' : 'amber'} dot>
                {isPublished ? 'Published' : 'Draft'}
              </Badge>
            </div>
            {brand && (
              <p className="text-xs text-graphite/60 font-sans">/{brand.slug}</p>
            )}
          </div>
          <Link
            to={`/brands`}
            className="hidden sm:flex items-center gap-1.5 text-xs text-graphite/60 hover:text-graphite font-sans transition-colors"
          >
            View public page
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Sub-nav tabs */}
        <div className="flex items-center gap-0 border-t border-accent-soft overflow-x-auto px-4">
          {HUB_TABS.map(tab => {
            const Icon = tab.icon;
            const isActive = location.pathname.endsWith(`/${tab.path}`);
            return (
              <Link
                key={tab.path}
                to={`/admin/brands/${id}/${tab.path}`}
                className={`flex items-center gap-2 px-3 py-3 text-sm font-medium font-sans whitespace-nowrap border-b-2 transition-colors -mb-px ${
                  isActive
                    ? 'border-graphite text-graphite'
                    : 'border-transparent text-graphite/60 hover:text-graphite'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Tab content */}
      <Outlet />
    </div>
  );
}
