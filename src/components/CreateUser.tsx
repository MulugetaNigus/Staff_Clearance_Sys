import React, { useState } from 'react';
import { userService, type CreateUserData } from '../services/userService';
import { toastUtils } from '../utils/toastUtils';
import Input from './ui/Input';
import Button from './ui/Button';
import Card from './ui/Card';
import { User, Mail, Phone, Briefcase, Shield, Lock, Eye, EyeOff } from 'lucide-react';

const USER_ROLES = [
  { value: 'AcademicStaff', label: 'Academic Staff' },
  { value: 'SystemAdmin', label: 'System Admin' },
  { value: 'AcademicVicePresident', label: 'Academic Vice President' },
  { value: 'Registrar', label: 'Registrar' },
  { value: 'HumanResources', label: 'Human Resources' },
  { value: 'AcademicDepartmentReviewer', label: 'Academic Department Reviewer' },
  { value: 'RegistrarReviewer', label: 'Registrar Reviewer' },
  { value: 'StudentDeanReviewer', label: 'Student Dean Reviewer' },
  { value: 'DistanceEducationReviewer', label: 'Distance Education Reviewer' },
  { value: 'ResearchDirectorateReviewer', label: 'Research Directorate Reviewer' },
  { value: 'CollegeReviewer', label: 'College Reviewer' },
  { value: 'DepartmentReviewer', label: 'Department Reviewer' },
  { value: 'EmployeeFinanceReviewer', label: 'Employee Finance Reviewer' },
  { value: 'LibraryReviewer', label: 'Library Reviewer' },
  { value: 'GeneralServiceReviewer', label: 'General Service Reviewer' },
  { value: 'PropertyDirectorReviewer', label: 'Property Director Reviewer' },
  { value: 'Store1Reviewer', label: 'Store 1 Reviewer' },
  { value: 'Store2Reviewer', label: 'Store 2 Reviewer' },
  { value: 'PropertySpecialist1Reviewer', label: 'Property Specialist 1 Reviewer' },
  { value: 'PropertySpecialist2Reviewer', label: 'Property Specialist 2 Reviewer' },
  { value: 'InternalAuditReviewer', label: 'Internal Audit Reviewer' },
  { value: 'FinanceExecutiveReviewer', label: 'Finance Executive Reviewer' },
  { value: 'FinanceSpecialistReviewer', label: 'Finance Specialist Reviewer' },
  { value: 'TreasurerReviewer', label: 'Treasurer Reviewer' },
  { value: 'EthicsReviewer', label: 'Ethics Reviewer' },
  { value: 'ICTReviewer', label: 'ICT Reviewer' },
  { value: 'CommunityEngagementReviewer', label: 'Community Engagement Reviewer' },
  { value: 'HRManagementReviewer', label: 'HR Management Reviewer' },
  { value: 'RecordsArchivesReviewer', label: 'Records Archives Reviewer' },
  { value: 'FacilitiesReviewer', label: 'Facilities Reviewer' },
  { value: 'CaseExecutiveReviewer', label: 'Case Executive Reviewer' },
  { value: 'HRDevelopmentReviewer', label: 'HR Development Reviewer' },
  // Workflow.js critical roles (Orders 5-13)
  { value: 'ICTExecutiveReviewer', label: 'ICT Executive Reviewer' },
  { value: 'PropertyExecutiveDirectorReviewer', label: 'Property Executive Director Reviewer' },
  { value: 'SeniorFinanceSpecialistReviewer', label: 'Senior Finance Specialist Reviewer' },
  { value: 'InternalAuditExecutiveDirectorReviewer', label: 'Internal Audit Executive Director' },
  { value: 'HRCompetencyDevelopmentReviewer', label: 'HR Competency Development Team Leader' },
  { value: 'RecordsArchivesOfficerReviewer', label: 'Records & Archives Officer' },
];

interface ValidationErrors {
  name?: string;
  email?: string;
  password?: string;
  department?: string;
  contactInfo?: string;
}

