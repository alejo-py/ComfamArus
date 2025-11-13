import { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "../app/layout/AppLayout";
import MainContent from "@/features/dashboard/components/MainContent";
import LoadingSpinner from "@/shared/components/ui/loading-spinner";
import { processRoutes } from "./routes";

// Lazy load de TodoList para evitar importación estática
const TodoList = lazy(
  () => import("@/features/pendientes/components/TodoList")
);

// Componente de carga para Suspense
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <LoadingSpinner />
  </div>
);

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<AppLayout />}>
        {/* Ruta principal */}
        <Route index element={<MainContent />} />

        {/* Rutas estáticas */}
        <Route
          path="pendientes"
          element={
            <Suspense fallback={<PageLoader />}>
              <TodoList />
            </Suspense>
          }
        />

        {/* Rutas dinámicas de procesos */}
        <Route
          path="indicador-de-equipos"
          element={
            <Suspense fallback={<PageLoader />}>
              {(() => {
                const Component = processRoutes["indicador-de-equipos"];
                return <Component />;
              })()}
            </Suspense>
          }
        />

        <Route
          path="Cruce-CMDB"
          element={
            <Suspense fallback={<PageLoader />}>
              {(() => {
                const Component = processRoutes["Cruce-CMDB"];
                return <Component />;
              })()}
            </Suspense>
          }
        />

        <Route
          path="inventario"
          element={
            <Suspense fallback={<PageLoader />}>
              {(() => {
                const Component = processRoutes.inventario;
                return <Component />;
              })()}
            </Suspense>
          }
        />

        <Route
          path="proceso-3"
          element={
            <Suspense fallback={<PageLoader />}>
              {(() => {
                const Component = processRoutes["proceso-3"];
                return <Component />;
              })()}
            </Suspense>
          }
        />

        <Route
          path="proceso-4"
          element={
            <Suspense fallback={<PageLoader />}>
              {(() => {
                const Component = processRoutes["proceso-4"];
                return <Component />;
              })()}
            </Suspense>
          }
        />

        <Route
          path="proceso-5"
          element={
            <Suspense fallback={<PageLoader />}>
              {(() => {
                const Component = processRoutes["proceso-5"];
                return <Component />;
              })()}
            </Suspense>
          }
        />

        <Route
          path="proceso-6"
          element={
            <Suspense fallback={<PageLoader />}>
              {(() => {
                const Component = processRoutes["proceso-6"];
                return <Component />;
              })()}
            </Suspense>
          }
        />

        {/* Ruta 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
