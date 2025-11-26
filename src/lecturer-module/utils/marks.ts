/**
 * Lecturer Module - Marks Calculation Utilities
 * SWE 4070 Group Project 2 - Group 2 (Lecturer Module)
 * 
 * This file contains all logic for calculating marks, totals, and grades.
 * Implements the exact grading system specified in requirements.
 */

import type {
  Grade,
  GradeBoundary,
  AssessmentMarks,
  StudentMarks,
  MarksInput,
  GradeDistribution,
} from '../types';
import { GRADE_BOUNDARIES, MAX_TOTAL_MARKS, MIN_PASSING_SCORE } from '../types';

// ============================================
// TOTAL SCORE CALCULATION
// ============================================

/**
 * Calculate total score from individual assessment marks
 * 
 * @param marks - Individual assessment marks
 * @returns Total score (sum of all components)
 * 
 * @example
 * calculateTotalScore({
 *   assignment: 8,
 *   quiz: 12,
 *   project: 20,
 *   midsem: 18,
 *   finalExam: 25
 * }) // Returns 83
 */
export function calculateTotalScore(marks: AssessmentMarks): number {
  const total = 
    marks.assignment +
    marks.quiz +
    marks.project +
    marks.midsem +
    marks.finalExam;

  // Round to 2 decimal places
  return Math.round(total * 100) / 100;
}

// ============================================
// GRADE CALCULATION
// ============================================

/**
 * Calculate grade based on total score
 * Uses the exact grading system from requirements
 * 
 * Grade Scale:
 * A:     90 – 100
 * A-:    87 – 89
 * B+:    84 – 86
 * B:     80 – 83
 * B-:    77 – 79
 * C+:    74 – 76
 * C:     70 – 73
 * C-:    67 – 69
 * D+:    64 – 66
 * D:     62 – 63
 * D-:    60 – 61
 * F:     0 – 59
 * 
 * @param totalScore - Total score (0-100)
 * @returns Calculated grade
 * 
 * @example
 * calculateGrade(85) // Returns 'B+'
 * calculateGrade(90) // Returns 'A'
 * calculateGrade(50) // Returns 'F'
 */
export function calculateGrade(totalScore: number): Grade {
  // Ensure score is within valid range
  const score = Math.max(0, Math.min(MAX_TOTAL_MARKS, totalScore));

  // Find matching grade boundary
  for (const boundary of GRADE_BOUNDARIES) {
    if (score >= boundary.minScore && score <= boundary.maxScore) {
      return boundary.grade;
    }
  }

  // Fallback to F (should never reach here if GRADE_BOUNDARIES is correct)
  return 'F';
}

/**
 * Get grade boundary for a specific grade
 * 
 * @param grade - Grade to look up
 * @returns Grade boundary or undefined if not found
 */
export function getGradeBoundary(grade: Grade): GradeBoundary | undefined {
  return GRADE_BOUNDARIES.find(b => b.grade === grade);
}

/**
 * Check if a grade is passing (D- or better)
 * 
 * @param grade - Grade to check
 * @returns True if passing, false otherwise
 */
export function isPassingGrade(grade: Grade): boolean {
  return grade !== 'F';
}

/**
 * Check if a score is passing (>= 60)
 * 
 * @param score - Total score to check
 * @returns True if passing, false otherwise
 */
export function isPassingScore(score: number): boolean {
  return score >= MIN_PASSING_SCORE;
}

// ============================================
// MARKS PROCESSING
// ============================================

/**
 * Process marks input and calculate total score and grade
 * Converts MarksInput to complete StudentMarks
 * 
 * @param input - Raw marks input
 * @param additionalData - Additional data (courseId, lecturerId, etc.)
 * @returns Complete StudentMarks object with calculated total and grade
 * 
 * @example
 * processMarks(
 *   {
 *     studentId: 'S001',
 *     assignment: 8,
 *     quiz: 12,
 *     project: 20,
 *     midsem: 18,
 *     finalExam: 25
 *   },
 *   {
 *     courseId: 'C001',
 *     lecturerId: 'L001',
 *     id: 'M001'
 *   }
 * )
 */
export function processMarks(
  input: MarksInput,
  additionalData: {
    id: string;
    courseId: string;
    lecturerId: string;
  }
): StudentMarks {
  const totalScore = calculateTotalScore({
    assignment: input.assignment,
    quiz: input.quiz,
    project: input.project,
    midsem: input.midsem,
    finalExam: input.finalExam,
  });

  const grade = calculateGrade(totalScore);

  return {
    ...additionalData,
    studentId: input.studentId,
    assignment: input.assignment,
    quiz: input.quiz,
    project: input.project,
    midsem: input.midsem,
    finalExam: input.finalExam,
    totalScore,
    grade,
    submittedAt: new Date().toISOString(),
  };
}

