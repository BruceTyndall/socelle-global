import { createBrowserRouter } from 'react-router';
import { Root } from './pages/Root';
import { Home } from './pages/Home';
import { Intelligence } from './pages/Intelligence';
import { Professionals } from './pages/Professionals';
import { Brands } from './pages/Brands';
import { Events } from './pages/Events';
import { Jobs } from './pages/Jobs';
import { ArticleFeed } from './pages/ArticleFeed';
import { ArticleDetail } from './pages/ArticleDetail';

/*
 * SUPABASE INTEGRATION — routes.ts
 * ──────────────────────────────────────────────────────────────
 *
 * When Supabase is connected, add loaders to the feed routes
 * so data fetches before render (no loading spinners needed):
 *
 *   import { feedLoader } from './pages/ArticleFeed';
 *   import { articleLoader } from './pages/ArticleDetail';
 *
 *   { path: 'intelligence/feed', Component: ArticleFeed, loader: feedLoader },
 *   { path: 'intelligence/feed/:slug', Component: ArticleDetail, loader: articleLoader },
 *
 * See the integration notes in each page file for loader implementations.
 * ──────────────────────────────────────────────────────────────
 */

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Root,
    children: [
      { index: true, Component: Home },
      { path: 'intelligence', Component: Intelligence },
      { path: 'intelligence/feed', Component: ArticleFeed },
      { path: 'intelligence/feed/:slug', Component: ArticleDetail },
      { path: 'professionals', Component: Professionals },
      { path: 'brands', Component: Brands },
      { path: 'events', Component: Events },
      { path: 'jobs', Component: Jobs },
    ],
  },
]);