import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import DashboardContent from '../components/DashboardContent';

const DashboardPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        <DashboardContent activeTab={activeTab} setActiveTab={setActiveTab} />
      </main>
    </div>
  );
};

export default DashboardPage;