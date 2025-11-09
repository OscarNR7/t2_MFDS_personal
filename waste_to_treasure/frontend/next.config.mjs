/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      // Dominios de S3 (para producción)
      {
        protocol: 'https',
        hostname: 'waste-to-treasure-images.s3.us-east-2.amazonaws.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.amazonaws.com',
        pathname: '/**',
      },
      
      // --- INICIO DE CAMBIOS ---
      // Dominios de prueba locales que estás usando, permite poner imagenes de cualquier dominio para modo dev
      {
        protocol: 'https',
        hostname: '**',
        pathname: '/**',
      },
    ],
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  },
}

export default nextConfig