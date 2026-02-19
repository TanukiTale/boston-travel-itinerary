/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_MY_BOSTON_MAP_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
