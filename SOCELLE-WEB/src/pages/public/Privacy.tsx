import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import MainNav from '../../components/MainNav';
import SiteFooter from '../../components/sections/SiteFooter';
import { useCmsPage } from '../../lib/useCmsPage';

const SECTIONS = [
  {
    title: 'Information We Collect',
    body: `We collect information you provide directly to us, including your name, email address, business name, and service menu content when you create an account or use our services. We also collect usage data to improve the platform experience.`,
  },
  {
    title: 'How We Use Your Information',
    body: `We use your information to provide, maintain, and improve our services; send you communications about your account and our platform; and generate brand match analysis and recommendations. We do not sell your personal information to third parties.`,
  },
  {
    title: 'Data Storage & Security',
    body: `Your data is stored securely using Supabase, which provides encrypted storage and industry-standard security practices. Service menu content is used solely to generate analysis reports within your account.`,
  },
  {
    title: 'Cookies & Tracking',
    body: `We use minimal cookies required for authentication and session management. We do not use third-party advertising trackers. Analytics data is collected in aggregate form only.`,
  },
  {
    title: 'Your Rights',
    body: `You may request access to, correction of, or deletion of your personal data at any time by contacting us. You may also export your data or close your account through your account settings.`,
  },
  {
    title: 'Contact',
    body: `If you have questions about this privacy policy or how we handle your data, please contact us at privacy@socelle.com.`,
  },
];

export default function Privacy() {
  const { isLive: _cmsLive } = useCmsPage('privacy');

  return (
    <div className="min-h-screen bg-mn-bg font-sans">
      <Helmet>
        <title>Privacy Policy — Socelle</title>
        <meta name="description" content="Socelle privacy policy. Learn how we collect, use, and safeguard your information on our professional beauty wholesale platform." />
        <meta property="og:title" content="Privacy Policy — Socelle" />
        <meta property="og:description" content="Learn how Socelle collects, uses, and safeguards your information." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://socelle.com/privacy" />
        <meta property="og:image" content="https://socelle.com/og-image.svg" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://socelle.com/privacy" />
        <script type="application/ld+json">{JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          name: 'Privacy Policy — Socelle',
          description: 'Socelle privacy policy. Learn how we collect, use, and safeguard your information on our professional beauty intelligence platform.',
          url: 'https://socelle.com/privacy',
          isPartOf: { '@type': 'WebSite', url: 'https://socelle.com', name: 'Socelle' },
        })}</script>
      </Helmet>
      <MainNav />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="mb-12">
          <p className="text-accent text-[11px] font-sans font-medium tracking-[0.25em] uppercase mb-4">Legal</p>
          <h1 className="font-sans font-semibold text-4xl text-graphite mb-3">Privacy Policy</h1>
          <div className="w-10 h-px bg-accent/50 mb-5" />
          <p className="text-graphite/50 font-sans font-light text-sm">Last updated: January 2025</p>
        </div>

        <div className="space-y-10">
          <p className="text-graphite/60 font-sans leading-relaxed">
            Socelle ("we", "our", "us") is committed to protecting your privacy. This policy explains how we collect,
            use, and safeguard your information when you use our platform.
          </p>

          {SECTIONS.map((section) => (
            <div key={section.title}>
              <h2 className="font-sans font-semibold text-graphite text-base mb-3">{section.title}</h2>
              <p className="text-graphite/60 font-sans leading-relaxed font-light text-sm">{section.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 pt-8 border-t border-graphite/10 flex gap-6">
          <Link to="/terms" className="text-sm text-graphite hover:underline font-sans font-medium">
            Terms of Service
          </Link>
          <Link to="/" className="text-sm text-graphite/60 hover:text-graphite font-sans transition-colors">
            Back to home
          </Link>
        </div>
      </div>

      <SiteFooter />
    </div>
  );
}
