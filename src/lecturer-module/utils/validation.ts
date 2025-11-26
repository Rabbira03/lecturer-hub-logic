/**
 * Lecturer Module - Validation Utilities
 * SWE 4070 Group Project 2 - Group 2 (Lecturer Module)
 * 
 * This file contains all validation logic for the Lecturer Module.
 * Validates user inputs before sending to backend.
 */

import type {
  ValidationResult,
  ValidationError,
  LecturerRegistrationData,
  LoginCredentials,
  MarksInput,
  AssessmentMarks,
} from '../types';
import { MAX_MARKS, MAX_TOTAL_MARKS } from '../types';

// ============================================
// VALIDATION HELPERS
// ============================================

/**
 * Create a validation error
 */
function createError(field: string, message: string): ValidationError {
  return { field, message };
}

/**
 * Create validation result
 */
function createResult(errors: ValidationError[]): ValidationResult {
  return {
    isValid: errors.length === 0,
    errors,
  };
}

// ============================================
// EMAIL VALIDATION
// ============================================

/**
 * Validate email format
 * Must be a valid email address
 */
export function validateEmail(email: string): ValidationResult {
  const errors: ValidationError[] = [];

  if (!email) {
    errors.push(createError('email', 'Email is required'));
    return createResult(errors);
  }

  // Basic email regex pattern
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(email)) {
    errors.push(createError('email', 'Invalid email format'));
  }

  if (email.length > 255) {
    errors.push(createError('email', 'Email must be less than 255 characters'));
  }

  return createResult(errors);
}

// ============================================
// PHONE VALIDATION
// ============================================

/**
 * Validate phone number
 * Must be 10-15 digits
 */
export function validatePhone(phone: string): ValidationResult {
  const errors: ValidationError[] = [];

  if (!phone) {
    errors.push(createError('phone', 'Phone number is required'));
    return createResult(errors);
  }

  // Remove all non-digit characters
  const digitsOnly = phone.replace(/\D/g, '');

  if (digitsOnly.length < 10) {
    errors.push(createError('phone', 'Phone number must be at least 10 digits'));
  }

  if (digitsOnly.length > 15) {
    errors.push(createError('phone', 'Phone number must be less than 15 digits'));
  }

  return createResult(errors);
}

// ============================================
// PASSWORD VALIDATION
// ============================================

/**
 * Validate password strength
 * Requirements:
 * - At least 8 characters
 * - Contains at least one uppercase letter
 * - Contains at least one lowercase letter
 * - Contains at least one number
 */
export function validatePassword(password: string): ValidationResult {
  const errors: ValidationError[] = [];

  if (!password) {
    errors.push(createError('password', 'Password is required'));
    return createResult(errors);
  }

  if (password.length < 8) {
    errors.push(createError('password', 'Password must be at least 8 characters'));
  }

  if (!/[A-Z]/.test(password)) {
    errors.push(createError('password', 'Password must contain at least one uppercase letter'));
  }

  if (!/[a-z]/.test(password)) {
    errors.push(createError('password', 'Password must contain at least one lowercase letter'));
  }

  if (!/[0-9]/.test(password)) {
    errors.push(createError('password', 'Password must contain at least one number'));
  }

  return createResult(errors);
}

// ============================================
// NAME VALIDATION
// ============================================

/**
 * Validate name (first name or last name)
 * Must be 2-50 characters, letters only
 */
