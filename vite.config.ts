import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import eslint from "vite-plugin-eslint";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        eslint(),
        react(),
        VitePWA({
            registerType: "autoUpdate",
            workbox: {
                globPatterns: ["**/*.{js,css,html,png,jpg}"],
            },
            devOptions: {
                enabled: true,
            },
            manifest: {
                name: "Interactive Image Retargeter",
                short_name: "Retargeter",
                description: "Content-aware image resizing in real time.",
                display: "standalone",
                theme_color: "#2c3e50",
                background_color: "#ecf0f1",
                orientation: "any",
                icons: [
                    {
                        src: "/favicon-16x16.png",
                        sizes: "16x16",
                        type: "image/png",
                    },
                    {
                        src: "/favicon-32x32.png",
                        sizes: "32x32",
                        type: "image/png",
                    },
                    {
                        src: "/android-chrome-192x192.png",
                        sizes: "192x192",
                        type: "image/png",
                    },
                    {
                        src: "/android-chrome-512x512.png",
                        sizes: "512x512",
                        type: "image/png",
                    },
                ],
            },
        }),
    ],
    build: {
        outDir: "build",
    },
    server: {
        port: 3000,
    },
});
