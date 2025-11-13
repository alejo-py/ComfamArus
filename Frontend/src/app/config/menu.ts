import { Icon } from "@iconify-icon/react";

export interface MenuItem {
  id: string;
  label: string;
  path: string;
  icon?: string;
}

export interface ProcessItem {
  id: string;
  label: string;
  path: string;
}

// Menú principal
export const menuItems: MenuItem[] = [
  {
    id: "Home",
    label: "Home",
    path: "/",
    icon: "mdi:home",
  },
  {
    id: "Dashboard",
    label: "Dashboard",
    path: "/dashboard",
    icon: "ep:trend-charts",
  },
  {
    id: "Pendientes",
    label: "Pendientes",
    path: "/pendientes",
    icon: "clarity:tasks-solid",
  },
  {
    id: "Inventario",
    label: "Inventario",
    path: "/inventario",
    icon: "material-symbols:inventory-2",
  },
];

// Procesos de automatización
export const processItems: ProcessItem[] = [
  {
    id: "Indicador de Equipos",
    label: "Indicador Equipos",
    path: "/indicador-de-equipos",
  },
  { id: "Cruce CMDB", label: "Cruce CMDB", path: "/Cruce-CMDB" },
  { id: "Proceso3", label: "Proceso 3", path: "/proceso-3" },
  { id: "Proceso4", label: "Proceso 4", path: "/proceso-4" },
  { id: "Proceso5", label: "Proceso 5", path: "/proceso-5" },
  { id: "Proceso6", label: "Proceso 6", path: "/proceso-6" },
];

// Configuración de procesos para el home
export const dashboardProcesses = [
  {
    id: 1,
    title: "Indicador Equipos",
    icon: "Settings",
    color: "#8B5CF6",
    bgColor: "bg-transparent",
    path: "/indicador-de-equipos",
  },
  {
    id: 2,
    title: "Cruce CMDB",
    icon: "Workflow",
    color: "#06B6D4",
    bgColor: "bg-transparent",
    path: "/Cruce-CMDB",
  },
  {
    id: 3,
    title: "Proceso 3",
    icon: "Cog",
    color: "#F59E0B",
    bgColor: "bg-transparent",
    path: "/proceso-3",
  },
  {
    id: 4,
    title: "Proceso 4",
    icon: "FileText",
    color: "#EF4444",
    bgColor: "bg-transparent",
    path: "/proceso-4",
  },
  {
    id: 5,
    title: "Proceso 5",
    icon: "Users",
    color: "#3B82F6",
    bgColor: "bg-transparent",
    path: "/proceso-5",
  },
  {
    id: 6,
    title: "Proceso 6",
    icon: "CheckSquare",
    color: "#10B981",
    bgColor: "bg-transparent",
    path: "/proceso-6",
  },
];

