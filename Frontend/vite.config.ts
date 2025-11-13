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
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Separar node_modules en chunks más pequeños
          if (id.includes("node_modules")) {
            // Dependencias grandes de gráficos
            if (id.includes("recharts")) {
              return "vendor-recharts";
            }
            // Dependencias de Excel
            if (id.includes("xlsx")) {
              return "vendor-xlsx";
            }
            // React y React DOM
            if (id.includes("react") || id.includes("react-dom")) {
              return "vendor-react";
            }
            // React Router
            if (id.includes("react-router")) {
              return "vendor-router";
            }
            // Radix UI
            if (id.includes("@radix-ui")) {
              return "vendor-radix";
            }
            // TanStack Table
            if (id.includes("@tanstack")) {
              return "vendor-tanstack";
            }
            // Iconos
            if (id.includes("lucide-react") || id.includes("@iconify")) {
              return "vendor-icons";
            }
            // Otras dependencias de node_modules
            return "vendor-other";
          }
        },
      },
    },
    chunkSizeWarningLimit: 1000, // Aumentar el límite a 1MB para evitar advertencias innecesarias
  },
});
