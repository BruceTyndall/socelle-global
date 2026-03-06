import { useState, useEffect } from 'react';
import { Bug, Copy, CheckCircle, AlertCircle, Database, User, Shield } from 'lucide-react';
import { useAuth } from '../../lib/auth';
import { supabase } from '../../lib/supabase';

interface QueryResult {
  success: boolean;
  data?: any;
  error?: string;
  isRLSError?: boolean;
}

export default function DebugPanel() {
  const { user, profile, session, loading: authLoading } = useAuth();
  const [brandsResult, setBrandsResult] = useState<QueryResult | null>(null);
  const [protocolsResult, setProtocolsResult] = useState<QueryResult | null>(null);
  const [productsResult, setProductsResult] = useState<QueryResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [testing, setTesting] = useState(false);

  const isSupabaseConfigured = !!(
    import.meta.env.VITE_SUPABASE_URL &&
    import.meta.env.VITE_SUPABASE_ANON_KEY
  );

  useEffect(() => {
    if (!authLoading && user) {
      runDatabaseTests();
    }
  }, [authLoading, user]);

  const runDatabaseTests = async () => {
    setTesting(true);

    // Test 1: Brands
    try {
      const { data, error } = await supabase
        .from('brands')
        .select('id, name, slug, status')
        .order('name')
        .limit(3);

      if (error) {
        const isRLS = error.code === 'PGRST301' ||
                     error.message?.toLowerCase().includes('permission') ||
                     error.message?.toLowerCase().includes('rls');
        setBrandsResult({
          success: false,
          error: error.message,
          isRLSError: isRLS
        });
      } else {
        setBrandsResult({
          success: true,
          data: {
            count: data?.length || 0,
            sample: data || []
          }
        });
      }
    } catch (err: any) {
      setBrandsResult({
        success: false,
        error: err.message || 'Unknown error'
      });
    }

    // Test 2: Protocols
    try {
      const { count, error } = await supabase
        .from('canonical_protocols')
        .select('*', { count: 'exact', head: true });

      if (error) {
        const isRLS = error.code === 'PGRST301' ||
                     error.message?.toLowerCase().includes('permission') ||
                     error.message?.toLowerCase().includes('rls');
        setProtocolsResult({
          success: false,
          error: error.message,
          isRLSError: isRLS
        });
      } else {
        setProtocolsResult({
          success: true,
          data: { count: count || 0 }
        });
      }
    } catch (err: any) {
      setProtocolsResult({
        success: false,
        error: err.message || 'Unknown error'
      });
    }

    // Test 3: Products
    try {
      const { count, error } = await supabase
        .from('pro_products')
        .select('*', { count: 'exact', head: true });

      if (error) {
        const isRLS = error.code === 'PGRST301' ||
                     error.message?.toLowerCase().includes('permission') ||
                     error.message?.toLowerCase().includes('rls');
        setProductsResult({
          success: false,
          error: error.message,
          isRLSError: isRLS
        });
      } else {
        setProductsResult({
          success: true,
          data: { count: count || 0 }
        });
      }
    } catch (err: any) {
      setProductsResult({
        success: false,
        error: err.message || 'Unknown error'
      });
    }

    setTesting(false);
  };

  const copyDebugInfo = () => {
    const debugInfo = {
      timestamp: new Date().toISOString(),
      supabase: {
        configured: isSupabaseConfigured,
        url: import.meta.env.VITE_SUPABASE_URL ? 'Set' : 'Missing',
        anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Set (hidden)' : 'Missing'
      },
      auth: {
        authenticated: !!user,
        userId: user?.id || null,
        email: user?.email || null,
        hasSession: !!session,
        hasProfile: !!profile,
        profile: profile ? {
          role: profile.role,
          brandId: profile.brand_id,
          businessId: profile.business_id
        } : null
      },
      databaseTests: {
        brands: brandsResult,
        protocols: protocolsResult,
        products: productsResult
      }
    };

    navigator.clipboard.writeText(JSON.stringify(debugInfo, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Bug className="w-8 h-8 text-pro-navy" />
          <h1 className="text-3xl font-bold text-pro-charcoal">Debug Panel</h1>
        </div>
        <p className="text-pro-warm-gray">System diagnostics and authentication state</p>
      </div>

      <button
        onClick={copyDebugInfo}
        className="mb-6 flex items-center gap-2 px-4 py-2 bg-pro-navy text-white rounded-lg hover:bg-pro-charcoal transition-colors"
      >
        {copied ? (
          <>
            <CheckCircle className="w-4 h-4" />
            Copied to Clipboard
          </>
        ) : (
          <>
            <Copy className="w-4 h-4" />
            Copy Debug Info
          </>
        )}
      </button>

      <div className="space-y-6">
        {/* Supabase Config */}
        <div className="bg-white rounded-lg shadow-sm border border-pro-stone p-6">
          <div className="flex items-center gap-3 mb-4">
            <Database className="w-6 h-6 text-pro-navy" />
            <h2 className="text-xl font-bold text-pro-charcoal">Supabase Configuration</h2>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              {isSupabaseConfigured ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600" />
              )}
              <span className="font-medium text-pro-charcoal">
                {isSupabaseConfigured ? 'Configured' : 'Not Configured'}
              </span>
            </div>
            <div className="ml-7 space-y-1 text-sm text-pro-warm-gray">
              <div>VITE_SUPABASE_URL: {import.meta.env.VITE_SUPABASE_URL ? '✓ Set' : '✗ Missing'}</div>
              <div>VITE_SUPABASE_ANON_KEY: {import.meta.env.VITE_SUPABASE_ANON_KEY ? '✓ Set' : '✗ Missing'}</div>
            </div>
          </div>
        </div>

        {/* Auth State */}
        <div className="bg-white rounded-lg shadow-sm border border-pro-stone p-6">
          <div className="flex items-center gap-3 mb-4">
            <User className="w-6 h-6 text-green-600" />
            <h2 className="text-xl font-bold text-pro-charcoal">Authentication State</h2>
          </div>
          {authLoading ? (
            <p className="text-pro-warm-gray">Loading auth state...</p>
          ) : user ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="font-medium text-pro-charcoal">Authenticated</span>
              </div>
              <div className="ml-7 space-y-2 text-sm">
                <div>
                  <span className="font-medium text-pro-charcoal">User ID:</span>{' '}
                  <code className="text-pro-warm-gray bg-pro-stone px-2 py-1 rounded">{user.id}</code>
                </div>
                <div>
                  <span className="font-medium text-pro-charcoal">Email:</span>{' '}
                  <span className="text-pro-warm-gray">{user.email}</span>
                </div>
                <div>
                  <span className="font-medium text-pro-charcoal">Session:</span>{' '}
                  <span className="text-pro-warm-gray">{session ? '✓ Active' : '✗ None'}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-600" />
              <span className="text-pro-warm-gray">Not authenticated</span>
            </div>
          )}
        </div>

        {/* Profile State */}
        <div className="bg-white rounded-lg shadow-sm border border-pro-stone p-6">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-6 h-6 text-purple-600" />
            <h2 className="text-xl font-bold text-pro-charcoal">User Profile</h2>
          </div>
          {authLoading ? (
            <p className="text-pro-warm-gray">Loading profile...</p>
          ) : profile ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="font-medium text-pro-charcoal">Profile Loaded</span>
              </div>
              <div className="ml-7 space-y-2 text-sm">
                <div>
                  <span className="font-medium text-pro-charcoal">Role:</span>{' '}
                  <code className="text-pro-warm-gray bg-pro-stone px-2 py-1 rounded">{profile.role}</code>
                </div>
                <div>
                  <span className="font-medium text-pro-charcoal">Brand ID:</span>{' '}
                  <span className="text-pro-warm-gray">{profile.brand_id || 'None'}</span>
                </div>
                <div>
                  <span className="font-medium text-pro-charcoal">Business ID:</span>{' '}
                  <span className="text-pro-warm-gray">{profile.business_id || 'None'}</span>
                </div>
              </div>
            </div>
          ) : user ? (
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-600" />
              <span className="text-pro-warm-gray">Profile not loaded (user authenticated but profile missing)</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-pro-warm-gray" />
              <span className="text-pro-warm-gray">No profile (not authenticated)</span>
            </div>
          )}
        </div>

        {/* Database Query Tests */}
        <div className="bg-white rounded-lg shadow-sm border border-pro-stone p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Database className="w-6 h-6 text-orange-600" />
              <h2 className="text-xl font-bold text-pro-charcoal">Database Query Tests</h2>
            </div>
            <button
              onClick={runDatabaseTests}
              disabled={testing}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:bg-pro-stone transition-colors text-sm"
            >
              {testing ? 'Testing...' : 'Re-run Tests'}
            </button>
          </div>

          <div className="space-y-4">
            {/* Brands Test */}
            <div className="border border-pro-stone rounded-lg p-4">
              <h3 className="font-semibold text-pro-charcoal mb-2">Brands Table</h3>
              {brandsResult ? (
                <div>
                  {brandsResult.success ? (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <span className="text-green-700 font-medium">Query successful</span>
                      </div>
                      <div className="text-sm text-pro-warm-gray space-y-1">
                        <div>Count: {brandsResult.data.count}</div>
                        {brandsResult.data.sample && brandsResult.data.sample.length > 0 && (
                          <div className="mt-2">
                            <div className="font-medium text-pro-charcoal mb-1">Sample records:</div>
                            <div className="bg-pro-ivory rounded p-2 space-y-1">
                              {brandsResult.data.sample.map((brand: any) => (
                                <div key={brand.id} className="text-xs">
                                  {brand.name} ({brand.slug}) - {brand.status}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <AlertCircle className="w-5 h-5 text-red-600" />
                        <span className="text-red-700 font-medium">Query failed</span>
                      </div>
                      {brandsResult.isRLSError && (
                        <div className="bg-amber-50 border border-amber-200 rounded p-3 mb-2">
                          <p className="text-sm font-medium text-amber-900 mb-1">RLS Policy Issue Detected</p>
                          <p className="text-xs text-amber-700">
                            RLS is blocking this query for the current role. Fix policies in Supabase.
                          </p>
                        </div>
                      )}
                      <code className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded block">
                        {brandsResult.error}
                      </code>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-pro-warm-gray text-sm">Not tested yet</p>
              )}
            </div>

            {/* Protocols Test */}
            <div className="border border-pro-stone rounded-lg p-4">
              <h3 className="font-semibold text-pro-charcoal mb-2">Canonical Protocols Table</h3>
              {protocolsResult ? (
                <div>
                  {protocolsResult.success ? (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <span className="text-green-700 font-medium">Query successful</span>
                      </div>
                      <div className="text-sm text-pro-warm-gray">
                        Count: {protocolsResult.data.count}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <AlertCircle className="w-5 h-5 text-red-600" />
                        <span className="text-red-700 font-medium">Query failed</span>
                      </div>
                      {protocolsResult.isRLSError && (
                        <div className="bg-amber-50 border border-amber-200 rounded p-3 mb-2">
                          <p className="text-sm font-medium text-amber-900 mb-1">RLS Policy Issue Detected</p>
                          <p className="text-xs text-amber-700">
                            RLS is blocking this query for the current role. Fix policies in Supabase.
                          </p>
                        </div>
                      )}
                      <code className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded block">
                        {protocolsResult.error}
                      </code>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-pro-warm-gray text-sm">Not tested yet</p>
              )}
            </div>

            {/* Products Test */}
            <div className="border border-pro-stone rounded-lg p-4">
              <h3 className="font-semibold text-pro-charcoal mb-2">PRO Products Table</h3>
              {productsResult ? (
                <div>
                  {productsResult.success ? (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <span className="text-green-700 font-medium">Query successful</span>
                      </div>
                      <div className="text-sm text-pro-warm-gray">
                        Count: {productsResult.data.count}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <AlertCircle className="w-5 h-5 text-red-600" />
                        <span className="text-red-700 font-medium">Query failed</span>
                      </div>
                      {productsResult.isRLSError && (
                        <div className="bg-amber-50 border border-amber-200 rounded p-3 mb-2">
                          <p className="text-sm font-medium text-amber-900 mb-1">RLS Policy Issue Detected</p>
                          <p className="text-xs text-amber-700">
                            RLS is blocking this query for the current role. Fix policies in Supabase.
                          </p>
                        </div>
                      )}
                      <code className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded block">
                        {productsResult.error}
                      </code>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-pro-warm-gray text-sm">Not tested yet</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
