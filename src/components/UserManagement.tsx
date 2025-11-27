import React, { useState, useEffect, useMemo } from 'react';
import { userService } from '../services/userService';
import type { User } from '../services/userService';
import { toastUtils } from '../utils/toastUtils';
import {
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Lock,
  Unlock,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Shield,
  User as UserIcon,
  Briefcase,
  Mail
} from 'lucide-react';
import Button from './ui/Button';
import Input from './ui/Input';
import Badge from './ui/Badge';
import Card from './ui/Card';

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters and Search
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Sorting
  const [sortConfig, setSortConfig] = useState<{ key: keyof User; direction: 'asc' | 'desc' } | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const fetchedUsers = await userService.getAllUsers();
        setUsers(fetchedUsers);
      } catch (err) {
        setError('Failed to fetch users.');
        toastUtils.error('Could not load user data.');
      }
      setIsLoading(false);
    };

    fetchUsers();
  }, []);

  // Filter and Sort Logic
  const filteredUsers = useMemo(() => {
    let result = [...users];

    // Search
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter(
        user =>
          (user.name?.toLowerCase() || '').includes(lowerQuery) ||
          (user.email?.toLowerCase() || '').includes(lowerQuery) ||
          (user.username?.toLowerCase() || '').includes(lowerQuery)
      );
    }

    // Filter by Role
    if (roleFilter !== 'all') {
      result = result.filter(user => user.role === roleFilter);
    }

    // Filter by Status
    if (statusFilter !== 'all') {
      const isActive = statusFilter === 'active';
      result = result.filter(user => user.isActive === isActive);
    }

    // Sort
    if (sortConfig) {
      result.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return result;
  }, [users, searchQuery, roleFilter, statusFilter, sortConfig]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSort = (key: keyof User) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleToggleStatus = async (userId: string, isActive: boolean) => {
    const loadingToast = toastUtils.loading(`Updating user status...`);
    const result = await userService.toggleUserStatus(userId);
    toastUtils.dismiss(loadingToast);
    if (result.success) {
      toastUtils.success(`User ${isActive ? 'deactivated' : 'activated'} successfully!`);
      setUsers(users.map(u => u.id === userId ? { ...u, isActive: !isActive } : u));
    } else {
      toastUtils.error('Failed to update user status.');
    }
  };

  const handleResetPassword = async (userId: string) => {
    if (window.confirm('Are you sure you want to reset this user\'s password?')) {
      const loadingToast = toastUtils.loading('Resetting password...');
      const result = await userService.resetUserPassword(userId);
      toastUtils.dismiss(loadingToast);
      if (result.success && result.newPassword) {
        toastUtils.success('Password has been reset successfully!');
        alert(`New password: ${result.newPassword}`);
      } else {
        toastUtils.error('Failed to reset password.');
      }
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm('Are you sure you want to permanently delete this user?')) {
      const loadingToast = toastUtils.loading('Deleting user...');
      const success = await userService.deleteUser(userId);
      toastUtils.dismiss(loadingToast);
      if (success) {
        toastUtils.success('User deleted successfully!');
        setUsers(users.filter(u => u.id !== userId));
      } else {
        toastUtils.error('Failed to delete user.');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-12 bg-gray-100 rounded-xl animate-pulse"></div>
        <div className="h-96 bg-gray-100 rounded-xl animate-pulse"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
        <p className="text-red-600 font-medium">{error}</p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => window.location.reload()}
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 font-['Plus_Jakarta_Sans_Variable']">User Management</h2>
          <p className="text-gray-500 text-sm mt-1">Manage system access and user roles</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="purple" size="lg">
            {filteredUsers.length} Users
          </Badge>
        </div>
      </div>

      <Card className="overflow-hidden border-0 shadow-lg">
        {/* Toolbar */}
        <div className="p-5 border-b border-gray-100 bg-gray-50/50 flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="w-full md:w-96">
            <Input
              placeholder="Search users..."
              icon={Search}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white"
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative">
              <select
                className="appearance-none bg-white border border-gray-200 text-gray-700 py-2.5 pl-4 pr-10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm font-medium transition-all cursor-pointer hover:border-gray-300"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="all">All Roles</option>
                <option value="SystemAdmin">Admin</option>
                <option value="AcademicStaff">Staff</option>
                <option value="AcademicVicePresident">Vice President</option>
                <option value="DepartmentHead">Dept Head</option>
                <option value="Dean">Dean</option>
                <option value="Reviewer">Reviewer</option>
              </select>
              <Filter className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>

            <div className="relative">
              <select
                className="appearance-none bg-white border border-gray-200 text-gray-700 py-2.5 pl-4 pr-10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm font-medium transition-all cursor-pointer hover:border-gray-300"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-gray-300 pointer-events-none"></div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50/50">
              <tr>
                <th
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-blue-600 transition-colors"
                  onClick={() => handleSort('name')}
                >
                  User Details
                </th>
                <th
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-blue-600 transition-colors"
                  onClick={() => handleSort('role')}
                >
                  Role & Dept
                </th>
                <th
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-blue-600 transition-colors"
                  onClick={() => handleSort('isActive')}
                >
                  Status
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {paginatedUsers.length > 0 ? (
                paginatedUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-semibold text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500 flex items-center gap-1">
                            <Mail className="h-3 w-3" /> {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
                          <Shield className="h-3.5 w-3.5 text-blue-500" />
                          {user.role}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                          <Briefcase className="h-3 w-3" />
                          {user.department || 'N/A'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge
                        variant={user.isActive ? 'success' : 'error'}
                        dot
                        size="sm"
                      >
                        {user.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleToggleStatus(user.id, user.isActive)}
                          className={`p-2 rounded-lg transition-colors ${user.isActive
                            ? 'text-amber-600 hover:bg-amber-50'
                            : 'text-green-600 hover:bg-green-50'
                            }`}
                          title={user.isActive ? "Deactivate User" : "Activate User"}
                        >
                          {user.isActive ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                        </button>

                        <button
                          onClick={() => handleResetPassword(user.id)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Reset Password"
                        >
                          <RotateCcw className="h-4 w-4" />
                        </button>

                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete User"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <div className="h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                        <UserIcon className="h-6 w-6 text-gray-400" />
                      </div>
                      <p className="text-lg font-medium text-gray-900">No users found</p>
                      <p className="text-sm text-gray-500">Try adjusting your search or filters</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredUsers.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-medium">{Math.min(currentPage * itemsPerPage, filteredUsers.length)}</span> of <span className="font-medium">{filteredUsers.length}</span> results
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                icon={ChevronLeft}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                icon={ChevronRight}
                iconPosition="right"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default UserManagement;