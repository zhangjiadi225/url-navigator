/*
 * @Author: jdzhang jdzhang@in-road.com
 * @Date: 2024-12-25 17:38:52
 * @LastEditors: jdzhang jdzhang@in-road.com
 * @LastEditTime: 2024-12-26 15:55:51
 * @FilePath: \url-navigator\next.config.mjs
 * @Description: 
 */
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  distDir: 'out',
  images: {
    unoptimized: true
  },
  webpack: (config) => {
    config.module.rules.push({
      test: /\.json$/,
      type: 'json'
    });
    return config;
  }
}

export default nextConfig 