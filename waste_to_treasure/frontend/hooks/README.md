# Hooks

Custom React hooks para lógica reutilizable.

## Organización

```
hooks/
├── index.js              # Re-exporta todos los hooks
├── use-auth.js           # Autenticación y usuario actual
├── use-cart.js           # Gestión del carrito
├── use-listings.js       # Consultas de listings
├── use-orders.js         # Consultas de órdenes
├── use-payments.js       # Gestión de pagos
├── use-notifications.js  # Notificaciones del usuario
├── use-reviews.js        # Reviews y ratings
├── use-categories.js     # Categorías
├── use-shipping.js       # Métodos de envío
├── use-subscriptions.js  # Planes y suscripciones
├── use-debounce.js       # Debounce para búsquedas
├── use-media-query.js    # Responsive breakpoints
└── use-toast.js          # Notificaciones toast
```

## Tipos de Hooks

### Data Fetching Hooks

Hooks que obtienen datos del backend:

```javascript
// Ejemplo: use-listings.js
export function useListings(params) {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    // fetch listings
  }, [params]);
  
  return { listings, loading, error, refetch };
}
```

### State Management Hooks

Hooks que conectan con stores de Zustand:

```javascript
// Ejemplo: use-cart.js
export function useCart() {
  const items = useCartStore(state => state.items);
  const addItem = useCartStore(state => state.addItem);
  const removeItem = useCartStore(state => state.removeItem);
  
  return { items, addItem, removeItem, total };
}
```

### Utility Hooks

Hooks de utilidad general:

```javascript
// Ejemplo: use-debounce.js
export function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  
  return debouncedValue;
}
```

## Convenciones

- Nombrar con prefijo `use` (camelCase)
- Retornar objetos con nombres descriptivos
- Incluir estados de loading y error para data fetching
- Documentar parámetros y valores de retorno con JSDoc
- Optimizar re-renders con useMemo/useCallback donde sea necesario

## Uso

```typescript
import { useAuth, useCart, useListings } from '@/hooks';

function MyComponent() {
  const { user, isAuthenticated } = useAuth();
  const { items, addItem } = useCart();
  const { listings, loading } = useListings({ category: 'electronics' });
  
  // ...
}
```

## Testing

Testear hooks con `@testing-library/react-hooks`:

```typescript
import { renderHook, act } from '@testing-library/react-hooks';
import { useCart } from './use-cart';

test('should add item to cart', () => {
  const { result } = renderHook(() => useCart());
  
  act(() => {
    result.current.addItem(mockItem);
  });
  
  expect(result.current.items).toHaveLength(1);
});
```
