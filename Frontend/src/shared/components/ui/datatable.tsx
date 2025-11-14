import React, { useState, useEffect, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  getFilteredRowModel,
} from "@tanstack/react-table";
import { Input } from "@/shared/components/ui/input";

interface DataTableProps<TData> {
  data: TData[];
  columns: any[];
  caption?: string;
  globalFilterColumn?: string;
  searchButton?: React.ReactNode;
}

// Hook personalizado para debounce
const useDebounce = <T,>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

export default function DataTable<TData>({
  data,
  columns,
  caption,
  globalFilterColumn,
  searchButton,
}: DataTableProps<TData>) {
  const [sorting, setSorting] = useState<any>([]);
  const [columnFilters, setColumnFilters] = useState<any>([]);
  const tableContainerRef = React.useRef<HTMLDivElement | null>(null);
  const tableRef = React.useRef<HTMLTableElement | null>(null);
  const [, setContentWidth] = React.useState<number>(0);
  const [globalFilter, setGlobalFilter] = useState<string>("");
  const debouncedGlobalFilter = useDebounce(globalFilter, 300);

  // Memoizar la función de filtro global para evitar recrearla en cada render
  const globalFilterFn = useMemo(
    () => (row: any, _columnId: any, filterValue: string) => {
      if (!filterValue) return true;
      const searchValue = filterValue.toLowerCase().trim();
      // Buscar en todas las columnas visibles
      return Object.values(row.original).some((value: any) => {
        if (value === null || value === undefined) return false;
        // Normalizar el valor: convertir a string y a minúsculas
        const valueStr = String(value).toLowerCase();
        // Normalizar el searchValue: reemplazar múltiples espacios por uno solo y guiones bajos por espacios
        const normalizedSearch = searchValue
          .replace(/\s+/g, " ")
          .replace(/_/g, " ")
          .trim();
        // Normalizar el valor: reemplazar múltiples espacios por uno solo y guiones bajos por espacios
        const normalizedValue = valueStr
          .replace(/\s+/g, " ")
          .replace(/_/g, " ")
          .trim();
        // Buscar con espacios normalizados (búsqueda parcial flexible)
        return normalizedValue.includes(normalizedSearch);
      });
    },
    []
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnFiltersChange: setColumnFilters,
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn,
    state: {
      sorting,
      columnFilters,
      globalFilter: debouncedGlobalFilter,
    },
  });

  React.useEffect(() => {
    const updateWidth = () => {
      const tbl = tableRef.current;
      if (!tbl) return;
      const scrollWidth = tbl.scrollWidth;
      setContentWidth(scrollWidth);
    };
    updateWidth();
    const ro = new ResizeObserver(updateWidth);
    if (tableRef.current) {
      ro.observe(tableRef.current);
    }
    return () => ro.disconnect();
  }, []);


  return (
    <div className="space-y-4 h-full flex flex-col">
      {globalFilterColumn && (
        <div className="flex items-center gap-2 px-4 pt-4">
          <Input
            placeholder="Buscar en todas las columnas..."
            value={globalFilter ?? ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="max-w-sm"
          />
          {searchButton}
        </div>
      )}
      <div className="rounded-md border border-gray-200 flex-1 min-h-0">
        <div
          ref={tableContainerRef}
          className="h-full overflow-y-auto overflow-x-auto"
        >
          <Table ref={tableRef} className="w-full table-auto">
            {caption && <TableCaption>{caption}</TableCaption>}
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup: any) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header: any) => {
                    const columnDef = header.column.columnDef as any;
                    return (
                      <TableHead
                        key={header.id}
                        style={{
                          width: columnDef.size
                            ? `${columnDef.size}px`
                            : "auto",
                          minWidth: columnDef.minSize
                            ? `${columnDef.minSize}px`
                            : "100px",
                          maxWidth: columnDef.maxSize
                            ? `${columnDef.maxSize}px`
                            : "none",
                        }}
                        className="whitespace-nowrap"
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row: any) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell: any) => {
                      const columnDef = cell.column.columnDef as any;
                      return (
                        <TableCell
                          key={cell.id}
                          style={{
                            width: columnDef.size
                              ? `${columnDef.size}px`
                              : "auto",
                            minWidth: columnDef.minSize
                              ? `${columnDef.minSize}px`
                              : "100px",
                            maxWidth: columnDef.maxSize
                              ? `${columnDef.maxSize}px`
                              : "none",
                          }}
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No hay resultados.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}

