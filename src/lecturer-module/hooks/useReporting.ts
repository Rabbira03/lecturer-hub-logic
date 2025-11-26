/**
 * Lecturer Module - Reporting & Export Hook
 * SWE 4070 Group Project 2 - Group 2 (Lecturer Module)
 * 
 * Custom React hook for generating reports and exporting data.
 * Handles statistics calculation, CSV export, and printable HTML generation.
 */

import { useState, useCallback } from 'react';
import type { StudentWithMarks, ClassStatistics } from '../types';
import { getCourseStatistics } from '../services/api';
import {
  exportMarksToCSV,
  exportStatisticsToCSV,
  exportMarksToPrintableHTML,
  downloadCSV,
  downloadHTML,
  printHTML,
} from '../utils/export';
import {
  calculateAverageScore,
  findHighestScore,
  findLowestScore,
  calculatePassRate,
  calculateGradeDistribution,
} from '../utils/marks';

// ============================================
// HOOK STATE INTERFACE
// ============================================

interface UseReportingState {
  // Current statistics
  statistics: ClassStatistics | null;
  
  // Loading states
  isLoadingStatistics: boolean;
  isExporting: boolean;
  
  // Error handling
  error: string | null;
}

interface UseReportingActions {
  // Fetch course statistics from backend
  fetchStatistics: (courseId: string) => Promise<ClassStatistics | null>;
  
  // Calculate statistics client-side (from students array)
  calculateStatistics: (students: StudentWithMarks[], courseName: string, courseId: string) => ClassStatistics;
  
  // Export marks to CSV
  exportToCSV: (students: StudentWithMarks[], courseName: string) => void;
  
  // Export statistics to CSV
  exportStatisticsCSV: (statistics: ClassStatistics) => void;
  
  // Export marks to printable HTML
  exportToPrintableHTML: (students: StudentWithMarks[], courseName: string, lecturerName: string) => void;
  
  // Print marks directly (opens print dialog)
  printMarks: (students: StudentWithMarks[], courseName: string, lecturerName: string) => void;
  
  // Clear error
  clearError: () => void;
}

export interface UseReportingReturn extends UseReportingState, UseReportingActions {}

// ============================================
// CUSTOM HOOK
// ============================================

/**
 * useReporting Hook
 * 
 * Manages course statistics and data export functionality.
 * Provides methods for generating reports in various formats.
 * 
 * @returns Reporting state and actions
 * 
 * @example
 * ```tsx
 * function CourseStatistics({ courseId }: { courseId: string }) {
 *   const { 
 *     statistics, 
 *     isLoadingStatistics, 
 *     fetchStatistics 
 *   } = useReporting();
 * 
 *   useEffect(() => {
 *     fetchStatistics(courseId);
 *   }, [courseId]);
 * 
 *   if (isLoadingStatistics) return <p>Loading statistics...</p>;
 *   if (!statistics) return <p>No statistics available</p>;
 * 
 *   return (
 *     <div>
 *       <h2>{statistics.courseName} Statistics</h2>
 *       <p>Average Score: {statistics.averageScore}</p>
 *       <p>Highest Score: {statistics.highestScore}</p>
 *       <p>Lowest Score: {statistics.lowestScore}</p>
 *       <p>Pass Rate: {statistics.passRate}%</p>
 *     </div>
 *   );
 * }
 * ```
 * 
 * @example
 * ```tsx
 * // Export functionality
 * function ExportButtons({ students, courseName, lecturerName }) {
 *   const { 
 *     exportToCSV, 
 *     printMarks, 
 *     isExporting 
 *   } = useReporting();
 * 
 *   return (
 *     <div>
 *       <button 
 *         onClick={() => exportToCSV(students, courseName)}
 *         disabled={isExporting}
 *       >
 *         Export to CSV
 *       </button>
 *       
 *       <button 
 *         onClick={() => printMarks(students, courseName, lecturerName)}
 *         disabled={isExporting}
 *       >
 *         Print Marks
 *       </button>
 *     </div>
 *   );
 * }
 * ```
 * 
 * @example
 * ```tsx
 * // Client-side statistics calculation
 * function LocalStatistics({ students, courseName, courseId }) {
 *   const { calculateStatistics } = useReporting();
 *   
 *   const stats = calculateStatistics(students, courseName, courseId);
 * 
 *   return (
 *     <div>
 *       <h3>Class Overview</h3>
 *       <p>Students: {stats.totalStudents}</p>
 *       <p>Average: {stats.averageScore}</p>
 *       <p>Pass Rate: {stats.passRate}%</p>
 *     </div>
 *   );
 * }
 * ```
 */
