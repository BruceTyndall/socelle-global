/**
 * SOCELLE Studio Mini-App — Scoped Entry
 *
 * Standalone app for the Authoring Studio and Course Builder.
 * Routes: portal studio, course builder, education content creation.
 *
 * Shared backend: same Supabase project (rumdmulxzmjtsplsjngi)
 * Auth: same Supabase auth — tokens work cross-app.
 *
 * IMPORTANT: This file replaces the monolithic SOCELLE-WEB App.tsx.
 * All other hubs (CRM, Sales, Commerce, etc.) are intentionally excluded.
 * Content published here flows through the CMS into Intelligence and other hubs.
 *
 * Design: Pearl Mineral V2 cool-toned token system
 */

import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from './lib/auth';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ToastProvider } from './components/Toast';
import { ModuleAccessProvider } from './modules/_core/context/ModuleAccessContext';
import ProtectedRoute from './components/ProtectedRoute';
import { ConfigCheck } from './components/ConfigCheck';

const fallback = <div className="flex h-screen items-center justify-center bg-background text-graphite/40 text-sm">Loading…</div>;

// ── Auth ──────────────────────────────────────────────────────────────────────
const Login = lazy(() => import('./pages/public/Login'));
const ForgotPassword = lazy(() => import('./pages/public/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/public/ResetPassword'));

// ── Portal layout ─────────────────────────────────────────────────────────────
const PortalLayout = lazy(() => import('./layouts/PortalLayout'));

// ── Studio ────────────────────────────────────────────────────────────────────
const StudioHome = lazy(() => import('./pages/business/studio/StudioHome'));
const StudioEditor = lazy(() => import('./pages/business/studio/StudioEditor'));
const CourseBuilder = lazy(() => import('./pages/business/studio/CourseBuilder'));

// ── CMS (admin authoring) ─────────────────────────────────────────────────────
const AdminLayout = lazy(() => import('./layouts/AdminLayout'));
const CmsDashboard = lazy(() => import('./pages/admin/cms/CmsDashboard'));
const CmsPagesList = lazy(() => import('./pages/admin/cms/CmsPagesList'));
const CmsPostsList = lazy(() => import('./pages/admin/cms/CmsPostsList'));
const CmsBlockLibrary = lazy(() => import('./pages/admin/cms/CmsBlockLibrary'));
const CmsMediaLibrary = lazy(() => import('./pages/admin/cms/CmsMediaLibrary'));
const CmsSpacesConfig = lazy(() => import('./pages/admin/cms/CmsSpacesConfig'));
const CmsTemplatesList = lazy(() => import('./pages/admin/cms/CmsTemplatesList'));
const AdminStoryDrafts = lazy(() => import('./pages/admin/cms/AdminStoryDrafts'));
const PageLayoutBuilder = lazy(() => import('./pages/admin/cms/PageLayoutBuilder'));

// ── Education (content creation side) ────────────────────────────────────────
const EducationHub = lazy(() => import('./pages/business/EducationHub'));
const CoursePlayer = lazy(() => import('./pages/public/CoursePlayer'));

// ── Not found ─────────────────────────────────────────────────────────────────
const NotFound = lazy(() => import('./pages/public/NotFound'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, retry: 1 },
  },
});

export default function App() {
  return (
    <HelmetProvider>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <ModuleAccessProvider>
              <ToastProvider>
                <ConfigCheck>
                  <BrowserRouter>
                    <Suspense fallback={fallback}>
                      <Routes>

                        {/* ── Auth ─────────────────────────────────── */}
                        <Route path="/login" element={<Login />} />
                        <Route path="/forgot-password" element={<ForgotPassword />} />
                        <Route path="/reset-password" element={<ResetPassword />} />

                        {/* ── Public course player ──────────────────── */}
                        <Route path="/courses/:id" element={<CoursePlayer />} />

                        {/* ── Portal studio ─────────────────────────── */}
                        <Route
                          path="/portal"
                          element={
                            <ProtectedRoute requireRole="business">
                              <PortalLayout />
                            </ProtectedRoute>
                          }
                        >
                          <Route index element={<Navigate to="/portal/studio" replace />} />
                          <Route path="studio" element={<StudioHome />} />
                          <Route path="studio/editor" element={<StudioEditor />} />
                          <Route path="studio/editor/:id" element={<StudioEditor />} />
                          <Route path="studio/course" element={<CourseBuilder />} />
                          <Route path="studio/course/:id" element={<CourseBuilder />} />
                          <Route path="education" element={<EducationHub />} />
                        </Route>

                        {/* ── Admin CMS ─────────────────────────────── */}
                        <Route
                          path="/admin"
                          element={
                            <ProtectedRoute requireRole="admin">
                              <AdminLayout />
                            </ProtectedRoute>
                          }
                        >
                          <Route path="cms" element={<CmsDashboard />} />
                          <Route path="cms/pages" element={<CmsPagesList />} />
                          <Route path="cms/posts" element={<CmsPostsList />} />
                          <Route path="cms/blocks" element={<CmsBlockLibrary />} />
                          <Route path="cms/media" element={<CmsMediaLibrary />} />
                          <Route path="cms/spaces" element={<CmsSpacesConfig />} />
                          <Route path="cms/templates" element={<CmsTemplatesList />} />
                          <Route path="cms/story-drafts" element={<AdminStoryDrafts />} />
                          <Route path="cms/layout-builder" element={<PageLayoutBuilder />} />
                        </Route>

                        {/* ── Root redirect ─────────────────────────── */}
                        <Route path="/" element={<Navigate to="/portal/studio" replace />} />
                        <Route path="*" element={<NotFound />} />

                      </Routes>
                    </Suspense>
                  </BrowserRouter>
                </ConfigCheck>
              </ToastProvider>
            </ModuleAccessProvider>
          </AuthProvider>
        </QueryClientProvider>
      </ErrorBoundary>
    </HelmetProvider>
  );
}
