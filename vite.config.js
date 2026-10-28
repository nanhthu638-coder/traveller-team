import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  plugins: [tailwindcss()],
  build: {
    rollupOptions: {
      input: {
        index: resolve(projectRoot, "index.html"),
        "tour-list": resolve(projectRoot, "tour-list.html"),
        "tour-detail": resolve(projectRoot, "tour-detail.html"),
        "booking-history": resolve(projectRoot, "booking-history.html"),
        "booking-detail": resolve(projectRoot, "booking-detail.html"),
        checkout: resolve(projectRoot, "checkout.html"),
        profile: resolve(projectRoot, "profile.html"),
        contact: resolve(projectRoot, "contact.html"),
        "admin-login": resolve(projectRoot, "admin-login.html"),
        admin: resolve(projectRoot, "admin.html"),
      },
    },
  },
  server: {
    proxy: {
      "/api": "http://localhost:3000",
    },
  },
});
