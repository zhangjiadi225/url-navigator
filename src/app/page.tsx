/*
 * @Author: jdzhang jdzhang@in-road.com
 * @Date: 2024-12-25 15:08:49
 * @LastEditors: jdzhang jdzhang@in-road.com
 * @LastEditTime: 2024-12-26 17:35:32
 * @FilePath: \url-navigator\src\app\page.tsx
 * @Description: 
 */
'use client';

import { useState } from 'react';
import QuickAdd from './quick-add/page';
import TestDataGenerator from '@/app/test-data/page'; // 假设这是新的测试数据生成组件

export default function Home() {
  const [activeTab, setActiveTab] = useState('navigation');

  return (
    <main className="min-h-screen flex flex-col">      
      <div className="flex-1 p-4">
        {/* Tab 导航 */}
        <div className="border-b border-gray-200">
          <nav className="flex gap-4">
            <button
              onClick={() => setActiveTab('navigation')}
              className={`py-2 px-4 font-medium ${
                activeTab === 'navigation'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              网址导航
            </button>
            <button
              onClick={() => setActiveTab('testData')}
              className={`py-2 px-4 font-medium ${
                activeTab === 'testData'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              测试数据生成
            </button>
          </nav>
        </div>

        {/* Tab 内容 */}
        <div className="mt-4">
          {activeTab === 'navigation' && <QuickAdd />}
          {activeTab === 'testData' && <TestDataGenerator />}
        </div>
      </div>
    </main>
  );
}