const CreateUser: React.FC = () => {
  const [newUser, setNewUser] = useState<CreateUserData>({
    name: '',
    email: '',
    password: '',
    role: 'AcademicStaff',
    department: '',
    contactInfo: '',
  });

  const [showPassword, setShowPassword] = useState(false);

  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validation functions
  const validateName = (name: string): string | undefined => {
    if (!name.trim()) {
      return 'Full name is required';
    }
    if (name.trim().length < 3) {
      return 'Name must be at least 3 characters long';
    }
    if (name.trim().length > 100) {
      return 'Name must not exceed 100 characters';
    }
    if (!/^[a-zA-Z\s'-]+$/.test(name)) {
      return 'Name can only contain letters, spaces, hyphens, and apostrophes';
    }
    const nameParts = name.trim().split(/\s+/);
    if (nameParts.length < 2) {
      return 'Please enter both first and last name';
    }
    return undefined;
  };

  const validateEmail = (email: string): string | undefined => {
    if (!email.trim()) {
      return 'Email address is required';
    }
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      return 'Please enter a valid email address (e.g., john@example.com)';
    }
    if (email.length > 255) {
      return 'Email must not exceed 255 characters';
    }
    return undefined;
  };

  const validateDepartment = (department: string): string | undefined => {
    if (!department.trim()) {
      return 'Department is required';
    }
    if (department.trim().length < 2) {
      return 'Department name must be at least 2 characters long';
    }
    if (department.trim().length > 100) {
      return 'Department name must not exceed 100 characters';
    }
    return undefined;
  };

  const validateContactInfo = (contactInfo: string): string | undefined => {
    if (!contactInfo.trim()) {
      return 'Contact information is required';
    }
    // Ethiopian phone number format: +251 9XX XXX XXX or 09XX XXX XXX
    const phoneRegex = /^(\+251|0)?9\d{8}$/;
    const cleanedPhone = contactInfo.replace(/[\s-]/g, '');

    if (!phoneRegex.test(cleanedPhone)) {
      return 'Please enter a valid Ethiopian phone number (e.g., +251911234567 or 0911234567)';
    }
    return undefined;
  };

  const validatePassword = (password: string): string | undefined => {
    if (!password) {
      return 'Password is required';
    }
    if (password.length < 6) {
      return 'Password must be at least 6 characters long';
    }
    if (password.length > 50) {
      return 'Password must not exceed 50 characters';
    }
    return undefined;
  };

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    newErrors.name = validateName(newUser.name);
    newErrors.email = validateEmail(newUser.email);
    newErrors.password = validatePassword(newUser.password);
    newErrors.department = validateDepartment(newUser.department);
    newErrors.contactInfo = validateContactInfo(newUser.contactInfo);

    setErrors(newErrors);

    // Return true if no errors
    return !Object.values(newErrors).some(error => error !== undefined);
  };

  const handleFieldChange = (field: keyof CreateUserData, value: string) => {
    setNewUser({ ...newUser, [field]: value });

    // Clear error for this field when user starts typing
    if (errors[field as keyof ValidationErrors]) {
      setErrors({ ...errors, [field]: undefined });
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    if (!validateForm()) {
      toastUtils.error('Please fix the validation errors before submitting');
      return;
    }

    setIsSubmitting(true);

    try {
      const loadingToast = toastUtils.loading('Creating user...');

      // Create user via API
      const response = await userService.createUser(newUser);

      if (response.success && response.data) {
        toastUtils.dismiss(loadingToast);
        toastUtils.success('User created successfully!');

        // Reset form
        setNewUser({ name: '', email: '', password: '', role: 'AcademicStaff', department: '', contactInfo: '' });
        setErrors({});
      } else {
        toastUtils.dismiss(loadingToast);
        toastUtils.error(response.message || 'Failed to create user');
      }
    } catch (error: any) {
      console.error('Failed to create user:', error);
      toastUtils.error(error.response?.data?.message || error.message || 'Failed to create user');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setNewUser({ name: '', email: '', password: '', role: 'AcademicStaff', department: '', contactInfo: '' });
    setErrors({});
    setShowPassword(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-6 border border-green-200">
        <h1 className="text-3xl font-bold text-gray-900 font-['Plus_Jakarta_Sans_Variable']">Create New User</h1>
        <p className="text-gray-600 mt-1">Fill in the details to create a new user account.</p>
      </div>

      <Card className="p-6">
        <form onSubmit={handleCreateUser} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Full Name */}
            <Input
              label="Full Name"
              icon={User}
              value={newUser.name}
              onChange={(e) => handleFieldChange('name', e.target.value)}
              placeholder="Enter full name (e.g., John Doe)"
              error={errors.name}
              required
            />

            {/* Email Address */}
            <Input
              type="email"
              label="Email Address"
              icon={Mail}
              value={newUser.email}
              onChange={(e) => handleFieldChange('email', e.target.value)}
              placeholder="Enter email (e.g., john@example.com)"
              error={errors.email}
              required
            />

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Lock className="inline h-4 w-4 mr-1 text-gray-500" />
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newUser.password}
                  onChange={(e) => handleFieldChange('password', e.target.value)}
                  placeholder="Enter password (min 6 characters)"
                  className={`w-full px-4 py-3 bg-gray-50 border rounded-xl text-gray-900 placeholder-gray-400 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all duration-200 pr-12 ${errors.password ? 'border-red-500' : 'border-gray-200'}`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password}</p>}
            </div>

            {/* Department */}
            <Input
              label="Department"
              icon={Briefcase}
              value={newUser.department}
              onChange={(e) => handleFieldChange('department', e.target.value)}
              placeholder="Enter department name"
              error={errors.department}
              required
            />

            {/* Contact Information */}
            <Input
              label="Contact Number"
              icon={Phone}
              value={newUser.contactInfo}
              onChange={(e) => handleFieldChange('contactInfo', e.target.value)}
              placeholder="+251911234567 or 0911234567"
              error={errors.contactInfo}
              required
              helperText="Ethiopian phone number format"
            />

            {/* Role */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Shield className="inline h-4 w-4 mr-1 text-gray-500" />
                Role
              </label>
              <select
                value={newUser.role}
                onChange={(e) => handleFieldChange('role', e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all duration-200"
              >
                {USER_ROLES.map(role => (
                  <option key={role.value} value={role.value}>{role.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-4 border-t border-gray-100">
            <Button
              type="button"
              variant="outline"
              onClick={handleReset}
              disabled={isSubmitting}
            >
              Reset
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isSubmitting}
            >
              Create User
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default CreateUser;
