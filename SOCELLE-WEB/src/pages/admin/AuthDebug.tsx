import { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Shield, CheckCircle, XCircle, Home, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../lib/auth';
import { supabase } from '../../lib/supabase';

interface DebugInfo {
  windowOrigin: string;
  hasSupabaseUrl: boolean;
  sessionExists: boolean;
  authUid: string | null;
  email: string | null;
  brandId: string | null;
  profileExists: boolean;
  profileRole: string | null;
  profileError: string | null;
  effectiveRole: string | null;
  isAdmin: boolean;
  lastAuthError: string | null;
}

export default function AuthDebug() {
  const { user, profile, profileError, effectiveRole, isAdmin, loading, lastAuthError } = useAuth();
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null);
  const [loadingDebug, setLoadingDebug] = useState(true);

  useEffect(() => {
    const fetchDebugInfo = async () => {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const sessionUser = sessionData.session?.user;

        let profileExists = false;
        let profileRole = null;
        let fetchError = null;

        if (sessionUser) {
          const { data: profileData, error } = await supabase
            .from('user_profiles')
            .select('role')
            .eq('id', sessionUser.id)
            .maybeSingle();

          if (error) {
            fetchError = error.message;
          } else if (profileData) {
            profileExists = true;
            profileRole = profileData.role;
          }
        }

        setDebugInfo({
          windowOrigin: window.location.origin,
          hasSupabaseUrl: !!import.meta.env.VITE_SUPABASE_URL,
          sessionExists: !!sessionData.session,
          authUid: sessionUser?.id || null,
          email: sessionUser?.email || null,
          brandId: profile?.brand_id || null,
          profileExists,
          profileRole,
          profileError: fetchError,
          effectiveRole: effectiveRole || null,
          isAdmin,
          lastAuthError: lastAuthError || null,
        });
      } catch (error) {
        console.error('Debug fetch error:', error);
      } finally {
        setLoadingDebug(false);
      }
    };

    if (!loading) {
      fetchDebugInfo();
    }
  }, [loading, effectiveRole, isAdmin, profile?.brand_id, lastAuthError]);

  if (loading || loadingDebug) {
    return (
      <div className="min-h-screen bg-graphite flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-graphite border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-graphite/60">Loading debug info...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  const InfoRow = ({ label, value, status }: { label: string; value: string; status?: 'success' | 'error' | 'warning' }) => (
    <div className="flex items-start justify-between py-3 border-b border-graphite last:border-0">
      <span className="text-sm font-medium text-graphite/60">{label}</span>
      <div className="flex items-center gap-2">
        {status === 'success' && <CheckCircle className="w-4 h-4 text-green-400" />}
        {status === 'error' && <XCircle className="w-4 h-4 text-red-400" />}
        {status === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-400" />}
        <span className={`text-sm font-mono ${
          status === 'success' ? 'text-green-300' :
          status === 'error' ? 'text-red-300' :
          status === 'warning' ? 'text-amber-300' :
          'text-accent-soft'
        }`}>
          {value}
        </span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-graphite p-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Link
            to="/admin/login"
            className="flex items-center gap-2 text-graphite/60 hover:text-white transition-colors"
          >
            <Home className="w-4 h-4" />
            <span className="text-sm">Back to Login</span>
          </Link>

          {isAdmin && (
            <Link
              to="/admin/brands"
              className="px-4 py-2 bg-graphite text-white rounded-lg hover:bg-graphite transition-colors text-sm font-medium"
            >
              Go to Admin Portal
            </Link>
          )}
        </div>

        <div className="bg-graphite rounded-xl shadow-2xl border border-graphite overflow-hidden">
          <div className="bg-graphite px-6 py-4 border-b border-graphite">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-graphite to-graphite rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Admin Auth Debug</h1>
                <p className="text-sm text-graphite/60">Diagnostic information for authentication</p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {debugInfo && (
              <>
                <div>
                  <h2 className="text-lg font-semibold text-white mb-4">Environment</h2>
                  <div className="bg-graphite rounded-lg p-4 border border-graphite">
                    <InfoRow
                      label="Window Origin"
                      value={debugInfo.windowOrigin}
                    />
                    <InfoRow
                      label="Supabase URL Configured"
                      value={debugInfo.hasSupabaseUrl ? 'Yes' : 'No'}
                      status={debugInfo.hasSupabaseUrl ? 'success' : 'error'}
                    />
                  </div>
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-white mb-4">Session</h2>
                  <div className="bg-graphite rounded-lg p-4 border border-graphite">
                    <InfoRow
                      label="Session Exists"
                      value={debugInfo.sessionExists ? 'Yes' : 'No'}
                      status={debugInfo.sessionExists ? 'success' : 'error'}
                    />
                    {debugInfo.sessionExists && (
                      <>
                        <InfoRow
                          label="email"
                          value={debugInfo.email || 'N/A'}
                        />
                        <InfoRow
                          label="auth.uid()"
                          value={debugInfo.authUid || 'N/A'}
                        />
                      </>
                    )}
                  </div>
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-white mb-4">User Profile</h2>
                  <div className="bg-graphite rounded-lg p-4 border border-graphite">
                    <InfoRow
                      label="Profile Exists"
                      value={debugInfo.profileExists ? 'Yes' : 'No'}
                      status={debugInfo.profileExists ? 'success' : 'warning'}
                    />
                    {debugInfo.profileExists && (
                      <InfoRow
                        label="profile.role"
                        value={debugInfo.profileRole || 'N/A'}
                      />
                    )}
                    <InfoRow
                      label="profile.brand_id"
                      value={debugInfo.brandId || 'N/A'}
                    />
                    {debugInfo.profileError && (
                      <InfoRow
                        label="Profile Error"
                        value={debugInfo.profileError}
                        status="error"
                      />
                    )}
                    {profileError && (
                      <InfoRow
                        label="Profile Context Error"
                        value={profileError}
                        status="error"
                      />
                    )}
                    <InfoRow
                      label="Last Auth Error"
                      value={debugInfo.lastAuthError || 'None'}
                      status={debugInfo.lastAuthError ? 'warning' : undefined}
                    />
                  </div>
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-white mb-4">Access Control</h2>
                  <div className="bg-graphite rounded-lg p-4 border border-graphite">
                    <InfoRow
                      label="Effective Role"
                      value={debugInfo.effectiveRole || 'None'}
                      status={debugInfo.effectiveRole ? 'success' : 'warning'}
                    />
                    <InfoRow
                      label="Is Admin"
                      value={debugInfo.isAdmin ? 'Yes' : 'No'}
                      status={debugInfo.isAdmin ? 'success' : 'error'}
                    />
                  </div>
                </div>

                {debugInfo.isAdmin ? (
                  <div className="bg-green-900/30 border border-green-700 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <h3 className="font-semibold text-green-300 mb-1">Admin Access Granted</h3>
                        <p className="text-sm text-green-200">
                          You have admin privileges and can access the admin portal.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-red-900/30 border border-red-700 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <h3 className="font-semibold text-red-300 mb-1">Admin Access Denied</h3>
                        <p className="text-sm text-red-200 mb-2">
                          You don't have admin privileges. This could be because:
                        </p>
                        <ul className="text-sm text-red-200 list-disc list-inside space-y-1">
                          <li>Your account doesn't have the admin role assigned</li>
                          <li>Your email is not in the admin override list</li>
                          <li>There's an issue loading your user profile</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
