import { useNavigate } from "react-router-dom";
import {
  Settings,
  Workflow,
  Cog,
  FileText,
  Users,
  CheckSquare,
} from "lucide-react";
import { dashboardProcesses } from "@/app/config/menu";

const MainContent = () => {
  const navigate = useNavigate();

  // Mapeo de iconos
  const iconMap = {
    Settings,
    Workflow,
    Cog,
    FileText,
    Users,
    CheckSquare,
  };

  const handleCardClick = (path: string) => {
    navigate(path);
  };

  return (
    <main className="flex-1 bg-white p-8 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-black mb-8 flex items-center gap-2">
          Automatización de procesos
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {dashboardProcesses.map((card: { id: number; title: string; icon: string; color: string; path: string }) => {
            const IconComponent = iconMap[card.icon as keyof typeof iconMap];
            return (
              <div
                key={card.id}
                onClick={() => handleCardClick(card.path)}
                className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-all duration-200 cursor-pointer hover:scale-105 hover:border-gray-300"
              >
                <div className="mb-4">
                  <IconComponent
                    className="w-16 h-16"
                    style={{ color: card.color }}
                  />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {card.title}
                </h3>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
};

export default MainContent;


