/**
 * Lecturer Module - Marks Management Hook
 * SWE 4070 Group Project 2 - Group 2 (Lecturer Module)
 * 
 * Custom React hook for managing student marks.
 * Handles creation, updating, validation, and calculation of marks.
 */

import { useState, useCallback } from 'react';
import type { MarksInput, StudentMarks, BulkMarksInput } from '../types';
import {
  createMarks,
  updateMarks,
  getMarksByStudent,
  bulkCreateMarks,
} from '../services/api';
import {
  validateMarks,
  validateBulkMarks,
} from '../utils/validation';
import {
  calculateTotalScore,
  calculateGrade,
} from '../utils/marks';

// ============================================
// HOOK STATE INTERFACE
// ============================================

interface UseMarksState {
  // Currently selected marks
  currentMarks: StudentMarks | null;
  
  // Loading states
  isSubmitting: boolean;
  isUpdating: boolean;
  isFetching: boolean;
  
  // Success flag
  success: boolean;
  
  // Error handling
  error: string | null;
}

interface UseMarksActions {
  // Submit new marks
  submitMarks: (marks: MarksInput) => Promise<boolean>;
  
  // Update existing marks
  updateStudentMarks: (marksId: string, marks: Partial<MarksInput>) => Promise<boolean>;
  
  // Bulk submit marks
  submitBulkMarks: (bulkMarks: BulkMarksInput) => Promise<boolean>;
  
  // Fetch marks for a student
  fetchMarks: (studentId: string) => Promise<StudentMarks | null>;
  
  // Validate marks without submitting
  validateMarksInput: (marks: MarksInput) => boolean;
  
  // Calculate total and grade (client-side preview)
  previewCalculation: (marks: MarksInput) => { totalScore: number; grade: string };
  
  // Clear success/error state
  clearStatus: () => void;
}

export interface UseMarksReturn extends UseMarksState, UseMarksActions {}

// ============================================
// CUSTOM HOOK
// ============================================

