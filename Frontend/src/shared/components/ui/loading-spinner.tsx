const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF277E]"></div>
    <span className="ml-3 text-[#FF277E]">Cargando...</span>
  </div>
);

export default LoadingSpinner;
