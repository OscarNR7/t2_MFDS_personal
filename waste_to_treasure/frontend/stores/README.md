# Stores - Estado Global con Zustand

State management global usando Zustand.

## 🎯 Propósito

Gestión de **estado global** de la aplicación usando Zustand (alternativa ligera a Redux).

## 📂 Stores Principales

- `useAuthStore.js` - Estado de autenticación (usuario actual)
- `useCartStore.js` - Estado del carrito de compras
- `useFilterStore.js` - Estado de filtros del marketplace

## 🔧 Patrón de Store

Cada store debe:
1. Usar `create()` de Zustand
2. Incluir state y actions
3. Persistir en localStorage si es necesario

## 📝 Ejemplo: `useCartStore.js`

```javascript
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => set((state) => ({
        items: [...state.items, item]
      })),
      removeItem: (id) => set((state) => ({
        items: state.items.filter(item => item.id !== id)
      })),
      clearCart: () => set({ items: [] }),
      getTotalPrice: () => {
        const items = get().items
        return items.reduce((sum, item) => sum + item.price * item.quantity, 0)
      }
    }),
    { name: 'cart-storage' }
  )
)
```

## 🎯 Uso en Componentes

```javascript
'use client'
import { useCartStore } from '@/stores/useCartStore'

export default function CartButton() {
  const items = useCartStore(state => state.items)
  return <button>Cart ({items.length})</button>
}
```
