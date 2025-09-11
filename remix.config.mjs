import { vercelPreset } from "@vercel/remix/vite";

/** @type {import('@remix-run/dev').AppConfig} */
export default {
  presets: [vercelPreset()],   // Vercel ke liye zaroori
  ignoredRouteFiles: ["**/.*"],

  server: "@vercel/remix",     // Vercel adapter
  serverModuleFormat: "esm",
  serverPlatform: "node",

  future: {
    v3_fetcherPersist: true,
    v3_relativeSplatPath: true,
    v3_throwAbortReason: true,
    v3_singleFetch: true,
    v3_lazyRouteDiscovery: true,
  },
};
