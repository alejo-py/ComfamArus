import { useState, useEffect } from "react";
import DataTable from "@/shared/components/ui/datatable";
import { columns } from "../data/columns";
import { getUsers } from "../data/users";
import type { User } from "../data/users";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Plus, X, Filter, ChevronDown, RotateCcw } from "lucide-react";
import ExcelUploadButton from "@/shared/components/ui/excel-upload-button";
import LoadingSpinner from "@/shared/components/ui/loading-spinner";

interface Filter {
  id: string;
  field: string;
  operator: string;
  value: string;
}

const IndicadorDeEquipos = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filters, setFilters] = useState<Filter[]>([]);
  const [appliedFilters, setAppliedFilters] = useState<Filter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);

  // Cargar datos
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const data = await getUsers();
        setUsers(data);
      } catch (error) {
        console.error("Error cargando usuarios:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadUsers();
  }, []);

  const addFilter = () => {
    setIsAnimating(true);
    const newFilter: Filter = {
      id: Date.now().toString(),
      field: "nombre",
      operator: "contains",
      value: "",
    };
    setFilters([...filters, newFilter]);
    setShowFilters(true);
    setTimeout(() => setIsAnimating(false), 300);
  };

  const removeFilter = (id: string) => {
    setIsAnimating(true);
    setFilters(filters.filter((filter) => filter.id !== id));
    setTimeout(() => {
      setIsAnimating(false);
      if (filters.length === 1) {
        setShowFilters(false);
      }
    }, 300);
  };

  const clearAllFilters = () => {
    setIsAnimating(true);
    setFilters([]);
    setAppliedFilters([]);
    setShowFilters(false);
    setTimeout(() => setIsAnimating(false), 300);
  };

  const applyFilters = () => {
    setAppliedFilters([...filters]);
    setShowFilters(false);
  };

  const removeAppliedFilter = (id: string) => {
    setAppliedFilters(appliedFilters.filter((filter) => filter.id !== id));
  };

  const handleFileUpload = async (file: File) => {
    console.log("Procesando archivo:", file.name);
  };

  const updateFilter = (id: string, field: keyof Filter, value: string) => {
    setFilters(
      filters.map((filter) =>
        filter.id === id ? { ...filter, [field]: value } : filter
      )
    );
  };

  const fieldOptions = [
    { value: "nombre", label: "Nombre" },
    { value: "cedula_empleado", label: "Cédula Empleado" },
    { value: "service_req_number", label: "Service Req Number" },
    { value: "tipo_de_contrato", label: "Tipo De Contrato" },
    { value: "estado_del_caso", label: "Estado Del Caso" },
    { value: "fecha_transferencia", label: "Fecha Transferencia" },
    { value: "fecha_programacion", label: "Fecha Programación" },
    { value: "fecha_creacion", label: "Fecha Creación" },
    { value: "fecha_cierre", label: "Fecha Cierre" },
    { value: "fecha_ingreso_usuario", label: "Fecha Ingreso Usuario" },
    { value: "dias_ingreso_vs_sln", label: "Días Ingreso vs Sln" },
    { value: "ano_caso", label: "Año Caso" },
    { value: "mes_caso", label: "Mes Caso" },
    { value: "semana_caso", label: "Semana Caso" },
    { value: "ano_sln", label: "Año Sln" },
    { value: "mes_sln", label: "Mes Sln" },
    { value: "semana_sln", label: "Semana Sln" },
    { value: "mes_ingreso", label: "Mes Ingreso" },
    { value: "dia_ingreso", label: "Día Ingreso" },
    { value: "ano", label: "Año" },
    { value: "ans_entrega", label: "Ans Entrega" },
    { value: "dias_entrega", label: "Días Entrega" },
    { value: "dias_ingreso", label: "Días Ingreso" },
    { value: "ans_ingreso", label: "Ans Ingreso" },
    { value: "kpi", label: "KPI" },
    { value: "cumplimiento_kpi", label: "Cumplimiento KPI" },
    { value: "excepcion", label: "Excepción" },
    { value: "motivo_excepcion", label: "Motivo Excepción" },
    { value: "observaciones", label: "Observaciones" },
  ];

  const operatorOptions = [
    { value: "contains", label: "contiene el siguiente valor:" },
    { value: "not_contains", label: "no contiene el siguiente valor:" },
    { value: "equals", label: "es el siguiente valor:" },
    { value: "not_equals", label: "no es el siguiente valor:" },
    { value: "starts_with", label: "comienza con el siguiente valor:" },
    { value: "not_starts_with", label: "no comienza con el siguiente valor:" },
    { value: "ends_with", label: "termina con el siguiente valor:" },
    { value: "not_ends_with", label: "no termina con el siguiente valor:" },
    { value: "empty", label: "está vacío" },
  ];

  if (isLoading) {
    return (
      <div className="h-[80vh] w-[70vw] flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <>
      <div
        className="w-[70vw] rounded-md border p-4"
        role="region"
        aria-label="Tabla de usuarios con filtros"
        tabIndex={0}
      >
        {/* Panel de Filtros Avanzados */}
        <div className="mb-6">
          {/* Header de Filtros */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute -inset-1 rounded-lg group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                <Button
                  onClick={() => setShowFilters(!showFilters)}
                  className="relative bg-comfama hover:bg-comfama text-white px-6 py-2 rounded-lg font-medium transition-all duration-300 transform hover:scale-105"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filtros
                  <ChevronDown
                    className={`h-4 w-4 ml-2 transition-transform duration-300 ${
                      showFilters ? "rotate-180" : ""
                    }`}
                  />
                </Button>
              </div>

              {appliedFilters.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="bg-comfama text-white px-3 py-1 rounded-full text-sm font-medium">
                    {appliedFilters.length} filtro
                    {appliedFilters.length > 1 ? "s" : ""} aplicado
                    {appliedFilters.length > 1 ? "s" : ""}
                  </span>
                  <Button
                    onClick={clearAllFilters}
                    variant="outline"
                    size="sm"
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 border-red-200"
                  >
                    <RotateCcw className="h-3 w-3 mr-1" />
                    Limpiar
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Panel de Filtros Expandible */}
          <div
            className={`overflow-hidden transition-all duration-500 ease-in-out ${
              showFilters ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"
            }`}
          >
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200 shadow-lg">
              <div className="max-h-[500px] overflow-y-auto p-6">
                <div className="space-y-4">
                  {filters.map((filter, index) => (
                    <div
                      key={filter.id}
                      className={`transform transition-all duration-500 ease-out ${
                        isAnimating
                          ? "scale-95 opacity-0"
                          : "scale-100 opacity-100"
                      }`}
                      style={{
                        animationDelay: `${index * 100}ms`,
                      }}
                    >
                      <div className="bg-white rounded-xl p-4 shadow-md border border-gray-200 hover:shadow-lg transition-all duration-300 hover:border-comfama group">
                        <div className="flex items-center gap-3">
                          {/* Número de filtro */}
                          <div className="flex-shrink-0 w-8 h-8 bg-comfama rounded-full flex items-center justify-center text-white font-bold text-sm">
                            {index + 1}
                          </div>

                          {/* Campo */}
                          <div className="flex-1">
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              Campo
                            </label>
                            <select
                              value={filter.field}
                              onChange={(e) =>
                                updateFilter(filter.id, "field", e.target.value)
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-comfama focus:border-comfama transition-all duration-200 bg-white"
                            >
                              {fieldOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Operador */}
                          <div className="flex-1">
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              Condición
                            </label>
                            <select
                              value={filter.operator}
                              onChange={(e) =>
                                updateFilter(
                                  filter.id,
                                  "operator",
                                  e.target.value
                                )
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-comfama focus:border-comfama transition-all duration-200 bg-white"
                            >
                              {operatorOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Valor */}
                          {filter.operator !== "empty" && (
                            <div className="flex-1">
                              <label className="block text-xs font-medium text-gray-600 mb-1">
                                Valor
                              </label>
                              <Input
                                placeholder="Introducir valor..."
                                value={filter.value}
                                onChange={(e) =>
                                  updateFilter(
                                    filter.id,
                                    "value",
                                    e.target.value
                                  )
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-comfama focus:border-comfama transition-all duration-200"
                              />
                            </div>
                          )}

                          {/* Botón eliminar */}
                          <div className="flex-shrink-0">
                            <Button
                              onClick={() => removeFilter(filter.id)}
                              variant="outline"
                              size="sm"
                              className="text-red-500 hover:text-red-700 hover:bg-red-50 border-red-200 transition-all duration-200 hover:scale-110"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex items-center justify-between p-6 pt-4 border-t border-gray-200 bg-white rounded-b-xl">
                <Button
                  onClick={addFilter}
                  className="bg-comfama hover:bg-comfama text-white px-6 py-2 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Filtro
                </Button>

                <div className="flex gap-3">
                  <Button
                    onClick={clearAllFilters}
                    variant="outline"
                    className="text-gray-600 hover:text-gray-800 border-gray-300 hover:border-gray-400"
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Limpiar Todo
                  </Button>
                  <Button
                    onClick={applyFilters}
                    className="bg-comfama hover:bg-comfama text-white px-6 py-2 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 shadow-lg"
                  >
                    Aplicar Filtros
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros Aplicados */}
        {appliedFilters.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center gap-2 flex-wrap">
              {appliedFilters.map((filter) => {
                const fieldLabel =
                  fieldOptions.find((opt) => opt.value === filter.field)
                    ?.label || filter.field;
                const operatorLabel =
                  operatorOptions.find((opt) => opt.value === filter.operator)
                    ?.label || filter.operator;

                return (
                  <div
                    key={filter.id}
                    className="bg-white border border-gray-200 rounded-lg px-3 py-3 shadow-sm hover:shadow-md transition-all duration-200 group w-fit min-w-[200px] relative"
                  >
                    <div className="flex flex-col gap-1">
                      <div className="text-sm font-semibold text-gray-800">
                        {fieldLabel}
                      </div>
                      <div className="text-sm text-gray-600">
                        {operatorLabel}
                        {filter.operator !== "empty" && (
                          <span className="text-comfama font-medium ml-1">
                            {filter.value}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Botón X para eliminar filtro */}
                    <Button
                      onClick={() => removeAppliedFilter(filter.id)}
                      variant="ghost"
                      size="sm"
                      className="absolute -top-2 -right-2 h-6 w-6 p-0 text-red-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all duration-200 opacity-0 group-hover:opacity-100"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tabla de datos */}
        <div className="h-[90vh]">
          <DataTable
            data={users}
            columns={columns}
            caption="Lista de usuarios"
            globalFilterColumn="nombre"
            searchButton={
              <ExcelUploadButton
                onUpload={handleFileUpload}
                buttonText="Cargar data"
              />
            }
          />
        </div>
      </div>
    </>
  );
};

export default IndicadorDeEquipos;


