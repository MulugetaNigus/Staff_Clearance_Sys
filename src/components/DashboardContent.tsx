import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import ClearanceForm from './ClearanceForm';
import ProfileEditor from './ProfileEditor';
import ProgressTracker from './ProgressTracker';
import VPApprovalDashboard from './VPApprovalDashboard';
import ReviewerDashboard from './ReviewerDashboard';
import HRPendingRequestsDashboard from './HRPendingRequestsDashboard';
import UserManagement from './UserManagement';
import CreateUser from './CreateUser';
import EmptyState from './EmptyState';
import {clearanceService} from '../services/clearanceService';
import { toastUtils } from '../utils/toastUtils';
import type { ClearanceStep } from '../types/clearance';
import { dashboardService } from '../services/dashboardService';

interface DashboardContentProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const StatCard: React.FC<{ title: string; value: string | number; icon: string; color: string }> = ({ title, value, icon, color }) => (
  <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
      </div>
      <div className={`w-16 h-16 ${color} rounded-2xl flex items-center justify-center text-white text-2xl shadow-lg`}>
        {icon}
      </div>
    </div>
  </div>
);

const QuickActions: React.FC<{ role: string; setActiveTab: (tab: string) => void }> = ({ role, setActiveTab }) => {
  const getActionsForRole = () => {
    if (role === 'SystemAdmin') {
      return [
        { title: 'User Management', icon: '👥', action: () => setActiveTab('user-management'), color: 'bg-gradient-to-r from-blue-500 to-blue-600' },
        { title: 'Create User', icon: '➕', action: () => setActiveTab('create-users'), color: 'bg-gradient-to-r from-green-500 to-green-600' },
        { title: 'System Settings', icon: '⚙️', action: () => setActiveTab('settings'), color: 'bg-gradient-to-r from-purple-500 to-purple-600' },
        { title: 'View Reports', icon: '📈', action: () => setActiveTab('reports'), color: 'bg-gradient-to-r from-orange-500 to-orange-600' },
      ];
    } else if (role.includes('Reviewer')) {
      return [
        { title: 'Pending Reviews', icon: '📋', action: () => setActiveTab('pending-reviews'), color: 'bg-gradient-to-r from-blue-500 to-blue-600' },
        { title: 'Update Profile', icon: '📝', action: () => setActiveTab('profile'), color: 'bg-gradient-to-r from-purple-500 to-purple-600' },
      ];
    } else { // Default to 'User' role
      return [
        { title: 'Start Clearance', icon: '🚀', action: () => setActiveTab('clearance'), color: 'bg-gradient-to-r from-blue-500 to-blue-600' },
        { title: 'Track Progress', icon: '📊', action: () => setActiveTab('track-clearance'), color: 'bg-gradient-to-r from-green-500 to-green-600' },
        { title: 'Update Profile', icon: '📝', action: () => setActiveTab('profile'), color: 'bg-gradient-to-r from-purple-500 to-purple-600' },
        { title: 'Download Certificate', icon: '📋', action: () => setActiveTab('download-certificate'), color: 'bg-gradient-to-r from-orange-500 to-orange-600' },
      ];
    }
  };

  const actions = getActionsForRole();

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
      <h3 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h3>
      <div className="space-y-3">
        {actions.map((action, index) => (
          <button key={index} onClick={action.action} className={`w-full p-4 ${action.color} text-white rounded-xl hover:opacity-90 transition-all duration-200 shadow-lg hover:shadow-xl`}>
            <div className="text-2xl mb-2">{action.icon}</div>
            <p className="font-medium">{action.title}</p>
          </button>
        ))}
      </div>
    </div>
  );
};

