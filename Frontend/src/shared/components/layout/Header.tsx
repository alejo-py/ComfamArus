import { useNavigate } from "react-router-dom";
import { User } from "lucide-react";
import Logo from "@/assets/images/Comfama_logo.svg";
import { useNavigation } from "@/shared/hooks/useNavigation";

const Header = () => {
  const navigate = useNavigate();
  const { getSectionName } = useNavigation();

  const handleLogoClick = () => {
    navigate("/");
  };

  return (
    <header className="bg-[#ffffff] px-6 py-4 flex items-center justify-between shadow-md border-b border">
      <div className="flex items-center gap-3">
        <button
          onClick={handleLogoClick}
          className="cursor-pointer hover:scale-105 transition-transform duration-200 rounded-lg "
        >
          <img src={Logo} alt="Logo" width={150} height={100} />
        </button>
      </div>
      <div className="flex items-center space-x-6">
        <span className="text-lg text-white bg-comfama px-2 py-1 rounded-lg font-medium">
          {getSectionName()}
        </span>
        <div className="w-8 h-8 bg-comfama rounded-full flex items-center justify-center">
          <User className="w-5 h-5 text-white" />
        </div>
      </div>
    </header>
  );
};

export default Header;


