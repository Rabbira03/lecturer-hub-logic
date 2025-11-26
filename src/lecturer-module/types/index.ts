/**
 * Lecturer Module - Type Definitions
 * SWE 4070 Group Project 2 - Group 2 (Lecturer Module)
 * 
 * This file contains all TypeScript types and interfaces for the Lecturer Module.
 * These types ensure type safety across the entire logic layer.
 */

// ============================================
// AUTHENTICATION TYPES
// ============================================

/**
 * Credentials required for lecturer login
 */
export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * Response from login API
 */
export interface LoginResponse {
  token: string;
  lecturer: Lecturer;
}

/**
 * Data required for lecturer registration
 */
export interface LecturerRegistrationData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  courseId: string; // Each lecturer is assigned to one course
}

// ============================================
// LECTURER TYPES
// ============================================

/**
 * Lecturer entity
 */
export interface Lecturer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  courseId: string;
  courseName: string;
  createdAt: string;
}

// ============================================
// STUDENT TYPES
// ============================================

/**
 * Student entity (read-only for lecturers)
 */
export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  registrationNumber: string;
  courseId: string;
  createdAt: string;
}

/**
 * Student with their marks
 */
export interface StudentWithMarks extends Student {
  marks?: StudentMarks;
}

// ============================================
// MARKS TYPES
// ============================================

/**
 * Individual assessment components
 * Each field represents the actual score achieved
 */
export interface AssessmentMarks {
  assignment: number;  // Max: 10
  quiz: number;        // Max: 15
  project: number;     // Max: 25
  midsem: number;      // Max: 20
  finalExam: number;   // Max: 30
}

/**
 * Complete marks record for a student
 */
export interface StudentMarks {
  id: string;
  studentId: string;
  courseId: string;
  lecturerId: string;
  assignment: number;
  quiz: number;
  project: number;
  midsem: number;
  finalExam: number;
  totalScore: number;  // Auto-calculated (sum of all components)
  grade: Grade;        // Auto-calculated based on total score
  submittedAt?: string;
  updatedAt?: string;
}

/**
 * Data required to create or update marks
 */
export interface MarksInput {
  studentId: string;
  assignment: number;
  quiz: number;
  project: number;
  midsem: number;
  finalExam: number;
}

/**
 * Bulk marks entry (multiple students at once)
 */
export interface BulkMarksInput {
  marks: MarksInput[];
}

/**
 * Maximum marks for each assessment component
 */
export interface AssessmentMaxMarks {
  assignment: 10;
  quiz: 15;
  project: 25;
  midsem: 20;
  finalExam: 30;
}

/**
 * Grade scale definition
 */
export type Grade = 
  | 'A'   // 90-100
  | 'A-'  // 87-89
  | 'B+'  // 84-86
  | 'B'   // 80-83
  | 'B-'  // 77-79
  | 'C+'  // 74-76
  | 'C'   // 70-73
  | 'C-'  // 67-69
  | 'D+'  // 64-66
  | 'D'   // 62-63
  | 'D-'  // 60-61
  | 'F';  // 0-59

/**
 * Grade boundary definition
 */
export interface GradeBoundary {
  grade: Grade;
  minScore: number;
  maxScore: number;
}

// ============================================
// REPORTING & STATISTICS TYPES
// ============================================

/**
 * Class statistics for a course
 */
export interface ClassStatistics {
  courseId: string;
  courseName: string;
  totalStudents: number;
  studentsWithMarks: number;
  averageScore: number;
  highestScore: number;
  lowestScore: number;
  passRate: number; // Percentage of students with grade >= D-
  gradeDistribution: GradeDistribution;
}

/**
 * Distribution of grades in a class
 */
export interface GradeDistribution {
  'A': number;
  'A-': number;
  'B+': number;
  'B': number;
  'B-': number;
  'C+': number;
  'C': number;
  'C-': number;
  'D+': number;
  'D': number;
  'D-': number;
  'F': number;
}

/**
 * Export format options
 */
export type ExportFormat = 'csv' | 'html';

/**
 * CSV export data
 */
export interface CSVExportData {
  filename: string;
  data: string; // CSV formatted string
  mimeType: 'text/csv';
}

/**
 * HTML export data (for printing)
 */
export interface HTMLExportData {
  filename: string;
  data: string; // HTML formatted string
  mimeType: 'text/html';
}

// ============================================
// VALIDATION TYPES
// ============================================

/**
 * Validation result
 */
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

/**
 * Individual validation error
 */
export interface ValidationError {
  field: string;
  message: string;
}

// ============================================
// API RESPONSE TYPES
// ============================================

/**
 * Standard API success response
 */
export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
}

/**
 * Standard API error response
 */
export interface ApiErrorResponse {
  success: false;
  error: string;
  message: string;
  statusCode?: number;
}

/**
 * Generic API response (success or error)
 */
export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

// ============================================
// CONSTANTS
// ============================================

/**
 * Maximum marks for each assessment component
 */
export const MAX_MARKS: Readonly<AssessmentMaxMarks> = {
  assignment: 10,
  quiz: 15,
  project: 25,
  midsem: 20,
  finalExam: 30,
} as const;

/**
 * Total maximum marks (sum of all components)
 */
export const MAX_TOTAL_MARKS = 100;

/**
 * Minimum passing score (D- grade = 60)
 */
export const MIN_PASSING_SCORE = 60;

/**
 * Grade boundaries (sorted from highest to lowest)
 */
export const GRADE_BOUNDARIES: readonly GradeBoundary[] = [
  { grade: 'A',   minScore: 90, maxScore: 100 },
  { grade: 'A-',  minScore: 87, maxScore: 89 },
  { grade: 'B+',  minScore: 84, maxScore: 86 },
  { grade: 'B',   minScore: 80, maxScore: 83 },
  { grade: 'B-',  minScore: 77, maxScore: 79 },
  { grade: 'C+',  minScore: 74, maxScore: 76 },
  { grade: 'C',   minScore: 70, maxScore: 73 },
  { grade: 'C-',  minScore: 67, maxScore: 69 },
  { grade: 'D+',  minScore: 64, maxScore: 66 },
  { grade: 'D',   minScore: 62, maxScore: 63 },
  { grade: 'D-',  minScore: 60, maxScore: 61 },
  { grade: 'F',   minScore: 0,  maxScore: 59 },
] as const;
