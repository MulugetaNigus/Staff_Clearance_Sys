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
import { clearanceService } from '../services/clearanceService';
import { toastUtils } from '../utils/toastUtils';
import type { ClearanceStep } from '../types/clearance';
import { dashboardService } from '../services/dashboardService';
import { Users, FileText, Clock, CheckCircle2, Rocket, BarChart3, UserPlus, Settings, TrendingUp, Edit, Hash } from 'lucide-react';
import { StatCard as UIStatCard } from './ui/Card';
import ReportsDashboard from './ReportsDashboard';
import ProfileSettings from './ProfileSettings';
import DownloadCertificate from './DownloadCertificate';
import AdminCertificateManager from './AdminCertificateManager';

interface DashboardContentProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

// Legacy StatCard wrapper using new UI component
const StatCard: React.FC<{ title: string; value: string | number; icon: React.FC<{ className?: string }>; color: string }> = ({ title, value, icon, color }) => {
  const variantMap: any = {
    'bg-gradient-to-r from-blue-500 to-blue-600': 'blue',
    'bg-gradient-to-r from-green-500 to-green-600': 'emerald',
    'bg-gradient-to-r from-yellow-500 to-yellow-600': 'amber',
    'bg-gradient-to-r from-purple-500 to-purple-600': 'purple',
  };

  return <UIStatCard title={title} value={value} icon={icon} variant={variantMap[color] || 'blue'} />;
};

