import type { Json } from '../database.types';

export interface SmartFillContext {
  business_name: string;
  city: string;
  offer: string;
  price: string;
  date: string;
  cta: string;
  brand_kit: {
    primary: string;
  };
  signal: {
    metric: string;
  };
}

export interface ResolveResult<T> {
  value: T;
  unresolved: string[];
}

const VARIABLE_REGEX = /\{([a-zA-Z0-9_.]+)\}/g;

const CONTEXT_FALLBACK: SmartFillContext = {
  business_name: 'Your Business',
  city: 'Your City',
  offer: 'Limited-time professional offer',
  price: '$99',
  date: new Date().toLocaleDateString('en-US'),
  cta: 'Book now',
  brand_kit: {
    primary: '#6E879B',
  },
  signal: {
    metric: 'Latest signal value',
  },
};

function getPathValue(context: SmartFillContext, path: string): string | null {
  const parts = path.split('.');
  let current: unknown = context;

  for (const part of parts) {
    if (current == null || typeof current !== 'object' || !(part in current)) {
      return null;
    }
    current = (current as Record<string, unknown>)[part];
  }

  if (typeof current === 'string') return current;
  if (typeof current === 'number') return String(current);
  if (typeof current === 'boolean') return current ? 'true' : 'false';

  return null;
}

export function mergeSmartFillContext(partial?: Partial<SmartFillContext>): SmartFillContext {
  return {
    ...CONTEXT_FALLBACK,
    ...(partial ?? {}),
    brand_kit: {
      ...CONTEXT_FALLBACK.brand_kit,
      ...(partial?.brand_kit ?? {}),
    },
    signal: {
      ...CONTEXT_FALLBACK.signal,
      ...(partial?.signal ?? {}),
    },
  };
}

export function extractTemplateVariables(input: string): string[] {
  const vars = new Set<string>();
  let match: RegExpExecArray | null = VARIABLE_REGEX.exec(input);

  while (match) {
    vars.add(match[1]);
    match = VARIABLE_REGEX.exec(input);
  }

  VARIABLE_REGEX.lastIndex = 0;
  return Array.from(vars);
}

export function resolveTemplateString(
  input: string,
  context: SmartFillContext
): ResolveResult<string> {
  const unresolved = new Set<string>();

  const value = input.replace(VARIABLE_REGEX, (_full, variablePath: string) => {
    const resolved = getPathValue(context, variablePath);
    if (resolved == null || resolved.trim() === '') {
      unresolved.add(variablePath);
      return `{${variablePath}}`;
    }
    return resolved;
  });

  VARIABLE_REGEX.lastIndex = 0;
  return {
    value,
    unresolved: Array.from(unresolved),
  };
}

function resolveJsonNode(node: Json, context: SmartFillContext): ResolveResult<Json> {
  if (typeof node === 'string') {
    return resolveTemplateString(node, context);
  }

  if (Array.isArray(node)) {
    const unresolved = new Set<string>();
    const resolvedArray = node.map((entry) => {
      const result = resolveJsonNode(entry as Json, context);
      result.unresolved.forEach((v) => unresolved.add(v));
      return result.value;
    });

    return {
      value: resolvedArray,
      unresolved: Array.from(unresolved),
    };
  }

  if (node && typeof node === 'object') {
    const unresolved = new Set<string>();
    const resolvedObject: Record<string, Json> = {};

    Object.entries(node).forEach(([key, value]) => {
      const result = resolveJsonNode(value as Json, context);
      result.unresolved.forEach((v) => unresolved.add(v));
      resolvedObject[key] = result.value;
    });

    return {
      value: resolvedObject,
      unresolved: Array.from(unresolved),
    };
  }

  return {
    value: node,
    unresolved: [],
  };
}

export function resolveTemplateJson(
  value: Json,
  context: SmartFillContext
): ResolveResult<Json> {
  return resolveJsonNode(value, context);
}

export function findUnresolvedVariablesInJson(value: Json): string[] {
  const unresolved = new Set<string>();

  function walk(node: Json) {
    if (typeof node === 'string') {
      extractTemplateVariables(node).forEach((v) => unresolved.add(v));
      return;
    }

    if (Array.isArray(node)) {
      node.forEach((entry) => walk(entry as Json));
      return;
    }

    if (node && typeof node === 'object') {
      Object.values(node).forEach((entry) => walk(entry as Json));
    }
  }

  walk(value);
  return Array.from(unresolved);
}
