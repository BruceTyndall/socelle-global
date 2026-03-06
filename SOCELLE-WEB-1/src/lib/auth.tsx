import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from './supabase';
import { sendWelcomeEmail } from './emailService';
import { RETRY_CONFIG } from './platformConfig';
import { createScopedLogger } from './logger';
import { getErrorMessage } from './errors';
import { PAYMENT_BYPASS } from './paymentBypass';

export type SubscriptionTier = 'free' | 'starter' | 'growth' | 'pro';

const log = createScopedLogger('Auth');

export type UserRole = 'spa_user' | 'admin' | 'business_user' | 'brand_admin' | 'platform_admin';

export interface UserProfile {
  id: string;
  role: UserRole;
  email: string | null;
  /** @deprecated legacy field from old spa_user accounts */
  spa_name?: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  brand_id: string | null;
  business_id: string | null;
  reseller_tier: 'active' | 'elite' | 'master' | null;
  brand_tier: 'emerging' | 'pro' | 'premium' | null;
  created_at: string;
  updated_at?: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
  profileError: string | null;
  lastAuthError: string | null;
  isAdmin: boolean;
  isSpaUser: boolean;
  isBusinessUser: boolean;
  isBrandAdmin: boolean;
  isPlatformAdmin: boolean;
  brandId: string | null;
  businessId: string | null;
  /** Current subscription tier. 'free' when no active subscription exists. */
  subscriptionTier: SubscriptionTier;
  /** True when subscription is active or trialing. */
  isPro: boolean;
  signUp: (email: string, password: string, spaName?: string, role?: UserRole, businessType?: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  updatePassword: (newPassword: string) => Promise<{ error: Error | null }>;
  refreshProfile: () => Promise<void>;
  effectiveRole: UserRole | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const normalizeRole = (role: string) => (role === 'spa_user' ? 'business_user' : role);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [lastAuthError, setLastAuthError] = useState<string | null>(null);
  const [subscriptionTier, setSubscriptionTier] = useState<SubscriptionTier>('free');
  const [isPro, setIsPro] = useState(false);

  const fetchProfile = async (userId: string, retries = 2, attemptCreate = true): Promise<UserProfile | null> => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        log.error('Profile fetch failed', { error: error.message, retries });
        if (retries > 0) {
          await new Promise(resolve => setTimeout(resolve, RETRY_CONFIG.PROFILE_FETCH_DELAY));
          return fetchProfile(userId, retries - 1, attemptCreate);
        }
        throw new Error(`Profile fetch failed after retries: ${error.message}`);
      }

      if (!data && attemptCreate) {
        log.warn('No profile found, auto-creating', { userId });

        const { error: insertError } = await supabase
          .from('user_profiles')
          .upsert({
            id: userId,
            role: 'business_user',
            created_at: new Date().toISOString()
          }, { onConflict: 'id' });

        if (insertError) {
          log.error('Auto-create profile failed', { error: insertError.message });
          throw new Error(`Profile creation failed: ${insertError.message}`);
        }

        await new Promise(resolve => setTimeout(resolve, RETRY_CONFIG.PROFILE_CREATE_DELAY));
        return fetchProfile(userId, 1, false);
      }

      if (!data) {
        throw new Error('Profile not found after all attempts');
      }

