import React, { useState } from 'react';
import EnhancedUserManagement from './EnhancedUserManagement';

// Placeholder components for other admin sections
const SecurityDashboard = () => <div className="p-6 bg-white rounded-lg shadow-md">Security settings and audit logs will be here.</div>;
const BackupDashboard = () => <div className="p-6 bg-white rounded-lg shadow-md">System backup and restore functionality will be here.</div>;
const ReportsDashboard = () => <div className="p-6 bg-white rounded-lg shadow-md">Report generation and management will be here.</div>;
const SupportDashboard = () => <div className="p-6 bg-white rounded-lg shadow-md">Technical support tools and user issue tracking will be here.</div>;

import AdminStatistics from './AdminStatistics';

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('userManagement');

  const renderContent = () => {
    switch (activeTab) {
      case 'userManagement':
        return <EnhancedUserManagement />;
      case 'security':
        return <SecurityDashboard />;
      case 'backups':
        return <BackupDashboard />;
      case 'reports':
        return <ReportsDashboard />;
      case 'support':
        return <SupportDashboard />;
      case 'adminStatistics':
        return <AdminStatistics />;
      default:
        return <EnhancedUserManagement />;
    }
  };

  const tabs = [
    { id: 'adminStatistics', name: 'Admin Statistics', icon: '📊' },
    { id: 'userManagement', name: 'User Management', icon: '👥' },
    { id: 'security', name: 'Security & Permissions', icon: '🛡️' },
    { id: 'backups', name: 'Backups & Data', icon: '💾' },
    { id: 'reports', name: 'Reports', icon: '📈' },
    { id: 'support', name: 'Support', icon: '🆘' },
  ];

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-2xl shadow-lg p-4 border-t-4 border-blue-600">
        <h1 className="text-3xl font-bold text-gray-800">System Administrator Dashboard</h1>
        <p className="text-gray-500 mt-1">Oversee and manage all aspects of the clearance system.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Tab Navigation */}
        <div className="lg:w-1/4">
          <div className="bg-white rounded-2xl shadow-lg p-4 space-y-2">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all duration-200 group ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}>
                <span className="text-2xl">{tab.icon}</span>
                <span className="font-medium">{tab.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="lg:w-3/4">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
