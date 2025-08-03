import React from 'react';
import { useAuth } from '../context/AuthContext';
import type { UserRole } from '../context/AuthContext';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

interface MenuItem {
  id: string;
  name: string;
  icon: string;
  roles: UserRole[];
}

const menuItems: MenuItem[] = [
  { id: 'dashboard', name: 'Dashboard', icon: '🏠', roles: ['AcademicStaff', 'SystemAdmin', 'AcademicVicePresident', 'LibraryReviewer', 'AcademicDepartmentReviewer', 'RegistrarReviewer', 'StudentDeanReviewer', 'DistanceEducationReviewer', 'ResearchDirectorateReviewer', 'CollegeReviewer', 'DepartmentReviewer', 'EmployeeFinanceReviewer', 'GeneralServiceReviewer', 'PropertyDirectorReviewer', 'Store1Reviewer', 'Store2Reviewer', 'PropertySpecialist1Reviewer', 'PropertySpecialist2Reviewer', 'InternalAuditReviewer', 'FinanceExecutiveReviewer', 'FinanceSpecialistReviewer', 'TreasurerReviewer', 'EthicsReviewer', 'ICTReviewer', 'CommunityEngagementReviewer', 'HRManagementReviewer', 'RecordsArchivesReviewer', 'FacilitiesReviewer', 'CaseExecutiveReviewer', 'HRDevelopmentReviewer'] },
  { id: 'clearance', name: 'Start Clearance', icon: '🚀', roles: ['AcademicStaff'] },
  { id: 'profile', name: 'My Profile', icon: '👤', roles: ['AcademicStaff', 'LibraryReviewer', 'AcademicDepartmentReviewer', 'RegistrarReviewer', 'StudentDeanReviewer', 'DistanceEducationReviewer', 'ResearchDirectorateReviewer', 'CollegeReviewer', 'DepartmentReviewer', 'EmployeeFinanceReviewer', 'GeneralServiceReviewer', 'PropertyDirectorReviewer', 'Store1Reviewer', 'Store2Reviewer', 'PropertySpecialist1Reviewer', 'PropertySpecialist2Reviewer', 'InternalAuditReviewer', 'FinanceExecutiveReviewer', 'FinanceSpecialistReviewer', 'TreasurerReviewer', 'EthicsReviewer', 'ICTReviewer', 'CommunityEngagementReviewer', 'HRManagementReviewer', 'RecordsArchivesReviewer', 'FacilitiesReviewer', 'CaseExecutiveReviewer', 'HRDevelopmentReviewer'] },
  { id: 'track-clearance', name: 'Track Progress', icon: '📊', roles: ['AcademicStaff'] },
  { id: 'vp-approval', name: 'VP Approvals', icon: '✅', roles: ['AcademicVicePresident'] },
  { id: 'review-requests', name: 'Review Requests', icon: '📝', roles: ['LibraryReviewer', 'AcademicDepartmentReviewer', 'RegistrarReviewer', 'StudentDeanReviewer', 'DistanceEducationReviewer', 'ResearchDirectorateReviewer', 'CollegeReviewer', 'DepartmentReviewer', 'EmployeeFinanceReviewer', 'GeneralServiceReviewer', 'PropertyDirectorReviewer', 'Store1Reviewer', 'Store2Reviewer', 'PropertySpecialist1Reviewer', 'PropertySpecialist2Reviewer', 'InternalAuditReviewer', 'FinanceExecutiveReviewer', 'FinanceSpecialistReviewer', 'TreasurerReviewer', 'EthicsReviewer', 'ICTReviewer', 'CommunityEngagementReviewer', 'HRManagementReviewer', 'RecordsArchivesReviewer', 'FacilitiesReviewer', 'CaseExecutiveReviewer'] },
  { id: 'hr-pending-requests', name: 'HR Pending Requests', icon: '⏳', roles: ['HRDevelopmentReviewer'] },
  { id: 'user-management', name: 'User Management', icon: '👥', roles: ['SystemAdmin'] },
  { id: 'create-users', name: 'Create Users', icon: '➕', roles: ['SystemAdmin'] },
  { id: 'reports', name: 'Reports', icon: '📈', roles: ['SystemAdmin', 'AcademicVicePresident'] },
  { id: 'settings', name: 'Settings', icon: '⚙️', roles: ['SystemAdmin'] },
];

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const { user, logout } = useAuth();

  const filteredMenuItems = menuItems.filter(item => 
    user && item.roles.includes(user.role)
  );

  return (
    <div className="bg-white shadow-lg w-64 h-full flex flex-col border-r border-gray-200">
      {/* Logo/Brand */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-800 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-sm">WU</span>
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-800">Woldia University</h1>
            <p className="text-xs text-gray-500">Clearance System</p>
          </div>
        </div>
      </div>

      {/* User Profile */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
            {user?.avatar ? (
              <img 
                src={user.avatar} 
                alt={user.name} 
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <span className="text-white font-bold text-lg">
                {user?.name?.charAt(0) || 'U'}
              </span>
            )}
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
            <p className="text-xs text-gray-600">{user?.department}</p>
            <p className="text-xs text-gray-500 capitalize bg-blue-100 px-2 py-1 rounded-full mt-1">
              {user?.role?.replace(/([A-Z])/g, ' $1').trim()}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {filteredMenuItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all duration-200 group ${
                  activeTab === item.id
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="text-sm font-medium">{item.name}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={logout}
          className="w-full flex items-center space-x-3 px-4 py-3 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all duration-200 group"
        >
          <span className="text-xl">🚪</span>
          <span className="text-sm font-medium">Sign Out</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
