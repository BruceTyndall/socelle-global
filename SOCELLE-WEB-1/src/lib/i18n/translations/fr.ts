// ── French Translations (Stub) ────────────────────────────────────
// WO-23: International Expansion Infrastructure
// Stub — re-exports English until professional translations are provided.

import en from './en';
import type { TranslationDictionary } from '../types';

const fr: TranslationDictionary = {
  ...en,
  // Override with French translations as they become available
  'nav.intelligence': 'Intelligence',
  'nav.protocols': 'Protocoles',
  'nav.education': 'Éducation',
  'nav.forBuyers': 'Pour les Acheteurs',
  'nav.forBrands': 'Pour les Marques',
  'nav.pricing': 'Tarifs',
  'nav.about': 'À Propos',
  'common.signIn': 'Se Connecter',
  'common.signOut': 'Se Déconnecter',
  'common.learnMore': 'En Savoir Plus',
  'common.search': 'Rechercher',
  'common.loading': 'Chargement...',
  'region.selectLanguage': 'Choisir la Langue',
  'region.selectCurrency': 'Choisir la Devise',
};

export default fr;
