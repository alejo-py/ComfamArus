import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import type { User } from "@/features/indicador-equipos/data/users";

interface LineChartProps {
  users: User[];
}

export default function EquipmentChart({ users }: LineChartProps) {
  // Calcular datos del gráfico basado en los usuarios
  const calculateChartData = () => {
    const months = ["Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep"];

    return months.map((month) => {
      // Filtrar usuarios por mes (simulando distribución)
      const monthUsers = users.filter((_, index) => {
        const monthIndex = months.indexOf(month);
        return index % 7 === monthIndex;
      });

      // Calcular cumplimiento basado en KPI
      const totalUsers = monthUsers.length;
      const compliantUsers = monthUsers.filter((user) => {
        const kpiValue = user.kpi ? parseInt(user.kpi.replace("%", "")) : 0;
        return kpiValue >= 80;
      }).length;

      const cumplimiento =
        totalUsers > 0 ? Math.round((compliantUsers / totalUsers) * 100) : 0;

      return {
        name: month,
        cumplimiento: cumplimiento,
        kpi: 80,
      };
    });
  };

  const data = calculateChartData();
  return (
    <LineChart
      style={{
        width: "100%",
        height: "100%",
        aspectRatio: 1.618,
      }}
      responsive
      data={data}
      margin={{
        top: 5,
        right: 0,
        left: 0,
        bottom: 5,
      }}
    >
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="name" />
      <YAxis
        width="auto"
        domain={[0, 120]}
        tickFormatter={(value: number) => `${value}%`}
        ticks={[0, 20, 40, 60, 80, 100, 120]}
      />
      <Tooltip />
      {/* <Legend /> */}
      <Line
        type="monotone"
        dataKey="kpi"
        stroke="#1e40af"
        strokeWidth={2}
        name="KPI 80%"
      />
      <Line
        type="monotone"
        dataKey="cumplimiento"
        stroke="#22c55e"
        strokeWidth={3}
        activeDot={{ r: 6 }}
        name="Cumplimiento"
      />
    </LineChart>
  );
}

