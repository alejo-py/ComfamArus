import type { User } from "./users";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/shared/components/ui/dropdown-menu";
import { DataPlateColumnHeader } from "@/shared/components/ui/datablate-column-header";

export const columns = [
  {
    header: ({ column }: { column: unknown }) => (
      <DataPlateColumnHeader title="Nombre" column={column as any} />
    ),
    accessorKey: "nombre",
  },
  { header: "Cédula Empleado", accessorKey: "cedula_empleado" },
  { header: "Service Req Number", accessorKey: "service_req_number" },
  { header: "Tipo De Contrato", accessorKey: "tipo_de_contrato" },
  { header: "Estado Del Caso", accessorKey: "estado_del_caso" },
  { header: "Fecha transferencia", accessorKey: "fecha_transferencia" },
  { header: "Fecha Programación", accessorKey: "fecha_programacion" },
  { header: "Fecha creación", accessorKey: "fecha_creacion" },
  { header: "Fecha cierre", accessorKey: "fecha_cierre" },
  { header: "Fecha Ingreso Usuario", accessorKey: "fecha_ingreso_usuario" },
  { header: "Días Ingreso vs Sln", accessorKey: "dias_ingreso_vs_sln" },
  { header: "Año Caso", accessorKey: "ano_caso" },
  { header: "Mes Caso", accessorKey: "mes_caso" },
  { header: "Semana Caso", accessorKey: "semana_caso" },
  { header: "Año Sln", accessorKey: "ano_sln" },
  { header: "Mes Sln", accessorKey: "mes_sln" },
  { header: "Semana Sln", accessorKey: "semana_sln" },
  { header: "Mes Ingreso", accessorKey: "mes_ingreso" },
  { header: "Día ingreso", accessorKey: "dia_ingreso" },
  { header: "Año", accessorKey: "ano" },
  { header: "Ans Entrega", accessorKey: "ans_entrega" },
  { header: "Días Entrega", accessorKey: "dias_entrega" },
  { header: "Días Ingreso", accessorKey: "dias_ingreso" },
  { header: "Ans Ingreso", accessorKey: "ans_ingreso" },
  { header: "KPI", accessorKey: "kpi" },
  { header: "Cumplimiento KPI", accessorKey: "cumplimiento_kpi" },
  { header: "Excepción", accessorKey: "excepcion" },
  { header: "Motivo Excepción", accessorKey: "motivo_excepcion" },
  { header: "Observaciones", accessorKey: "observaciones" },
  {
    id: "actions",
    cell: ({ row }: { row: any }) => {
      return (
        <div className="flex justify-end pr-6">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Acciones</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => {
                  navigator.clipboard.writeText(
                    String(row.original.service_req_number ?? "")
                  );
                }}
              >
                Copiar SRN
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Detalles</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];

