import { lazy } from "react";

// Lazy loading de componentes de procesos
export const processRoutes = {
  pendientes: null, // Se maneja directamente en la página dinámica
  "indicador-de-equipos": lazy(
    () => import("@/features/indicador-equipos/components/IndicadorDeEquipos")
  ),
  "Cruce-CMDB": lazy(
    () => import("@/features/cruce-cmdb/components/CruceCMDB")
  ),
  TodoList: lazy(() => import("@/features/pendientes/components/TodoList")),
  inventario: lazy(() => import("@/features/inventario/components/Inventario")),
  "proceso-3": lazy(
    () => import("@/features/procesos/proceso-3/components/Proceso3")
  ),
  "proceso-4": lazy(
    () => import("@/features/procesos/proceso-4/components/Proceso4")
  ),
  "proceso-5": lazy(
    () => import("@/features/procesos/proceso-5/components/Proceso5")
  ),
  "proceso-6": lazy(
    () => import("@/features/procesos/proceso-6/components/Proceso6")
  ),
} as const;

// Configuración de metadatos para cada Proceso
export const processMetadata = {
  pendientes: {
    title: "Pendientes",
    description: "Gestión de tareas pendientes",
  },
  TodoList: {
    title: "TodoList",
    description: "Gestión de pendientes",
  },
  "indicador-de-equipos": {
    title: "Indicador de Equipos",
    description: "Indicador de Equipos",
    showDataTable: true,
    globalFilterColumn: "name",
  },
  "Cruce-CMDB": {
    title: "Cruce CMDB",
    description: "Cruce CMBD",
  },
  inventario: {
    title: "Inventario Bodega",
    description: "Inventario",
  },
  "proceso-3": {
    title: "Proceso 3",
    description: "Descripción del proceso 3",
  },
  "proceso-4": {
    title: "Proceso 4",
    description: "Descripción del proceso 4",
  },
  "proceso-5": {
    title: "Proceso 5",
    description: "Descripción del proceso 5",
  },
  "proceso-6": {
    title: "Proceso 6",
    description: "Descripción del proceso 6",
  },
} as const;

// Función helper para obtener el componente correcto
export const getProcessComponent = (slug: string) => {
  const component = processRoutes[slug as keyof typeof processRoutes];
  if (component === null) {
    throw new Error(`Component for ${slug} is handled specially`);
  }
  return component;
};

// Función helper para obtener metadatos
export const getProcessMetadata = (slug: string) => {
  return processMetadata[slug as keyof typeof processMetadata];
};

// Función para verificar si un proceso existe
export const isValidProcess = (
  slug: string
): slug is keyof typeof processRoutes => {
  return slug in processRoutes;
};
