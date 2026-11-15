import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import { resolve } from "path";

const root = resolve(__dirname);

export default defineConfig({
  plugins: [tailwindcss()],
  server: {
    port: Number(process.env.PORT) || 5173,
    strictPort: false,
    watch: {
      ignored: ["**/dist/**"],
    },
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(root, "index.html"),
        proyectos: resolve(root, "proyectos/index.html"),
        proyecto01: resolve(root, "proyectos/proyecto-01/index.html"),
        estudio: resolve(root, "estudio/index.html"),
        serviciosArquitectura: resolve(root, "servicios/arquitectura/index.html"),
        serviciosInteriorismo: resolve(root, "servicios/interiorismo/index.html"),
        contacto: resolve(root, "contacto/index.html"),
      },
    },
  },
});
