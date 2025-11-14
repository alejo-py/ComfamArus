import { memo, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { User } from "lucide-react";
import Logo from "@/assets/images/Comfama_logo.svg";
import { useNavigation } from "@/shared/hooks/useNavigation";

const Header = memo(() => {
  const navigate = useNavigate();
  const { getSectionName } = useNavigation();

  const handleLogoClick = useCallback(() => {
    navigate("/");
  }, [navigate]);

  const sectionName = useMemo(() => getSectionName(), [getSectionName]);

  return (
    <header className="bg-[#ffffff] px-6 py-4 flex items-center justify-between shadow-md border-b border-gray-200">
      <div className="flex items-center gap-3">
        <button
          onClick={handleLogoClick}
          className="cursor-pointer hover:scale-105 transition-transform duration-200 rounded-lg"
        >
          <img src={Logo} alt="Logo" width={150} height={100} />
        </button>
      </div>
      <div className="flex items-center space-x-6">
        <button
          onClick={() => navigate("/")}
          className="text-lg text-white bg-[#FF277E] px-2 py-1 rounded-lg font-medium hover:bg-[#e01f6a] transition-colors"
        >
          {sectionName}
        </button>
        <div className="w-8 h-8 bg-[#FF277E] rounded-full flex items-center justify-center cursor-pointer hover:bg-[#e01f6a] transition-colors">
          <User className="w-5 h-5 text-white" />
        </div>
      </div>
    </header>
  );
});

Header.displayName = "Header";

export default Header;
