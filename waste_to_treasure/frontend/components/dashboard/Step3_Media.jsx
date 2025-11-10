'use client';

// Este es un placeholder para el Paso 3
export default function Step3_Media({ onNext, onBack, listingData, updateListingData }) {
  
  // Lógica para subir imágenes (ej. react-dropzone) iría aquí
  const handleOnDrop = (acceptedFiles) => {
    // Aquí actualizarías el estado
    // updateListingData({ images: [...listingData.images, ...acceptedFiles] });
    console.log(acceptedFiles);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 md:p-8">
      <div className="flex flex-col gap-6">
        <h2 className="text-[#396530] dark:text-green-300 text-2xl md:text-3xl font-poppins font-bold">
          Paso 3: Multimedia
        </h2>
        
        {/* Aquí iría el componente de "drag and drop" para imágenes */}
        <p className="text-gray-700 dark:text-gray-300">
          Añade fotos de tu producto o material. La primera foto será la portada.
        </p>
        
        {/* Placeholder de Dropzone */}
        <div 
          className="w-full h-48 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg 
                     flex flex-col items-center justify-center text-center p-4
                     cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50"
        >
          <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-4-4V7a4 4 0 014-4h.586a1 1 0 01.707.293l.414.414a1 1 0 00.707.293h3.172a1 1 0 00.707-.293l.414-.414a1 1 0 01.707-.293H17a4 4 0 014 4v5a4 4 0 01-4 4H7z" /></svg>
          <span className="mt-2 block text-sm text-gray-500">
            Arrastra y suelta tus fotos aquí, o haz clic para seleccionar
          </span>
        </div>
        
        {/* Aquí mostrarías las imágenes subidas */}

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
            onClick={onNext}
            className="px-8 py-3 bg-[#396530] text-white font-inter font-semibold rounded-lg hover:bg-green-900 dark:hover:bg-green-700 transition-colors"
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>
  );
}