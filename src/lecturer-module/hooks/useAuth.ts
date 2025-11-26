/**
 * Lecturer Module - Authentication Hook
 * SWE 4070 Group Project 2 - Group 2 (Lecturer Module)
 * 
 * Custom React hook for managing lecturer authentication.
 * Handles login, logout, registration, and session management.
 */

import { useState, useEffect, useCallback } from 'react';
import type {
  Lecturer,
  LoginCredentials,
  LecturerRegistrationData,
  ApiResponse,
  LoginResponse,
} from '../types';
import {
  loginLecturer,
  logoutLecturer,
  registerLecturer,
  getLecturerProfile,
  isAuthenticated,
  clearAuthData,
} from '../services/api';
import {
  validateLoginCredentials,
  validateLecturerRegistration,
} from '../utils/validation';


interface UseAuthState {
  // Current lecturer data
  lecturer: Lecturer | null;
  
  // Loading states
  isLoading: boolean;
  isAuthenticating: boolean;
  isRegistering: boolean;
  
  // Authentication status
  isAuthenticated: boolean;
  
  // Error handling
  error: string | null;
}

interface UseAuthActions {
  // Login action
  login: (credentials: LoginCredentials) => Promise<boolean>;
  
  // Logout action
  logout: () => Promise<void>;
  
  // Register action
  register: (data: LecturerRegistrationData) => Promise<boolean>;
  
  // Refresh lecturer profile
  refreshProfile: () => Promise<void>;
  
  // Clear error
  clearError: () => void;
}

export interface UseAuthReturn extends UseAuthState, UseAuthActions {}


/**
 * useAuth Hook
 * 
 * Manages lecturer authentication state and operations.
 * 
 * @returns Authentication state and actions
 * 
 * @example
 * ```tsx
 * function LoginComponent() {
 *   const { login, isAuthenticating, error, lecturer } = useAuth();
 * 
 *   const handleLogin = async () => {
 *     const success = await login({
 *       email: 'lecturer@example.com',
 *       password: 'password123'
 *     });
 *     
 *     if (success) {
 *       console.log('Logged in as:', lecturer);
 *     }
 *   };
 * 
 *   return (
 *     <div>
 *       <button onClick={handleLogin} disabled={isAuthenticating}>
 *         {isAuthenticating ? 'Logging in...' : 'Login'}
 *       </button>
 *       {error && <p>Error: {error}</p>}
 *     </div>
 *   );
 * }
 * ```
 */
export function useAuth(): UseAuthReturn {
  const [lecturer, setLecturer] = useState<Lecturer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Load lecturer profile on mount if authenticated
   */
  useEffect(() => {
    const loadProfile = async () => {
      if (isAuthenticated()) {
        try {
          const response = await getLecturerProfile();
          
          if (response.success) {
            setLecturer(response.data);
          } else {
            // Token might be invalid, clear auth data
            clearAuthData();
          }
        } catch (err) {
          console.error('Failed to load profile:', err);
        }
      }
      
      setIsLoading(false);
    };

    loadProfile();
  }, []);

  /**
   * Login lecturer
   */
  const login = useCallback(async (credentials: LoginCredentials): Promise<boolean> => {
    // Clear previous errors
    setError(null);
    setIsAuthenticating(true);

    try {
      // Validate credentials
      const validation = validateLoginCredentials(credentials);
      
      if (!validation.isValid) {
        setError(validation.errors[0].message);
        setIsAuthenticating(false);
        return false;
      }

      // Attempt login
      const response = await loginLecturer(credentials);

      if (response.success) {
        setLecturer(response.data.lecturer);
        setIsAuthenticating(false);
        return true;
      } else {
        setError(response.message);
        setIsAuthenticating(false);
        return false;
      }
    } catch (err) {
      setError('An unexpected error occurred during login');
      setIsAuthenticating(false);
      return false;
    }
  }, []);

  /**
   * Logout lecturer
   */
  const logout = useCallback(async (): Promise<void> => {
    try {
      await logoutLecturer();
      setLecturer(null);
      setError(null);
    } catch (err) {
      console.error('Logout error:', err);
      // Clear local state even if API call fails
      setLecturer(null);
      clearAuthData();
    }
  }, []);

  /**
   * Register new lecturer
   */
  const register = useCallback(async (data: LecturerRegistrationData): Promise<boolean> => {
    // Clear previous errors
    setError(null);
    setIsRegistering(true);

    try {
      // Validate registration data
      const validation = validateLecturerRegistration(data);
      
      if (!validation.isValid) {
        setError(validation.errors[0].message);
        setIsRegistering(false);
        return false;
      }

      // Attempt registration
      const response = await registerLecturer(data);

      if (response.success) {
        setIsRegistering(false);
        return true;
      } else {
        setError(response.message);
        setIsRegistering(false);
        return false;
      }
    } catch (err) {
      setError('An unexpected error occurred during registration');
      setIsRegistering(false);
      return false;
    }
  }, []);

  /**
   * Refresh lecturer profile
   */
  const refreshProfile = useCallback(async (): Promise<void> => {
    if (!isAuthenticated()) return;

    try {
      const response = await getLecturerProfile();
      
      if (response.success) {
        setLecturer(response.data);
      }
    } catch (err) {
      console.error('Failed to refresh profile:', err);
    }
  }, []);

  /**
   * Clear error message
   */
  const clearErrorMessage = useCallback(() => {
    setError(null);
  }, []);

  return {
    // State
    lecturer,
    isLoading,
    isAuthenticating,
    isRegistering,
    isAuthenticated: lecturer !== null,
    error,
    
    // Actions
    login,
    logout,
    register,
    refreshProfile,
    clearError: clearErrorMessage,
  };
}
