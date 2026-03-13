/**
 * SOCELLE Commerce Mini-App — Scoped Entry
 *
 * Standalone app for the B2B Commerce hub.
 * Routes: public shop, cart, checkout, portal commerce, admin shop.
 *
 * Shared backend: same Supabase project (rumdmulxzmjtsplsjngi)
 * Auth: same Supabase auth — tokens work cross-app.
 *
 * IMPORTANT: This file replaces the monolithic SOCELLE-WEB App.tsx.
 * All other hubs are intentionally excluded. Cross-hub signals are
 * read-only (via useIntelligence hook) but not rendered as full pages here.
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
import { ModuleRoute } from './components/gates';
import ProtectedRoute from './components/ProtectedRoute';
import { ConfigCheck } from './components/ConfigCheck';

const fallback = <div className="flex h-screen items-center justify-center bg-background text-graphite/40 text-sm">Loading…</div>;

// ── Auth ──────────────────────────────────────────────────────────────────────
const Login = lazy(() => import('./pages/public/Login'));
const Register = lazy(() => import('./pages/public/Register'));
const ForgotPassword = lazy(() => import('./pages/public/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/public/ResetPassword'));

// ── Public shop ───────────────────────────────────────────────────────────────
const Shop = lazy(() => import('./pages/public/Shop'));
const ShopCategory = lazy(() => import('./pages/public/ShopCategory'));
const ShopProduct = lazy(() => import('./pages/public/ShopProduct'));
const ShopCart = lazy(() => import('./pages/public/ShopCart'));
const ShopCheckout = lazy(() => import('./pages/public/ShopCheckout'));
const ShopOrders = lazy(() => import('./pages/public/ShopOrders'));
const ShopOrderDetail = lazy(() => import('./pages/public/ShopOrderDetail'));
const ShopWishlist = lazy(() => import('./pages/public/ShopWishlist'));
const IntelligenceCommerce = lazy(() => import('./pages/public/IntelligenceCommerce'));
const ProductDetail = lazy(() => import('./pages/public/ProductDetail'));
const CartPage = lazy(() => import('./pages/public/Cart'));
const CheckoutPage = lazy(() => import('./pages/public/Checkout'));

// ── Portal commerce (authenticated) ──────────────────────────────────────────
const PortalLayout = lazy(() => import('./layouts/PortalLayout'));
const CommerceHub = lazy(() => import('./pages/business/CommerceHub'));
const WishlistPage = lazy(() => import('./pages/business/WishlistPage'));
const OrderHistory = lazy(() => import('./pages/business/OrderHistory'));
const OrderDetail = lazy(() => import('./pages/business/OrderDetail'));

// ── Admin shop ────────────────────────────────────────────────────────────────
const AdminLayout = lazy(() => import('./layouts/AdminLayout'));
const AdminShopHub = lazy(() => import('./pages/admin/AdminShopHub'));
const AdminShopProducts = lazy(() => import('./pages/admin/shop/AdminShopProducts'));
const AdminShopCategories = lazy(() => import('./pages/admin/shop/AdminShopCategories'));
const AdminShopOrders = lazy(() => import('./pages/admin/shop/AdminShopOrders'));
const AdminShopDiscounts = lazy(() => import('./pages/admin/shop/AdminShopDiscounts'));
const AdminShopShipping = lazy(() => import('./pages/admin/shop/AdminShopShipping'));
const AdminShopReviews = lazy(() => import('./pages/admin/shop/AdminShopReviews'));

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
                        <Route path="/register" element={<Register />} />
                        <Route path="/forgot-password" element={<ForgotPassword />} />
                        <Route path="/reset-password" element={<ResetPassword />} />

                        {/* ── Public shop ──────────────────────────── */}
                        <Route path="/shop" element={<ModuleRoute moduleKey="MODULE_SHOP"><Shop /></ModuleRoute>} />
                        <Route path="/shop/intelligence" element={<ModuleRoute moduleKey="MODULE_SHOP"><IntelligenceCommerce /></ModuleRoute>} />
                        <Route path="/shop/category/:slug" element={<ModuleRoute moduleKey="MODULE_SHOP"><ShopCategory /></ModuleRoute>} />
                        <Route path="/shop/product/:slug" element={<ModuleRoute moduleKey="MODULE_SHOP"><ShopProduct /></ModuleRoute>} />
                        <Route path="/shop/cart" element={<ModuleRoute moduleKey="MODULE_SHOP"><ShopCart /></ModuleRoute>} />
                        <Route path="/shop/checkout" element={<ModuleRoute moduleKey="MODULE_SHOP"><ShopCheckout /></ModuleRoute>} />
                        <Route
                          path="/shop/orders"
                          element={
                            <ProtectedRoute>
                              <ModuleRoute moduleKey="MODULE_SHOP"><ShopOrders /></ModuleRoute>
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/shop/orders/:id"
                          element={
                            <ProtectedRoute>
                              <ModuleRoute moduleKey="MODULE_SHOP"><ShopOrderDetail /></ModuleRoute>
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/shop/wishlist"
                          element={
                            <ProtectedRoute>
                              <ModuleRoute moduleKey="MODULE_SHOP"><ShopWishlist /></ModuleRoute>
                            </ProtectedRoute>
                          }
                        />
                        {/* Legacy short routes */}
                        <Route path="/shop/:slug" element={<ModuleRoute moduleKey="MODULE_SHOP"><ProductDetail /></ModuleRoute>} />
                        <Route path="/cart" element={<ModuleRoute moduleKey="MODULE_SHOP"><CartPage /></ModuleRoute>} />
                        <Route path="/checkout" element={<ModuleRoute moduleKey="MODULE_SHOP"><CheckoutPage /></ModuleRoute>} />

                        {/* ── Portal commerce ───────────────────────── */}
                        <Route
                          path="/portal"
                          element={
                            <ProtectedRoute requireRole="business">
                              <PortalLayout />
                            </ProtectedRoute>
                          }
                        >
                          <Route index element={<Navigate to="/portal/commerce" replace />} />
                          <Route path="commerce" element={<CommerceHub />} />
                          <Route path="commerce/wishlist" element={<WishlistPage />} />
                          <Route path="commerce/orders" element={<OrderHistory />} />
                          <Route path="commerce/orders/:id" element={<OrderDetail />} />
                        </Route>

                        {/* ── Admin shop ────────────────────────────── */}
                        <Route
                          path="/admin"
                          element={
                            <ProtectedRoute requireRole="admin">
                              <AdminLayout />
                            </ProtectedRoute>
                          }
                        >
                          <Route path="shop" element={<AdminShopHub />} />
                          <Route path="shop/products" element={<AdminShopProducts />} />
                          <Route path="shop/categories" element={<AdminShopCategories />} />
                          <Route path="shop/orders" element={<AdminShopOrders />} />
                          <Route path="shop/discounts" element={<AdminShopDiscounts />} />
                          <Route path="shop/shipping" element={<AdminShopShipping />} />
                          <Route path="shop/reviews" element={<AdminShopReviews />} />
                        </Route>

                        {/* ── Root redirect ─────────────────────────── */}
                        <Route path="/" element={<Navigate to="/shop" replace />} />
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
