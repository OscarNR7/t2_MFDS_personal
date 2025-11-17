'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import Link from 'next/link'
import { 
  exchangeCodeForTokens, 
  getUserAttributesFromToken 
} from '@/lib/auth/oauth-helper'

export default function CallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login } = useAuth()
  const [error, setError] = useState(null)
  const [isProcessing, setIsProcessing] = useState(true)
  const hasProcessed = useRef(false)

  useEffect(() => {
    const handleCallback = async () => {
      // Evitar procesamiento multiple (React Strict Mode)
      if (hasProcessed.current) {
        console.log('Callback ya procesado anteriormente')
        return
      }

      try {
        // Verificar si hay un codigo OAuth en la URL
        const code = searchParams.get('code')
        const errorParam = searchParams.get('error')
        const errorDescription = searchParams.get('error_description')
        
        if (errorParam) {
          throw new Error(errorDescription || `Error de OAuth: ${errorParam}`)
        }

        if (!code) {
          throw new Error('No se recibio codigo de autorizacion')
        }

        // Verificar si este codigo ya fue procesado
        const processedCode = sessionStorage.getItem('oauth_processed_code')
        if (processedCode === code) {
          console.log('Este codigo ya fue procesado, redirigiendo...')
          router.push('/materials')
          return
        }

        // Marcar como procesado inmediatamente
        hasProcessed.current = true
        sessionStorage.setItem('oauth_processed_code', code)

        console.log('Codigo OAuth recibido, procesando...')
        
        // Determinar la URL de redirect que se uso
        const currentUrl = window.location.origin
        const redirectUri = currentUrl.includes('amplifyapp.com')
          ? 'https://main.d20d0dqywsvuyq.amplifyapp.com/callback'
          : 'http://localhost:3000/callback'

        // Intercambiar el codigo por tokens
        console.log('Intercambiando codigo por tokens...')
        const tokens = await exchangeCodeForTokens(code, redirectUri)
        
        if (!tokens.idToken) {
          throw new Error('No se obtuvo ID token')
        }

        console.log('Tokens obtenidos exitosamente')

        // Extraer atributos del usuario del ID token
        const userAttributes = getUserAttributesFromToken(tokens.idToken)
        console.log('Atributos del usuario:', {
          email: userAttributes.email,
          name: userAttributes.name
        })

        // Guardar el token en localStorage
        localStorage.setItem('auth-token', tokens.idToken)
        if (tokens.accessToken) {
          localStorage.setItem('access-token', tokens.accessToken)
        }
        if (tokens.refreshToken) {
          localStorage.setItem('refresh-token', tokens.refreshToken)
        }

        // Limpiar el codigo procesado del sessionStorage
        sessionStorage.removeItem('oauth_processed_code')

        // Esperar un momento antes de actualizar el contexto
        await new Promise(resolve => setTimeout(resolve, 500))

        // Actualizar el contexto de autenticacion
        try {
          const updatedUser = await login()
          
          // Redirigir segun el rol
          if (updatedUser && updatedUser.role === 'ADMIN') {
            router.push('/admin')
          } else {
            router.push('/materials')
          }
        } catch (loginError) {
          console.error('Error al actualizar contexto:', loginError)
          // Aun asi redirigir a materials ya que el token esta guardado
          router.push('/materials')
        }

      } catch (err) {
        console.error('Error en callback:', err)
        setError(err.message || 'Error al procesar la autenticacion')
        setIsProcessing(false)
        
        // Limpiar cualquier codigo procesado
        sessionStorage.removeItem('oauth_processed_code')
        
        // Redirigir al login despues de 4 segundos
        setTimeout(() => {
          router.push('/login?error=oauth_failed')
        }, 4000)
      }
    }

    handleCallback()
  }, [router, login, searchParams])

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#396539] to-[#294730] relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -left-10 -top-8 w-[263px] h-[263px] rounded-full bg-[#5AA44B] opacity-70 blur-xl" />
          <div className="absolute left-[35%] -top-14 w-[339px] h-[339px] rounded-full bg-[#5AA44B] opacity-55 blur-xl" />
          <div className="absolute right-[10%] -top-48 w-[339px] h-[339px] rounded-full bg-[#5AA44B] opacity-50 blur-xl" />
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md relative z-10">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Error de Autenticacion</h2>
            <p className="text-gray-600 mb-4 text-sm">{error}</p>
            <p className="text-sm text-gray-500 mb-4">Redirigiendo al inicio de sesion...</p>
            <Link 
              href="/login"
              className="inline-block text-[#A2704F] hover:text-[#69391E] font-medium transition-colors"
            >
              Volver ahora
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (isProcessing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#396539] to-[#294730] relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -left-10 -top-8 w-[263px] h-[263px] rounded-full bg-[#5AA44B] opacity-70 blur-xl" />
          <div className="absolute left-[35%] -top-14 w-[339px] h-[339px] rounded-full bg-[#5AA44B] opacity-55 blur-xl" />
          <div className="absolute right-[10%] -top-48 w-[339px] h-[339px] rounded-full bg-[#5AA44B] opacity-50 blur-xl" />
          <div className="absolute left-[12%] top-[50%] w-[339px] h-[339px] rounded-full bg-[#5AA44B] opacity-45 blur-xl" />
          <div className="absolute right-[8%] top-[35%] w-[267px] h-[450px] rounded-full bg-[#5AA44B] opacity-40 blur-xl" />
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md relative z-10">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-[#396539] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Completando inicio de sesion...</h2>
            <p className="text-gray-600">Por favor espera un momento</p>
            <p className="text-sm text-gray-500 mt-2">Procesando autenticacion con Google</p>
          </div>
        </div>
      </div>
    )
  }

  return null
}