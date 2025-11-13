import React from "react";
import {
  LineChart,
  BarChart,
  PieChart,
  AreaChart,
  Line,
  Bar,
  Pie,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
  ResponsiveContainer,
} from "recharts";

// Wrapper para Legend para evitar problemas de tipos con TypeScript
const LegendWrapper: React.FC<any> = (props) => {
  // @ts-expect-error - recharts Legend tiene problemas de tipos con TypeScript
  return React.createElement(Legend, props);
};

// Tipos de gráficas disponibles
export type ChartType = "line" | "bar" | "pie" | "area";

// Configuración de colores
export interface ColorConfig {
  primary?: string;
  secondary?: string;
  tertiary?: string;
  background?: string;
  grid?: string;
}

// Configuración de líneas/barras/áreas
export interface DataSeries {
  dataKey: string;
  name: string;
  color?: string;
  strokeWidth?: number;
  fill?: string;
  type?: "monotone" | "linear" | "step";
}

// Configuración del gráfico
export interface ChartConfig {
  title?: string;
  subtitle?: string;
  width?: string | number;
  height?: string | number;
  margin?: {
    top?: number;
    right?: number;
    left?: number;
    bottom?: number;
  };
  colors?: ColorConfig;
  showGrid?: boolean;
  showLegend?: boolean;
  showTooltip?: boolean;
  xAxisKey?: string;
  yAxisDomain?: [number, number];
  yAxisFormatter?: (value: number) => string;
  yAxisTicks?: number[];
}

// Props del componente wrapper
export interface ChartWrapperProps {
  type: ChartType;
  data: any[];
  series: DataSeries[];
  config?: ChartConfig;
  className?: string;
}

// Colores por defecto
const defaultColors: ColorConfig = {
  primary: "#FF277E",
  secondary: "#22c55e",
  tertiary: "#1e40af",
  background: "#ffffff",
  grid: "#e5e7eb",
};

const ChartWrapper: React.FC<ChartWrapperProps> = ({
  type,
  data,
  series,
  config = {},
  className = "",
}) => {
  // Combinar configuración por defecto con la proporcionada
  const finalConfig: ChartConfig = {
    width: "100%",
    height: "50vh",
    margin: { top: 5, right: 30, left: 20, bottom: 5 },
    colors: { ...defaultColors, ...config.colors },
    showGrid: true,
    showLegend: true,
    showTooltip: true,
    xAxisKey: "name",
    yAxisDomain: [0, 100],
    yAxisFormatter: (value: number) => `${value}%`,
    yAxisTicks: [0, 20, 40, 60, 80, 100],
    ...config,
  };

  // Renderizar elementos comunes
  const renderCommonElements = () => (
    <>
      {finalConfig.showGrid && (
        <CartesianGrid
          strokeDasharray="3 3"
          stroke={finalConfig.colors?.grid}
        />
      )}
      <XAxis dataKey={finalConfig.xAxisKey} />
      <YAxis
        width="auto"
        domain={finalConfig.yAxisDomain}
        tickFormatter={finalConfig.yAxisFormatter}
        ticks={finalConfig.yAxisTicks}
      />
      {finalConfig.showTooltip && <Tooltip />}
      {finalConfig.showLegend && <LegendWrapper />}
    </>
  );

  // Renderizar series de datos
  const renderSeries = () => {
    return series.map((serie, index) => {
      const color = serie.color || getColorByIndex(index);

      switch (type) {
        case "line":
          return (
            <Line
              key={serie.dataKey}
              type={serie.type || "monotone"}
              dataKey={serie.dataKey}
              stroke={color}
              strokeWidth={serie.strokeWidth || 2}
              name={serie.name}
              activeDot={{ r: 6 }}
            />
          );
        case "bar":
          return (
            <Bar
              key={serie.dataKey}
              dataKey={serie.dataKey}
              fill={color}
              name={serie.name}
            />
          );
        case "area":
          return (
            <Area
              key={serie.dataKey}
              type={serie.type || "monotone"}
              dataKey={serie.dataKey}
              stroke={color}
              fill={serie.fill || color}
              strokeWidth={serie.strokeWidth || 2}
              name={serie.name}
            />
          );
        case "pie":
          return null; // Los gráficos de pie se manejan diferente
        default:
          return null;
      }
    });
  };

  // Obtener color por índice
  const getColorByIndex = (index: number): string => {
    const primaryColor: string =
      finalConfig.colors?.primary ?? defaultColors.primary ?? "#FF277E";
    const secondaryColor: string =
      finalConfig.colors?.secondary ?? defaultColors.secondary ?? "#22c55e";
    const tertiaryColor: string =
      finalConfig.colors?.tertiary ?? defaultColors.tertiary ?? "#1e40af";

    const colors: string[] = [primaryColor, secondaryColor, tertiaryColor];
    const color = colors[index % colors.length];
    return color;
  };

  // Renderizar gráfico de pie
  const renderPieChart = () => {
    if (type !== "pie") return null;

    return (
      <PieChart
        width={finalConfig.width}
        height={finalConfig.height}
        margin={finalConfig.margin}
      >
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }: { name: string; percent: number }) =>
            `${name} ${(percent * 100).toFixed(0)}%`
          }
          outerRadius={80}
          fill="#8884d8"
          dataKey={series[0]?.dataKey || "value"}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={getColorByIndex(index)} />
          ))}
        </Pie>
        {finalConfig.showTooltip && <Tooltip />}
        {finalConfig.showLegend && <LegendWrapper />}
      </PieChart>
    );
  };

  // Renderizar gráfico principal
  const renderMainChart = () => {
    const commonProps = {
      width: finalConfig.width,
      height: finalConfig.height,
      data,
      margin: finalConfig.margin,
    };

    switch (type) {
      case "line":
        return (
          <LineChart {...commonProps}>
            {renderCommonElements()}
            {renderSeries()}
          </LineChart>
        );
      case "bar":
        return (
          <BarChart {...commonProps}>
            {renderCommonElements()}
            {renderSeries()}
          </BarChart>
        );
      case "area":
        return (
          <AreaChart {...commonProps}>
            {renderCommonElements()}
            {renderSeries()}
          </AreaChart>
        );
      case "pie":
        return renderPieChart();
      default:
        return null;
    }
  };

  return (
    <div className={`chart-wrapper ${className}`}>
      {(finalConfig.title || finalConfig.subtitle) && (
        <div className="mb-4">
          {finalConfig.title && (
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              {finalConfig.title}
            </h2>
          )}
          {finalConfig.subtitle && (
            <p className="text-gray-600 text-sm">{finalConfig.subtitle}</p>
          )}
        </div>
      )}

      <div className="flex justify-center">
        <ResponsiveContainer width="100%" height={finalConfig.height}>
          {renderMainChart()}
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ChartWrapper;

