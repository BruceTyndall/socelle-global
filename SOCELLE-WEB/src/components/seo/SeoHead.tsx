import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SeoHeadProps {
  title: string;
  description: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product' | 'profile';
  canonicalUrl?: string;
  jsonLd?: Record<string, any> | Record<string, any>[];
  productMeta?: {
    priceAmount?: string;
    priceCurrency?: string;
    availability?: string;
    brand?: string;
  };
}

const DEFAULT_IMAGE = 'https://socelle.com/og-image.jpeg';
const DEFAULT_URL = 'https://socelle.com';

export function SeoHead({
  title,
  description,
  image = DEFAULT_IMAGE,
  url,
  type = 'website',
  canonicalUrl,
  jsonLd,
  productMeta
}: SeoHeadProps) {
  const currentUrl = url || (typeof window !== 'undefined' ? window.location.href : DEFAULT_URL);
  const finalImage = image || DEFAULT_IMAGE;
  const siteName = 'Socelle';
  const fullTitle = title.includes(siteName) ? title : `${title} | ${siteName}`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      
      {/* Canonical */}
      <link rel="canonical" href={canonicalUrl || currentUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={finalImage} />
      <meta property="og:site_name" content={siteName} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={currentUrl} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={finalImage} />

      {/* Commerce Specific (Shopify standards for Pinterest/FB dynamic catalogs) */}
      {type === 'product' && productMeta && (
        <>
          {productMeta.priceAmount && <meta property="product:price:amount" content={productMeta.priceAmount} />}
          {productMeta.priceCurrency && <meta property="product:price:currency" content={productMeta.priceCurrency} />}
          {productMeta.availability && <meta property="product:availability" content={productMeta.availability} />}
          {productMeta.brand && <meta property="product:brand" content={productMeta.brand} />}
        </>
      )}

      {/* Structured Data (JSON-LD) */}
      {jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      )}
    </Helmet>
  );
}
