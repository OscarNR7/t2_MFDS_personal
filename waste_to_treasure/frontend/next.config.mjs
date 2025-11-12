/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export para AWS Amplify "Web" platform
  output: 'export',
  
  // Trailing slash para compatibilidad con Amplify
  trailingSlash: true,
  
  // Deshabilitar optimización de imágenes (requerido para static export)
  images: {
    unoptimized: true,
    remotePatterns: [
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
      ...(process.env.NODE_ENV === 'development' ? [{
        protocol: 'https',
        hostname: '**',
        pathname: '/**',
      }] : []),
    ],
  },
  
  // Variables de entorno
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  },
}

export default nextConfig