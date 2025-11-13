import { useLocation } from "react-router-dom";

export const useNavigation = () => {
  const location = useLocation();
  const pathname = location.pathname;

  // Obtener el nombre de la sección actual
  const getSectionName = () => {
    if (!pathname) return "Dashboard";

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
        return "Inventario";
      case "/indicador-de-equipos":
        return "Indicador de Equipos";
      case "/Cruce-CMDB":
        return "Cruce CMDB";
      default:
        return "Dashboard";
    }
  };

  // Verificar si una ruta está activa
  const isActive = (path: string): boolean => {
    if (!pathname) return false;
    if (path === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(path);
  };

  // Verificar si un submenú está activo
  const isSubmenuActive = (items: { path: string }[]): boolean => {
    return items.some((item) => isActive(item.path));
  };

  return {
    pathname,
    getSectionName,
    isActive,
    isSubmenuActive,
  };
};