const DashboardOverviewComponent: React.FC<{ setActiveTab: (tab: string) => void }> = ({ setActiveTab }) => {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await dashboardService.getDashboardData();
        if (response.success) {
          setStats(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data', error);
      }
    };

    const fetchRecentActivity = async () => {
      try {
        const response = await dashboardService.getRecentActivity();
        if (response.success) {
          setRecentActivity(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch recent activity', error);
      }
    };

    fetchDashboardData();
    fetchRecentActivity();
  }, []);

  const getStatsForRole = () => {
    if (!stats) return [];

    if (user?.role === 'SystemAdmin') {
      return [
        { title: 'Total Users', value: stats.totalUsers, icon: '👥', color: 'bg-gradient-to-r from-blue-500 to-blue-600' },
        { title: 'Total Clearance Requests', value: stats.totalClearanceRequests, icon: '📝', color: 'bg-gradient-to-r from-green-500 to-green-600' },
        { title: 'Pending Clearances', value: stats.pendingClearances, icon: '⏳', color: 'bg-gradient-to-r from-yellow-500 to-yellow-600' },
        { title: 'Completed Clearances', value: stats.completedClearances, icon: '✅', color: 'bg-gradient-to-r from-purple-500 to-purple-600' },
      ];
    } else if (user?.role.includes('Reviewer')) {
      return [
        { title: 'Assigned Reviews', value: stats.assignedReviews, icon: '📋', color: 'bg-gradient-to-r from-blue-500 to-blue-600' },
        { title: 'Completed Reviews', value: stats.completedReviews, icon: '✅', color: 'bg-gradient-to-r from-green-500 to-green-600' },
      ];
    } else {
      return [
        { title: 'Clearance Status', value: stats.myRequestStatus, icon: '📊', color: 'bg-gradient-to-r from-blue-500 to-blue-600' },
        { title: 'Total Steps', value: stats.totalSteps, icon: '#️⃣', color: 'bg-gradient-to-r from-yellow-500 to-yellow-600' },
        { title: 'Approved Steps', value: stats.approvedSteps, icon: '✅', color: 'bg-gradient-to-r from-green-500 to-green-600' },
      ];
    }
  };

  const dashboardStats = getStatsForRole();

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6">
        <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.name}!</h1>
        <p className="text-gray-600 mt-2">Here's what's happening with your projects today.</p>
        <div className="flex items-center mt-4 space-x-4">
          <div className="bg-white rounded-lg px-4 py-2 shadow-md">
            <span className="text-sm text-gray-500">Today</span>
            <p className="text-lg font-semibold text-gray-900">{new Date().toLocaleDateString()}</p>
          </div>
          <div className="bg-white rounded-lg px-4 py-2 shadow-md">
            <span className="text-sm text-gray-500">Status</span>
            <p className="text-lg font-semibold text-green-600">All Systems Operational</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {dashboardStats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Recent Activity</h3>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity._id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">{activity.description}</p>
                  <p className="text-xs text-gray-500">{new Date(activity.createdAt).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <QuickActions role={user?.role || ''} setActiveTab={setActiveTab} />
      </div>
    </div>
  );
};

const GenericContent: React.FC<{ title: string; icon: string }> = ({ title, icon }) => (
  <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
    <h2 className="text-2xl font-bold text-gray-800 flex items-center">
      <span className="text-3xl mr-4">{icon}</span>
      {title}
    </h2>
    <p className="text-gray-500 mt-4">This section is under construction. Please check back later.</p>
  </div>
);

const DashboardContent: React.FC<DashboardContentProps> = ({ activeTab, setActiveTab }) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [clearanceSteps, setClearanceSteps] = useState<ClearanceStep[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMyClearance = async () => {
      setIsLoading(true);
      try {
        const response = await clearanceService.getClearanceRequests();
        if (response.success && response.data.length > 0) {
          const myRequest = response.data[0];
          const stepsResponse = await clearanceService.getClearanceRequestById(myRequest._id);
          if (stepsResponse.success) {
            setClearanceSteps(stepsResponse.data.steps);
          }
        } else {
          setError('No active clearance request found.');
        }
      } catch (err) {
        setError('Failed to fetch clearance status.');
      }
      setIsLoading(false);
    };

    if (user?.role === 'AcademicStaff') {
      fetchMyClearance();
    }
  }, [user]);

  const handleClearanceSubmit = async (formData: FormData) => {
    setIsLoading(true);
    const loadingToast = toastUtils.loading('Submitting clearance request...');
    try {
      const response = await clearanceService.createClearanceRequest(formData);
      if (response.success) {
        toastUtils.dismiss(loadingToast);
        toastUtils.clearance.submitSuccess(response.message);
        setActiveTab('track-clearance');
      } else {
        toastUtils.dismiss(loadingToast);
        toastUtils.clearance.submitError(response.message);
      }
    } catch (error: any) {
      toastUtils.dismiss(loadingToast);
      const errorMessage = error.message || error.error || 'Failed to submit clearance request. Please try again.';
      toastUtils.clearance.submitError(errorMessage);
    }
    setIsLoading(false);
  };

  switch (activeTab) {
    case 'dashboard':
      return <DashboardOverviewComponent setActiveTab={setActiveTab} />;
    case 'clearance':
      return <ClearanceForm onSubmit={handleClearanceSubmit} isLoading={isLoading} />;
    case 'profile':
      return <ProfileEditor />;
    case 'track-clearance':
      if (isLoading) return <div>Loading...</div>;
      if (error) {
        return (
          <EmptyState
            title="No Active Clearance Request"
            description="You haven't initiated a clearance request yet. Start your clearance process to begin tracking your progress through all required departmental approvals."
            icon="📊"
            actionButton={{
              text: "Start Clearance Process",
              onClick: () => setActiveTab('clearance'),
              color: 'blue'
            }}
          />
        );
      }
      return <ProgressTracker steps={clearanceSteps} />;
    case 'vp-approval':
      return <VPApprovalDashboard />;
    case 'review-requests':
      return <ReviewerDashboard />;
    case 'pending-reviews':
      return <ReviewerDashboard />;
    case 'hr-pending-requests':
      return <HRPendingRequestsDashboard />;
    case 'final-approval':
      return <GenericContent title="Final Approvals" icon="✅" />;
    case 'user-management':
      return <UserManagement />;
    case 'create-users':
      return <CreateUser />;
    case 'reports':
      return <GenericContent title="Reports" icon="📈" />;
    case 'settings':
      return <GenericContent title="Settings" icon="⚙️" />;
    default:
      return <DashboardOverviewComponent setActiveTab={setActiveTab} />;
  }
};

export default DashboardContent;
