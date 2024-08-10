import { crx, defineManifest } from "@crxjs/vite-plugin";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { defineConfig } from "vite";


// https://crxjs.dev/vite-plugin/concepts/manifest
const manifest = defineManifest({
  manifest_version: 3,
  name: "Comment Viewer",
  version: "0.0.1",
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
    // viteStaticCopy({
    //   targets: [
    //     // ここにコピー元とコピー先のパスを記述
    //     {
    //       src: "./index.html",
    //       dest: ".",
    //     },
    //   ],
    // }),
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