/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['www.xiaohong.life'],
  },
  experimental: {
    optimizePackageImports: ['framer-motion'],
  },
  webpack: (config, { isServer }) => {
    // 优化webpack配置以减少不必要的预加载
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }
    return config;
  },
  // 优化资源加载
  compress: true,
  poweredByHeader: false,
}

module.exports = nextConfig 