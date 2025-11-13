import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  menuItems,
  processItems,
  type MenuItem,
  type ProcessItem,
} from "@/app/config/menu";
import { Icon } from "@iconify-icon/react";
import { useNavigation } from "@/shared/hooks/useNavigation";
import LoadingSpinner from "@/shared/components/ui/loading-spinner";

type SidebarProps = {
  collapsed?: boolean;
  onToggle?: () => void;
  loading?: boolean;
};

const Sidebar = ({
  collapsed = false,
  onToggle,
  loading = false,
}: SidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isActive, isSubmenuActive } = useNavigation();
  const [isAutomatizacionesOpen, setIsAutomatizacionesOpen] = useState(false);
  const [internalLoading, setInternalLoading] = useState(false);
  const pathname = location.pathname;

  // Reset loader when path changes
  useEffect(() => {
    setInternalLoading(false);
  }, [pathname]);

  // Show loader on initial mount (e.g., page refresh)
  useEffect(() => {
    setInternalLoading(true);
    const timer = setTimeout(() => setInternalLoading(false), 400);
    return () => clearTimeout(timer);
  }, []);

  const handleItemClick = (path: string) => {
    if (pathname === path) return; // No volver a cargar si ya está en la ruta
    setInternalLoading(true);
    navigate(path);
  };

  const handleAutomatizacionesToggle = () => {
    setIsAutomatizacionesOpen(!isAutomatizacionesOpen);
  };

  // Mantener abierto el submenú cuando haya una automatización activa
  useEffect(() => {
    if (isSubmenuActive(processItems)) {
      setIsAutomatizacionesOpen(true);
    }
  }, [isSubmenuActive]);

  if (loading || internalLoading) {
    return (
      <aside
        className={`sticky top-0 self-start bg-white shadow-lg h-screen border-r border-gray-200 flex items-center justify-center transition-all duration-300 overflow-x-hidden overflow-y-auto ${
          collapsed ? "w-8" : "w-64"
        }`}
      >
        <LoadingSpinner />
      </aside>
    );
  }

  return (
    <aside
      className={`sticky top-0 self-start bg-white shadow-lg h-screen border-r border-gray-200 transition-all duration-300 overflow-x-hidden overflow-y-auto ${
        collapsed ? "w-8" : "w-64"
      }`}
      aria-hidden={false}
    >
      {/* Toggle button centered */}
      {onToggle && (
        <button
          aria-label={
            collapsed ? "Abrir barra lateral" : "Cerrar barra lateral"
          }
          onClick={onToggle}
          className={`absolute top-1/2 -translate-y-1/2 right-1 z-10 p-1.5 rounded-md border transition-colors ${
            collapsed
              ? "bg-white hover:bg-gray-50 border-gray-200"
              : "bg-white hover:bg-gray-50 border-gray-200"
          }`}
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4 text-gray-700" />
          ) : (
            <ChevronLeft className="w-4 h-4 text-gray-700" />
          )}
        </button>
      )}

      <nav
        className={`p-6 transition-opacity duration-200 ${
          collapsed ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}
      >
        <ul className="space-y-2">
          {menuItems.map((item: MenuItem) => (
            <li key={item.id}>
              <button
                onClick={() => handleItemClick(item.path)}
                className={`w-full flex flex-row items-center px-4 py-3 rounded-lg font-medium transition-colors duration-200 ${
                  isActive(item.path)
                    ? "bg-gray-100 text-gray-900 font-bold"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                {item.icon && (
                  <Icon
                    icon={item.icon}
                    width={30}
                    height={30}
                    className="mr-3"
                  />
                )}
                <span className="text-base">{item.label}</span>
              </button>
            </li>
          ))}

          {/* Menú desplegable Automatizaciones */}
          <li>
            <button
              onClick={handleAutomatizacionesToggle}
              className={`w-full flex flex-row items-center px-4 py-3 rounded-lg font-medium transition-colors duration-200 ${
                isSubmenuActive(processItems)
                  ? "bg-gray-100 text-gray-900 font-bold"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <Icon
                icon="material-symbols:automation"
                width={30}
                height={30}
                className="mr-3"
              />
              <span className="flex-1 text-base">Automatizaciones</span>
              {isAutomatizacionesOpen ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>

            {isAutomatizacionesOpen && (
              <ul className="ml-4 mt-2 space-y-1">
                {processItems.map((item: ProcessItem) => (
                  <li key={item.id}>
                    <button
                      onClick={() => handleItemClick(item.path)}
                      className={`w-full text-left px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                        isActive(item.path)
                          ? "bg-[#FF277E] text-white"
                          : "text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
