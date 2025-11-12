import { create } from 'zustand'
import { cartService } from '@/lib/api/cart'

/**
 * Store de Zustand para manejar el estado del carrito de compras.
 */
export const useCartStore = create((set, get) => ({
  items: [],
  total_items: 0,
  subtotal: '0.00',
  estimated_commission: '0.00',
  estimated_total: '0.00',
  isLoading: true,
  error: null,

  // Setea el estado del carrito
  _setCartState: (data) => {
    set({
      items: data.items || [],
      total_items: data.total_items || 0,
      subtotal: data.subtotal || '0.00',
      estimated_commission: data.estimated_commission || '0.00',
      estimated_total: data.estimated_total || '0.00',
      isLoading: false,
      error: null,
    })
  },

  // Acción para cargar el carrito desde la API
  fetchCart: async () => {
    set({ isLoading: true, error: null })
    try {
      const data = await cartService.getCart()
      get()._setCartState(data)
    } catch (error) {
      set({ isLoading: false, error: 'No se pudo cargar el carrito' })
    }
  },

  // Acción para agregar un item
  addItem: async (listingId, quantity) => {
    set({ isLoading: true })
    try {
      const data = await cartService.addItem(listingId, quantity)
      get()._setCartState(data)
    } catch (error) {
      set({ isLoading: false, error: 'Error al agregar el item' })
    }
  },

  // Acción para actualizar un item
  updateItem: async (cartItemId, quantity) => {
    set({ isLoading: true })
    try {
      const data = await cartService.updateItem(cartItemId, quantity)
      get()._setCartState(data)
    } catch (error) {
      set({ isLoading: false, error: 'Error al actualizar el item' })
    }
  },

  // Acción para eliminar un item
  removeItem: async (cartItemId) => {
    set({ isLoading: true })
    try {
      const data = await cartService.removeItem(cartItemId)
      get()._setCartState(data)
    } catch (error) {
      set({ isLoading: false, error: 'Error al eliminar el item' })
    }
  },
}))