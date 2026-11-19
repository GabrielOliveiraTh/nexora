import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import common from '@config/i18n/en/common.json';
import label from '@config/i18n/en/label.json';
import contacts from '@config/i18n/en/contacts.json';
import deals from '@config/i18n/en/deals.json';
import activities from '@config/i18n/en/activities.json';
import companies from '@config/i18n/en/companies.json';
import dashboard from '@config/i18n/en/dashboard.json';
import settings from '@config/i18n/en/settings.json';
import errors from '@config/i18n/en/errors.json';
import auth from '@config/i18n/en/auth.json';
import pipeline from '@config/i18n/en/pipeline.json';

const enResources = {
  common,
  label,
  contacts,
  deals,
  activities,
  companies,
  dashboard,
  settings,
  errors,
  auth,
  pipeline,
} as const;

export type TranslationNamespace = keyof typeof enResources;

i18next.use(initReactI18next).init({
  resources: {
    en: enResources,
  },
  lng: 'en',
  defaultNS: 'common',
  fallbackNS: 'label',
  interpolation: {
    escapeValue: false,
  },
  returnNull: false,
});

export default i18next;
export { enResources };
