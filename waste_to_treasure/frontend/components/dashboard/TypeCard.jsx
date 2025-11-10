'use client';

import { Package, Box } from 'lucide-react'; // Importamos iconos por defecto

/**
 * Tarjeta seleccionable para "Producto" o "Material".
 */
export default function TypeCard({
  icon: Icon,
  title,
  description,
  isSelected,
  onClick,
}) {
  // Usamos un icono por defecto si no se provee uno
  const IconComponent = Icon || (title === 'Producto' ? Package : Box);

  return (
    <button
      onClick={onClick}
      className={`
        flex-1 p-6 rounded-xl text-center
        border-2 transition-all duration-200
        flex flex-col items-center gap-4 shadow-md
        dark:bg-gray-700
        ${
          isSelected
            ? 'border-[#396530] bg-green-50 dark:bg-green-900/30 dark:border-green-400 scale-105 shadow-lg'
            : 'border-gray-300 dark:border-gray-600 hover:shadow-lg hover:border-[#396530] dark:hover:border-green-500'
        }
      `}
    >
      {/* Icono */}
      <IconComponent
        className={`w-10 h-10 ${
          isSelected ? 'text-[#396530] dark:text-green-300' : 'text-gray-500 dark:text-gray-400'
        }`}
      />
      
      {/* Título */}
      <h3
        className={`
          text-2xl md:text-3xl font-roboto font-bold
          ${
            isSelected
              ? 'text-[#396530] dark:text-green-300'
              : 'text-gray-700 dark:text-gray-300'
          }
        `}
      >
        {title}
      </h3>
      
      {/* Descripción */}
      <p className="text-black dark:text-gray-400 text-sm md:text-base font-inter font-medium">
        {description}
      </p>
    </button>
  );
}