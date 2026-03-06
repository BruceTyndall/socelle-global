import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: [
                    '/portal/',   // Authenticated app — never index
                    '/admin/',    // Admin portal — never index
                    '/api/',      // API routes — never index
                    '/_next/',    // Next.js internals
                ],
            },
        ],
        sitemap: 'https://socelle.com/sitemap.xml',
        host: 'https://socelle.com',
    };
}
