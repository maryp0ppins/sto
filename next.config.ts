// next.config.ts - ОБНОВЛЕННАЯ ВЕРСИЯ
import type { NextConfig } from 'next'
 
const nextConfig: NextConfig = {
  experimental: {
    nodeMiddleware: true,
    // Убираем deprecated experimental.turbo
    // turbo: {},
  },
  
  // Новая стабильная настройка Turbopack
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },
  
  // Базовые настройки
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Webpack конфигурация (для случаев когда Turbopack не используется)
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      }
    }
    return config
  },
}
 
export default nextConfig