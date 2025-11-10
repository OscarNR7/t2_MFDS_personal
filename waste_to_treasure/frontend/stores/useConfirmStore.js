import { create } from 'zustand'

/**
 * Store de Zustand para manejar un modal de confirmación global.
 */
export const useConfirmStore = create(set => ({
  isOpen: false,
  title: '',
  message: '',
  danger: true, // Por defecto es un modal de peligro (rojo)
  onConfirm: () => {},
  onCancel: () => {},

  /**
   * Abre el modal de confirmación.
   * @param {string} title - El título del modal.
   * @param {string} message - El mensaje de confirmación.
   * @param {Function} onConfirm - La función a ejecutar si se confirma.
   * @param {Object} [options] - Opciones adicionales
   * @param {Function} [options.onCancel] - (Opcional) La función a ejecutar si se cancela.
   * @param {boolean} [options.danger] - (Opcional) Si el botón de confirmación es rojo. (default: true)
   */
  open: (title, message, onConfirm, options = {}) => {
    // --- INICIO DE LA CORRECCIÓN ---
    // Se desestructuran las opciones correctamente
    const { onCancel = () => {}, danger = true } = options
    set({
      isOpen: true,
      title,
      message,
      onConfirm,
      onCancel,
      danger, // Guardar el estado de peligro
    })
    // --- FIN DE LA CORRECCIÓN ---
  },

  /**
   * Cierra el modal y resetea su estado.
   */
  close: () =>
    set({
      isOpen: false,
      title: '',
      message: '',
      onConfirm: () => {},
      onCancel: () => {},
      danger: true, // Resetear al valor por defecto
    }),
}))