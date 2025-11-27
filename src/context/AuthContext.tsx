import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { toastUtils } from '../utils/toastUtils';
import API from '../services/api';

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
  login: (credentials: LoginCredentials) => Promise<{ mustChangePassword: boolean }>;
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
  // Initialize synchronously from localStorage to avoid redirect flicker on refresh
  const [state, dispatch] = useReducer(
    authReducer,
    initialState,
    (init): AuthState => {
      try {
        const token = localStorage.getItem('authToken');
        const cachedUser = localStorage.getItem('user');
        if (token && cachedUser) {
          const parsedUser = JSON.parse(cachedUser);
          return { user: parsedUser, isAuthenticated: true, isLoading: false };
        }
        if (token) {
          // We have a token but no cached user; show loading until /auth/me resolves
          return { user: null, isAuthenticated: false, isLoading: true };
        }
      } catch {
        // ignore parse errors
      }
      return init;
    }
  );

  // Bootstrap session on app load
  useEffect(() => {
    const initializeSession = async () => {
      const token = localStorage.getItem('authToken');
      const cachedUser = localStorage.getItem('user');

      // Optimistically set cached user while verifying token
      if (cachedUser) {
        try {
          const parsed = JSON.parse(cachedUser);
          dispatch({ type: 'LOGIN_SUCCESS', payload: parsed });
        } catch {
          // ignore parse errors
        }
      } else if (token) {
        dispatch({ type: 'LOGIN_START' });
      }

      if (!token) {
        // no session to restore
        return;
      }

      try {
        const response = await API.get('/auth/me');
        const user = response.data?.data?.user;
        if (user) {
          localStorage.setItem('user', JSON.stringify(user));
          dispatch({ type: 'LOGIN_SUCCESS', payload: user });
        } else {
          // invalid structure → clear session
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');
          dispatch({ type: 'LOGOUT' });
        }
      } catch {
        // token invalid/expired
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        dispatch({ type: 'LOGOUT' });
      }
    };

    initializeSession();
  }, []);

  const login = async (credentials: LoginCredentials): Promise<{ mustChangePassword: boolean }> => {
    dispatch({ type: 'LOGIN_START' });

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'https://staffclearancesys.onrender.com/api'}/auth/login`, {
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
        localStorage.setItem('user', JSON.stringify(data.data.user));

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
    localStorage.removeItem('user');

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