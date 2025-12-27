/// <reference types="vite/client" />
/// <reference types="vite-svg-loader" />

interface ImportMetaEnv {
  VITE_PLAUSIBLE_API_HOST: string;
  VITE_PLAUSIBLE_DOMAIN: string;
  PACKAGE_VERSION: string;
  GIT_SHORT_SHA: string;
  PROD: boolean;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Type declaration for reka-ui/date subpath export
// This allows TypeScript to resolve the module even with moduleResolution: "Node"
declare module 'reka-ui/date' {
  export * from 'reka-ui/dist/date';
}
