import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Header from "@/shared/components/layout/Header";
import Sidebar from "@/shared/components/layout/Sidebar";
import { useNavigation } from "@/shared/hooks/useNavigation";

const AppLayout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const location = useLocation();
  const { getSectionName } = useNavigation();

  // Obtener el slug de la ruta actual
  const slug = location.pathname.split("/").filter(Boolean)[0] || "home";
  const isHomePage = location.pathname === "/";

  // Obtener título
  const title = getSectionName();
  const containerClassName = "max-w-[77vw] mx-auto";

  // Casos especiales para el título
  let titleClassName = "text-3xl font-bold text-black mb-6";
  if (slug === "inventario") {
    titleClassName = "text-4xl font-bold text-black mb-6 text-center";
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <div className="flex flex-1 min-h-0">
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
        <main className="flex-1 bg-white overflow-auto">
          <div className="p-8 min-h-screen">
            <div className={containerClassName}>
              {!isHomePage && <h1 className={titleClassName}>{title}</h1>}
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
