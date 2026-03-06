import React, { useMemo } from 'react';
import type {
  Brand,
  BrandModule,
  BrandProducts,
  Protocol,
  TypographyStyles,
  DensityStyles,
  StatItem,
} from '../lib/types';

interface BrandPageRendererProps {
  brand: Brand;
  modules: BrandModule[];
  protocols?: Protocol[];
  products?: BrandProducts;
}

export default function BrandPageRenderer({
  brand,
  modules,
  protocols = [],
  products = { pro: [], retail: [] },
}: BrandPageRendererProps) {
  const { theme } = brand;
  const { colors, typography, density } = theme;

  const enabledModules = useMemo(
    () => modules.filter((m) => m.is_enabled).sort((a, b) => a.sort_order - b.sort_order),
    [modules]
  );

  const typographyStyles = useMemo(() => getTypographyStyles(typography), [typography]);
  const densityStyles = useMemo(() => getDensityStyles(density), [density]);

  if (enabledModules.length === 0) {
    return (
      <DefaultBrandLayout
        brand={brand}
        protocols={protocols}
        products={products}
        typographyStyles={typographyStyles}
        densityStyles={densityStyles}
      />
    );
  }

  return (
    <div
      style={{
        '--brand-primary': colors.primary,
        '--brand-secondary': colors.secondary,
        '--brand-accent': colors.accent,
        '--brand-surface': colors.surface,
        '--brand-text': colors.text,
      } as React.CSSProperties}
      className="w-full"
    >
      {enabledModules.map((module) => (
        <ModuleRenderer
          key={module.id}
          module={module}
          brand={brand}
          protocols={protocols}
          products={products}
          typographyStyles={typographyStyles}
          densityStyles={densityStyles}
        />
      ))}
    </div>
  );
}

interface ModuleRendererProps {
  module: BrandModule;
  brand: Brand;
  protocols: Protocol[];
  products: BrandProducts;
  typographyStyles: TypographyStyles;
  densityStyles: DensityStyles;
}

function ModuleRenderer({
  module, brand, protocols, products, typographyStyles, densityStyles,
}: ModuleRendererProps) {
  switch (module.module_type) {
    case 'hero':
      return <HeroModule module={module} brand={brand} typographyStyles={typographyStyles} densityStyles={densityStyles} />;
    case 'gallery':
      return <GalleryModule module={module} densityStyles={densityStyles} />;
    case 'featured_protocols':
      return <FeaturedProtocolsModule module={module} protocols={protocols} brand={brand} typographyStyles={typographyStyles} densityStyles={densityStyles} />;
    case 'featured_products':
      return <FeaturedProductsModule module={module} products={products} brand={brand} typographyStyles={typographyStyles} densityStyles={densityStyles} />;
    case 'rich_text':
      return <RichTextModule module={module} brand={brand} typographyStyles={typographyStyles} densityStyles={densityStyles} />;
    case 'stats_bar':
      return <StatsBarModule module={module} brand={brand} typographyStyles={typographyStyles} densityStyles={densityStyles} />;
    case 'cta':
      return <CTAModule module={module} brand={brand} typographyStyles={typographyStyles} densityStyles={densityStyles} />;
    default:
      return null;
  }
}

interface BaseModuleProps {
  module: BrandModule;
  brand: Brand;
  typographyStyles: TypographyStyles;
  densityStyles: DensityStyles;
}

