/**
 * Lecturer Module - Students Hook
 * SWE 4070 Group Project 2 - Group 2 (Lecturer Module)
 * 
 * Custom React hook for fetching and managing student data.
 * Provides access to students registered under a lecturer's course.
 */

import { useState, useEffect, useCallback } from 'react';
import type { Student, StudentWithMarks } from '../types';
import {
  getStudentsByCourse,
  getStudentById,
  getMarksByCourse,
} from '../services/api';

// ============================================
// HOOK STATE INTERFACE
// ============================================

interface UseStudentsState {
  // All students in the course
  students: Student[];
  
  // Students with their marks (if fetched)
  studentsWithMarks: StudentWithMarks[];
  
  // Loading states
  isLoading: boolean;
  isRefreshing: boolean;
  
  // Error handling
  error: string | null;
}

interface UseStudentsActions {
  // Fetch students for a course
  fetchStudents: (courseId: string) => Promise<void>;
  
  // Fetch students with their marks
  fetchStudentsWithMarks: (courseId: string) => Promise<void>;
  
  // Fetch single student
  fetchStudent: (studentId: string) => Promise<Student | null>;
  
  // Refresh student list
  refresh: () => Promise<void>;
  
  // Clear error
  clearError: () => void;
}

export interface UseStudentsReturn extends UseStudentsState, UseStudentsActions {}

// ============================================
// CUSTOM HOOK
// ============================================

/**
 * useStudents Hook
 * 
 * Manages student data for a course.
 * Handles fetching students and their marks.
 * 
 * @param courseId - Optional course ID to auto-fetch on mount
 * @returns Student state and actions
 * 
 * @example
 * ```tsx
 * function StudentList() {
 *   const { students, isLoading, fetchStudents, error } = useStudents();
 * 
 *   useEffect(() => {
 *     fetchStudents('COURSE_001');
 *   }, []);
 * 
 *   if (isLoading) return <p>Loading students...</p>;
 *   if (error) return <p>Error: {error}</p>;
 * 
 *   return (
 *     <ul>
 *       {students.map(student => (
 *         <li key={student.id}>
 *           {student.firstName} {student.lastName} - {student.email}
 *         </li>
 *       ))}
 *     </ul>
 *   );
 * }
 * ```
 * 
 * @example
 * ```tsx
 * // Fetch students with marks
 * function StudentMarksView() {
 *   const { studentsWithMarks, fetchStudentsWithMarks, isLoading } = useStudents();
 * 
 *   useEffect(() => {
 *     fetchStudentsWithMarks('COURSE_001');
 *   }, []);
 * 
 *   return (
 *     <table>
 *       {studentsWithMarks.map(student => (
 *         <tr key={student.id}>
 *           <td>{student.firstName}</td>
 *           <td>{student.marks?.totalScore ?? 'No marks'}</td>
 *           <td>{student.marks?.grade ?? 'N/A'}</td>
 *         </tr>
 *       ))}
 *     </table>
 *   );
 * }
 * ```
 */
export function useStudents(courseId?: string): UseStudentsReturn {
  const [students, setStudents] = useState<Student[]>([]);
  const [studentsWithMarks, setStudentsWithMarks] = useState<StudentWithMarks[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetchedCourseId, setLastFetchedCourseId] = useState<string | undefined>();

  /**
   * Fetch students for a course
   */
  const fetchStudents = useCallback(async (courseId: string): Promise<void> => {
    setError(null);
    setIsLoading(true);

    try {
      const response = await getStudentsByCourse(courseId);

      if (response.success) {
        setStudents(response.data);
        setLastFetchedCourseId(courseId);
      } else {
        setError(response.message);
        setStudents([]);
      }
    } catch (err) {
      setError('Failed to fetch students');
      setStudents([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Fetch students with their marks
   */
  const fetchStudentsWithMarks = useCallback(async (courseId: string): Promise<void> => {
    setError(null);
    setIsLoading(true);

    try {
      // Fetch both students and marks in parallel
      const [studentsResponse, marksResponse] = await Promise.all([
        getStudentsByCourse(courseId),
        getMarksByCourse(courseId),
      ]);

      if (!studentsResponse.success) {
        setError(studentsResponse.message);
        setStudentsWithMarks([]);
        setIsLoading(false);
        return;
      }

      const studentsData = studentsResponse.data;
      const marksData = marksResponse.success ? marksResponse.data : [];

      // Create a map of student ID to marks for quick lookup
      const marksMap = new Map(marksData.map(mark => [mark.studentId, mark]));

      // Combine students with their marks
      const combined: StudentWithMarks[] = studentsData.map(student => ({
        ...student,
        marks: marksMap.get(student.id),
      }));

      setStudentsWithMarks(combined);
      setStudents(studentsData);
      setLastFetchedCourseId(courseId);
    } catch (err) {
      setError('Failed to fetch students with marks');
      setStudentsWithMarks([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Fetch single student by ID
   */
  const fetchStudent = useCallback(async (studentId: string): Promise<Student | null> => {
    try {
      const response = await getStudentById(studentId);

      if (response.success) {
        return response.data;
      } else {
        console.error('Failed to fetch student:', response.message);
        return null;
      }
    } catch (err) {
      console.error('Failed to fetch student:', err);
      return null;
    }
  }, []);

  /**
   * Refresh current student list
   */
  const refresh = useCallback(async (): Promise<void> => {
    if (!lastFetchedCourseId) return;

    setIsRefreshing(true);
    
    // If we have marks data, refresh with marks
    if (studentsWithMarks.length > 0) {
      await fetchStudentsWithMarks(lastFetchedCourseId);
    } else {
      await fetchStudents(lastFetchedCourseId);
    }
    
    setIsRefreshing(false);
  }, [lastFetchedCourseId, studentsWithMarks.length, fetchStudents, fetchStudentsWithMarks]);

  /**
   * Clear error message
   */
  const clearErrorMessage = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Auto-fetch students if courseId is provided
   */
  useEffect(() => {
    if (courseId) {
      fetchStudents(courseId);
    }
  }, [courseId, fetchStudents]);

  return {
    // State
    students,
    studentsWithMarks,
    isLoading,
    isRefreshing,
    error,
    
    // Actions
    fetchStudents,
    fetchStudentsWithMarks,
    fetchStudent,
    refresh,
    clearError: clearErrorMessage,
  };
}
