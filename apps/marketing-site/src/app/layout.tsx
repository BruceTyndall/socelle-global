import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
    metadataBase: new URL('https://socelle.com'),
    title: {
        default: 'Socelle — Professional Beauty Intelligence',
        template: '%s | Socelle',
    },
    description:
        'Intelligence platform for professional beauty operators, brands, and employers. Market signals, benchmarks, jobs, and events — updated continuously.',
    openGraph: {
        type: 'website',
        locale: 'en_US',
        url: 'https://socelle.com',
        siteName: 'Socelle',
        images: [
            {
                url: '/og-default.jpg',
                width: 1200,
                height: 630,
                alt: 'Socelle — Professional Beauty Intelligence',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        site: '@socelle',
    },
    robots: {
        index: true,
        follow: true,
        googleBot: { index: true, follow: true },
    },
};

export default function RootLayout({
    children,
}: Readonly<{ children: React.ReactNode }>) {
    return (
        <html lang="en" className={inter.variable}>
            <body className="bg-mn-bg antialiased">{children}</body>
        </html>
    );
}
