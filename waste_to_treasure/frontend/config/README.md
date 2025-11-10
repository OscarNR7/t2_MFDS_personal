# Config

Archivos de configuración y constantes de la aplicación.

## Archivos

```
config/
├── index.js              # Re-exporta configuraciones
├── api.js                # URLs y configuración de API
├── aws.js                # Configuración AWS (Cognito, S3)
├── stripe.js             # Configuración Stripe
├── constants.js          # Constantes generales
├── theme.js              # Configuración de tema y colores
└── routes.js             # Rutas de la aplicación
```

## api.js

Configuración de endpoints y cliente API:

```javascript
export const API_CONFIG = {
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
};

export const API_ENDPOINTS = {
  // Auth
  login: '/auth/login',
  register: '/auth/register',
  
  // Users
  users: '/users',
  profile: '/users/me',
  
  // Listings
  listings: '/listings',
  
  // Orders
  orders: '/orders',
  
  // Payments
  payments: '/payments',
  createCheckout: '/payments/checkout',
  
  // ... otros endpoints
};
```

## aws.js

Configuración de servicios AWS:

```javascript
export const AWS_CONFIG = {
  cognito: {
    region: process.env.NEXT_PUBLIC_COGNITO_REGION,
    userPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID,
    clientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID,
  },
  s3: {
    bucketUrl: process.env.NEXT_PUBLIC_S3_BUCKET_URL,
    region: process.env.NEXT_PUBLIC_S3_REGION,
  },
};
```

## stripe.js

Configuración de Stripe:

```javascript
export const STRIPE_CONFIG = {
  publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  successUrl: '/checkout/success',
  cancelUrl: '/checkout/cancel',
};
```

## constants.js

Constantes de la aplicación:

```javascript
export const APP_NAME = 'Waste to Treasure';
export const APP_DESCRIPTION = 'Marketplace sostenible';

export const PAGINATION = {
  defaultPageSize: 20,
  maxPageSize: 100,
};

export const LISTING_CONSTANTS = {
  maxImages: 10,
  maxTitleLength: 100,
  maxDescriptionLength: 2000,
};

export const ORDER_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
};
```

## theme.js

Configuración del tema visual:

```javascript
export const COLORS = {
  primary: {
    main: '#396539',
    dark: '#294730',
  },
  secondary: {
    main: '#69391E',
    light: '#A2704F',
  },
  neutral: {
    dark: '#262C32',
    white: '#FCFCFC',
    light: '#F3F3F3',
    black: '#000000',
  },
};

export const FONTS = {
  heading: 'Poppins, sans-serif',
  subheading: 'Roboto, sans-serif',
  body: 'Inter, sans-serif',
};
```

## routes.js

Definición de rutas de la aplicación:

```javascript
export const ROUTES = {
  home: '/',
  
  // Auth
  login: '/login',
  register: '/register',
  
  // Marketplace
  marketplace: '/marketplace',
  listing: (id) => `/marketplace/listing/${id}`,
  
  // Dashboard
  dashboard: '/dashboard',
  myListings: '/dashboard/listings',
  myOrders: '/dashboard/orders',
  mySales: '/dashboard/sales',
  
  // Cart & Checkout
  cart: '/cart',
  checkout: '/checkout',
  
  // Profile
  profile: '/profile',
  settings: '/settings',
};
```

## Uso

```javascript
import { API_CONFIG, ROUTES, COLORS } from '@/config';

// En componentes
<Link href={ROUTES.marketplace}>Marketplace</Link>

// En estilos
style={{ color: COLORS.primary.main }}

// En servicios API
const response = await fetch(`${API_CONFIG.baseURL}${API_ENDPOINTS.listings}`);
```

## Seguridad

- NUNCA hardcodear secretos o keys privadas
- Usar variables de entorno para configuración sensible
- Las variables públicas deben tener prefijo `NEXT_PUBLIC_`
- Validar que variables requeridas existan al inicio
