export function normalizeMediaUrl(url: string | null | undefined): string | null {
  if (!url) return null;

  const decoded = url
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim();

  if (!decoded) return null;
  if (decoded.startsWith('//')) return `https:${decoded}`;

  return decoded;
}

export function normalizeMediaUrls(urls: string[] | null | undefined): string[] {
  if (!urls?.length) return [];
  return urls
    .map((url) => normalizeMediaUrl(url))
    .filter((url): url is string => Boolean(url));
}
