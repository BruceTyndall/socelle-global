import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    // Allow importing from workspace packages
    transpilePackages: ['@socelle/ui', '@socelle/supabase-config'],

    // Performance: enable React strict mode in dev
    reactStrictMode: true,

    // Image optimisation — add Supabase storage domain once known
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '*.supabase.co',
                port: '',
                pathname: '/storage/v1/object/public/**',
            },
        ],
    },

    // Redirects to align with the new nav rebranding
    async redirects() {
        return [
            { source: '/for-buyers', destination: '/professionals', permanent: true },
            { source: '/pricing', destination: '/plans', permanent: true },
            { source: '/education', destination: '/education', permanent: false },
        ];
    },
};

export default nextConfig;
