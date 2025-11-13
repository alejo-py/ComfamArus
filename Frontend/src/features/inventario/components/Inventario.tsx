import React, { useState, useMemo } from "react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import {
  Upload,
  CheckCircle2,
  XCircle,
  FileSpreadsheet,
  TrendingUp,
  AlertCircle,
  BarChart3,
  Send,
} from "lucide-react";
import DataTable from "@/shared/components/ui/datatable";
import ExcelUploadButton from "@/shared/components/ui/excel-upload-button";
import LoadingSpinner from "@/shared/components/ui/loading-spinner";
import * as XLSX from "xlsx";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

interface InventarioRow {
  id: string;
  serial: string;
  observacion: string;
}

type EstadoPermitido =
  | "Available"
  | "Awaiting Disposal"
  | "Reserved"
  | "Preparación";

interface ExcelRow {
  numeroSerie: string;
  estado: EstadoPermitido;
}

interface ComparacionResult {
  serial: string;
  estadoExcel: EstadoPermitido | "Faltante";
  coincidencia: "encontrado" | "no_encontrado" | "faltante";
  observacion?: string;
}

interface EstadisticasPorEstado {
  estado: EstadoPermitido;
  total: number;
  encontrados: number;
  noEncontrados: number;
  porcentajeEncontrados: number;
}

interface Estadisticas {
  totalExcel: number;
  totalEncontrados: number;
  totalNoEncontrados: number;
  porcentajeEncontrados: number;
  porEstado: EstadisticasPorEstado[];
}

// Constantes
const ESTADOS_PERMITIDOS: EstadoPermitido[] = [
  "Available",
  "Awaiting Disposal",
  "Reserved",
  "Preparación",
];

const FILA_INICIO_DATOS = 3; // La fila 3 contiene el encabezado (índice 2 en base 0)
const COLUMNA_NOMBRE = "nombre";
const COLUMNA_NUMERO_SERIE = "Número de serie";
const COLUMNA_ESTADO = "Estado";

// Prefijos permitidos para filtrar seriales
const PREFIJOS_PERMITIDOS = ["01-", "02-"];

// Colores para la gráfica de torta por estado
const COLORES_POR_ESTADO: Record<EstadoPermitido, string> = {
  Available: "#22c55e",
  "Awaiting Disposal": "#ef4444",
  Reserved: "#3b82f6",
  Preparación: "#f59e0b",
};
/**
 Extrae los datos del Excel desde la fila especificada
 */
const parseExcelData = (worksheet: XLSX.WorkSheet): any[][] => {
  // Leer todo el archivo y luego tomar desde la fila especificada
  const allData = XLSX.utils.sheet_to_json(worksheet, {
    header: 1,
    defval: "",
  }) as any[][];

  // Retornar desde la fila 3 (índice 2 en base 0)
  return allData.slice(FILA_INICIO_DATOS - 1);
};

/**
 * Encuentra el índice de una columna por su nombre
 * Single Responsibility: Solo busca el índice de una columna
 */
const encontrarIndiceColumna = (
  encabezados: any[],
  nombreColumna: string
): number => {
  return encabezados.findIndex(
    (header) =>
      header &&
      typeof header === "string" &&
      header.trim().toLowerCase() === nombreColumna.toLowerCase()
  );
};

/**
 * Valida si un estado está en la lista de estados permitidos
 * Single Responsibility: Solo valida estados
 */
const esEstadoPermitido = (estado: string): estado is EstadoPermitido => {
  return ESTADOS_PERMITIDOS.includes(estado as EstadoPermitido);
};

/**
 * Valida si un nombre tiene un prefijo permitido
 * Single Responsibility: Solo valida prefijos
 */
const tienePrefijoPermitido = (nombre: string): boolean => {
  if (!nombre || typeof nombre !== "string") return false;
  const nombreTrimmed = nombre.trim();
  return PREFIJOS_PERMITIDOS.some((prefijo) =>
    nombreTrimmed.startsWith(prefijo)
  );
};

/**
 * Valida si el nombre termina con el número de serie
 * Single Responsibility: Solo valida la relación nombre-serial
 */
const nombreTerminaConSerial = (
  nombre: string,
  numeroSerie: string
): boolean => {
  if (!nombre || !numeroSerie) return false;
  const nombreTrimmed = nombre.trim();
  const serialTrimmed = numeroSerie.trim();
  return nombreTrimmed.endsWith(serialTrimmed);
};

