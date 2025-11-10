# Lib - Utilidades y Configuraciones

Utilidades, configuraciones y servicios compartidos.

## 🎯 Propósito

Lógica compartida, configuraciones y helpers que no son componentes visuales.

## 📂 Estructura

- `api/` - Cliente HTTP (Axios) con interceptors
- `auth/` - Helpers de autenticación (Amplify)
- `stripe/` - Configuración de Stripe Elements
- `utils/` - Funciones auxiliares (formatters, validators)

## 🔌 API Client

El archivo `lib/api/axios.js` configura Axios con:
- Base URL del backend
- Interceptor de autenticación (JWT de Cognito)
- Manejo global de errores

## 🔐 Auth Helpers

El archivo `lib/auth/cognito.js` exporta:
- `getCurrentUser()` - Obtener usuario actual
- `signOut()` - Cerrar sesión
- `getToken()` - Obtener JWT token

## 💳 Stripe Client

El archivo `lib/stripe/client.js` inicializa:
```javascript
import { loadStripe } from '@stripe/stripe-js'
export const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
```

## 🛠️ Utils

Funciones comunes como:
- `formatPrice(amount)` → "$1,250.00 MXN"
- `formatDate(date)` → "08 Nov 2025"
- `validateEmail(email)` → boolean

## API Client

### client.js

Cliente HTTP configurado con interceptors:

```javascript
import axios from 'axios';
import { API_CONFIG } from '@/config';

const apiClient = axios.create({
  baseURL: API_CONFIG.baseURL,
  timeout: API_CONFIG.timeout,
  headers: API_CONFIG.headers,
});

// Interceptor para agregar token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth-token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para manejar errores
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirigir a login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
```

### Servicios por Recurso

Cada recurso tiene su archivo de servicio:

```javascript
// lib/api/listings.js
import apiClient from './client';

export const listingsService = {
  // GET /listings
  getAll: async (params) => {
    const { data } = await apiClient.get('/listings', { params });
    return data;
  },
  
  // GET /listings/:id
  getById: async (id) => {
    const { data } = await apiClient.get(`/listings/${id}`);
    return data;
  },
  
  // POST /listings
  create: async (listingData) => {
    const { data } = await apiClient.post('/listings', listingData);
    return data;
  },
  
  // PATCH /listings/:id
  update: async (id, updates) => {
    const { data } = await apiClient.patch(`/listings/${id}`, updates);
    return data;
  },
  
  // DELETE /listings/:id
  delete: async (id) => {
    await apiClient.delete(`/listings/${id}`);
  },
};
```

## Auth

### Cognito Client

```javascript
// lib/auth/cognito.js
import { CognitoUserPool, CognitoUser, AuthenticationDetails } from 'amazon-cognito-identity-js';
import { AWS_CONFIG } from '@/config';

const userPool = new CognitoUserPool({
  UserPoolId: AWS_CONFIG.cognito.userPoolId,
  ClientId: AWS_CONFIG.cognito.clientId,
});

export const cognitoAuth = {
  // Login
  signIn: async (email, password) => {
    return new Promise((resolve, reject) => {
      const user = new CognitoUser({ Username: email, Pool: userPool });
      const authDetails = new AuthenticationDetails({ Username: email, Password: password });
      
      user.authenticateUser(authDetails, {
        onSuccess: (result) => {
          const token = result.getIdToken().getJwtToken();
          resolve(token);
        },
        onFailure: (err) => reject(err),
      });
    });
  },
  
  // Register
  signUp: async (email, password, attributes) => {
    // implementación
  },
  
  // Logout
  signOut: () => {
    const user = userPool.getCurrentUser();
    user?.signOut();
  },
  
  // Get current user
  getCurrentUser: () => {
    return userPool.getCurrentUser();
  },
};
```

### Auth Context

```javascript
// lib/auth/auth-context.jsx
'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { cognitoAuth } from './cognito';

const AuthContext = createContext(undefined);

/**
 * @typedef {Object} AuthContextValue
 * @property {Object|null} user - Usuario actual
 * @property {boolean} isAuthenticated - Si está autenticado
 * @property {boolean} isLoading - Si está cargando
 * @property {Function} login - Función de login
 * @property {Function} logout - Función de logout
 * @property {Function} register - Función de registro
 */

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Verificar sesión existente
    checkSession();
  }, []);
  
  const checkSession = async () => {
    try {
      const currentUser = cognitoAuth.getCurrentUser();
      if (currentUser) {
        // Fetch user data
        const userData = await fetchUserData();
        setUser(userData);
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  const login = async (email, password) => {
    const token = await cognitoAuth.signIn(email, password);
    localStorage.setItem('auth-token', token);
    await checkSession();
  };
  
  const logout = () => {
    cognitoAuth.signOut();
    localStorage.removeItem('auth-token');
    setUser(null);
  };
  
  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      logout,
      register,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
```

## Utils

### Formateo

```javascript
// lib/utils/format.js
export const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
};

export const formatDate = (date) => {
  return new Intl.DateTimeFormat('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
};

export const truncate = (text, maxLength) => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};
```

### Validación

```javascript
// lib/utils/validation.js
export const validateEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

/**
 * @param {string} password
 * @returns {{ valid: boolean, errors: string[] }}
 */
export const validatePassword = (password) => {
  const errors = [];
  
  if (password.length < 8) {
    errors.push('Debe tener al menos 8 caracteres');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Debe contener al menos una mayúscula');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Debe contener al menos un número');
  }
  
  return { valid: errors.length === 0, errors };
};
```

### Manejo de Errores

```javascript
// lib/utils/errors.js
export class APIError extends Error {
  constructor(message, statusCode, details) {
    super(message);
    this.name = 'APIError';
    this.statusCode = statusCode;
    this.details = details;
  }
}

export const handleAPIError = (error) => {
  if (error.response) {
    return error.response.data?.detail || 'Error en el servidor';
  }
  if (error.request) {
    return 'No se pudo conectar con el servidor';
  }
  return error.message || 'Error desconocido';
};
```

## Best Practices

- Agrupar servicios por recurso/entidad
- Usar JSDoc para documentar requests/responses
- Centralizar configuración de clientes (axios, cognito)
- Manejar errores de forma consistente
- Implementar retry logic para requests fallidos
- Cachear resultados cuando sea apropiado
- Documentar funciones complejas
- Exportar funciones puras siempre que sea posible