function HeroModule({ module, brand, typographyStyles, densityStyles }: BaseModuleProps) {
  const { layout_variant, config } = module;
  const { colors } = brand.theme;
  const backgroundImage = config?.background_image || brand.hero_image_url;
  const headline = config?.headline || brand.name;
  const subheadline = config?.subheadline || brand.description;
  const ctaLabel = config?.button_label || 'Learn More';
  const ctaUrl = config?.button_url || '#';

  if (layout_variant === 'full_bleed' || layout_variant === 'video') {
    return (
      <div
        className="relative min-h-[500px] flex items-center justify-center text-center px-6"
        style={{
          backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
          backgroundColor: backgroundImage ? undefined : colors.primary,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0" style={{ background: backgroundImage ? 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.7) 100%)' : undefined }} />
        <div className="relative z-10 max-w-4xl text-white">
          <h1 className="text-4xl md:text-6xl mb-6" style={{ ...typographyStyles.headline, color: 'white' }}>{headline}</h1>
          <p className="text-xl mb-8 opacity-90" style={typographyStyles.body}>{subheadline}</p>
          <a href={ctaUrl} className="inline-block px-8 py-3 rounded-lg font-medium transition-all hover:opacity-90" style={{ backgroundColor: colors.accent, color: 'white' }}>{ctaLabel}</a>
        </div>
      </div>
    );
  }

  if (layout_variant === 'split') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-0" style={{ backgroundColor: colors.surface }}>
        {backgroundImage && <div className="h-[400px] md:h-auto bg-cover bg-center rounded-lg md:rounded-none" style={{ backgroundImage: `url(${backgroundImage})` }} />}
        <div className={`flex flex-col justify-center ${densityStyles.padding} px-6 md:px-12`}>
          <h1 className="text-3xl md:text-5xl mb-6" style={typographyStyles.headline}>{headline}</h1>
          <p className="mb-8" style={{ ...typographyStyles.body, color: colors.text }}>{subheadline}</p>
          <div><a href={ctaUrl} className="inline-block px-8 py-3 rounded-lg font-medium transition-all hover:opacity-90" style={{ backgroundColor: colors.accent, color: 'white' }}>{ctaLabel}</a></div>
        </div>
      </div>
    );
  }

  if (layout_variant === 'minimal') {
    return (
      <div className={`${densityStyles.padding} text-center px-6`} style={{ backgroundColor: colors.primary }}>
        <div className="max-w-4xl mx-auto text-white">
          <h1 className="text-4xl md:text-6xl mb-6" style={{ ...typographyStyles.headline, color: 'white' }}>{headline}</h1>
          <p className="text-xl mb-8 opacity-90" style={typographyStyles.body}>{subheadline}</p>
          <a href={ctaUrl} className="inline-block px-8 py-3 rounded-lg font-medium transition-all hover:opacity-90" style={{ backgroundColor: colors.accent, color: 'white' }}>{ctaLabel}</a>
        </div>
      </div>
    );
  }

  if (layout_variant === 'editorial') {
    return (
      <div className={`${densityStyles.padding} px-6`} style={{ backgroundColor: colors.surface }}>
        <div className="max-w-6xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold mb-6" style={{ ...typographyStyles.headline, color: colors.primary }}>{headline}</h1>
          <p className="text-2xl mb-8" style={{ ...typographyStyles.body, color: colors.secondary }}>{subheadline}</p>
        </div>
      </div>
    );
  }

  return null;
}

