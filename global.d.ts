declare module 'next-pwa' {
  import type { NextConfig } from 'next';

  interface PWAConfig {
    dest?: string;
    register?: boolean;
    skipWaiting?: boolean;
    disable?: boolean;
    fallbacks?: Record<string, unknown>;
    runtimeCaching?: Array<Record<string, unknown>>;
    publicExcludes?: string[];
    cacheOnFrontEndNav?: boolean;
    reloadOnOnline?: boolean;
    customWorkerDir?: string;
    [key: string]: unknown;
  }

  function withPWA(config?: PWAConfig): (nextConfig: NextConfig) => NextConfig;

  export default withPWA;
}
