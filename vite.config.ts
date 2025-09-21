import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import dotenv from "dotenv";
dotenv.config();

declare module "@remix-run/node" {
  interface Future {
    v3_singleFetch: true;
  }
}

export default defineConfig({
  ssr: {
    noExternal: [
      "@radix-ui/react-select",
      "@radix-ui/number",
      "lucide-react",
      "@radix-ui/react-select",
      "@radix-ui/number",
      "@radix-ui/react-popover",
      "@radix-ui/react-popper",
      "@radix-ui/react-dialog",
      "@radix-ui/react-use-escape-keydown",
    ],
  },
  optimizeDeps: {
    include: ["lucide-react"],
  },
  plugins: [
    remix({
      future: {
        v3_fetcherPersist: true,
        v3_relativeSplatPath: true,
        v3_throwAbortReason: true,
        v3_singleFetch: true,
        v3_lazyRouteDiscovery: true,
      },
    }),
    tsconfigPaths(),
  ],
});