function GalleryModule({ module, densityStyles }: { module: BrandModule; densityStyles: DensityStyles }) {
  const { layout_variant, config } = module;
  const images = config?.images ?? [];
  if (images.length === 0) return null;

  const renderImage = (img: string, idx: number, className: string) => (
    <div key={idx} className={className}>
      <img src={img} alt={`Gallery image ${idx + 1}`} className="w-full h-full object-cover" />
    </div>
  );

  if (layout_variant === 'grid') {
    return (
      <div className={`${densityStyles.padding} px-6`}>
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-3 gap-4">
          {images.map((img, idx) => renderImage(img, idx, 'aspect-square rounded-lg overflow-hidden'))}
        </div>
      </div>
    );
  }

  if (layout_variant === 'carousel') {
    return (
      <div className={`${densityStyles.padding} px-6`}>
        <div className="max-w-7xl mx-auto flex overflow-x-auto snap-x gap-4 pb-4">
          {images.map((img, idx) => renderImage(img, idx, 'min-w-[300px] snap-start rounded-lg overflow-hidden'))}
        </div>
      </div>
    );
  }

  if (layout_variant === 'masonry') {
    return (
      <div className={`${densityStyles.padding} px-6`}>
        <div className="max-w-7xl mx-auto columns-2 md:columns-3 gap-4">
          {images.map((img, idx) => (
            <div key={idx} className="mb-4 break-inside-avoid rounded-lg overflow-hidden">
              <img src={img} alt={`Gallery image ${idx + 1}`} className="w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return null;
}

function FeaturedProtocolsModule({
  module, protocols, brand, typographyStyles, densityStyles,
}: BaseModuleProps & { protocols: Protocol[] }) {
  const { layout_variant, config, title } = module;
  const selectedIds = config?.selected_protocol_ids ?? [];
  const filteredProtocols = protocols.filter((p) => selectedIds.includes(p.id));
  if (filteredProtocols.length === 0) return null;
  const { colors } = brand.theme;

  const getProtocolName = (p: Protocol) => p.name ?? p.protocol_name ?? 'Untitled';
  const getProtocolDuration = (p: Protocol) => p.duration ?? p.typical_duration;

  return (
    <div className={`${densityStyles.padding} px-6`} style={{ backgroundColor: colors.surface }}>
      <div className="max-w-7xl mx-auto">
        {title && <h2 className="text-3xl md:text-4xl mb-8" style={typographyStyles.headline}>{title}</h2>}

        {layout_variant === 'cards' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProtocols.map((protocol) => (
              <div key={protocol.id} className="p-6 rounded-lg border-l-4" style={{ backgroundColor: 'white', borderLeftColor: colors.accent }}>
                <h3 className="text-xl font-semibold mb-2" style={{ color: colors.text }}>{getProtocolName(protocol)}</h3>
                {protocol.category && <span className="inline-block px-3 py-1 rounded-full text-xs font-medium mb-3" style={{ backgroundColor: colors.primary, color: 'white' }}>{protocol.category}</span>}
                {getProtocolDuration(protocol) && <p className="text-sm" style={{ color: colors.secondary }}>{getProtocolDuration(protocol)}</p>}
              </div>
            ))}
          </div>
        )}

        {layout_variant === 'list' && (
          <div className="divide-y" style={{ borderColor: colors.secondary }}>
            {filteredProtocols.map((protocol) => (
              <div key={protocol.id} className="py-4 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold" style={{ color: colors.text }}>{getProtocolName(protocol)}</h3>
                  {protocol.category && <span className="text-sm" style={{ color: colors.secondary }}>{protocol.category}</span>}
                </div>
                {getProtocolDuration(protocol) && <span className="text-sm" style={{ color: colors.secondary }}>{getProtocolDuration(protocol)}</span>}
              </div>
            ))}
          </div>
        )}

        {layout_variant === 'detailed' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {filteredProtocols.map((protocol) => (
              <div key={protocol.id} className="p-8 rounded-lg" style={{ backgroundColor: 'white' }}>
                <h3 className="text-2xl font-semibold mb-3" style={{ color: colors.text }}>{getProtocolName(protocol)}</h3>
                {protocol.category && <span className="inline-block px-3 py-1 rounded-full text-xs font-medium mb-4" style={{ backgroundColor: colors.primary, color: 'white' }}>{protocol.category}</span>}
                {protocol.description && <p className="mb-4" style={{ ...typographyStyles.body, color: colors.text }}>{protocol.description}</p>}
                {getProtocolDuration(protocol) && <p className="text-sm" style={{ color: colors.secondary }}>Duration: {getProtocolDuration(protocol)}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function FeaturedProductsModule({
  module, products, brand, typographyStyles, densityStyles,
}: BaseModuleProps & { products: BrandProducts }) {
  const { layout_variant, config, title } = module;
  const selectedProIds = config?.selected_pro_ids ?? [];
  const selectedRetailIds = config?.selected_retail_ids ?? [];
  const { colors } = brand.theme;

  const filteredProducts = useMemo(() => [
    ...products.pro.filter((p) => selectedProIds.includes(p.id)),
    ...products.retail.filter((p) => selectedRetailIds.includes(p.id)),
  ], [products, selectedProIds, selectedRetailIds]);

  if (filteredProducts.length === 0) return null;

  const getProductName = (p: { name?: string; product_name: string }) => p.name ?? p.product_name;

  const ProductCard = ({ product }: { product: typeof filteredProducts[number] }) => (
    <div key={product.id} className="rounded-lg overflow-hidden" style={{ backgroundColor: 'white' }}>
      {product.image_url && <img src={product.image_url} alt={getProductName(product)} className="w-full aspect-square object-cover" />}
      <div className="p-4">
        <h3 className="font-semibold mb-1" style={{ color: colors.text }}>{getProductName(product)}</h3>
        {product.category && <p className="text-xs" style={{ color: colors.secondary }}>{product.category}</p>}
      </div>
    </div>
  );

  return (
    <div className={`${densityStyles.padding} px-6`} style={{ backgroundColor: colors.surface }}>
      <div className="max-w-7xl mx-auto">
        {title && <h2 className="text-3xl md:text-4xl mb-8" style={typographyStyles.headline}>{title}</h2>}

        {layout_variant === 'grid' && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => <ProductCard key={product.id} product={product} />)}
          </div>
        )}

        {layout_variant === 'carousel' && (
          <div className="flex overflow-x-auto snap-x gap-6 pb-4">
            {filteredProducts.map((product) => (
              <div key={product.id} className="min-w-[250px] snap-start">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}

        {layout_variant === 'compact' && (
          <div className="space-y-4">
            {filteredProducts.map((product) => (
              <div key={product.id} className="flex items-center gap-4">
                {product.image_url && <img src={product.image_url} alt={getProductName(product)} className="w-16 h-16 rounded object-cover" />}
                <div>
                  <h3 className="font-semibold" style={{ color: colors.text }}>{getProductName(product)}</h3>
                  {product.category && <p className="text-sm" style={{ color: colors.secondary }}>{product.category}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function RichTextModule({ module, brand, typographyStyles, densityStyles }: BaseModuleProps) {
  const { config, title } = module;
  const content = config?.content ?? '';
  const paragraphs = useMemo(() => content.split('\n\n').filter((p) => p.trim()), [content]);

  return (
    <div className={`${densityStyles.padding} px-6`}>
      <div className="max-w-3xl mx-auto">
        {title && <h2 className="text-3xl md:text-4xl mb-8" style={typographyStyles.headline}>{title}</h2>}
        <div className="space-y-4">
          {paragraphs.map((paragraph, idx) => (
            <p key={idx} style={{ ...typographyStyles.body, color: brand.theme.colors.text }}>{paragraph}</p>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatsBarModule({ module, brand, densityStyles }: BaseModuleProps) {
  const { layout_variant, config } = module;
  const stats: StatItem[] = config?.stats ?? [];
  if (stats.length === 0) return null;
  const { colors } = brand.theme;

  return (
    <div className={`${densityStyles.padding} px-6`} style={{ backgroundColor: colors.primary }}>
      <div className="max-w-7xl mx-auto">
        {layout_variant === 'horizontal' && (
          <div className="flex flex-wrap justify-around items-center divide-x divide-white/20">
            {stats.map((stat, idx) => (
              <div key={idx} className="px-8 text-center text-white">
                <div className="text-4xl md:text-5xl font-bold mb-2">{stat.value}</div>
                <div className="text-sm opacity-80">{stat.label}</div>
              </div>
            ))}
          </div>
        )}
        {layout_variant === 'cards' && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, idx) => (
              <div key={idx} className="p-6 rounded-lg text-center" style={{ backgroundColor: 'white' }}>
                <div className="text-3xl font-bold mb-2" style={{ color: colors.primary }}>{stat.value}</div>
                <div className="text-sm" style={{ color: colors.text }}>{stat.label}</div>
              </div>
            ))}
          </div>
        )}
        {layout_variant === 'centered' && (
          <div className="flex flex-wrap justify-center items-center gap-12">
            {stats.map((stat, idx) => (
              <div key={idx} className="text-center text-white">
                <div className="text-5xl font-bold mb-2">{stat.value}</div>
                <div className="text-sm opacity-80">{stat.label}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function CTAModule({ module, brand, typographyStyles, densityStyles }: BaseModuleProps) {
  const { config } = module;
  const headline = config?.headline ?? 'Ready to get started?';
  const body = config?.body ?? 'Contact us today to learn more';
  const buttonLabel = config?.button_label ?? 'Get Started';
  const buttonUrl = config?.button_url ?? '#';
  const { colors } = brand.theme;

  return (
    <div className={`${densityStyles.padding} px-6 text-center`} style={{ backgroundColor: colors.accent }}>
      <div className="max-w-4xl mx-auto text-white">
        <h2 className="text-3xl md:text-5xl mb-4" style={{ ...typographyStyles.headline, color: 'white' }}>{headline}</h2>
        <p className="text-lg mb-8 opacity-90" style={typographyStyles.body}>{body}</p>
        <a
          href={buttonUrl}
          className="inline-block px-8 py-3 rounded-lg font-medium border-2 border-white text-white hover:bg-white transition-all"
          style={{ color: 'white' }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'white'; e.currentTarget.style.color = colors.accent; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'white'; }}
        >
          {buttonLabel}
        </a>
      </div>
    </div>
  );
}

interface DefaultBrandLayoutProps {
  brand: Brand;
  protocols: Protocol[];
  products: BrandProducts;
  typographyStyles: TypographyStyles;
  densityStyles: DensityStyles;
}

function DefaultBrandLayout({ brand, protocols, products, typographyStyles, densityStyles }: DefaultBrandLayoutProps) {
  const { colors } = brand.theme;

  const getProtocolName = (p: Protocol) => p.name ?? p.protocol_name ?? 'Untitled';
  const getProductName = (p: { name?: string; product_name: string }) => p.name ?? p.product_name;

  return (
    <div>
      <div className={`${densityStyles.padding} text-center px-6`} style={{ backgroundColor: colors.primary }}>
        <div className="max-w-4xl mx-auto text-white">
          <h1 className="text-4xl md:text-6xl mb-6" style={{ ...typographyStyles.headline, color: 'white' }}>{brand.name}</h1>
          <p className="text-xl mb-8 opacity-90" style={typographyStyles.body}>{brand.description}</p>
        </div>
      </div>

      {protocols.length > 0 && (
        <div className={`${densityStyles.padding} px-6`} style={{ backgroundColor: colors.surface }}>
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl mb-8" style={typographyStyles.headline}>Protocols</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {protocols.slice(0, 6).map((protocol) => (
                <div key={protocol.id} className="p-6 rounded-lg border-l-4" style={{ backgroundColor: 'white', borderLeftColor: colors.accent }}>
                  <h3 className="text-xl font-semibold mb-2" style={{ color: colors.text }}>{getProtocolName(protocol)}</h3>
                  {protocol.category && (
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: colors.primary, color: 'white' }}>{protocol.category}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {(products.pro.length > 0 || products.retail.length > 0) && (
        <div className={`${densityStyles.padding} px-6`}>
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl mb-8" style={typographyStyles.headline}>Products</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...products.pro, ...products.retail].slice(0, 8).map((product) => (
                <div key={product.id} className="rounded-lg overflow-hidden" style={{ backgroundColor: 'white' }}>
                  {product.image_url && <img src={product.image_url} alt={getProductName(product)} className="w-full aspect-square object-cover" />}
                  <div className="p-4">
                    <h3 className="font-semibold" style={{ color: colors.text }}>{getProductName(product)}</h3>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function getTypographyStyles(typography: string): TypographyStyles {
  switch (typography) {
    case 'luxury': return { headline: { fontFamily: 'Georgia, serif', letterSpacing: '0.02em' }, body: { fontFamily: 'Georgia, serif', fontWeight: 300 } };
    case 'modern': return { headline: { fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 700, letterSpacing: '-0.02em' }, body: { fontFamily: 'Inter, system-ui, sans-serif' } };
    case 'clinical': return { headline: { fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 600, lineHeight: 1.3 }, body: { fontFamily: 'Inter, system-ui, sans-serif' } };
    default: return { headline: {}, body: {} };
  }
}

function getDensityStyles(density: string): DensityStyles {
  switch (density) {
    case 'spacious': return { padding: 'py-20', textSize: 'text-lg' };
    case 'balanced': return { padding: 'py-12', textSize: '' };
    case 'dense': return { padding: 'py-8', textSize: 'text-sm' };
    default: return { padding: 'py-12', textSize: '' };
  }
}