/**
 * Filtra y extrae las filas válidas del Excel
 * Single Responsibility: Solo filtra y transforma datos del Excel
 *
 * Lógica:
 * - Lee "Número de serie" para la comparación (como antes)
 * - Lee "nombre" para validar el prefijo (01- o 02-)
 * - Si el nombre tiene prefijo diferente a 01- o 02-, excluye la fila
 * - Si el nombre tiene prefijo 01- o 02-, incluye la fila y usa "Número de serie" para comparar
 */
const extraerFilasExcel = (jsonData: any[][]): ExcelRow[] => {
  if (jsonData.length === 0) return [];

  const encabezados = jsonData[0];
  const indiceNumeroSerie = encontrarIndiceColumna(
    encabezados,
    COLUMNA_NUMERO_SERIE
  );
  const indiceNombre = encontrarIndiceColumna(encabezados, COLUMNA_NOMBRE);
  const indiceEstado = encontrarIndiceColumna(encabezados, COLUMNA_ESTADO);

  if (indiceEstado === -1) {
    throw new Error(
      `No se encontró la columna "${COLUMNA_ESTADO}" en el archivo Excel.`
    );
  }

  if (indiceNumeroSerie === -1) {
    throw new Error(
      `No se encontró la columna "${COLUMNA_NUMERO_SERIE}" en el archivo Excel.`
    );
  }

  const filasValidas: ExcelRow[] = [];
  const filasExcluidas: Array<{
    numeroSerie: string;
    razon: string;
    fila: number;
  }> = [];

  // Empezar desde la fila 1 (después del encabezado)
  for (let i = 1; i < jsonData.length; i++) {
    const fila = jsonData[i];
    const estado = fila[indiceEstado];
    const numeroSerie = fila[indiceNumeroSerie];
    const nombre = indiceNombre !== -1 ? fila[indiceNombre] : null;

    // Validar estado primero
    if (
      !estado ||
      typeof estado !== "string" ||
      !esEstadoPermitido(estado.trim())
    ) {
      if (numeroSerie) {
        filasExcluidas.push({
          numeroSerie: String(numeroSerie).trim() || `Fila ${i + 1}`,
          razon: `Estado inválido o vacío: "${estado}"`,
          fila: i + 1,
        });
      }
      continue;
    }

    // Validar que tenga número de serie
    if (
      !numeroSerie ||
      typeof numeroSerie !== "string" ||
      numeroSerie.trim() === ""
    ) {
      filasExcluidas.push({
        numeroSerie: `Fila ${i + 1}`,
        razon: "Número de serie vacío o inválido",
        fila: i + 1,
      });
      continue;
    }

    const numeroSerieTrimmed = numeroSerie.trim();

    // Validar prefijo del nombre (si existe la columna nombre)
    // Si existe la columna nombre, validar que tenga prefijo permitido
    if (indiceNombre !== -1) {
      // Si la columna nombre existe, validar el prefijo
      if (nombre) {
        const nombreStr =
          typeof nombre === "string" ? nombre.trim() : String(nombre).trim();

        // Si el nombre tiene un prefijo diferente a 01- o 02-, excluir esta fila
        if (nombreStr && !tienePrefijoPermitido(nombreStr)) {
          filasExcluidas.push({
            numeroSerie: numeroSerieTrimmed,
            razon: `Nombre sin prefijo permitido (01- o 02-): "${nombreStr}"`,
            fila: i + 1,
          });
          continue; // Excluir esta fila
        }
        // Validar que el nombre termine con el número de serie (validación adicional de consistencia)
        // Esto asegura que el nombre y el serial estén relacionados
        // Ejemplo: "01-5J6RKFS" debería terminar con "5J6RKFS"
        if (nombreStr) {
          if (!nombreTerminaConSerial(nombreStr, numeroSerieTrimmed)) {
            filasExcluidas.push({
              numeroSerie: numeroSerieTrimmed,
              razon: `El nombre "${nombreStr}" no termina con el serial "${numeroSerieTrimmed}"`,
              fila: i + 1,
            });
            continue;
          }
        }
      }
      // Si la columna nombre existe pero está vacía, también excluir (para mantener consistencia)
      // Comentado para permitir filas sin nombre si es necesario
      // else {
      //   continue;
      // }
    }

    // Si pasó todas las validaciones, incluir la fila
    // Usar "Número de serie" para la comparación (como antes)
    filasValidas.push({
      numeroSerie: numeroSerieTrimmed,
      estado: estado.trim() as EstadoPermitido,
    });
  }

  return filasValidas;
};