const QuickActions: React.FC<{ role: string; setActiveTab: (tab: string) => void }> = ({ role, setActiveTab }) => {
  const getActionsForRole = () => {
    if (role === 'SystemAdmin') {
      return [
        { title: 'User Management', icon: Users, action: () => setActiveTab('user-management'), color: 'from-blue-500 to-blue-600' },
        { title: 'Create User', icon: UserPlus, action: () => setActiveTab('create-users'), color: 'from-emerald-500 to-emerald-600' },
        { title: 'System Settings', icon: Settings, action: () => setActiveTab('settings'), color: 'from-purple-500 to-purple-600' },
        { title: 'View Reports', icon: TrendingUp, action: () => setActiveTab('reports'), color: 'from-amber-500 to-amber-600' },
        { title: 'Staff Certificates', icon: FileText, action: () => setActiveTab('admin-certificates'), color: 'from-cyan-500 to-cyan-600' },
      ];
    } else if (role.includes('Reviewer')) {
      return [
        { title: 'Pending Reviews', icon: FileText, action: () => setActiveTab('pending-reviews'), color: 'from-blue-500 to-blue-600' },
        { title: 'Update Profile', icon: Edit, action: () => setActiveTab('profile'), color: 'from-purple-500 to-purple-600' },
      ];
    } else { // Default to 'User' role
      return [
        { title: 'Start Clearance', icon: Rocket, action: () => setActiveTab('clearance'), color: 'from-blue-500 to-blue-600' },
        { title: 'Track Progress', icon: BarChart3, action: () => setActiveTab('track-clearance'), color: 'from-emerald-500 to-emerald-600' },
        { title: 'Update Profile', icon: Edit, action: () => setActiveTab('profile'), color: 'from-purple-500 to-purple-600' },
        { title: 'Download Certificate', icon: FileText, action: () => setActiveTab('download-certificate'), color: 'from-amber-500 to-amber-600' },
      ];
    }
  };

  const actions = getActionsForRole();

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
      <h3 className="text-xl font-semibold text-gray-900 mb-6 font-['Plus_Jakarta_Sans_Variable']">Quick Actions</h3>
      <div className="space-y-3">
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <button
              key={index}
              onClick={action.action}
              className={`group w-full p-4 bg-gradient-to-r ${action.color} text-white rounded-xl hover:shadow-xl hover:scale-[1.02] transform transition-all duration-200 shadow-lg`}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg group-hover:bg-white/30 transition-colors duration-200">
                  <Icon className="h-5 w-5" />
                </div>
                <p className="font-medium text-left">{action.title}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

const DashboardOverviewComponent: React.FC<{ setActiveTab: (tab: string) => void }> = ({ setActiveTab }) => {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await dashboardService.getDashboardData();
        if (response.success) {
          setStats(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data', error);
        setError('Failed to load dashboard statistics');
      } finally {
        setIsLoading(false);
      }
    };

    const fetchRecentActivity = async () => {
      try {
        const response = await dashboardService.getRecentActivity();
        if (response.success) {
          setRecentActivity(response.data || []);
        }
      } catch (error) {
        console.error('Failed to fetch recent activity', error);
      }
    };

    fetchDashboardData();
    fetchRecentActivity();
  }, [user]);

  const getStatsForRole = () => {
    if (!stats) return [];

    if (user?.role === 'SystemAdmin') {
      return [
        { title: 'Total Users', value: stats.totalUsers || 0, icon: Users, color: 'bg-gradient-to-r from-blue-500 to-blue-600' },
        { title: 'Total Clearance Requests', value: stats.totalClearanceRequests || 0, icon: FileText, color: 'bg-gradient-to-r from-green-500 to-green-600' },
        { title: 'Pending Clearances', value: stats.pendingClearances || 0, icon: Clock, color: 'bg-gradient-to-r from-yellow-500 to-yellow-600' },
        { title: 'Completed Clearances', value: stats.completedClearances || 0, icon: CheckCircle2, color: 'bg-gradient-to-r from-purple-500 to-purple-600' },
      ];
    } else if (user?.role === 'AcademicVicePresident') {
      return [
        { title: 'Initial Approvals Pending', value: stats.vpInitialPending || 0, icon: Clock, color: 'bg-gradient-to-r from-blue-500 to-blue-600' },
        { title: 'Final Approvals Pending', value: stats.vpFinalPending || 0, icon: Clock, color: 'bg-gradient-to-r from-amber-500 to-amber-600' },
        { title: 'Total Approved', value: stats.totalApproved || 0, icon: CheckCircle2, color: 'bg-gradient-to-r from-green-500 to-green-600' },
      ];
    } else if (user?.role.includes('Reviewer')) {
      return [
        { title: 'Pending Reviews', value: stats.pendingReviews || 0, icon: Clock, color: 'bg-gradient-to-r from-blue-500 to-blue-600' },
        { title: 'Assigned Reviews', value: stats.assignedReviews || 0, icon: FileText, color: 'bg-gradient-to-r from-amber-500 to-amber-600' },
        { title: 'Completed Reviews', value: stats.completedReviews || 0, icon: CheckCircle2, color: 'bg-gradient-to-r from-green-500 to-green-600' },
      ];
    } else {
      // Academic Staff
      const statusDisplay = stats.myRequestStatus === 'none' ? 'No Request' :
        stats.myRequestStatus === 'cleared' ? 'Cleared' :
          stats.myRequestStatus === 'rejected' ? 'Rejected' :
            stats.myRequestStatus === 'initiated' ? 'Initiated' :
              stats.myRequestStatus === 'in_progress' ? 'In Progress' :
                stats.myRequestStatus || 'Unknown';

      return [
        { title: 'Clearance Status', value: statusDisplay, icon: BarChart3, color: 'bg-gradient-to-r from-blue-500 to-blue-600' },
        { title: 'Total Steps', value: stats.totalSteps || 0, icon: Hash, color: 'bg-gradient-to-r from-yellow-500 to-yellow-600' },
        { title: 'Approved Steps', value: stats.approvedSteps || 0, icon: CheckCircle2, color: 'bg-gradient-to-r from-green-500 to-green-600' },
      ];
    }
  };

  const dashboardStats = getStatsForRole();

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white rounded-2xl shadow-lg p-6 animate-pulse">
              <div className="h-20 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
        <p className="text-red-600 font-medium">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-100">
        <h1 className="text-3xl font-bold text-gray-900 font-['Plus_Jakarta_Sans_Variable']">Welcome back, {user?.name}!</h1>
        <p className="text-gray-600 mt-2">Here's what's happening with your clearance system today.</p>
        <div className="flex items-center mt-4 space-x-4">
          <div className="bg-white rounded-lg px-4 py-2 shadow-md">
            <span className="text-sm text-gray-500">Today</span>
            <p className="text-lg font-semibold text-gray-900">{new Date().toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
          </div>
          <div className="bg-white rounded-lg px-4 py-2 shadow-md">
            <span className="text-sm text-gray-500">Status</span>
            <p className="text-lg font-semibold text-green-600 flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              All Systems Operational
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {dashboardStats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <h3 className="text-xl font-semibold text-gray-900 mb-6 font-['Plus_Jakarta_Sans_Variable']">Recent Activity</h3>
          <div className="space-y-4">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity) => (
                <div key={activity._id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <FileText className="h-5 w-5 text-blue-600" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900">{activity.description}</p>
                    {activity.details && (
                      <p className="text-xs text-gray-500 mt-1">{activity.details}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">{new Date(activity.createdAt).toLocaleString()}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No recent activity</p>
              </div>
            )}
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
  const [myRequest, setMyRequest] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMyClearance = async () => {
      setIsLoading(true);
      try {
        const response = await clearanceService.getClearanceRequests();
        if (response.success && response.data.length > 0) {
          const request = response.data[0];
          setMyRequest(request);
          const stepsResponse = await clearanceService.getClearanceRequestById(request._id);
          if (stepsResponse.success) {
            setClearanceSteps(stepsResponse.data.steps);
          }
        } else {
          setMyRequest(null);
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
    try {
      const response = await clearanceService.createClearanceRequest(formData);

      if (response.success) {
        toastUtils.clearance.submitSuccess(response.data?.referenceCode);
        setActiveTab('track-clearance');
        // Re-fetch clearance data after submission if user is AcademicStaff
        if (user?.role === 'AcademicStaff') {
          const fetchMyClearance = async () => {
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
          };
          fetchMyClearance();
        }
      } else {
        toastUtils.clearance.submitError(response);
      }
    } catch (error: any) {
      toastUtils.clearance.submitError(error);
    } finally {
      setIsLoading(false);
    }
  };

  switch (activeTab) {
    case 'dashboard':
      return <DashboardOverviewComponent setActiveTab={setActiveTab} />;
    case 'clearance':
      if (myRequest && myRequest.status !== 'rejected') {
        return (
          <EmptyState
            title="Active Clearance Request Found"
            description="You already have an active or completed clearance request. You cannot initiate a new one."
            icon="⚠️"
            actionButton={{
              text: "Track Progress",
              onClick: () => setActiveTab('track-clearance'),
              color: 'blue'
            }}
          />
        );
      }
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
      return <ProgressTracker
        steps={clearanceSteps}
        rejectionReason={clearanceSteps.length > 0 ? (clearanceSteps[0] as any).requestId?.rejectionReason : undefined}
        requestStatus={clearanceSteps.length > 0 ? (clearanceSteps[0] as any).requestId?.status : undefined}
      />;
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
      return <ReportsDashboard />;
    case 'settings':
      return <ProfileSettings />;
    case 'download-certificate':
      return <DownloadCertificate />;
    case 'admin-certificates':
      return <AdminCertificateManager />;
    default:
      return <DashboardOverviewComponent setActiveTab={setActiveTab} />;
  }
};

export default DashboardContent;
