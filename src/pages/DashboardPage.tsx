import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import DashboardContent from '../components/DashboardContent';
import NotificationBell from '../components/NotificationBell';
import { useAuth } from '../context/AuthContext';

const DashboardPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { user } = useAuth();

  // Only show notification bell for Academic Staff
  const showNotifications = user?.role === 'AcademicStaff';

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header with Notification Bell */}
        {showNotifications && (
          <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-end items-center">
            <NotificationBell />
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <DashboardContent activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;