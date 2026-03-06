// ── Spanish Translations (Stub) ───────────────────────────────────
// WO-23: International Expansion Infrastructure
// Stub — re-exports English until professional translations are provided.

import en from './en';
import type { TranslationDictionary } from '../types';

const es: TranslationDictionary = {
  ...en,
  // Override with Spanish translations as they become available
  'nav.intelligence': 'Inteligencia',
  'nav.protocols': 'Protocolos',
  'nav.education': 'Educación',
  'nav.forBuyers': 'Para Compradores',
  'nav.forBrands': 'Para Marcas',
  'nav.pricing': 'Precios',
  'nav.about': 'Acerca de',
  'common.signIn': 'Iniciar Sesión',
  'common.signOut': 'Cerrar Sesión',
  'common.learnMore': 'Más Información',
  'common.search': 'Buscar',
  'common.loading': 'Cargando...',
  'region.selectLanguage': 'Seleccionar Idioma',
  'region.selectCurrency': 'Seleccionar Moneda',
};

export default es;
