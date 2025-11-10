'use client'

import { X, AlertTriangle } from 'lucide-react'
import { useConfirmStore } from '@/stores/useConfirmStore'

export default function GlobalConfirmModal({
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
}) {
  // --- INICIO DE LA CORRECCIÓN ---
  // 'danger' ahora viene del store, no de props estáticas
  const { isOpen, title, message, onConfirm, onCancel, danger, close } =
    useConfirmStore()
  // --- FIN DE LA CORRECCIÓN ---

  if (!isOpen) return null

  const handleConfirm = () => {
    onConfirm()
    close()
  }

  const handleCancel = () => {
    onCancel()
    close()
  }

  const confirmClasses = danger
    ? 'bg-red-600 text-white hover:bg-red-700'
    : 'bg-primary-500 text-white hover:bg-primary-600' // Botón verde si no es 'danger'

  return (
    <div
      onClick={handleCancel}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
    >
      <div
        onClick={e => e.stopPropagation()}
        className="relative w-full max-w-md rounded-xl bg-white p-6 shadow-lg"
      >
        <div className="flex items-start">
          {danger && (
            <div className="mr-4 flex-shrink-0 rounded-full bg-red-100 p-2">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
          )}
          <div className="flex-1">
            <h2 className="font-poppins text-2xl font-semibold text-neutral-900">
              {title}
            </h2>
            <p className="mt-2 font-inter text-base text-neutral-600">
              {message}
            </p>
          </div>
          <button
            onClick={handleCancel}
            className="-mt-2 -mr-2 ml-4 text-neutral-400 hover:text-neutral-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Botones de Acción */}
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={handleCancel}
            className="rounded-lg border border-neutral-300 bg-white px-4 py-2 font-inter text-sm font-semibold text-neutral-900 transition-colors hover:bg-neutral-50"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className={`rounded-lg px-4 py-2 font-inter text-sm font-semibold transition-colors ${confirmClasses}`}
          >
            {/* El texto del botón cambia según si es 'danger' o no */}
            {danger ? confirmText : 'Aceptar'}
          </button>
        </div>
      </div>
    </div>
  )
}