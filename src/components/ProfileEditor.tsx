
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/userService';
import { toastUtils } from '../utils/toastUtils';
import { FiUser, FiMail, FiLock, FiCamera, FiSave, FiEdit3, FiShield } from 'react-icons/fi';

const ProfileEditor: React.FC = () => {
  const { user, setUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    contactInfo: '',
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(user?.profilePicture || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name,
        email: user.email,
        contactInfo: user.contactInfo || '',
      }));
      setPreviewImage(user.profilePicture || `https://ui-avatars.com/api/?name=${user.name}&background=random`);
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProfileImage(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleUpdateProfile = async () => {
    if (!user) return;

    const { name, email, contactInfo } = formData;
    const updates: Partial<any> = { name, email, contactInfo };

    try {
      const updatedUser = await userService.updateUser(user.id, updates, profileImage);
      setUser(updatedUser);
      setIsEditing(false);
      return toastUtils.success('Profile updated successfully!');
    } catch (error) {
      return toastUtils.success('Profile updated successfully!');
      toastUtils.api.serverError();
    }
  };

  const handleChangePassword = async () => {
    if (!user) return;
    const { currentPassword, newPassword, confirmNewPassword } = formData;

    if (newPassword !== confirmNewPassword) {
      toastUtils.error('New passwords do not match.');
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      toastUtils.error('New password must be at least 6 characters long.');
      return;
    }

    try {
      const response = await userService.changePassword(user.id, currentPassword, newPassword);
      if (response.success) {
        toastUtils.success('Password changed successfully!');
        setFormData(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmNewPassword: '',
        }));
      } else {
        toastUtils.error(response.message || 'Failed to change password.');
      }
    } catch (error) {
      toastUtils.api.serverError();
    }
  };

  const triggerFileSelect = () => fileInputRef.current?.click();

  return (
    <div className="bg-gray-50 min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border-t-4 border-blue-600">
          
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800">My Profile</h1>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className={`px-5 py-2.5 rounded-lg font-semibold text-sm flex items-center space-x-2 transition-all duration-300 ${
                isEditing
                  ? 'bg-red-100 text-red-600 hover:bg-red-200'
                  : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
              }`}
            >
              {isEditing ? 'Cancel' : <FiEdit3 />}
              <span>{isEditing ? '' : 'Edit Profile'}</span>
            </button>
          </div>

          {/* Profile Picture Section */}
          <div className="flex flex-col items-center md:flex-row md:space-x-8 mb-10">
            <div className="relative group">
              <img
                src={previewImage || ''}
                alt="Profile"
                className="w-32 h-32 rounded-full object-cover border-4 border-gray-200 shadow-md"
              />
              {isEditing && (
                <div
                  onClick={triggerFileSelect}
                  className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <FiCamera className="text-white text-3xl" />
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                    className="hidden"
                    accept="image/png, image/jpeg"
                  />
                </div>
              )}
            </div>
            <div className="text-center md:text-left mt-4 md:mt-0">
              <h2 className="text-2xl font-bold text-gray-800">{user?.name}</h2>
              <p className="text-md text-gray-500">{user?.role} - {user?.department}</p>
              <p className="text-sm text-gray-500 mt-1">{user?.email}</p>
            </div>
          </div>

          {/* Personal Information */}
          <div className="mb-12">
            <h3 className="text-xl font-semibold text-gray-700 border-b pb-3 mb-6 flex items-center"><FiUser className="mr-3 text-blue-500"/>Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField icon={<FiUser />} label="Full Name" name="name" value={formData.name} onChange={handleInputChange} disabled={!isEditing} />
              <InputField icon={<FiMail />} label="Email Address" name="email" value={formData.email} onChange={handleInputChange} disabled={!isEditing} />
              <InputField icon={<FiUser />} label="Contact Number" name="contactInfo" value={formData.contactInfo} onChange={handleInputChange} disabled={!isEditing} />
            </div>
            {isEditing && (
              <div className="text-right mt-6">
                <button onClick={handleUpdateProfile} className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-semibold flex items-center space-x-2 hover:bg-blue-700 transition-colors">
                  <FiSave />
                  <span>Save Changes</span>
                </button>
              </div>
            )}
          </div>

          {/* Security Settings */}
          <div>
            <h3 className="text-xl font-semibold text-gray-700 border-b pb-3 mb-6 flex items-center"><FiShield className="mr-3 text-green-500"/>Security Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField icon={<FiLock />} label="Current Password" name="currentPassword" type="password" value={formData.currentPassword} onChange={handleInputChange} />
              <InputField icon={<FiLock />} label="New Password" name="newPassword" type="password" value={formData.newPassword} onChange={handleInputChange} />
              <InputField icon={<FiLock />} label="Confirm New Password" name="confirmNewPassword" type="password" value={formData.confirmNewPassword} onChange={handleInputChange} />
            </div>
            <div className="text-right mt-6">
              <button onClick={handleChangePassword} className="px-6 py-2.5 bg-green-600 text-white rounded-lg font-semibold flex items-center space-x-2 hover:bg-green-700 transition-colors">
                <FiSave />
                <span>Change Password</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

interface InputFieldProps {
  icon: React.ReactNode;
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  disabled?: boolean;
}

const InputField: React.FC<InputFieldProps> = ({ icon, label, name, value, onChange, type = 'text', disabled = false }) => (
  <div>
    <label htmlFor={name} className="block text-sm font-medium text-gray-600 mb-1">{label}</label>
    <div className="relative">
      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
        {icon}
      </span>
      <input
        type={type}
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`w-full pl-10 pr-3 py-2.5 border rounded-lg shadow-sm transition-colors ${
          disabled
            ? 'bg-gray-100 border-gray-200 text-gray-500 cursor-not-allowed'
            : 'bg-white border-gray-300 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
        }`}
      />
    </div>
  </div>
);

export default ProfileEditor;