export function useReporting(): UseReportingReturn {
  const [statistics, setStatistics] = useState<ClassStatistics | null>(null);
  const [isLoadingStatistics, setIsLoadingStatistics] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch course statistics from backend
   */
  const fetchStatistics = useCallback(async (courseId: string): Promise<ClassStatistics | null> => {
    setError(null);
    setIsLoadingStatistics(true);

    try {
      const response = await getCourseStatistics(courseId);

      if (response.success) {
        setStatistics(response.data);
        setIsLoadingStatistics(false);
        return response.data;
      } else {
        setError(response.message);
        setIsLoadingStatistics(false);
        return null;
      }
    } catch (err) {
      setError('Failed to fetch statistics');
      setIsLoadingStatistics(false);
      return null;
    }
  }, []);

  /**
   * Calculate statistics client-side
   * Useful when you already have the data and don't need to fetch from backend
   */
  const calculateStatistics = useCallback(
    (students: StudentWithMarks[], courseName: string, courseId: string): ClassStatistics => {
      // Filter students who have marks
      const studentsWithMarks = students.filter(s => s.marks !== undefined);
      const marksArray = studentsWithMarks.map(s => s.marks!);

      // Calculate statistics
      const stats: ClassStatistics = {
        courseId,
        courseName,
        totalStudents: students.length,
        studentsWithMarks: studentsWithMarks.length,
        averageScore: calculateAverageScore(marksArray),
        highestScore: findHighestScore(marksArray),
        lowestScore: findLowestScore(marksArray),
        passRate: calculatePassRate(marksArray),
        gradeDistribution: calculateGradeDistribution(marksArray),
      };

      setStatistics(stats);
      return stats;
    },
    []
  );

  /**
   * Export marks to CSV and trigger download
   */
  const exportToCSV = useCallback((students: StudentWithMarks[], courseName: string): void => {
    setIsExporting(true);
    setError(null);

    try {
      const csvData = exportMarksToCSV(students, courseName);
      downloadCSV(csvData);
    } catch (err) {
      setError('Failed to export CSV');
      console.error('CSV export error:', err);
    } finally {
      setIsExporting(false);
    }
  }, []);

  /**
   * Export statistics to CSV and trigger download
   */
  const exportStatisticsCSV = useCallback((statistics: ClassStatistics): void => {
    setIsExporting(true);
    setError(null);

    try {
      const csvData = exportStatisticsToCSV(statistics);
      downloadCSV(csvData);
    } catch (err) {
      setError('Failed to export statistics CSV');
      console.error('Statistics CSV export error:', err);
    } finally {
      setIsExporting(false);
    }
  }, []);

  /**
   * Export marks to printable HTML and download file
   */
  const exportToPrintableHTML = useCallback(
    (students: StudentWithMarks[], courseName: string, lecturerName: string): void => {
      setIsExporting(true);
      setError(null);

      try {
        const htmlData = exportMarksToPrintableHTML(students, courseName, lecturerName);
        downloadHTML(htmlData);
      } catch (err) {
        setError('Failed to export HTML');
        console.error('HTML export error:', err);
      } finally {
        setIsExporting(false);
      }
    },
    []
  );

  /**
   * Print marks directly (opens print dialog)
   */
  const printMarks = useCallback(
    (students: StudentWithMarks[], courseName: string, lecturerName: string): void => {
      setIsExporting(true);
      setError(null);

      try {
        const htmlData = exportMarksToPrintableHTML(students, courseName, lecturerName);
        printHTML(htmlData);
      } catch (err) {
        setError('Failed to print');
        console.error('Print error:', err);
      } finally {
        setIsExporting(false);
      }
    },
    []
  );

  /**
   * Clear error message
   */
  const clearErrorMessage = useCallback(() => {
    setError(null);
  }, []);

  return {
    // State
    statistics,
    isLoadingStatistics,
    isExporting,
    error,
    
    // Actions
    fetchStatistics,
    calculateStatistics,
    exportToCSV,
    exportStatisticsCSV,
    exportToPrintableHTML,
    printMarks,
    clearError: clearErrorMessage,
  };
}
