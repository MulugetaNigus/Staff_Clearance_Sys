import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { toastUtils } from '../utils/toastUtils';

// Types moved from src/types/auth.ts
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  department: string;
  contactInfo: string;
  avatar?: string;
  mustChangePassword: boolean; // Added mustChangePassword field
}

export type UserRole = 
  | 'AcademicStaff'
  | 'SystemAdmin'
  | 'AcademicVicePresident'
  | 'Registrar'
  | 'HumanResources'
  // Departmental Reviewers (28 roles)
  | 'AcademicDepartmentReviewer'
  | 'RegistrarReviewer'
  | 'StudentDeanReviewer'
  | 'DistanceEducationReviewer'
  | 'ResearchDirectorateReviewer'
  | 'CollegeReviewer'
  | 'DepartmentReviewer'
  | 'EmployeeFinanceReviewer'
  | 'LibraryReviewer'
  | 'GeneralServiceReviewer'
  | 'PropertyDirectorReviewer'
  | 'Store1Reviewer'
  | 'Store2Reviewer'
  | 'PropertySpecialist1Reviewer'
  | 'PropertySpecialist2Reviewer'
  | 'InternalAuditReviewer'
  | 'FinanceExecutiveReviewer'
  | 'FinanceSpecialistReviewer'
  | 'TreasurerReviewer'
  | 'EthicsReviewer'
  | 'ICTReviewer'
  | 'CommunityEngagementReviewer'
  | 'HRManagementReviewer'
  | 'RecordsArchivesReviewer'
  | 'FacilitiesReviewer'
  | 'CaseExecutiveReviewer'
  | 'HRDevelopmentReviewer';

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: User }
  | { type: 'LOGIN_ERROR' }
  | { type: 'LOGOUT' };

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN_START':
      return { ...state, isLoading: true };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        isLoading: false,
        isAuthenticated: true,
        user: action.payload,
      };
    case 'LOGIN_ERROR':
      return {
        ...state,
        isLoading: false,
        isAuthenticated: false,
        user: null,
      };
    case 'LOGOUT':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        isLoading: false,
      };
    default:
      return state;
  }
};

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
};

// Mock users for demo purposes


export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  const login = async (credentials: LoginCredentials): Promise<void> => {
    dispatch({ type: 'LOGIN_START' });

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: credentials.email, // Backend expects 'username' field but it's actually email
          password: credentials.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      if (data.success && data.data && data.data.user) {
        // Store token in localStorage for future requests
        localStorage.setItem('authToken', data.data.token);
        
        dispatch({ type: 'LOGIN_SUCCESS', payload: data.data.user });
        return { mustChangePassword: data.data.user.mustChangePassword };
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      dispatch({ type: 'LOGIN_ERROR' });
      throw error;
    }
  };

  const logout = () => {
    // Remove token from localStorage
    localStorage.removeItem('authToken');
    
    dispatch({ type: 'LOGOUT' });
    toastUtils.auth.logoutSuccess();
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};