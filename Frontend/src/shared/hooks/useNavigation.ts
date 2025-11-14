import { useCallback } from "react";
import { useLocation } from "react-router-dom";
import { getProcessMetadata, isValidProcess } from "@/routes/routes";

export const useNavigation = () => {
  const location = useLocation();
  const pathname = location.pathname;

  // Obtener el nombre de la sección actual (memorizado)
  const getSectionName = useCallback(() => {
    if (!pathname) return "Dashboard";

    // Obtener el slug de la ruta
    const slug = pathname.split("/").filter(Boolean)[0] || "";
    
    // Si es un proceso válido, usar los metadatos
    if (slug && isValidProcess(slug)) {
      const metadata = getProcessMetadata(slug);
      return metadata?.title || "Dashboard";
    }

    // Rutas dinámicas para procesos
    if (pathname.startsWith("/proceso-")) {
      return pathname
        .substring(1) // Remover el slash inicial
        .replace(/-/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());
    }

    // Rutas dinámicas para pendientes
    if (pathname.startsWith("/todolist-")) {
      return "TodoList";
    }

    switch (pathname) {
      case "/":
        return "Home";
      case "/dashboard":
        return "Dashboard";
      case "/pendientes":
        return "Pendientes";
      case "/inventario":
        return "Inventario Bodega";
      case "/indicador-de-equipos":
        return "Indicador de Equipos";
      case "/Cruce-CMDB":
        return "Cruce CMDB";
      default:
        return "Dashboard";
    }
  }, [pathname]);

  // Verificar si una ruta está activa (memoizado)
  const isActive = useCallback(
    (path: string): boolean => {
      if (!pathname) return false;
      if (path === "/") {
        return pathname === "/";
      }
      return pathname.startsWith(path);
    },
    [pathname]
  );

  // Verificar si un submenú está activo (memoizado)
  const isSubmenuActive = useCallback(
    (items: { path: string }[]): boolean => {
      return items.some((item) => isActive(item.path));
    },
    [isActive]
  );

  return {
    pathname,
    getSectionName,
    isActive,
    isSubmenuActive,
  };
};
