'use client';

import { Edit2 } from 'lucide-react'; // Asumo que tienes lucide-react

// Este es un placeholder para el Paso 4
export default function Step4_Review({ onPublish, onBack, listingData, setStep }) {
  
  // Extraemos los datos para mostrarlos
  const { type, category, title, description, price, quantity, condition, images } = listingData;

  // Función para volver a un paso específico a editar
  const handleEdit = (stepNumber) => {
    setStep(stepNumber);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 md:p-8">
      <div className="flex flex-col gap-6">
        <h2 className="text-[#396530] dark:text-green-300 text-2xl md:text-3xl font-poppins font-bold">
          Paso 4: Revisión y Publicar
        </h2>
        
        <p className="text-gray-700 dark:text-gray-300">
          Por favor, revisa que toda la información sea correcta antes de publicar.
        </p>

        {/* Resumen de la publicación */}
        <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
          
          {/* Sección 1: Tipo y Categoría */}
          <div className="flex justify-between items-center">
            <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Tipo y Categoría</h4>
            <button onClick={() => handleEdit(1)} className="text-sm text-[#396530] hover:underline flex items-center gap-1">
              <Edit2 size={14} /> Editar
            </button>
          </div>
          <p className="text-gray-700 dark:text-gray-300"><strong>Tipo:</strong> <span className="capitalize">{type?.toLowerCase() || 'N/A'}</span></p>
          <p className="text-gray-700 dark:text-gray-300"><strong>Categoría:</strong> <span className="capitalize">{category || 'N/A'}</span></p>

          <hr className="border-gray-200 dark:border-gray-600"/>

          {/* Sección 2: Información */}
          <div className="flex justify-between items-center">
            <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Información</h4>
            <button onClick={() => handleEdit(2)} className="text-sm text-[#396530] hover:underline flex items-center gap-1">
              <Edit2 size={14} /> Editar
            </button>
          </div>
          <p className="text-gray-700 dark:text-gray-300"><strong>Título:</strong> {title || 'N/A'}</p>
          <p className="text-gray-700 dark:text-gray-300"><strong>Precio:</strong> ${parseFloat(price || 0).toFixed(2)} USD</p>
          <p className="text-gray-700 dark:text-gray-300"><strong>Cantidad:</strong> {quantity || 0}</p>
          {/* --- INICIO DE LA CORRECCIÓN --- */}
          <p className="text-gray-700 dark:text-gray-300"><strong>Condición:</strong> <span className="capitalize">{condition?.toLowerCase() || 'N/A'}</span></p>
          {/* --- FIN DE LA CORRECCIÓN (Se cambió </D> por </p>) --- */}
          <p className="text-gray-700 dark:text-gray-300"><strong>Descripción:</strong> {description || 'N/A'}</p>
          
          <hr className="border-gray-200 dark:border-gray-600"/>

          {/* Sección 3: Multimedia */}
          <div className="flex justify-between items-center">
            <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Multimedia</h4>
            <button onClick={() => handleEdit(3)} className="text-sm text-[#396530] hover:underline flex items-center gap-1">
              <Edit2 size={14} /> Editar
            </button>
          </div>
           <p className="text-gray-700 dark:text-gray-300"><strong>Imágenes:</strong> {images.length} subidas</p>
           {/* Aquí podrías mostrar thumbnails de las imágenes */}

        </div>

        {/* Divisor y Botones */}
        <hr className="border-t border-gray-200 dark:border-gray-700" />
        <div className="flex justify-between">
          <button
            onClick={onBack}
            className="px-8 py-3 bg-gray-200 text-gray-800 font-inter font-semibold rounded-lg hover:bg-gray-300 transition-colors"
          >
            Volver
          </button>
          <button
            onClick={onPublish}
            className="px-8 py-3 bg-blue-600 text-white font-inter font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            Confirmar y Publicar
          </button>
        </div>
      </div>
    </div>
  );
}