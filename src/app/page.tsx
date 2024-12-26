/*
 * @Author: jdzhang jdzhang@in-road.com
 * @Date: 2024-12-25 15:08:49
 * @LastEditors: jdzhang jdzhang@in-road.com
 * @LastEditTime: 2024-12-26 10:35:35
 * @FilePath: \my-app\src\app\page.tsx
 * @Description: 
 */
'use client';

import QuickAdd from './quick-add/page';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col">
      <header className="p-4 bg-white shadow">
        <h1 className="text-2xl font-bold text-gray-800">网址导航</h1>
      </header>
      <div className="flex-1">
        <QuickAdd />
      </div>
    </main>
  );
}
