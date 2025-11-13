import React, { useState, useRef } from "react";
import { Button } from "./button";
import {
  Download,
  Upload,
  FileSpreadsheet,
  X,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

interface ExcelUploadButtonProps {
  onUpload?: (file: File) => void | Promise<void>;
  buttonText?: string;
  buttonClassName?: string;
  title?: string;
  description?: string;
  accept?: string;
  maxSizeMB?: number;
}

const ExcelUploadButton: React.FC<ExcelUploadButtonProps> = ({
  onUpload,
  buttonText = "Cargar Archivo",
  buttonClassName = "",
  title = "Cargar Archivo Excel",
  description = "Adjunta un archivo de Excel (.xlsx, .xls)",
  accept = ".xlsx,.xls",
  maxSizeMB = 50,
}) => {
  const [showExcelModal, setShowExcelModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadError, setUploadError] = useState<string>("");
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    const allowedTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
      "application/vnd.ms-excel", // .xls
    ];

    const allowedExtensions = [".xlsx", ".xls"];
    const fileExtension = file.name
      .toLowerCase()
      .substring(file.name.lastIndexOf("."));

    // Validar tipo de archivo
    if (
      !allowedTypes.includes(file.type) &&
      !allowedExtensions.includes(fileExtension)
    ) {
      setUploadError("Solo se permiten archivos de Excel (.xlsx, .xls)");
      return;
    }

    // Validar tamaño
    const fileSizeMB = file.size / 1024 / 1024;
    if (fileSizeMB > maxSizeMB) {
      setUploadError(
        `El archivo es demasiado grande. Tamaño máximo: ${maxSizeMB} MB`
      );
      return;
    }

    setSelectedFile(file);
    setUploadError("");
    setUploadSuccess(false);
  };

  const handleFileInputChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(false);

    const file = event.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(false);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadError("");
    setUploadSuccess(false);

    try {
      if (onUpload) {
        await onUpload(selectedFile);
      }
      setUploadSuccess(true);

      // Cerrar modal después de un breve delay
      setTimeout(() => {
        setShowExcelModal(false);
        setSelectedFile(null);
        setUploadSuccess(false);
        setIsUploading(false);
        setUploadError("");
      }, 1500);
    } catch (error) {
      setUploadError(
        error instanceof Error ? error.message : "Error al procesar el archivo"
      );
      setIsUploading(false);
    }
  };

  const closeModal = () => {
    setShowExcelModal(false);
    setSelectedFile(null);
    setUploadError("");
    setUploadSuccess(false);
    setIsUploading(false);
    setIsDragOver(false);
  };

  const handleOpenModal = () => {
    setShowExcelModal(true);
  };

  return (
    <>
      <Button
        onClick={handleOpenModal}
        className={`relative bg-comfama hover:bg-comfama text-white px-6 py-2 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 ${buttonClassName}`}
      >
        <Download className="h-4 w-4 mr-2" />
        {buttonText}
      </Button>

      {/* Modal para adjuntar archivos Excel */}
      {showExcelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 p-6">
            {/* Header del modal */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-comfama rounded-lg flex items-center justify-center">
                  <FileSpreadsheet className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {title}
                  </h3>
                  <p className="text-sm text-gray-500">{description}</p>
                </div>
              </div>
              <Button
                onClick={closeModal}
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Área de drag & drop */}
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300 ${
                isDragOver
                  ? "border-comfama bg-comfama/5"
                  : "border-gray-300 hover:border-gray-400"
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              {selectedFile ? (
                <div className="space-y-4">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {selectedFile.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <Button
                    onClick={() => setSelectedFile(null)}
                    variant="outline"
                    size="sm"
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 border-red-200"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Quitar archivo
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                    <Upload className="h-8 w-8 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Arrastra tu archivo aquí
                    </p>
                    <p className="text-xs text-gray-500">
                      o haz clic para seleccionar
                    </p>
                  </div>
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    variant="outline"
                    className="border-comfama text-comfama hover:bg-comfama hover:text-white"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Seleccionar archivo
                  </Button>
                </div>
              )}
            </div>

            {/* Input oculto para archivos */}
            <input
              ref={fileInputRef}
              type="file"
              accept={accept}
              onChange={handleFileInputChange}
              className="hidden"
            />

            {/* Mensajes de error o éxito */}
            {uploadError && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <p className="text-sm text-red-700">{uploadError}</p>
              </div>
            )}

            {uploadSuccess && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <p className="text-sm text-green-700">
                  Archivo procesado exitosamente
                </p>
              </div>
            )}

            {/* Botones de acción */}
            <div className="flex gap-3 mt-6">
              <Button
                onClick={closeModal}
                variant="outline"
                className="flex-1 text-gray-600 hover:text-gray-800 border-gray-300 hover:border-gray-400"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleUpload}
                disabled={!selectedFile || isUploading || uploadSuccess}
                className="flex-1 bg-comfama hover:bg-comfama text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUploading || uploadSuccess ? (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Procesando...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Cargar archivo
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ExcelUploadButton;

