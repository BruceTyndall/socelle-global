const ALLOWED_TAGS = new Set([
  'a',
  'b',
  'blockquote',
  'br',
  'code',
  'em',
  'h1',
  'h2',
  'h3',
  'h4',
  'img',
  'li',
  'ol',
  'p',
  'pre',
  'strong',
  'ul',
]);

const ALLOWED_ATTRS: Record<string, Set<string>> = {
  a: new Set(['href', 'title']),
  img: new Set(['src', 'alt', 'title']),
};

function isSafeUrl(value: string, attribute: 'href' | 'src'): boolean {
  try {
    const parsed = new URL(value, window.location.origin);
    if (attribute === 'href') {
      return ['http:', 'https:', 'mailto:'].includes(parsed.protocol);
    }
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}

function sanitizeElement(element: Element) {
  const tag = element.tagName.toLowerCase();

  if (!ALLOWED_TAGS.has(tag)) {
    const parent = element.parentNode;
    while (element.firstChild) {
      parent?.insertBefore(element.firstChild, element);
    }
    parent?.removeChild(element);
    return;
  }

  const allowedAttrs = ALLOWED_ATTRS[tag] ?? new Set<string>();
  for (const attr of Array.from(element.attributes)) {
    const attrName = attr.name.toLowerCase();
    if (!allowedAttrs.has(attrName)) {
      element.removeAttribute(attr.name);
      continue;
    }

    if ((attrName === 'href' || attrName === 'src') && !isSafeUrl(attr.value, attrName)) {
      element.removeAttribute(attr.name);
    }
  }

  if (tag === 'a' && element.hasAttribute('href')) {
    element.setAttribute('target', '_blank');
    element.setAttribute('rel', 'noopener noreferrer');
  }

  if (tag === 'img') {
    element.setAttribute('loading', 'lazy');
  }
}

export function sanitizeArticleHtml(html: string | null | undefined): string | null {
  if (!html?.trim() || typeof DOMParser === 'undefined') {
    return null;
  }

  const doc = new DOMParser().parseFromString(html, 'text/html');
  doc
    .querySelectorAll('script,style,iframe,object,embed,form,input,button,textarea,select,svg,math,link,meta,base')
    .forEach((node) => node.remove());

  const elements = Array.from(doc.body.querySelectorAll('*')).reverse();
  for (const element of elements) {
    sanitizeElement(element);
  }

  const safeHtml = doc.body.innerHTML.trim();
  return safeHtml.length > 0 ? safeHtml : null;
}