/**
 * Normaliza un serial para comparación (elimina espacios, convierte a minúsculas)
 * Single Responsibility: Solo normaliza el serial
 */
const normalizarSerial = (serial: string): string => {
  if (!serial || typeof serial !== "string") return "";
  // Eliminar espacios al inicio y final, convertir a minúsculas
  // También eliminar espacios internos múltiples y caracteres de control
  return serial
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, "");
};

/**
 * Compara un serial con una lista de seriales (case-insensitive y normalizado)
 * Single Responsibility: Solo realiza la comparación
 */
const serialCoincide = (serial1: string, serial2: string): boolean => {
  const serial1Normalizado = normalizarSerial(serial1);
  const serial2Normalizado = normalizarSerial(serial2);

  // Comparación exacta después de normalización
  if (serial1Normalizado === serial2Normalizado) {
    return true;
  }

  // Comparación adicional: eliminar todos los espacios y comparar
  const serial1SinEspacios = serial1Normalizado.replace(/\s/g, "");
  const serial2SinEspacios = serial2Normalizado.replace(/\s/g, "");

  return serial1SinEspacios === serial2SinEspacios;
};

/**
 * Realiza la comparación entre los seriales del Excel y los de la tabla
 * Single Responsibility: Solo realiza la comparación
 *
 * Lógica mejorada:
 * 1. Crea un mapa de seriales de la tabla para búsqueda O(1)
 * 2. Compara cada serial del Excel con los de la tabla
 * 3. Identifica seriales de la tabla que no están en el Excel (faltantes)
 */
const compararSeriales = (
  filasExcel: ExcelRow[],
  serialesTabla: string[]
): ComparacionResult[] => {
  const resultados: ComparacionResult[] = [];

  // Comparar seriales del Excel con los de la tabla
  // Usar serialCoincide para comparación flexible (maneja espacios, mayúsculas, etc.)
  filasExcel.forEach((filaExcel) => {
    const serialExcel = filaExcel.numeroSerie;

    // Verificar si el serial del Excel está en la tabla usando comparación flexible
    let encontrado = false;

    for (const serialTabla of serialesTabla) {
      const coincide = serialCoincide(serialTabla, serialExcel);

      if (coincide) {
        encontrado = true;
        break; // Encontrado, no necesitamos seguir buscando
      }
    }

    resultados.push({
      serial: filaExcel.numeroSerie, // Mantener el formato original del Excel
      estadoExcel: filaExcel.estado,
      coincidencia: encontrado ? "encontrado" : "no_encontrado",
    });
  });

  // Encontrar seriales que están en la tabla pero no en el Excel (Faltantes)
  serialesTabla.forEach((serialTabla) => {
    if (!serialTabla || serialTabla.trim() === "") return; // Saltar seriales vacíos

    // Verificar si el serial de la tabla está en el Excel usando comparación flexible
    let existeEnExcel = false;

    for (const filaExcel of filasExcel) {
      const serialExcel = filaExcel.numeroSerie;
      const coincide = serialCoincide(serialTabla, serialExcel);

      if (coincide) {
        existeEnExcel = true;
        break;
      }
    }

    if (!existeEnExcel) {
      resultados.push({
        serial: serialTabla, // Mantener el formato original de la tabla
        estadoExcel: "Faltante" as EstadoPermitido | "Faltante",
        coincidencia: "faltante",
      });
    }
  });

  return resultados;
};

/**
 * Calcula las estadísticas por estado
 * Single Responsibility: Solo calcula estadísticas
 */
const calcularEstadisticasPorEstado = (
  resultados: ComparacionResult[]
): EstadisticasPorEstado[] => {
  const estadisticasPorEstado = new Map<
    EstadoPermitido,
    EstadisticasPorEstado
  >();

  ESTADOS_PERMITIDOS.forEach((estado) => {
    const filasEstado = resultados.filter((r) => r.estadoExcel === estado);
    const total = filasEstado.length;
    const encontrados = filasEstado.filter(
      (r) => r.coincidencia === "encontrado"
    ).length;
    const noEncontrados = total - encontrados;
    const porcentajeEncontrados =
      total > 0 ? Math.round((encontrados / total) * 100 * 100) / 100 : 0;

    estadisticasPorEstado.set(estado, {
      estado,
      total,
      encontrados,
      noEncontrados,
      porcentajeEncontrados,
    });
  });

  return Array.from(estadisticasPorEstado.values());
};

