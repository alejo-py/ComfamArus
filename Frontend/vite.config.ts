import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom"],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Separar node_modules en chunks más pequeños
          if (id.includes("node_modules")) {
            // React y React DOM deben estar juntos y primero
            // Incluir también react/jsx-runtime para evitar problemas
            if (
              id.includes("react") ||
              id.includes("react-dom") ||
              id.includes("react/jsx-runtime")
            ) {
              return "vendor-react";
            }
            // Dependencias grandes de gráficos
            if (id.includes("recharts")) {
              return "vendor-recharts";
            }
            // Dependencias de Excel
            if (id.includes("xlsx")) {
              return "vendor-xlsx";
            }
            // React Router
            if (id.includes("react-router")) {
              return "vendor-router";
            }
            // Radix UI - mantener en chunk separado pero después de React
            if (id.includes("@radix-ui")) {
              return "vendor-radix";
            }
            // TanStack Table - mantener en chunk separado pero después de React
            if (id.includes("@tanstack")) {
              return "vendor-tanstack";
            }
            // Iconos - @iconify-icon/react puede depender de React, mantenerlo separado pero después de React
            if (id.includes("lucide-react")) {
              return "vendor-icons";
            }
            // @iconify-icon/react puede necesitar React, mantenerlo en vendor-icons pero asegurar orden
            if (id.includes("@iconify")) {
              return "vendor-icons";
            }
            // Dependencias que pueden depender de React - moverlas a vendor-react para evitar problemas
            // Estas dependencias comunes suelen depender de React
            if (
              id.includes("clsx") ||
              id.includes("tailwind-merge") ||
              id.includes("class-variance-authority") ||
              id.includes("axios")
            ) {
              return "vendor-utils";
            }
            // Otras dependencias de node_modules
            // IMPORTANTE: Si alguna dependencia aquí depende de React, puede causar problemas
            // Por ahora, dejamos que Vite maneje el orden de carga
            return "vendor-other";
          }
        },
      },
    },
    chunkSizeWarningLimit: 1000, // Aumentar el límite a 1MB para evitar advertencias innecesarias
    commonjsOptions: {
      include: [/node_modules/],
      transformMixedEsModules: true,
    },
  },
  ssr: {
    noExternal: ["react", "react-dom"],
  },
  optimizeDeps: {
    include: ["react", "react-dom", "react/jsx-runtime"],
    esbuildOptions: {
      define: {
        global: "globalThis",
      },
    },
  },
});
