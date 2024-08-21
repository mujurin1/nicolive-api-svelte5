import { crx, defineManifest } from "@crxjs/vite-plugin";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { defineConfig } from "vite";
import zipPack from "vite-plugin-zip-pack";


// https://crxjs.dev/vite-plugin/concepts/manifest
const manifest = defineManifest({
  manifest_version: 3,
  name: "ニコ生コメビュ",
  version: "0.0.3",
  icons: {
    128: "assets/128x128.png",
  },
  permissions: ["cookies", "storage"],
  action: {
    // default_popup: "index.html",
  },
  host_permissions: [
    "*://*.nicovideo.jp/*",
    // "*://*.nimg.jp/*",
    // "*://*.dmc.nico/*",
  ],
  content_scripts: [
    // {
    //   matches: [
    //     "https://*.nicovideo.jp/*",
    //     "https://us-central1-ncbrowseroauth.cloudfunctions.net/*"
    //   ],
    //   js: [
    //     "src/content.ts"
    //   ]
    // },
  ],
  background: {
    service_worker: "src/background.ts"
  },
});

export default defineConfig({
  plugins: [
    svelte(),
    crx({ manifest }),
    zipPack({ outDir: "." }),
  ],

  build: {
    rollupOptions: {
      input: {
        main: "./index.html"
      }
    }
  },

  // 拡張機能でホットリロードを使うにはポートの指定が必要
  server: {
    // hmr: { port: 5174 }, 
    port: 5173
  }
});