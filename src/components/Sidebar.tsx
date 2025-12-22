import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import type { UserRole } from '../context/AuthContext';
import {
  Home,
  Rocket,
  User,
  BarChart3,
  CheckCircle2,
  FileText,
  Clock,
  Users,
  UserPlus,
  TrendingUp,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  X
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

interface MenuItem {
  id: string;
  name: string;
  icon: React.FC<{ className?: string }>;
  roles: UserRole[];
}

const menuItems: MenuItem[] = [
  {
    id: 'dashboard',
    name: 'Dashboard',
    icon: Home,
    roles: ['AcademicStaff', 'SystemAdmin', 'AcademicVicePresident', 'LibraryReviewer', 'AcademicDepartmentReviewer', 'RegistrarReviewer', 'StudentDeanReviewer', 'DistanceEducationReviewer', 'ResearchDirectorateReviewer', 'CollegeReviewer', 'DepartmentReviewer', 'EmployeeFinanceReviewer', 'GeneralServiceReviewer', 'PropertyDirectorReviewer', 'Store1Reviewer', 'Store2Reviewer', 'PropertySpecialist1Reviewer', 'PropertySpecialist2Reviewer', 'InternalAuditReviewer', 'FinanceExecutiveReviewer', 'FinanceSpecialistReviewer', 'TreasurerReviewer', 'EthicsReviewer', 'ICTReviewer', 'CommunityEngagementReviewer', 'HRManagementReviewer', 'RecordsArchivesReviewer', 'FacilitiesReviewer', 'CaseExecutiveReviewer', 'HRDevelopmentReviewer', 'ICTExecutiveReviewer', 'PropertyExecutiveDirectorReviewer', 'SeniorFinanceSpecialistReviewer', 'InternalAuditExecutiveDirectorReviewer', 'HRCompetencyDevelopmentReviewer', 'RecordsArchivesOfficerReviewer']
  },
  {
    id: 'clearance',
    name: 'Start Clearance',
    icon: Rocket,
    roles: ['AcademicStaff']
  },
  {
    id: 'profile',
    name: 'My Profile',
    icon: User,
    roles: ['AcademicStaff', 'LibraryReviewer', 'AcademicDepartmentReviewer', 'RegistrarReviewer', 'StudentDeanReviewer', 'DistanceEducationReviewer', 'ResearchDirectorateReviewer', 'CollegeReviewer', 'DepartmentReviewer', 'EmployeeFinanceReviewer', 'GeneralServiceReviewer', 'PropertyDirectorReviewer', 'Store1Reviewer', 'Store2Reviewer', 'PropertySpecialist1Reviewer', 'PropertySpecialist2Reviewer', 'InternalAuditReviewer', 'FinanceExecutiveReviewer', 'FinanceSpecialistReviewer', 'TreasurerReviewer', 'EthicsReviewer', 'ICTReviewer', 'CommunityEngagementReviewer', 'HRManagementReviewer', 'RecordsArchivesReviewer', 'FacilitiesReviewer', 'CaseExecutiveReviewer', 'HRDevelopmentReviewer', 'ICTExecutiveReviewer', 'PropertyExecutiveDirectorReviewer', 'SeniorFinanceSpecialistReviewer', 'InternalAuditExecutiveDirectorReviewer', 'HRCompetencyDevelopmentReviewer', 'RecordsArchivesOfficerReviewer']
  },
  {
    id: 'track-clearance',
    name: 'Track Progress',
    icon: BarChart3,
    roles: ['AcademicStaff']
  },
  {
    id: 'vp-approval',
    name: 'VP Approvals',
    icon: CheckCircle2,
    roles: ['AcademicVicePresident']
  },
  {
    id: 'review-requests',
    name: 'Review Requests',
    icon: FileText,
    roles: ['LibraryReviewer', 'AcademicDepartmentReviewer', 'RegistrarReviewer', 'StudentDeanReviewer', 'DistanceEducationReviewer', 'ResearchDirectorateReviewer', 'CollegeReviewer', 'DepartmentReviewer', 'EmployeeFinanceReviewer', 'GeneralServiceReviewer', 'PropertyDirectorReviewer', 'Store1Reviewer', 'Store2Reviewer', 'PropertySpecialist1Reviewer', 'PropertySpecialist2Reviewer', 'InternalAuditReviewer', 'FinanceExecutiveReviewer', 'FinanceSpecialistReviewer', 'TreasurerReviewer', 'EthicsReviewer', 'ICTReviewer', 'CommunityEngagementReviewer', 'HRManagementReviewer', 'RecordsArchivesReviewer', 'FacilitiesReviewer', 'CaseExecutiveReviewer', 'ICTExecutiveReviewer', 'PropertyExecutiveDirectorReviewer', 'SeniorFinanceSpecialistReviewer', 'InternalAuditExecutiveDirectorReviewer', 'HRCompetencyDevelopmentReviewer', 'RecordsArchivesOfficerReviewer']
  },
  {
    id: 'hr-pending-requests',
    name: 'HR Pending Requests',
    icon: Clock,
    roles: ['HRDevelopmentReviewer']
  },
  {
    id: 'user-management',
    name: 'User Management',
    icon: Users,
    roles: ['SystemAdmin']
  },
  {
    id: 'create-users',
    name: 'Create Users',
    icon: UserPlus,
    roles: ['SystemAdmin']
  },
  {
    id: 'reports',
    name: 'Reports',
    icon: TrendingUp,
    roles: ['SystemAdmin', 'AcademicVicePresident']
  },
  {
    id: 'settings',
    name: 'Settings',
    icon: Settings,
    roles: ['SystemAdmin']
  },
];

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const { user, logout } = useAuth();

  // State for sidebar collapse (desktop)
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebarCollapsed');
    return saved === 'true';
  });

  // State for mobile menu
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Save collapse preference
  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', isCollapsed.toString());
  }, [isCollapsed]);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileOpen(false);
  }, [activeTab]);

  // Close mobile menu on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsMobileOpen(false);
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  const filteredMenuItems = menuItems.filter(item =>
    user && item.roles.includes(user.role)
  );

  // Get user initials for avatar
  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const SidebarContent = () => (
    <>
      {/* Logo/Brand */}
      <div className={`p-6 border-b border-gray-100 transition-all duration-300 ${isCollapsed ? 'px-4' : ''}`}>
        <div className="flex items-center gap-3">
          <div className="relative flex-shrink-0">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 via-blue-700 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg font-['Plus_Jakarta_Sans_Variable']">WU</span>
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white"></div>
          </div>
          {!isCollapsed && (
            <div className="overflow-hidden">
              <h1 className="text-lg font-bold text-gray-900 font-['Plus_Jakarta_Sans_Variable'] whitespace-nowrap">Woldia University</h1>
              <p className="text-xs text-gray-500 font-medium whitespace-nowrap">Clearance System</p>
            </div>
          )}
        </div>
      </div>

      {/* User Profile */}
      <div className={`p-6 border-b border-gray-100 bg-gradient-to-br from-gray-50 to-white transition-all duration-300 ${isCollapsed ? 'px-4' : ''}`}>
        <div className="flex items-center gap-3">
          <div className="relative group cursor-pointer flex-shrink-0">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-14 h-14 rounded-2xl object-cover"
                />
              ) : (
                <span className="text-white font-bold text-lg font-['Plus_Jakarta_Sans_Variable']">
                  {user?.name ? getUserInitials(user.name) : 'U'}
                </span>
              )}
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white animate-pulse"></div>
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0 overflow-hidden">
              <p className="text-sm font-semibold text-gray-900 truncate font-['Plus_Jakarta_Sans_Variable']">{user?.name}</p>
              <p className="text-xs text-gray-600 truncate">{user?.department}</p>
              <span className="inline-block mt-1.5 text-xs font-medium px-2.5 py-1 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white whitespace-nowrap">
                {user?.role?.replace(/([A-Z])/g, ' $1').trim()}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-1">
          {filteredMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <li key={item.id}>
                <button
                  onClick={() => setActiveTab(item.id)}
                  className={`
                    group w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-left transition-all duration-200 relative overflow-hidden
                    ${isActive
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/30'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }
                    ${isCollapsed ? 'justify-center' : ''}
                  `}
                  title={isCollapsed ? item.name : undefined}
                >
                  {/* Hover effect background */}
                  {!isActive && (
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                  )}

                  {/* Icon */}
                  <div className={`
                    relative p-2 rounded-lg transition-all duration-200 flex-shrink-0
                    ${isActive
                      ? 'bg-white/20 shadow-sm'
                      : 'bg-gray-100 group-hover:bg-blue-50 group-hover:scale-110'
                    }
                  `}>
                    <Icon className={`
                      h-5 w-5 transition-all duration-200
                      ${isActive
                        ? 'text-white'
                        : 'text-gray-500 group-hover:text-blue-600'
                      }
                    `} />
                  </div>

                  {/* Text */}
                  {!isCollapsed && (
                    <span className={`
                      relative text-sm font-medium font-['Plus_Jakarta_Sans_Variable'] whitespace-nowrap
                      ${isActive ? 'text-white' : 'text-gray-700 group-hover:text-gray-900'}
                    `}>
                      {item.name}
                    </span>
                  )}

                  {/* Active indicator */}
                  {isActive && !isCollapsed && (
                    <div className="absolute right-2 w-1.5 h-8 bg-white rounded-full"></div>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Logout Button */}
      <div className={`p-4 border-t border-gray-100 bg-gray-50 transition-all duration-300 ${isCollapsed ? 'px-2' : ''}`}>
        <button
          onClick={logout}
          className={`group w-full flex items-center gap-3 px-4 py-3.5 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all duration-200 relative overflow-hidden ${isCollapsed ? 'justify-center' : ''}`}
          title={isCollapsed ? 'Sign Out' : undefined}
        >
          <div className="absolute inset-0 bg-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>

          <div className="relative p-2 rounded-lg bg-gray-100 group-hover:bg-red-100 transition-all duration-200 group-hover:scale-110 flex-shrink-0">
            <LogOut className="h-5 w-5 text-gray-500 group-hover:text-red-600 transition-colors duration-200" />
          </div>

          {!isCollapsed && (
            <span className="relative text-sm font-medium font-['Plus_Jakarta_Sans_Variable']">Sign Out</span>
          )}
        </button>
      </div>

      {/* Collapse Toggle Button (Desktop only) */}
      <button
        onClick={toggleCollapse}
        className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-white border-2 border-gray-200 rounded-full items-center justify-center shadow-md hover:shadow-lg hover:border-blue-500 hover:text-blue-600 transition-all duration-200 z-50"
        aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {isCollapsed ? (
          <ChevronRight className="h-4 w-4" />
        ) : (
          <ChevronLeft className="h-4 w-4" />
        )}
      </button>
    </>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-3 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 border border-gray-100"
        aria-label="Toggle menu"
      >
        {isMobileOpen ? (
          <X className="h-6 w-6 text-gray-700" />
        ) : (
          <Menu className="h-6 w-6 text-gray-700" />
        )}
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40 animate-fade-in"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar - Desktop (collapsible) */}
      <div
        className={`
          hidden md:flex bg-white shadow-2xl h-full flex-col border-r border-gray-100 transition-all duration-300 relative
          ${isCollapsed ? 'w-24' : 'w-72'}
        `}
      >
        <SidebarContent />
      </div>

      {/* Sidebar - Mobile (slide-in) */}
      <div
        className={`
          md:hidden fixed left-0 top-0 h-full w-72 bg-white shadow-2xl flex flex-col border-r border-gray-100 z-50 transform transition-transform duration-300
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <SidebarContent />
      </div>
    </>
  );
};

export default Sidebar;
