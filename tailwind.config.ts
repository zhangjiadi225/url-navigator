/*
 * @Author: jdzhang jdzhang@in-road.com
 * @Date: 2024-12-25 15:08:49
 * @LastEditors: jdzhang jdzhang@in-road.com
 * @LastEditTime: 2024-12-26 15:18:28
 * @FilePath: \url-navigator\tailwind.config.ts
 * @Description: 
 */
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', '-apple-system', 'PingFang SC', 'Microsoft YaHei', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
