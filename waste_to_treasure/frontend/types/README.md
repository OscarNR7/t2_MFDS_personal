# Types

Definiciones de tipos y constantes de datos para toda la aplicación (JavaScript).

## Organización

Los tipos/constantes están organizados por entidad/funcionalidad del backend:

```
types/
├── index.js              # Re-exporta todos los tipos
├── api.js                # Tipos de respuestas API genéricas
├── user.js               # Usuario, perfil, roles
├── listing.js            # Publicaciones/productos
├── category.js           # Categorías
├── cart.js               # Carrito de compras
├── order.js              # Órdenes y order items
├── payment.js            # Pagos, transacciones, customer
├── shipping.js           # Métodos y opciones de envío
├── review.js             # Reseñas y calificaciones
├── notification.js       # Notificaciones
├── subscription.js       # Suscripciones y planes
├── address.js            # Direcciones
├── faq.js                # FAQs
├── legal.js              # Documentos legales
└── admin.js              # Reportes, logs admin
```

## Convenciones

### Nomenclatura

- Constantes para enums: `USER_ROLES`, `ORDER_STATUS`, `PAYMENT_STATUS`
- Objetos de ejemplo para documentación (JSDoc)
- Funciones auxiliares para validación de tipos

### Estructura con JSDoc

```javascript
/**
 * @typedef {Object} User
 * @property {string} user_id
 * @property {string} email
 * @property {string} full_name
 * @property {'buyer'|'seller'|'admin'} role
 * @property {string} created_at
 */

/**
 * @typedef {Object} CreateUserData
 * @property {string} email
 * @property {string} password
 * @property {string} full_name
 */

/**
 * @typedef {Object} UserListResponse
 * @property {User[]} items
 * @property {number} total
 * @property {number} page
 * @property {number} page_size
 */

// Constantes
export const USER_ROLES = {
  BUYER: 'buyer',
  SELLER: 'seller',
  ADMIN: 'admin',
};
```

## Sincronización con Backend

Los tipos deben reflejar los schemas de Pydantic del backend:
- `backend/app/schemas/*.py` → `frontend/types/*.js`

Al agregar/modificar endpoints en el backend, actualizar los tipos correspondientes aquí.

## Uso

```javascript
import { USER_ROLES } from '@/types';

// Usar constantes
if (user.role === USER_ROLES.SELLER) {
  // ...
}
```

## Validación

Para validación de datos usar:
- Validación manual en funciones
- Validación de backend (principal)
- PropTypes en componentes (opcional)
