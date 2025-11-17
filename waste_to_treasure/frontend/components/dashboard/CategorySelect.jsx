/**
 * Autor: Alejandro Campa Alonso 215833
 * Componente: CategorySelect
 * Descripción: dropdown para seleccionar categoría de producto con carga desde API, muestra opciones como Madera, Textil, Metal, Plástico, Vidrio, etc.
 */

'use client';

import { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import categoriesService from '@/lib/api/categories';

/**
 * Dropdown para seleccionar la categoría.
 * Carga las categorías desde la API del backend.
 * 
 * @param {boolean} onlyParents - Si es true, solo muestra categorías padre
 * @param {number} parentCategoryId - Si se proporciona, solo muestra categorías hijas de este padre
 * @param {string} label - Etiqueta personalizada para el select
 * @param {string} className - Clases CSS adicionales para el contenedor
 */
export default function CategorySelect({ 
  value, 
  onChange, 
  disabled, 
  type = 'MATERIAL', 
  onlyParents = false, 
  parentCategoryId = null,
  label = 'Categoría',
  className = ''
}) {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Cargar categorías desde el backend
  useEffect(() => {
    console.log('[CategorySelect] useEffect triggered:', { type, onlyParents, parentCategoryId })
    
    if (!type) {
      console.log('[CategorySelect] No type, skipping')
      return;
    }
    
    // Si necesitamos subcategorías pero no hay padre, no cargar nada
    if (!onlyParents && !parentCategoryId) {
      console.log('[CategorySelect] Need subcategories but no parent, clearing')
      setCategories([]);
      return;
    }
    
    const fetchCategories = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const params = { 
          type: type.toUpperCase(),
          limit: 100 
        };
        
        // Pasar parent_id al backend para filtrado eficiente
        if (onlyParents) {
          params.parent_id = -1; // Solo raíces
        } else if (parentCategoryId) {
          params.parent_id = parentCategoryId; // Solo hijas de este padre
        }
        
        console.log('[CategorySelect] Fetching with params:', params)
        const data = await categoriesService.getAll(params);
        console.log('[CategorySelect] Received categories:', data.items?.length || 0, data.items)
        setCategories(data.items || []);
      } catch (err) {
        console.error('[CategorySelect] Error:', err)
        setError('No se pudieron cargar las categorías');
        setCategories([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, [type, onlyParents, parentCategoryId]);

  return (
    <div className={`relative w-full ${className}`}>
      <label
        htmlFor="category"
        className="block text-sm font-medium text-dark mb-1"
      >
        {label}
      </label>
      <select
        id="category"
        value={value}
        onChange={onChange}
        disabled={isLoading || disabled || error}
        className={`
          w-full p-3 border border-gray-400 dark:border-gray-600 rounded-xl appearance-none
          bg-white text-dark
          focus:ring-2 focus:ring-[#396530] focus:border-transparent
          disabled:bg-gray-100 disabled:cursor-not-allowed
          ${
            value
              ? 'text-black dark:text-black'
              : 'text-black'
          }
        `}
      >
        <option value="" disabled>
          {isLoading 
            ? 'Cargando categorías...' 
            : error 
            ? error
            : 'Selecciona una categoría...'}
        </option>
        
        {categories.map((cat) => (
          <option key={cat.category_id} value={cat.category_id}>
            {cat.name}
          </option>
        ))}
      </select>
      <ChevronDown className="w-5 h-5 text-gray-400 absolute right-4 top-[42px] pointer-events-none" />
    </div>
  );
}