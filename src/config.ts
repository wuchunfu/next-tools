import { defineConfig } from 'figue'
import * as v from 'valibot'

// Helper schemas for common coercions
const booleanish = v.pipe(
  v.union([v.boolean(), v.literal('true'), v.literal('false')]),
  v.transform(val => (!!(val === true || val === 'true'))),
)

export const config = defineConfig(
  {
    app: {
      version: {
        doc: 'Application current version',
        schema: v.string(),
        default: '0.0.0',
        env: 'PACKAGE_VERSION',
      },
      lastCommitSha: {
        doc: 'Application last commit SHA version',
        schema: v.string(),
        default: '',
        env: 'VITE_VERCEL_GIT_COMMIT_SHA',
      },
      baseUrl: {
        doc: 'Application base url',
        schema: v.string(),
        default: '/',
        env: 'BASE_URL',
      },
      env: {
        doc: 'Application current env',
        schema: v.picklist(['production', 'development', 'preview', 'test']),
        default: 'development',
        env: 'VITE_VERCEL_ENV',
      },
    },
    plausible: {
      isTrackerEnabled: {
        doc: 'Is the tracker enabled',
        schema: booleanish,
        default: false,
        env: 'VITE_TRACKER_ENABLED',
      },
      domain: {
        doc: 'Plausible current domain',
        schema: v.string(),
        default: '',
        env: 'VITE_PLAUSIBLE_DOMAIN',
      },
      apiHost: {
        doc: 'Plausible remote api host',
        schema: v.string(),
        default: '',
        env: 'VITE_PLAUSIBLE_API_HOST',
      },
      trackLocalhost: {
        doc: 'Enable or disable localhost tracking by plausible',
        schema: booleanish,
        default: false,
      },
    },
    showBanner: {
      doc: 'Show the banner',
      schema: booleanish,
      default: false,
      env: 'VITE_SHOW_BANNER',
    },
    showSponsorBanner: {
      doc: 'Show the sponsor banner',
      schema: booleanish,
      default: false,
      env: 'VITE_SHOW_SPONSOR_BANNER',
    },
  },
  {
    envSource: {
      ...import.meta.env,
      // import.meta.env.PACKAGE_VERSION is statically replaced at build time (see vite.config.ts define)
      PACKAGE_VERSION: import.meta.env.PACKAGE_VERSION,
    },
  },
).config
