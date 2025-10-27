/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_WALLETCONNECT_PROJECT_ID?: string
  readonly VITE_EVENT_REGISTRY_CONTRACT_ID?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
