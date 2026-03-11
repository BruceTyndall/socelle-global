/**
 * Dev-only guard for mock/fixture data.
 * Vite tree-shakes `import.meta.env.DEV` branches in production builds,
 * so mock data never reaches the production bundle.
 */
export function devOnly<T>(factory: () => T): T | null {
  if (import.meta.env.DEV) return factory();
  return null;
}
