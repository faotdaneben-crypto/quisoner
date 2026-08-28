const path = require('path')

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  // Monorepo: dependencies (termasuk `next`) di-hoist ke root node_modules,
  // bukan ke packages/surveys-app/node_modules. Tanpa ini, standalone build
  // tidak men-trace `next/dist/compiled/*` sehingga runtime error
  // "Cannot find module 'next/dist/compiled/source-map'" di Vercel.
  outputFileTracingRoot: path.resolve(__dirname, '../..'),
  reactStrictMode: true,
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb'
    }
  }
}

module.exports = nextConfig
