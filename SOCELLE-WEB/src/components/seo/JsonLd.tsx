/**
 * JsonLd.tsx — Reusable JSON-LD structured data component
 *
 * Renders a <script type="application/ld+json"> tag with the provided schema object.
 * Use inside <Helmet> or standalone — both work with react-helmet-async.
 *
 * Usage:
 *   <JsonLd data={buildOrganizationSchema()} />
 *   <JsonLd data={[buildOrganizationSchema(), buildWebSiteSchema()]} />
 *
 * Authority: WO-OVERHAUL-05 Phase 5: SEO Infrastructure
 */

interface JsonLdProps {
  /** A single schema object or an array of schema objects */
  data: Record<string, unknown> | Record<string, unknown>[];
}

export default function JsonLd({ data }: JsonLdProps) {
  const schemas = Array.isArray(data) ? data : [data];

  return (
    <>
      {schemas.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
    </>
  );
}
