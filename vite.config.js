import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";
import { vercelApiDevPlugin } from "./vite-plugins/vercelApiDev.js";

// https://vite.dev/config/
export default defineConfig({
  base: "/WAQT/",
  plugins: [
    react(),
    tailwindcss(),
    vercelApiDevPlugin(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["icons/icon.svg"],
      manifest: {
        name: "Waqt — Horaires de prière",
        short_name: "Waqt",
        description: "Horaires de prière, qibla et tasbih.",
        theme_color: "#0B1613",
        background_color: "#0B1613",
        display: "standalone",
        start_url: "/",
        // TODO before store submission: replace with real 192/512 PNG +
        // maskable icons (this SVG is a placeholder brand mark).
        icons: [{ src: "/icons/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" }],
      },
      workbox: {
        navigateFallbackDenylist: [/^\/api\//],
        runtimeCaching: [
          {
            urlPattern: /^\/api\/geocode/,
            handler: "NetworkFirst",
            options: { cacheName: "geocode-cache", expiration: { maxEntries: 50, maxAgeSeconds: 86400 } },
          },
        ],
      },
    }),
  ],
});
