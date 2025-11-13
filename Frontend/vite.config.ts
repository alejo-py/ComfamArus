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
        manualChunks: (id) => {
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
            // Iconos
            if (id.includes("lucide-react") || id.includes("@iconify")) {
              return "vendor-icons";
            }
            // Otras dependencias de node_modules
            // Nota: Estas dependencias pueden depender de React, pero Vite debería manejar el orden de carga
            return "vendor-other";
          }
        },
      },
    },
    chunkSizeWarningLimit: 1000, // Aumentar el límite a 1MB para evitar advertencias innecesarias
  },
  optimizeDeps: {
    include: ["react", "react-dom", "react/jsx-runtime"],
  },
});
