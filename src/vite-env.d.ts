/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ADMIN_PORTAL_URL?: string;
  readonly VITE_FLUTTERWAVE_PUBLIC_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}