// ============================================
// GRADE STATISTICS
// ============================================

/**
 * Calculate grade distribution from an array of marks
 * Counts how many students received each grade
 * 
 * @param marksArray - Array of student marks
 * @returns Grade distribution object
 * 
 * @example
 * calculateGradeDistribution([
 *   { grade: 'A', ... },
 *   { grade: 'A', ... },
 *   { grade: 'B+', ... },
 *   { grade: 'F', ... }
 * ])
 * // Returns: { 'A': 2, 'A-': 0, 'B+': 1, ..., 'F': 1 }
 */
export function calculateGradeDistribution(marksArray: StudentMarks[]): GradeDistribution {
  const distribution: GradeDistribution = {
    'A': 0,
    'A-': 0,
    'B+': 0,
    'B': 0,
    'B-': 0,
    'C+': 0,
    'C': 0,
    'C-': 0,
    'D+': 0,
    'D': 0,
    'D-': 0,
    'F': 0,
  };

  marksArray.forEach(marks => {
    distribution[marks.grade]++;
  });

  return distribution;
}

/**
 * Calculate average score from an array of marks
 * 
 * @param marksArray - Array of student marks
 * @returns Average score (rounded to 2 decimal places)
 */
export function calculateAverageScore(marksArray: StudentMarks[]): number {
  if (marksArray.length === 0) return 0;

  const total = marksArray.reduce((sum, marks) => sum + marks.totalScore, 0);
  const average = total / marksArray.length;

  return Math.round(average * 100) / 100;
}

/**
 * Find highest score from an array of marks
 * 
 * @param marksArray - Array of student marks
 * @returns Highest score or 0 if array is empty
 */
export function findHighestScore(marksArray: StudentMarks[]): number {
  if (marksArray.length === 0) return 0;

  return Math.max(...marksArray.map(marks => marks.totalScore));
}

/**
 * Find lowest score from an array of marks
 * 
 * @param marksArray - Array of student marks
 * @returns Lowest score or 0 if array is empty
 */
export function findLowestScore(marksArray: StudentMarks[]): number {
  if (marksArray.length === 0) return 0;

  return Math.min(...marksArray.map(marks => marks.totalScore));
}

/**
 * Calculate pass rate (percentage of students with passing grades)
 * 
 * @param marksArray - Array of student marks
 * @returns Pass rate as percentage (0-100)
 */
export function calculatePassRate(marksArray: StudentMarks[]): number {
  if (marksArray.length === 0) return 0;

  const passingCount = marksArray.filter(marks => isPassingGrade(marks.grade)).length;
  const passRate = (passingCount / marksArray.length) * 100;

  return Math.round(passRate * 100) / 100;
}

// ============================================
// MARKS COMPARISON
// ============================================

/**
 * Compare two grades
 * Returns positive if grade1 > grade2, negative if grade1 < grade2, 0 if equal
 * 
 * @param grade1 - First grade
 * @param grade2 - Second grade
 * @returns Comparison result
 */
export function compareGrades(grade1: Grade, grade2: Grade): number {
  const boundary1 = getGradeBoundary(grade1);
  const boundary2 = getGradeBoundary(grade2);

  if (!boundary1 || !boundary2) return 0;

  // Higher grade has higher minScore
  return boundary1.minScore - boundary2.minScore;
}

/**
 * Get grade points for a grade (useful for GPA calculations)
 * 
 * @param grade - Grade to convert
 * @returns Grade points (4.0 scale)
 */
export function getGradePoints(grade: Grade): number {
  const gradePoints: Record<Grade, number> = {
    'A': 4.0,
    'A-': 3.7,
    'B+': 3.3,
    'B': 3.0,
    'B-': 2.7,
    'C+': 2.3,
    'C': 2.0,
    'C-': 1.7,
    'D+': 1.3,
    'D': 1.0,
    'D-': 0.7,
    'F': 0.0,
  };

  return gradePoints[grade];
}

/**
 * Calculate percentage for a score
 * 
 * @param score - Total score
 * @param maxScore - Maximum possible score (default: 100)
 * @returns Percentage (0-100)
 */
export function calculatePercentage(score: number, maxScore: number = MAX_TOTAL_MARKS): number {
  if (maxScore === 0) return 0;
  
  const percentage = (score / maxScore) * 100;
  return Math.round(percentage * 100) / 100;
}