export function validateName(name: string, fieldName: string = 'name'): ValidationResult {
  const errors: ValidationError[] = [];

  if (!name) {
    errors.push(createError(fieldName, `${fieldName} is required`));
    return createResult(errors);
  }

  if (name.length < 2) {
    errors.push(createError(fieldName, `${fieldName} must be at least 2 characters`));
  }

  if (name.length > 50) {
    errors.push(createError(fieldName, `${fieldName} must be less than 50 characters`));
  }

  // Only letters, spaces, hyphens, and apostrophes
  if (!/^[a-zA-Z\s\-']+$/.test(name)) {
    errors.push(createError(fieldName, `${fieldName} can only contain letters, spaces, hyphens, and apostrophes`));
  }

  return createResult(errors);
}

// ============================================
// MARKS VALIDATION
// ============================================

/**
 * Validate a single mark value
 * Must be a number within the allowed range (0 to max)
 */
export function validateMark(
  value: number,
  fieldName: keyof AssessmentMarks,
  maxValue: number
): ValidationResult {
  const errors: ValidationError[] = [];

  // Check if value is a number
  if (typeof value !== 'number' || isNaN(value)) {
    errors.push(createError(fieldName, `${fieldName} must be a valid number`));
    return createResult(errors);
  }

  // Check if value is within range
  if (value < 0) {
    errors.push(createError(fieldName, `${fieldName} cannot be negative`));
  }

  if (value > maxValue) {
    errors.push(createError(fieldName, `${fieldName} cannot exceed ${maxValue}`));
  }

  // Check for decimal places (marks should be whole numbers or have max 2 decimal places)
  const decimalPlaces = (value.toString().split('.')[1] || '').length;
  if (decimalPlaces > 2) {
    errors.push(createError(fieldName, `${fieldName} can have at most 2 decimal places`));
  }

  return createResult(errors);
}

/**
 * Validate all marks for a student
 * Checks each component and validates total
 */
export function validateMarks(marks: MarksInput): ValidationResult {
  const errors: ValidationError[] = [];

  // Validate student ID
  if (!marks.studentId) {
    errors.push(createError('studentId', 'Student ID is required'));
  }

  // Validate each assessment component
  const assignmentResult = validateMark(marks.assignment, 'assignment', MAX_MARKS.assignment);
  errors.push(...assignmentResult.errors);

  const quizResult = validateMark(marks.quiz, 'quiz', MAX_MARKS.quiz);
  errors.push(...quizResult.errors);

  const projectResult = validateMark(marks.project, 'project', MAX_MARKS.project);
  errors.push(...projectResult.errors);

  const midsemResult = validateMark(marks.midsem, 'midsem', MAX_MARKS.midsem);
  errors.push(...midsemResult.errors);

  const finalExamResult = validateMark(marks.finalExam, 'finalExam', MAX_MARKS.finalExam);
  errors.push(...finalExamResult.errors);

  // Validate total (only if individual marks are valid)
  if (errors.length === 0) {
    const total = marks.assignment + marks.quiz + marks.project + marks.midsem + marks.finalExam;
    
    if (total > MAX_TOTAL_MARKS) {
      errors.push(createError('total', `Total marks (${total}) cannot exceed ${MAX_TOTAL_MARKS}`));
    }
  }

  return createResult(errors);
}

/**
 * Validate bulk marks input
 * Validates multiple students' marks at once
 */
export function validateBulkMarks(marksArray: MarksInput[]): ValidationResult {
  const errors: ValidationError[] = [];

  if (!Array.isArray(marksArray) || marksArray.length === 0) {
    errors.push(createError('marks', 'At least one student\'s marks is required'));
    return createResult(errors);
  }

  // Validate each student's marks
  marksArray.forEach((marks, index) => {
    const result = validateMarks(marks);
    
    // Add index to error field for identification
    result.errors.forEach(error => {
      errors.push({
        field: `marks[${index}].${error.field}`,
        message: error.message,
      });
    });
  });

  // Check for duplicate student IDs
  const studentIds = marksArray.map(m => m.studentId);
  const duplicates = studentIds.filter((id, index) => studentIds.indexOf(id) !== index);
  
  if (duplicates.length > 0) {
    errors.push(createError('marks', `Duplicate student IDs found: ${duplicates.join(', ')}`));
  }

  return createResult(errors);
}

// ============================================
// AUTHENTICATION VALIDATION
// ============================================

/**
 * Validate login credentials
 */
export function validateLoginCredentials(credentials: LoginCredentials): ValidationResult {
  const errors: ValidationError[] = [];

  // Validate email
  const emailResult = validateEmail(credentials.email);
  errors.push(...emailResult.errors);

  // Validate password exists (don't validate strength for login)
  if (!credentials.password) {
    errors.push(createError('password', 'Password is required'));
  }

  return createResult(errors);
}

/**
 * Validate lecturer registration data
 */
export function validateLecturerRegistration(data: LecturerRegistrationData): ValidationResult {
  const errors: ValidationError[] = [];

  // Validate first name
  const firstNameResult = validateName(data.firstName, 'firstName');
  errors.push(...firstNameResult.errors);

  // Validate last name
  const lastNameResult = validateName(data.lastName, 'lastName');
  errors.push(...lastNameResult.errors);

  // Validate email
  const emailResult = validateEmail(data.email);
  errors.push(...emailResult.errors);

  // Validate phone
  const phoneResult = validatePhone(data.phone);
  errors.push(...phoneResult.errors);

  // Validate password
  const passwordResult = validatePassword(data.password);
  errors.push(...passwordResult.errors);

  // Validate course ID
  if (!data.courseId) {
    errors.push(createError('courseId', 'Course ID is required'));
  }

  return createResult(errors);
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Get first error message from validation result
 * Useful for displaying a single error to the user
 */
export function getFirstError(result: ValidationResult): string | null {
  return result.errors.length > 0 ? result.errors[0].message : null;
}

/**
 * Get all error messages as an array of strings
 */
export function getAllErrors(result: ValidationResult): string[] {
  return result.errors.map(error => error.message);
}

/**
 * Get errors grouped by field
 */
export function getErrorsByField(result: ValidationResult): Record<string, string[]> {
  const grouped: Record<string, string[]> = {};

  result.errors.forEach(error => {
    if (!grouped[error.field]) {
      grouped[error.field] = [];
    }
    grouped[error.field].push(error.message);
  });

  return grouped;
}
