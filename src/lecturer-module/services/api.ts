/**
 * Lecturer Module - API Service Layer
 * SWE 4070 Group Project 2 - Group 2 (Lecturer Module)
 * 
 * This file handles all HTTP requests to the backend API.
 * Backend team (Group 5) will provide actual endpoint URLs.
 * 
 * PLACEHOLDER URLs are used - update these when backend is ready!
 */

import type {
  ApiResponse,
  LoginCredentials,
  LoginResponse,
  LecturerRegistrationData,
  Lecturer,
  Student,
  StudentMarks,
  MarksInput,
  BulkMarksInput,
  ClassStatistics,
} from '../types';

// ============================================
// API CONFIGURATION
// ============================================

/**
 * Base API URL - UPDATE THIS when backend is deployed
 */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

/**
 * API endpoints - UPDATE these paths according to backend routes
 */
const ENDPOINTS = {
  // Authentication
  login: '/auth/login',
  register: '/auth/register',
  logout: '/auth/logout',
  
  // Lecturer
  getLecturerProfile: '/lecturer/profile',
  
  // Students
  getStudentsByCourse: (courseId: string) => `/courses/${courseId}/students`,
  getStudentById: (studentId: string) => `/students/${studentId}`,
  
  // Marks
  createMarks: '/marks',
  updateMarks: (marksId: string) => `/marks/${marksId}`,
  getMarksByStudent: (studentId: string) => `/marks/student/${studentId}`,
  getMarksByCourse: (courseId: string) => `/marks/course/${courseId}`,
  bulkCreateMarks: '/marks/bulk',
  
  // Statistics
  getCourseStatistics: (courseId: string) => `/statistics/course/${courseId}`,
} as const;

/**
 * Storage key for authentication token
 */
export const AUTH_TOKEN_KEY = 'lecturer_auth_token';

// ============================================
// API UTILITIES
// ============================================

/**
 * Get authentication token from localStorage
 */
function getAuthToken(): string | null {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

/**
 * Set authentication token in localStorage
 */
export function setAuthToken(token: string): void {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
}

/**
 * Remove authentication token from localStorage
 */
export function removeAuthToken(): void {
  localStorage.removeItem(AUTH_TOKEN_KEY);
}

/**
 * Build headers for API requests
 * Includes authentication token if available
 */
function buildHeaders(): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
}

/**
 * Generic fetch wrapper with error handling
 */
async function fetchAPI<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        ...buildHeaders(),
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || 'Request failed',
        message: data.message || `HTTP ${response.status}`,
        statusCode: response.status,
      };
    }

    return {
      success: true,
      data,
      message: data.message,
    };
  } catch (error) {
    return {
      success: false,
      error: 'NETWORK_ERROR',
      message: error instanceof Error ? error.message : 'Network request failed',
    };
  }
}

// ============================================
// AUTHENTICATION API
// ============================================

/**
 * Login lecturer
 * 
 * @param credentials - Email and password
 * @returns Login response with token and lecturer data
 */
export async function loginLecturer(
  credentials: LoginCredentials
): Promise<ApiResponse<LoginResponse>> {
  const response = await fetchAPI<LoginResponse>(ENDPOINTS.login, {
    method: 'POST',
    body: JSON.stringify(credentials),
  });

  // Store token if login successful
  if (response.success) {
    setAuthToken(response.data.token);
  }

  return response;
}

/**
 * Register new lecturer
 * 
 * @param data - Lecturer registration data
 * @returns Registered lecturer data
 */
export async function registerLecturer(
  data: LecturerRegistrationData
): Promise<ApiResponse<Lecturer>> {
  return fetchAPI<Lecturer>(ENDPOINTS.register, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Logout lecturer
 * Clears authentication token
 */
export async function logoutLecturer(): Promise<ApiResponse<void>> {
  const response = await fetchAPI<void>(ENDPOINTS.logout, {
    method: 'POST',
  });

  // Clear token regardless of response
  removeAuthToken();

  return response;
}

/**
 * Get current lecturer profile
 */
export async function getLecturerProfile(): Promise<ApiResponse<Lecturer>> {
  return fetchAPI<Lecturer>(ENDPOINTS.getLecturerProfile, {
    method: 'GET',
  });
}

// ============================================
// STUDENT API
// ============================================

/**
 * Fetch all students registered for a course
 * 
 * @param courseId - ID of the course
 * @returns Array of students
 */
export async function getStudentsByCourse(
  courseId: string
): Promise<ApiResponse<Student[]>> {
  return fetchAPI<Student[]>(ENDPOINTS.getStudentsByCourse(courseId), {
    method: 'GET',
  });
}

/**
 * Fetch single student details
 * 
 * @param studentId - ID of the student
 * @returns Student data
 */
export async function getStudentById(
  studentId: string
): Promise<ApiResponse<Student>> {
  return fetchAPI<Student>(ENDPOINTS.getStudentById(studentId), {
    method: 'GET',
  });
}

// ============================================
// MARKS API
// ============================================

/**
 * Create marks for a student
 * 
 * @param marks - Marks data
 * @returns Created marks record
 */
export async function createMarks(
  marks: MarksInput
): Promise<ApiResponse<StudentMarks>> {
  return fetchAPI<StudentMarks>(ENDPOINTS.createMarks, {
    method: 'POST',
    body: JSON.stringify(marks),
  });
}

/**
 * Update existing marks
 * 
 * @param marksId - ID of the marks record
 * @param marks - Updated marks data
 * @returns Updated marks record
 */
export async function updateMarks(
  marksId: string,
  marks: Partial<MarksInput>
): Promise<ApiResponse<StudentMarks>> {
  return fetchAPI<StudentMarks>(ENDPOINTS.updateMarks(marksId), {
    method: 'PUT',
    body: JSON.stringify(marks),
  });
}

/**
 * Get marks for a specific student
 * 
 * @param studentId - ID of the student
 * @returns Marks record
 */
export async function getMarksByStudent(
  studentId: string
): Promise<ApiResponse<StudentMarks>> {
  return fetchAPI<StudentMarks>(ENDPOINTS.getMarksByStudent(studentId), {
    method: 'GET',
  });
}

/**
 * Get all marks for a course
 * 
 * @param courseId - ID of the course
 * @returns Array of marks records
 */
export async function getMarksByCourse(
  courseId: string
): Promise<ApiResponse<StudentMarks[]>> {
  return fetchAPI<StudentMarks[]>(ENDPOINTS.getMarksByCourse(courseId), {
    method: 'GET',
  });
}

/**
 * Bulk create marks for multiple students
 * 
 * @param bulkMarks - Array of marks for multiple students
 * @returns Array of created marks records
 */
export async function bulkCreateMarks(
  bulkMarks: BulkMarksInput
): Promise<ApiResponse<StudentMarks[]>> {
  return fetchAPI<StudentMarks[]>(ENDPOINTS.bulkCreateMarks, {
    method: 'POST',
    body: JSON.stringify(bulkMarks),
  });
}

// ============================================
// STATISTICS API
// ============================================

/**
 * Get course statistics
 * 
 * @param courseId - ID of the course
 * @returns Class statistics
 */
export async function getCourseStatistics(
  courseId: string
): Promise<ApiResponse<ClassStatistics>> {
  return fetchAPI<ClassStatistics>(ENDPOINTS.getCourseStatistics(courseId), {
    method: 'GET',
  });
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return getAuthToken() !== null;
}

/**
 * Clear all authentication data
 */
export function clearAuthData(): void {
  removeAuthToken();
}