      return { ...data, role: normalizeRole(data.role) };
    } catch (error) {
      log.error('Critical profile fetch error', { error: getErrorMessage(error), retries });
      if (retries > 0) {
        await new Promise(resolve => setTimeout(resolve, RETRY_CONFIG.CRITICAL_ERROR_DELAY));
        return fetchProfile(userId, retries - 1, attemptCreate);
      }
      throw error;
    }
  };

  const fetchSubscription = async (userId: string) => {
    if (PAYMENT_BYPASS) {
      setIsPro(true);
      setSubscriptionTier('pro');
      return;
    }
    try {
      const { data } = await supabase
        .from('subscriptions')
        .select('status, plan_id')
        .eq('user_id', userId)
        .in('status', ['active', 'trialing'])
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (data?.status === 'active' || data?.status === 'trialing') {
        setIsPro(true);
        // Map plan_id prefix to tier enum
        const planId: string = data.plan_id ?? '';
        if (planId.startsWith('pro')) setSubscriptionTier('pro');
        else if (planId.startsWith('growth')) setSubscriptionTier('growth');
        else if (planId.startsWith('starter')) setSubscriptionTier('starter');
        else setSubscriptionTier('pro'); // active sub with unknown plan → treat as pro
      } else {
        setIsPro(false);
        setSubscriptionTier('free');
      }
    } catch {
      setIsPro(false);
      setSubscriptionTier('free');
    }
  };

  const refreshProfile = async () => {
    if (user) {
      const profileData = await fetchProfile(user.id);
      setProfile(profileData);
    }
  };

  useEffect(() => {
    let mounted = true;
    const setLoadingFalse = () => { if (mounted) setLoading(false); };

    supabase.auth.getSession()
      .then(async ({ data: { session }, error }) => {
        if (!mounted) return;
        if (error) {
          log.warn('getSession error', { error: error.message });
          setLoadingFalse();
          return;
        }
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          try {
            const profileData = await fetchProfile(session.user.id);
            if (mounted) {
              setProfile(profileData);
              setProfileError(null);
            }
          } catch (err: unknown) {
            log.error('Failed to load profile', { error: getErrorMessage(err) });
            if (mounted) {
              const msg = getErrorMessage(err);
              setProfileError(msg);
              setLastAuthError(msg);
              setProfile(null);
            }
          }
          fetchSubscription(session.user.id);
        }

        setLoadingFalse();
      })
      .catch((err) => {
        log.warn('getSession failed', { error: getErrorMessage(err) });
        setLoadingFalse();
      });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      try {
        if (!mounted) return;
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          try {
            const profileData = await fetchProfile(session.user.id);
            if (mounted) setProfile(profileData);
            setProfileError(null);
          } catch (err: unknown) {
            log.error('Failed to load profile', { error: getErrorMessage(err) });
            if (mounted) {
              const msg = getErrorMessage(err);
              setProfileError(msg);
              setLastAuthError(msg);
              setProfile(null);
            }
          }
          fetchSubscription(session.user.id);
        } else {
          setProfile(null);
          setProfileError(null);
          setSubscriptionTier('free');
          setIsPro(false);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (
    email: string,
    password: string,
    spaName?: string,
    role: UserRole = 'business_user',
    businessType?: string,
  ) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        log.warn('SignUp error', { error: error.message });
        setLastAuthError(error.message);
        return { error };
      }

      if (data.user) {
        // ── Step 1: For business_user signups, create the businesses record first
        // so we can link business_id in the user_profile in a single INSERT.
        let newBusinessId: string | null = null;

        if (role === 'business_user' && spaName) {
          const { data: bizData, error: bizError } = await supabase
            .from('businesses')
            .insert({
              name: spaName,
              type: businessType || 'spa',
              created_by_user_id: data.user.id,
            })
            .select('id')
            .single();

          if (bizError) {
            log.warn('Business record creation error', { error: bizError.message });
            // Non-fatal — profile still created, business_id will just be null
          } else {
            newBusinessId = bizData.id;
          }
        }

        // ── Step 2: Create user_profile, linking business_id if we have it
        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert({
            id: data.user.id,
            role: role,
            spa_name: spaName || null,
            contact_email: email,
            ...(newBusinessId ? { business_id: newBusinessId } : {}),
          });

        if (profileError) {
          log.warn('Profile creation error', { error: profileError.message });
          setLastAuthError(profileError.message);
        }

        // Send welcome email (best-effort, non-blocking)
        sendWelcomeEmail(email, { spa_name: spaName });
      }

      setLastAuthError(null);
      return { error: null };
    } catch (error) {
      log.warn('SignUp error', { error: getErrorMessage(error) });
      setLastAuthError(getErrorMessage(error));
      return { error: error instanceof Error ? error : new Error(getErrorMessage(error)) };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        log.warn('SignIn error', { error: error.message });
        setLastAuthError(error.message);
      } else {
        setLastAuthError(null);
      }

      return { error };
    } catch (error) {
      log.warn('SignIn error', { error: getErrorMessage(error) });
      setLastAuthError(getErrorMessage(error));
      return { error: error instanceof Error ? error : new Error(getErrorMessage(error)) };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        log.warn('Password reset error', { error: error.message });
        setLastAuthError(error.message);
      } else {
        setLastAuthError(null);
      }

      return { error };
    } catch (error) {
      log.warn('Password reset error', { error: getErrorMessage(error) });
      setLastAuthError(getErrorMessage(error));
      return { error: error instanceof Error ? error : new Error(getErrorMessage(error)) };
    }
  };

  const updatePassword = async (newPassword: string) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        log.warn('Password update error', { error: error.message });
        setLastAuthError(error.message);
      } else {
        setLastAuthError(null);
      }

      return { error };
    } catch (error) {
      log.warn('Password update error', { error: getErrorMessage(error) });
      setLastAuthError(getErrorMessage(error));
      return { error: error instanceof Error ? error : new Error(getErrorMessage(error)) };
    }
  };

  const effectiveRole: UserRole | null = profile?.role || null;

  const isAdmin = effectiveRole === 'admin' || effectiveRole === 'platform_admin';
  // Note: 'spa_user' is normalized to 'business_user' in fetchProfile, so check
  // both the normalized value and the raw DB value for backwards compatibility.
  const isSpaUser = effectiveRole === 'spa_user' || effectiveRole === 'business_user';
  const isBusinessUser = effectiveRole === 'business_user' || effectiveRole === 'spa_user';
  const isBrandAdmin = effectiveRole === 'brand_admin' || effectiveRole === 'admin' || effectiveRole === 'platform_admin';
  const isPlatformAdmin = effectiveRole === 'platform_admin';
  const brandId = profile?.brand_id || null;
  const businessId = profile?.business_id || null;

  const value = {
    user,
    session,
    profile,
    loading,
    profileError,
    lastAuthError,
    isAdmin,
    isSpaUser,
    isBusinessUser,
    isBrandAdmin,
    isPlatformAdmin,
    brandId,
    businessId,
    subscriptionTier,
    isPro,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
    refreshProfile,
    effectiveRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