/**
 * Calcula las estadísticas generales
 * Single Responsibility: Solo calcula estadísticas generales
 */
const calcularEstadisticasGenerales = (
  resultados: ComparacionResult[],
  porEstado: EstadisticasPorEstado[]
): Estadisticas => {
  const totalExcel = resultados.length;
  const totalEncontrados = resultados.filter(
    (r) => r.coincidencia === "encontrado"
  ).length;
  const totalNoEncontrados = totalExcel - totalEncontrados;
  const porcentajeEncontrados =
    totalExcel > 0
      ? Math.round((totalEncontrados / totalExcel) * 100 * 100) / 100
      : 0;

  return {
    totalExcel,
    totalEncontrados,
    totalNoEncontrados,
    porcentajeEncontrados,
    porEstado,
  };
};

const Inventario = () => {
  const [rows, setRows] = useState<InventarioRow[]>([
    { id: Date.now().toString(), serial: "", observacion: "" },
  ]);

  const [excelData, setExcelData] = useState<ExcelRow[]>([]);
  const [rightTableData, setRightTableData] = useState<ComparacionResult[]>([]);
  const [estadisticas, setEstadisticas] = useState<Estadisticas | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [archivoCargado, setArchivoCargado] = useState<string | null>(null);
  const inputRefs = React.useRef<{ [key: string]: HTMLInputElement | null }>(
    {}
  );

  const handleCellChange = (
    id: string,
    field: "serial" | "observacion",
    value: string
  ) => {
    setRows((prevRows) =>
      prevRows.map((row) => (row.id === id ? { ...row, [field]: value } : row))
    );
  };

  const handleAddRow = (afterId?: string) => {
    const newId =
      Date.now().toString() + Math.random().toString(36).substr(2, 9);
    const newRow: InventarioRow = {
      id: newId,
      serial: "",
      observacion: "",
    };

    if (afterId) {
      setRows((prevRows) => {
        const index = prevRows.findIndex((row) => row.id === afterId);
        if (index === -1) {
          return [...prevRows, newRow];
        }
        const newRows = [...prevRows];
        newRows.splice(index + 1, 0, newRow);
        return newRows;
      });
    } else {
      setRows((prevRows) => [...prevRows, newRow]);
    }

    // Focus en el nuevo input después de un pequeño delay
    setTimeout(() => {
      const serialInput = inputRefs.current[`${newId}-serial`];
      if (serialInput) {
        serialInput.focus();
      }
    }, 10);
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    rowId: string,
    field: "serial" | "observacion"
  ) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const isLastRow = rows[rows.length - 1]?.id === rowId;

      if (isLastRow) {
        // Si es la última fila, agregar una nueva
        handleAddRow(rowId);
      } else {
        // Si no es la última, mover el focus a la siguiente fila
        const currentIndex = rows.findIndex((row) => row.id === rowId);
        if (currentIndex !== -1 && currentIndex < rows.length - 1) {
          const nextRow = rows[currentIndex + 1];
          const nextInput = inputRefs.current[`${nextRow.id}-${field}`];
          if (nextInput) {
            nextInput.focus();
          }
        }
      }
    } else if (e.key === "Tab" && field === "observacion") {
      const isLastRow = rows[rows.length - 1]?.id === rowId;
      if (isLastRow && !e.shiftKey) {
        e.preventDefault();
        handleAddRow(rowId);
      }
    }
  };

  const handleFileUpload = async (file: File) => {
    setIsLoading(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: "array" });

      // Obtener la primera hoja
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];

      // Parsear datos desde la fila 3
      const jsonData = parseExcelData(worksheet);

      // Extraer y filtrar filas válidas
      const filasExcel = extraerFilasExcel(jsonData);

      if (filasExcel.length === 0) {
        alert(
          "No se encontraron filas válidas. Verifica que:\n" +
            "1. Las filas tengan estados permitidos (Available, Awaiting Disposal, Reserved, Preparación)\n" +
            "2. Si existe la columna 'nombre', debe tener prefijo '01-' o '02-'\n" +
            "3. El 'nombre' debe terminar con el 'Número de serie'\n" +
            "4. Las filas deben tener 'Número de serie' válido"
        );
        return;
      }

      // Limpiar solo los datos del Excel anterior (mantener seriales manuales)
      setExcelData(filasExcel);
      setRightTableData([]);
      setEstadisticas(null);
      setArchivoCargado(file.name);
    } catch (error) {
      const mensajeError =
        error instanceof Error
          ? error.message
          : "Error al procesar el archivo Excel. Por favor, verifica que el archivo sea válido.";
      alert(mensajeError);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnviar = () => {
    if (excelData.length === 0) {
      alert("Por favor, carga primero un archivo Excel con los datos.");
      return;
    }

    // Obtener los seriales de la tabla izquierda (filtrar vacíos y normalizar)
    const serialesTabla = rows
      .map((row) => row.serial.trim())
      .filter((serial) => serial !== "");

    if (serialesTabla.length === 0) {
      alert("Por favor, ingresa al menos un serial en la tabla.");
      return;
    }

    // Realizar la comparación usando función pura
    const resultados = compararSeriales(excelData, serialesTabla);

    // Agregar observaciones a los resultados encontrados y faltantes
    const resultadosConObservaciones = resultados.map((resultado) => {
      if (
        resultado.coincidencia === "encontrado" ||
        resultado.coincidencia === "faltante"
      ) {
        const filaEncontrada = rows.find((row) =>
          serialCoincide(row.serial, resultado.serial)
        );
        return {
          ...resultado,
          observacion: filaEncontrada?.observacion || "",
        };
      }
      return resultado;
    });

    // Calcular estadísticas por estado
    const estadisticasPorEstado = calcularEstadisticasPorEstado(
      resultadosConObservaciones
    );

    // Calcular estadísticas generales
    const estadisticasGenerales = calcularEstadisticasGenerales(
      resultadosConObservaciones,
      estadisticasPorEstado
    );

    setEstadisticas(estadisticasGenerales);
    setRightTableData(resultadosConObservaciones);
  };

  const handleExportar = () => {
    if (rightTableData.length === 0) {
      alert(
        "No hay datos para exportar. Por favor, realiza primero la comparación."
      );
      return;
    }

    try {
      // Crear un nuevo workbook
      const workbook = XLSX.utils.book_new();

      // Preparar los datos para exportar
      const datosExportar = rightTableData.map((item) => ({
        "Número de serie": item.serial,
        "Estado Excel": item.estadoExcel,
        Coincidencia:
          item.coincidencia === "encontrado"
            ? "Encontrado"
            : item.coincidencia === "faltante"
            ? "Faltante"
            : "No Encontrado",
        Observación: item.observacion || "",
      }));

      // Crear la hoja de trabajo
      const worksheet = XLSX.utils.json_to_sheet(datosExportar);

      // Agregar la hoja al workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, "Comparación");

      // Generar el archivo Excel
      XLSX.writeFile(
        workbook,
        `inventario_comparacion_${new Date().toISOString().split("T")[0]}.xlsx`
      );
    } catch (error) {
      alert("Error al exportar el archivo. Por favor, intenta nuevamente.");
    }
  };

  // Calcular seriales duplicados
  const serialesDuplicados = useMemo(() => {
    const serialesConContenido = rows
      .map((row) => row.serial.trim())
      .filter((serial) => serial.length > 0);

    const contadorSeriales = new Map<string, number>();
    serialesConContenido.forEach((serial) => {
      const serialLower = serial.toLowerCase();
      contadorSeriales.set(
        serialLower,
        (contadorSeriales.get(serialLower) || 0) + 1
      );
    });

    const duplicados = Array.from(contadorSeriales.entries())
      .filter(([_, count]) => count > 1)
      .map(([serialLower, count]) => {
        // Encontrar el serial original (con mayúsculas/minúsculas originales)
        const serialOriginal = serialesConContenido.find(
          (s) => s.toLowerCase() === serialLower
        );
        return { serial: serialOriginal || serialLower, count };
      });

    return {
      lista: duplicados,
      cantidad: duplicados.length,
    };
  }, [rows]);

  // Columnas para la tabla de la derecha con tamaños automáticos
  const columns = useMemo(
    () => [
      {
        accessorKey: "serial",
        header: "Serial",
        cell: ({ row }: { row: any }) => (
          <div className="font-medium whitespace-nowrap">
            {row.getValue("serial")}
          </div>
        ),
        minSize: 150,
        maxSize: 300,
      },
      {
        accessorKey: "estadoExcel",
        header: "Estado Excel",
        cell: ({ row }: { row: any }) => {
          const estado = row.getValue("estadoExcel") as
            | EstadoPermitido
            | "Faltante";
          const isFaltante = estado === "Faltante";
          return (
            <div
              className={`font-medium whitespace-nowrap ${
                isFaltante ? "text-orange-600" : "text-gray-700"
              }`}
            >
              {estado}
            </div>
          );
        },
        minSize: 140,
        maxSize: 220,
      },
      {
        accessorKey: "coincidencia",
        header: "Coincidencia",
        cell: ({ row }: { row: any }) => {
          const coincidencia = row.getValue("coincidencia") as string;
          const isEncontrado = coincidencia === "encontrado";
          const isFaltante = coincidencia === "faltante";
          return (
            <div className="flex items-center gap-2 whitespace-nowrap">
              {isEncontrado ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                  <span className="text-green-600 font-medium">Encontrado</span>
                </>
              ) : isFaltante ? (
                <>
                  <AlertCircle className="h-4 w-4 text-orange-600 flex-shrink-0" />
                  <span className="text-orange-600 font-medium">Faltante</span>
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
                  <span className="text-red-600 font-medium">
                    No Encontrado
                  </span>
                </>
              )}
            </div>
          );
        },
        minSize: 160,
        maxSize: 220,
      },
      {
        accessorKey: "observacion",
        header: "Observación",
        cell: ({ row }: { row: any }) => (
          <div className="text-gray-600 break-words">
            {row.getValue("observacion") || "-"}
          </div>
        ),
        minSize: 200,
        // Sin maxSize para que pueda expandirse según el espacio disponible
      },
    ],
    []
  );

  return (
    <div className="h-full flex gap-4 p-4">
      {/* Columna izquierda */}
      <div className="w-2/5 flex flex-col gap-4">
        {/* Botón CARGAR ARCHIVO */}
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center gap-2 mb-2">
            <FileSpreadsheet className="h-5 w-5 text-comfama" />
            <h3 className="font-semibold text-gray-800">Cargar Inventario</h3>
          </div>
          <p className="text-sm text-gray-600 mb-3">
            Sube un archivo Excel con los seriales y estados de los equipos
          </p>
          <ExcelUploadButton
            onUpload={handleFileUpload}
            buttonText="CARGAR ARCHIVO"
          />
          {archivoCargado && (
            <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                <span className="text-xs text-green-700 font-medium">
                  Archivo cargado: {archivoCargado}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Tabla editable */}
        <div className="bg-white rounded-lg border flex flex-col shadow-sm max-h-[600px]">
          <div className="p-4 border-b bg-gray-50 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-800">
                  Seriales a Comparar
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  Ingresa los seriales que deseas buscar. Presiona Enter para
                  agregar una nueva fila.
                </p>
              </div>
            </div>
          </div>
          <div className="overflow-y-auto flex-1 min-h-0">
            <Table>
              <TableHeader className="bg-gray-50 sticky top-0 z-10 shadow-sm">
                <TableRow>
                  <TableHead className="w-1/2 font-semibold bg-gray-50">
                    Serial
                  </TableHead>
                  <TableHead className="w-1/2 font-semibold bg-gray-50">
                    Observación
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row, index) => {
                  const isLastRow = index === rows.length - 1;
                  return (
                    <TableRow key={row.id}>
                      <TableCell>
                        <Input
                          ref={(el) => {
                            inputRefs.current[`${row.id}-serial`] = el;
                          }}
                          value={row.serial}
                          onChange={(e) =>
                            handleCellChange(
                              row.id,
                              "serial",
                              e.target.value.toUpperCase()
                            )
                          }
                          onKeyDown={(e) => handleKeyDown(e, row.id, "serial")}
                          className="w-full"
                          placeholder="Ingrese serial"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          ref={(el) => {
                            inputRefs.current[`${row.id}-observacion`] = el;
                          }}
                          value={row.observacion}
                          onChange={(e) =>
                            handleCellChange(
                              row.id,
                              "observacion",
                              e.target.value
                            )
                          }
                          onKeyDown={(e) =>
                            handleKeyDown(e, row.id, "observacion")
                          }
                          className="w-full"
                          placeholder={
                            isLastRow
                              ? "Ingrese observación"
                              : "Ingrese observación"
                          }
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Contador de seriales y duplicados */}
        <div className="bg-white rounded-lg border p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">Seriales escritos:</span>
            </div>
            <span className="text-2xl font-bold text-comfama">
              {rows.filter((row) => row.serial.trim().length > 0).length}
            </span>
          </div>
          {serialesDuplicados.cantidad > 0 && (
            <div className="pt-3 border-t">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-orange-500" />
                  <span className="text-sm text-gray-600">
                    Seriales Duplicados:
                  </span>
                </div>
                <span className="text-lg font-bold text-orange-600">
                  {serialesDuplicados.cantidad}
                </span>
              </div>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {serialesDuplicados.lista.map((dup, index) => (
                  <div
                    key={index}
                    className="text-xs bg-orange-50 border border-orange-200 rounded px-2 py-1 flex items-center justify-between"
                  >
                    <span className="font-medium text-orange-800">
                      {dup.serial}
                    </span>
                    <span className="text-orange-600 font-semibold">
                      ({dup.count} veces)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Botón enviar */}
        <Button
          onClick={handleEnviar}
          className="w-full bg-comfama hover:bg-comfama/90 text-white px-6 py-3 rounded-lg font-medium shadow-md transition-all duration-200 flex items-center justify-center gap-2"
        >
          <Send className="h-4 w-4" />
          Comparar Seriales
        </Button>
      </div>

      {/* Columna derecha */}
      <div className="w-2/3 flex flex-col gap-4">
        {/* Estadísticas Generales */}
        {estadisticas && (
          <div className="space-y-4">
            {/* Resumen General */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  Resumen General
                </h3>
              </div>
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-2 mb-2">
                    <FileSpreadsheet className="h-4 w-4 text-gray-500" />
                    <span className="text-xs text-gray-500 uppercase tracking-wide">
                      Total en Excel
                    </span>
                  </div>
                  <div className="text-3xl font-bold text-gray-900">
                    {estadisticas.totalExcel}
                  </div>
                </div>
                <div className="bg-white rounded-lg p-4 border border-green-200 shadow-sm hover:shadow-md transition-shadow bg-gradient-to-br from-green-50 to-white">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span className="text-xs text-gray-500 uppercase tracking-wide">
                      Encontrados
                    </span>
                  </div>
                  <div className="text-3xl font-bold text-green-600">
                    {estadisticas.totalEncontrados}
                  </div>
                </div>
                <div className="bg-white rounded-lg p-4 border border-red-200 shadow-sm hover:shadow-md transition-shadow bg-gradient-to-br from-red-50 to-white">
                  <div className="flex items-center gap-2 mb-2">
                    <XCircle className="h-4 w-4 text-red-600" />
                    <span className="text-xs text-gray-500 uppercase tracking-wide">
                      No Encontrados
                    </span>
                  </div>
                  <div className="text-3xl font-bold text-red-600">
                    {estadisticas.totalNoEncontrados}
                  </div>
                </div>
                <div className="bg-white rounded-lg p-4 border border-blue-200 shadow-sm hover:shadow-md transition-shadow bg-gradient-to-br from-blue-50 to-white">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-4 w-4 text-blue-600" />
                    <span className="text-xs text-gray-500 uppercase tracking-wide">
                      Porcentaje
                    </span>
                  </div>
                  <div className="text-3xl font-bold text-blue-600">
                    {estadisticas.porcentajeEncontrados}%
                  </div>
                </div>
              </div>
            </div>

            {/* Estadísticas por Estado y Gráfica */}
            {estadisticas.porEstado.length > 0 && (
              <div className="grid grid-cols-2 gap-4">
                {/* Estadísticas por Estado */}
                <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <AlertCircle className="h-5 w-5 text-comfama" />
                    <h3 className="text-lg font-semibold text-gray-800">
                      Por Estado
                    </h3>
                  </div>
                  <div className="space-y-3">
                    {estadisticas.porEstado
                      .filter((est) => est.total > 0)
                      .map((est) => (
                        <div
                          key={est.estado}
                          className="p-4 rounded-lg border-2 transition-all hover:shadow-md"
                          style={{
                            borderColor: COLORES_POR_ESTADO[est.estado] + "40",
                            backgroundColor:
                              COLORES_POR_ESTADO[est.estado] + "08",
                          }}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{
                                  backgroundColor:
                                    COLORES_POR_ESTADO[est.estado],
                                }}
                              />
                              <span className="font-semibold text-gray-800">
                                {est.estado}
                              </span>
                            </div>
                            <span className="text-lg font-bold text-gray-900">
                              {est.total}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div className="bg-white rounded p-2 border border-green-200">
                              <div className="text-xs text-gray-500 mb-1">
                                Encontrados
                              </div>
                              <div className="font-bold text-green-600 text-lg">
                                {est.encontrados}
                              </div>
                            </div>
                            <div className="bg-white rounded p-2 border border-blue-200">
                              <div className="text-xs text-gray-500 mb-1">
                                Porcentaje
                              </div>
                              <div className="font-bold text-blue-600 text-lg">
                                {est.porcentajeEncontrados.toFixed(1)}%
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Gráfica de Torta - Distribución por Estado */}
                <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <BarChart3 className="h-5 w-5 text-comfama" />
                    <h3 className="text-lg font-semibold text-gray-800">
                      Distribución Visual
                    </h3>
                  </div>
                  <div className="h-64 mb-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={estadisticas.porEstado
                            .filter((est) => est.total > 0)
                            .map((est) => ({
                              name: est.estado,
                              value: est.total,
                              porcentaje: est.porcentajeEncontrados,
                              encontrados: est.encontrados,
                            }))}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={(props: any) => {
                            const name = props.name || "";
                            const value = props.value || 0;
                            return `${name}: ${value}`;
                          }}
                          outerRadius={90}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {estadisticas.porEstado
                            .filter((est) => est.total > 0)
                            .map((est, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={COLORES_POR_ESTADO[est.estado]}
                              />
                            ))}
                        </Pie>
                        <Tooltip
                          formatter={(
                            value: number,
                            name: string,
                            props: any
                          ) => [
                            `${value} equipos`,
                            `${
                              props.payload.name
                            } - ${props.payload.porcentaje.toFixed(
                              1
                            )}% encontrados`,
                          ]}
                          contentStyle={{
                            backgroundColor: "white",
                            border: "1px solid #e5e7eb",
                            borderRadius: "8px",
                            padding: "8px",
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  {/* Leyenda personalizada mejorada */}
                  <div className="space-y-2">
                    {estadisticas.porEstado
                      .filter((est) => est.total > 0)
                      .map((est) => (
                        <div
                          key={est.estado}
                          className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className="w-4 h-4 rounded shadow-sm"
                              style={{
                                backgroundColor: COLORES_POR_ESTADO[est.estado],
                              }}
                            />
                            <span className="text-sm font-medium text-gray-700">
                              {est.estado}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-sm">
                            <span className="text-gray-600">
                              {est.total} equipos
                            </span>
                            <span className="font-semibold text-blue-600">
                              {est.porcentajeEncontrados.toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>

                  {/* Mostrar seriales faltantes si existen */}
                  {rightTableData.filter((r) => r.coincidencia === "faltante")
                    .length > 0 && (
                    <div className="mt-4 p-4 bg-orange-50 border-2 border-orange-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertCircle className="h-5 w-5 text-orange-600" />
                        <h4 className=" text-orange-800">Seriales Faltantes</h4>
                      </div>
                      <div className="text-sm text-orange-700">
                        <span className="font-bold text-lg">
                          {
                            rightTableData.filter(
                              (r) => r.coincidencia === "faltante"
                            ).length
                          }
                        </span>{" "}
                        serial(es) escrito(s) manualmente no se encontraron en
                        el Excel
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Área de tabla */}
        <div className="flex-1 min-h-0 max-h-[500px] bg-white rounded-xl border border-gray-200 shadow-sm overflow-y-auto flex flex-col">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <LoadingSpinner />
            </div>
          ) : (
            <>
              <div className="p-4 border-b bg-gray-50 flex-shrink-0">
                <h3 className="font-semibold text-gray-800">
                  {rightTableData.length > 0
                    ? `Resultados de la Comparación (${rightTableData.length} registros)`
                    : "Resultados de la Comparación"}
                </h3>
                {rightTableData.length === 0 && (
                  <p className="text-sm text-gray-500 mt-1">
                    Los resultados aparecerán aquí después de realizar la
                    comparación
                  </p>
                )}
              </div>
              <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
                <DataTable
                  data={rightTableData}
                  columns={columns}
                  caption=""
                  globalFilterColumn="serial"
                />
              </div>
            </>
          )}
        </div>

        {/* Botón Exportar */}
        <Button
          onClick={handleExportar}
          disabled={rightTableData.length === 0}
          className="w-full bg-[#FF277E] hover:bg-[#FF277E]/90 text-white px-6 py-3 rounded-lg font-medium shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <Upload className="h-4 w-4" />
          Exportar Resultados a Excel
        </Button>
      </div>
    </div>
  );
};

export default Inventario;
