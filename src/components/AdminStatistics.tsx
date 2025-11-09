import React, { useEffect, useState } from 'react';
import { getAdminDashboardStats } from '../services/adminService';
import { toastUtils } from '../utils/toastUtils';

const StatCard = ({ title, value, icon, color, footer }) => (
  <div className={`bg-white p-6 rounded-2xl shadow-lg border-l-4 ${color}`}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
      </div>
      <div className="text-4xl text-gray-300">{icon}</div>
    </div>
    {footer && <p className="text-xs text-gray-500 mt-4">{footer}</p>}
  </div>
);

const AdminStatistics: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getAdminDashboardStats();
        setStats(data);
      } catch (error) {
        console.error('Failed to fetch admin stats:', error);
        toastUtils.error('Could not load admin statistics.');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading statistics...</p>
      </div>
    );
  }

  if (!stats) {
    return <div className="p-6 bg-red-100 text-red-700 rounded-lg">Could not load statistics.</div>;
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Users" value={stats.users.total} icon="👥" color="border-blue-500" footer={`${stats.users.newThisMonth} new this month`} />
        <StatCard title="Active Users" value={stats.users.active} icon="✅" color="border-green-500" footer={`${stats.users.locked} locked accounts`} />
        <StatCard title="Clearance Requests" value={stats.clearances.total} icon="📂" color="border-indigo-500" footer={`${stats.clearances.completionRate}% completion rate`} />
        <StatCard title="Pending Clearances" value={stats.clearances.pending} icon="⏳" color="border-yellow-500" footer={`${stats.clearances.rejected} rejected`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Users by Role</h2>
          <ul className="space-y-3">
            {stats.users.byRole.map(role => (
              <li key={role._id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="font-medium text-gray-700">{role._id}</span>
                <span className="font-bold text-blue-600">{role.count}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-lg">
          <h2 className="text-xl font-semibold mb-4">System Health</h2>
          <div className="space-y-4">
            <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
              <span>Database Connection:</span>
              <span className="font-semibold text-green-600">Connected</span>
            </div>
            <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
              <span>System Uptime:</span>
              <span className="font-semibold">{`${(stats.systemHealth.uptime / 3600).toFixed(2)} hours`}</span>
            </div>
            <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
              <span>Memory Usage:</span>
              <span className="font-semibold">{`${(stats.systemHealth.memoryUsage.rss / 1024 / 1024).toFixed(2)} MB`}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminStatistics;