/**
 * useMarks Hook
 * 
 * Manages marks creation, updating, and validation.
 * Provides real-time calculation and validation feedback.
 * 
 * @returns Marks state and actions
 * 
 * @example
 * ```tsx
 * function MarksEntryForm({ studentId }: { studentId: string }) {
 *   const [marksInput, setMarksInput] = useState<MarksInput>({
 *     studentId,
 *     assignment: 0,
 *     quiz: 0,
 *     project: 0,
 *     midsem: 0,
 *     finalExam: 0,
 *   });
 * 
 *   const { 
 *     submitMarks, 
 *     isSubmitting, 
 *     error, 
 *     success,
 *     previewCalculation 
 *   } = useMarks();
 * 
 *   // Preview calculation
 *   const { totalScore, grade } = previewCalculation(marksInput);
 * 
 *   const handleSubmit = async () => {
 *     const success = await submitMarks(marksInput);
 *     if (success) {
 *       alert('Marks submitted successfully!');
 *     }
 *   };
 * 
 *   return (
 *     <div>
 *       <input 
 *         type="number" 
 *         value={marksInput.assignment}
 *         onChange={(e) => setMarksInput({
 *           ...marksInput,
 *           assignment: parseFloat(e.target.value)
 *         })}
 *         max={10}
 *       />
 *       {/* More inputs... *\/}
 *       
 *       <p>Total: {totalScore} | Grade: {grade}</p>
 *       
 *       <button onClick={handleSubmit} disabled={isSubmitting}>
 *         {isSubmitting ? 'Submitting...' : 'Submit Marks'}
 *       </button>
 *       
 *       {error && <p style={{ color: 'red' }}>{error}</p>}
 *       {success && <p style={{ color: 'green' }}>Success!</p>}
 *     </div>
 *   );
 * }
 * ```
 * 
 * @example
 * ```tsx
 * // Bulk marks entry
 * function BulkMarksEntry({ students }: { students: Student[] }) {
 *   const { submitBulkMarks, isSubmitting } = useMarks();
 * 
 *   const [bulkData, setBulkData] = useState<MarksInput[]>(
 *     students.map(s => ({
 *       studentId: s.id,
 *       assignment: 0,
 *       quiz: 0,
 *       project: 0,
 *       midsem: 0,
 *       finalExam: 0,
 *     }))
 *   );
 * 
 *   const handleBulkSubmit = async () => {
 *     const success = await submitBulkMarks({ marks: bulkData });
 *     if (success) {
 *       alert('All marks submitted!');
 *     }
 *   };
 * 
 *   return (
 *     <div>
 *       {/* Render inputs for all students *\/}
 *       <button onClick={handleBulkSubmit} disabled={isSubmitting}>
 *         Submit All Marks
 *       </button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useMarks(): UseMarksReturn {
  const [currentMarks, setCurrentMarks] = useState<StudentMarks | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Submit new marks for a student
   */
  const submitMarks = useCallback(async (marks: MarksInput): Promise<boolean> => {
    // Clear previous status
    setError(null);
    setSuccess(false);
    setIsSubmitting(true);

    try {
      // Validate marks
      const validation = validateMarks(marks);
      
      if (!validation.isValid) {
        setError(validation.errors[0].message);
        setIsSubmitting(false);
        return false;
      }

      // Submit to backend
      const response = await createMarks(marks);

      if (response.success) {
        setCurrentMarks(response.data);
        setSuccess(true);
        setIsSubmitting(false);
        return true;
      } else {
        setError(response.message);
        setIsSubmitting(false);
        return false;
      }
    } catch (err) {
      setError('An unexpected error occurred while submitting marks');
      setIsSubmitting(false);
      return false;
    }
  }, []);

  /**
   * Update existing marks
   */
  const updateStudentMarks = useCallback(
    async (marksId: string, marks: Partial<MarksInput>): Promise<boolean> => {
      // Clear previous status
      setError(null);
      setSuccess(false);
      setIsUpdating(true);

      try {
        // If we have a complete marks object, validate it
        if (marks.studentId && 
            marks.assignment !== undefined &&
            marks.quiz !== undefined &&
            marks.project !== undefined &&
            marks.midsem !== undefined &&
            marks.finalExam !== undefined) {
          
          const validation = validateMarks(marks as MarksInput);
          
          if (!validation.isValid) {
            setError(validation.errors[0].message);
            setIsUpdating(false);
            return false;
          }
        }

        // Update on backend
        const response = await updateMarks(marksId, marks);

        if (response.success) {
          setCurrentMarks(response.data);
          setSuccess(true);
          setIsUpdating(false);
          return true;
        } else {
          setError(response.message);
          setIsUpdating(false);
          return false;
        }
      } catch (err) {
        setError('An unexpected error occurred while updating marks');
        setIsUpdating(false);
        return false;
      }
    },
    []
  );

  /**
   * Submit marks for multiple students at once
   */
  const submitBulkMarks = useCallback(async (bulkMarks: BulkMarksInput): Promise<boolean> => {
    // Clear previous status
    setError(null);
    setSuccess(false);
    setIsSubmitting(true);

    try {
      // Validate all marks
      const validation = validateBulkMarks(bulkMarks.marks);
      
      if (!validation.isValid) {
        setError(validation.errors[0].message);
        setIsSubmitting(false);
        return false;
      }

      // Submit to backend
      const response = await bulkCreateMarks(bulkMarks);

      if (response.success) {
        setSuccess(true);
        setIsSubmitting(false);
        return true;
      } else {
        setError(response.message);
        setIsSubmitting(false);
        return false;
      }
    } catch (err) {
      setError('An unexpected error occurred while submitting bulk marks');
      setIsSubmitting(false);
      return false;
    }
  }, []);

  /**
   * Fetch marks for a student
   */
  const fetchMarks = useCallback(async (studentId: string): Promise<StudentMarks | null> => {
    setIsFetching(true);
    setError(null);

    try {
      const response = await getMarksByStudent(studentId);

      if (response.success) {
        setCurrentMarks(response.data);
        setIsFetching(false);
        return response.data;
      } else {
        setError(response.message);
        setIsFetching(false);
        return null;
      }
    } catch (err) {
      setError('Failed to fetch marks');
      setIsFetching(false);
      return null;
    }
  }, []);

  /**
   * Validate marks input without submitting
   * Returns true if valid, false if invalid (sets error)
   */
  const validateMarksInput = useCallback((marks: MarksInput): boolean => {
    const validation = validateMarks(marks);
    
    if (!validation.isValid) {
      setError(validation.errors[0].message);
      return false;
    }
    
    setError(null);
    return true;
  }, []);

  /**
   * Calculate total score and grade (client-side preview)
   * Does NOT submit to backend
   */
  const previewCalculation = useCallback((marks: MarksInput): { totalScore: number; grade: string } => {
    const totalScore = calculateTotalScore({
      assignment: marks.assignment,
      quiz: marks.quiz,
      project: marks.project,
      midsem: marks.midsem,
      finalExam: marks.finalExam,
    });

    const grade = calculateGrade(totalScore);

    return { totalScore, grade };
  }, []);

  /**
   * Clear success and error status
   */
  const clearStatus = useCallback(() => {
    setError(null);
    setSuccess(false);
  }, []);

  return {
    // State
    currentMarks,
    isSubmitting,
    isUpdating,
    isFetching,
    success,
    error,
    
    // Actions
    submitMarks,
    updateStudentMarks,
    submitBulkMarks,
    fetchMarks,
    validateMarksInput,
    previewCalculation,
    clearStatus,
  };
}
