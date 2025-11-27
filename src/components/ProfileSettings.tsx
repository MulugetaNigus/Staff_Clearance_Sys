import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/userService';
import { toastUtils } from '../utils/toastUtils';
import Card from './ui/Card';
import Input from './ui/Input';
import Button from './ui/Button';
import { User, Mail, Phone, Lock, Save, Shield, CheckCircle, XCircle } from 'lucide-react';

interface ValidationErrors {
    name?: string;
    contactInfo?: string;
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
}

interface PasswordStrength {
    score: number;
    label: string;
    color: string;
    suggestions: string[];
}

const ProfileSettings: React.FC = () => {
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(false);

    // Profile State
    const [profileData, setProfileData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        contactInfo: user?.contactInfo || '',
    });

    // Password State
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    // Error states
    const [profileErrors, setProfileErrors] = useState<ValidationErrors>({});
    const [passwordErrors, setPasswordErrors] = useState<ValidationErrors>({});

    // Validation functions
    const validateName = (name: string): string | undefined => {
        if (!name.trim()) {
            return 'Name is required';
        }
        if (name.trim().length < 3) {
            return 'Name must be at least 3 characters';
        }
        if (name.trim().length > 100) {
            return 'Name must not exceed 100 characters';
        }
        if (!/^[a-zA-Z\s'-]+$/.test(name)) {
            return 'Name can only contain letters, spaces, hyphens, and apostrophes';
        }
        return undefined;
    };

    const validateContactInfo = (contactInfo: string): string | undefined => {
        if (!contactInfo.trim()) {
            return 'Contact number is required';
        }
        const phoneRegex = /^(\+251|0)?9\d{8}$/;
        const cleanedPhone = contactInfo.replace(/[\s-]/g, '');

        if (!phoneRegex.test(cleanedPhone)) {
            return 'Please enter a valid Ethiopian phone number';
        }
        return undefined;
    };

    const checkPasswordStrength = (password: string): PasswordStrength => {
        let score = 0;
        const suggestions: string[] = [];

        if (password.length >= 8) score++;
        else suggestions.push('At least 8 characters');

        if (password.length >= 12) score++;

        if (/[a-z]/.test(password)) score++;
        else suggestions.push('Include lowercase letters');

        if (/[A-Z]/.test(password)) score++;
        else suggestions.push('Include uppercase letters');

        if (/[0-9]/.test(password)) score++;
        else suggestions.push('Include numbers');

        if (/[^a-zA-Z0-9]/.test(password)) score++;
        else suggestions.push('Include special characters (!@#$%^&*)');

        let label = 'Very Weak';
        let color = 'bg-red-500';

        if (score >= 2) {
            label = 'Weak';
            color = 'bg-orange-500';
        }
        if (score >= 4) {
            label = 'Medium';
            color = 'bg-yellow-500';
        }
        if (score >= 5) {
            label = 'Strong';
            color = 'bg-green-500';
        }
        if (score >= 6) {
            label = 'Very Strong';
            color = 'bg-emerald-600';
        }

        return { score, label, color, suggestions };
    };

    const validatePassword = (password: string): string | undefined => {
        if (!password) {
            return 'Password is required';
        }
        if (password.length < 8) {
            return 'Password must be at least 8 characters long';
        }
        if (password.length > 128) {
            return 'Password must not exceed 128 characters';
        }
        const strength = checkPasswordStrength(password);
        if (strength.score < 3) {
            return 'Password is too weak. ' + strength.suggestions.join(', ');
        }
        return undefined;
    };

    const validateProfileForm = (): boolean => {
        const errors: ValidationErrors = {};

        errors.name = validateName(profileData.name);
        errors.contactInfo = validateContactInfo(profileData.contactInfo);

        setProfileErrors(errors);
        return !Object.values(errors).some(error => error !== undefined);
    };

    const validatePasswordForm = (): boolean => {
        const errors: ValidationErrors = {};

        if (!passwordData.currentPassword) {
            errors.currentPassword = 'Current password is required';
        }

        errors.newPassword = validatePassword(passwordData.newPassword);

        if (!passwordData.confirmPassword) {
            errors.confirmPassword = 'Please confirm your new password';
        } else if (passwordData.newPassword !== passwordData.confirmPassword) {
            errors.confirmPassword = 'Passwords do not match';
        }

        if (passwordData.currentPassword && passwordData.newPassword &&
            passwordData.currentPassword === passwordData.newPassword) {
            errors.newPassword = 'New password must be different from current password';
        }

        setPasswordErrors(errors);
        return !Object.values(errors).some(error => error !== undefined);
    };

    const handleProfileFieldChange = (field: keyof typeof profileData, value: string) => {
        setProfileData({ ...profileData, [field]: value });

        if (profileErrors[field as keyof ValidationErrors]) {
            setProfileErrors({ ...profileErrors, [field]: undefined });
        }
    };

    const handlePasswordFieldChange = (field: keyof typeof passwordData, value: string) => {
        setPasswordData({ ...passwordData, [field]: value });

        if (passwordErrors[field as keyof ValidationErrors]) {
            setPasswordErrors({ ...passwordErrors, [field]: undefined });
        }
    };

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateProfileForm()) {
            toastUtils.error('Please fix the validation errors');
            return;
        }

        setIsLoading(true);
        const loadingToast = toastUtils.loading('Updating profile...');

        try {
            await userService.updateProfile({
                id: user?.id,
                ...profileData
            });
            toastUtils.dismiss(loadingToast);
            toastUtils.success('Profile updated successfully!');
        } catch (error) {
            toastUtils.dismiss(loadingToast);
            toastUtils.error('Failed to update profile.');
        } finally {
            setIsLoading(false);
        }
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validatePasswordForm()) {
            toastUtils.error('Please fix the validation errors');
            return;
        }

        setIsLoading(true);
        const loadingToast = toastUtils.loading('Changing password...');

        try {
            await userService.changePassword({
                userId: user?.id,
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });
            toastUtils.dismiss(loadingToast);
            toastUtils.success('Password changed successfully!');
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
            setPasswordErrors({});
        } catch (error: any) {
            toastUtils.dismiss(loadingToast);
            toastUtils.error(error.message || 'Failed to change password.');
        } finally {
            setIsLoading(false);
        }
    };

    const passwordStrength = passwordData.newPassword ? checkPasswordStrength(passwordData.newPassword) : null;

    return (
        <div className="space-y-8 animate-fade-in">
            <div>
                <h2 className="text-2xl font-bold text-gray-900 font-['Plus_Jakarta_Sans_Variable']">Account Settings</h2>
                <p className="text-gray-500 text-sm mt-1">Manage your profile information and security</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Profile Information */}
                <Card className="p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <User className="h-5 w-5 text-blue-600" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-800">Profile Information</h3>
                    </div>

                    <form onSubmit={handleProfileUpdate} className="space-y-4">
                        <Input
                            label="Full Name"
                            icon={User}
                            value={profileData.name}
                            onChange={(e) => handleProfileFieldChange('name', e.target.value)}
                            placeholder="Your full name"
                            error={profileErrors.name}
                            required
                        />

                        <Input
                            label="Email Address"
                            icon={Mail}
                            value={profileData.email}
                            disabled
                            helperText="Email cannot be changed. Contact admin for assistance."
                        />

                        <Input
                            label="Contact Number"
                            icon={Phone}
                            value={profileData.contactInfo}
                            onChange={(e) => handleProfileFieldChange('contactInfo', e.target.value)}
                            placeholder="+251911234567"
                            error={profileErrors.contactInfo}
                            helperText="Ethiopian phone number format"
                            required
                        />

                        <div className="pt-4">
                            <Button
                                type="submit"
                                variant="primary"
                                isLoading={isLoading}
                                icon={Save}
                            >
                                Save Changes
                            </Button>
                        </div>
                    </form>
                </Card>

                {/* Security Settings */}
                <Card className="p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-purple-100 rounded-lg">
                            <Shield className="h-5 w-5 text-purple-600" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-800">Security</h3>
                    </div>

                    <form onSubmit={handlePasswordChange} className="space-y-4">
                        <Input
                            type="password"
                            label="Current Password"
                            icon={Lock}
                            value={passwordData.currentPassword}
                            onChange={(e) => handlePasswordFieldChange('currentPassword', e.target.value)}
                            placeholder="Enter current password"
                            error={passwordErrors.currentPassword}
                            required
                        />

                        <div>
                            <Input
                                type="password"
                                label="New Password"
                                icon={Lock}
                                value={passwordData.newPassword}
                                onChange={(e) => handlePasswordFieldChange('newPassword', e.target.value)}
                                placeholder="Enter new password"
                                error={passwordErrors.newPassword}
                                required
                            />

                            {/* Password Strength Indicator */}
                            {passwordData.newPassword && passwordStrength && (
                                <div className="mt-3 space-y-2">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-gray-600 font-medium">Password Strength:</span>
                                        <span className={`font-semibold ${passwordStrength.score >= 5 ? 'text-green-600' :
                                                passwordStrength.score >= 4 ? 'text-yellow-600' :
                                                    'text-red-600'
                                            }`}>
                                            {passwordStrength.label}
                                        </span>
                                    </div>
                                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full transition-all duration-300 ${passwordStrength.color}`}
                                            style={{ width: `${(passwordStrength.score / 6) * 100}%` }}
                                        />
                                    </div>
                                    {passwordStrength.suggestions.length > 0 && (
                                        <div className="space-y-1 mt-2">
                                            {passwordStrength.suggestions.map((suggestion, idx) => (
                                                <div key={idx} className="flex items-center gap-1.5 text-xs text-gray-600">
                                                    <XCircle className="h-3 w-3 text-red-500" />
                                                    <span>{suggestion}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    {passwordStrength.score >= 5 && (
                                        <div className="flex items-center gap-1.5 text-xs text-green-600 font-medium mt-2">
                                            <CheckCircle className="h-3 w-3" />
                                            <span>Great password!</span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <Input
                            type="password"
                            label="Confirm New Password"
                            icon={Lock}
                            value={passwordData.confirmPassword}
                            onChange={(e) => handlePasswordFieldChange('confirmPassword', e.target.value)}
                            placeholder="Confirm new password"
                            error={passwordErrors.confirmPassword}
                            required
                        />

                        <div className="pt-4">
                            <Button
                                type="submit"
                                variant="secondary"
                                isLoading={isLoading}
                                icon={Save}
                            >
                                Change Password
                            </Button>
                        </div>
                    </form>
                </Card>
            </div>
        </div>
    );
};

export default ProfileSettings;
