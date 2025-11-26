/**
 * Lecturer Module - Usage Examples
 * SWE 4070 Group Project 2 - Group 2 (Lecturer Module)
 * 
 * This file contains practical examples of how to use the Lecturer Module logic layer.
 * These examples demonstrate integration with the UI layer (Group 4).
 * 
 * NOTE: These are example implementations to guide the UI team.
 * They are NOT actual UI components - just demonstrations of the logic usage.
 */

import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useStudents } from '../hooks/useStudents';
import { useMarks } from '../hooks/useMarks';
import { useReporting } from '../hooks/useReporting';
import type { MarksInput } from '../types';

// ============================================
// EXAMPLE 1: LOGIN FLOW
// ============================================

/**
 * Example: Login Component
 * Demonstrates how to use the useAuth hook for lecturer login
 */
export function LoginExample() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const { login, isAuthenticating, error, lecturer, clearError } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const success = await login({ email, password });
    
    if (success) {
      console.log('Login successful!', lecturer);
      // UI Team: Redirect to dashboard here
    }
  };

  return (
    <div>
      <h2>Lecturer Login</h2>
      
      <form onSubmit={handleLogin}>
        <div>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              clearError(); // Clear error when user types
            }}
            required
          />
        </div>

        <div>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              clearError();
            }}
            required
          />
        </div>

        <button type="submit" disabled={isAuthenticating}>
          {isAuthenticating ? 'Logging in...' : 'Login'}
        </button>

        {error && (
          <div style={{ color: 'red' }}>
            Error: {error}
          </div>
        )}
      </form>
    </div>
  );
}

// ============================================
// EXAMPLE 2: REGISTRATION FLOW
// ============================================

/**
 * Example: Registration Component
 * Demonstrates how to register a new lecturer
 */
export function RegistrationExample() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    courseId: '',
  });

  const { register, isRegistering, error } = useAuth();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const success = await register(formData);
    
    if (success) {
      alert('Registration successful! Please login.');
      // UI Team: Redirect to login page
    }
  };

  return (
    <div>
      <h2>Lecturer Registration</h2>
      
      <form onSubmit={handleRegister}>
        <input
          type="text"
          placeholder="First Name"
          value={formData.firstName}
          onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
          required
        />
        
        <input
          type="text"
          placeholder="Last Name"
          value={formData.lastName}
          onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
          required
        />
        
        <input
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />
        
        <input
          type="tel"
          placeholder="Phone"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          required
        />
        
        <input
          type="password"
          placeholder="Password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          required
        />
        
        <select
          value={formData.courseId}
          onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
          required
        >
          <option value="">Select Course</option>
          <option value="CS101">Data Structures</option>
          <option value="CS102">Algorithms</option>
          {/* Add more course options */}
        </select>

        <button type="submit" disabled={isRegistering}>
          {isRegistering ? 'Registering...' : 'Register'}
        </button>

        {error && <div style={{ color: 'red' }}>{error}</div>}
      </form>
    </div>
  );
}

// ============================================
// EXAMPLE 3: VIEWING STUDENTS
// ============================================

/**
 * Example: Student List Component
 * Demonstrates how to fetch and display students for a course
 */
export function StudentListExample({ courseId }: { courseId: string }) {
  const { students, isLoading, error, fetchStudents } = useStudents();

  useEffect(() => {
    fetchStudents(courseId);
  }, [courseId, fetchStudents]);

  if (isLoading) {
    return <div>Loading students...</div>;
  }

  if (error) {
    return <div style={{ color: 'red' }}>Error: {error}</div>;
  }

  return (
    <div>
      <h2>Students ({students.length})</h2>
      
      <table>
        <thead>
          <tr>
            <th>Registration No.</th>
            <th>Name</th>
            <th>Email</th>
          </tr>
        </thead>
        <tbody>
          {students.map(student => (
            <tr key={student.id}>
              <td>{student.registrationNumber}</td>
              <td>{student.firstName} {student.lastName}</td>
              <td>{student.email}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ============================================
// EXAMPLE 4: ENTERING MARKS
// ============================================

/**
 * Example: Marks Entry Form
 * Demonstrates how to enter and submit marks for a student
 */
export function MarksEntryExample({ studentId }: { studentId: string }) {
  const [marksInput, setMarksInput] = useState<MarksInput>({
    studentId,
    assignment: 0,
    quiz: 0,
    project: 0,
    midsem: 0,
    finalExam: 0,
  });

  const { 
    submitMarks, 
    isSubmitting, 
    error, 
    success,
    previewCalculation,
    clearStatus
  } = useMarks();

  // Calculate total and grade in real-time
  const { totalScore, grade } = previewCalculation(marksInput);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const success = await submitMarks(marksInput);
    
    if (success) {
      alert('Marks submitted successfully!');
      // UI Team: Could redirect or clear form here
    }
  };

  const handleInputChange = (field: keyof MarksInput, value: string) => {
    const numValue = parseFloat(value) || 0;
    setMarksInput({ ...marksInput, [field]: numValue });
    clearStatus(); // Clear status when user makes changes
  };

  return (
    <div>
      <h2>Enter Marks</h2>
      
      <form onSubmit={handleSubmit}>
        <div>
          <label>Assignment (Max: 10):</label>
          <input
            type="number"
            min="0"
            max="10"
            step="0.01"
            value={marksInput.assignment}
            onChange={(e) => handleInputChange('assignment', e.target.value)}
            required
          />
        </div>

        <div>
          <label>Quiz (Max: 15):</label>
          <input
            type="number"
            min="0"
            max="15"
            step="0.01"
            value={marksInput.quiz}
            onChange={(e) => handleInputChange('quiz', e.target.value)}
            required
          />
        </div>

        <div>
          <label>Project (Max: 25):</label>
          <input
            type="number"
            min="0"
            max="25"
            step="0.01"
            value={marksInput.project}
            onChange={(e) => handleInputChange('project', e.target.value)}
            required
          />
        </div>

        <div>
          <label>Midsem (Max: 20):</label>
          <input
            type="number"
            min="0"
            max="20"
            step="0.01"
            value={marksInput.midsem}
            onChange={(e) => handleInputChange('midsem', e.target.value)}
            required
          />
        </div>

        <div>
          <label>Final Exam (Max: 30):</label>
          <input
            type="number"
            min="0"
            max="30"
            step="0.01"
            value={marksInput.finalExam}
            onChange={(e) => handleInputChange('finalExam', e.target.value)}
            required
          />
        </div>

        {/* Real-time calculation preview */}
        <div style={{ background: '#f0f0f0', padding: '10px', margin: '10px 0' }}>
          <h3>Preview</h3>
          <p><strong>Total Score:</strong> {totalScore} / 100</p>
          <p><strong>Grade:</strong> {grade}</p>
        </div>

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Submitting...' : 'Submit Marks'}
        </button>

        {error && <div style={{ color: 'red' }}>Error: {error}</div>}
        {success && <div style={{ color: 'green' }}>Marks submitted successfully!</div>}
      </form>
    </div>
  );
}

// ============================================
// EXAMPLE 5: VIEWING MARKS
// ============================================

/**
 * Example: View Student Marks
 * Demonstrates how to display students with their marks
 */
export function ViewMarksExample({ courseId }: { courseId: string }) {
  const { studentsWithMarks, isLoading, fetchStudentsWithMarks } = useStudents();

  useEffect(() => {
    fetchStudentsWithMarks(courseId);
  }, [courseId, fetchStudentsWithMarks]);

  if (isLoading) {
    return <div>Loading marks...</div>;
  }

  return (
    <div>
      <h2>Student Marks</h2>
      
      <table>
        <thead>
          <tr>
            <th>Student</th>
            <th>Assignment</th>
            <th>Quiz</th>
            <th>Project</th>
            <th>Midsem</th>
            <th>Final</th>
            <th>Total</th>
            <th>Grade</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {studentsWithMarks.map(student => (
            <tr key={student.id}>
              <td>{student.firstName} {student.lastName}</td>
              <td>{student.marks?.assignment ?? 'N/A'}</td>
              <td>{student.marks?.quiz ?? 'N/A'}</td>
              <td>{student.marks?.project ?? 'N/A'}</td>
              <td>{student.marks?.midsem ?? 'N/A'}</td>
              <td>{student.marks?.finalExam ?? 'N/A'}</td>
              <td><strong>{student.marks?.totalScore ?? 'N/A'}</strong></td>
              <td><strong>{student.marks?.grade ?? 'N/A'}</strong></td>
              <td>
                {student.marks 
                  ? (student.marks.grade !== 'F' ? '✓ Pass' : '✗ Fail')
                  : 'No Marks'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ============================================
// EXAMPLE 6: STATISTICS & REPORTING
// ============================================

/**
 * Example: Course Statistics Dashboard
 * Demonstrates how to display course statistics
 */
export function StatisticsExample({ courseId }: { courseId: string }) {
  const { statistics, isLoadingStatistics, fetchStatistics } = useReporting();

  useEffect(() => {
    fetchStatistics(courseId);
  }, [courseId, fetchStatistics]);

  if (isLoadingStatistics) {
    return <div>Loading statistics...</div>;
  }

  if (!statistics) {
    return <div>No statistics available</div>;
  }

  return (
    <div>
      <h2>{statistics.courseName} - Statistics</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div>
          <h3>Overview</h3>
          <p>Total Students: {statistics.totalStudents}</p>
          <p>Students with Marks: {statistics.studentsWithMarks}</p>
          <p>Average Score: {statistics.averageScore.toFixed(2)}</p>
          <p>Highest Score: {statistics.highestScore}</p>
          <p>Lowest Score: {statistics.lowestScore}</p>
          <p>Pass Rate: {statistics.passRate.toFixed(2)}%</p>
        </div>

        <div>
          <h3>Grade Distribution</h3>
          {Object.entries(statistics.gradeDistribution).map(([grade, count]) => (
            <p key={grade}>
              Grade {grade}: {count} student{count !== 1 ? 's' : ''}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================
// EXAMPLE 7: EXPORT FUNCTIONALITY
// ============================================

/**
 * Example: Export Controls
 * Demonstrates how to export marks to CSV and printable HTML
 */
export function ExportExample({ courseId, courseName, lecturerName }: { 
  courseId: string;
  courseName: string;
  lecturerName: string;
}) {
  const { studentsWithMarks, fetchStudentsWithMarks } = useStudents();
  const { exportToCSV, printMarks, isExporting } = useReporting();

  useEffect(() => {
    fetchStudentsWithMarks(courseId);
  }, [courseId, fetchStudentsWithMarks]);

  return (
    <div>
      <h2>Export Options</h2>
      
      <div>
        <button
          onClick={() => exportToCSV(studentsWithMarks, courseName)}
          disabled={isExporting || studentsWithMarks.length === 0}
        >
          {isExporting ? 'Exporting...' : 'Export to CSV'}
        </button>

        <button
          onClick={() => printMarks(studentsWithMarks, courseName, lecturerName)}
          disabled={isExporting || studentsWithMarks.length === 0}
        >
          {isExporting ? 'Preparing...' : 'Print Marks'}
        </button>

        {studentsWithMarks.length === 0 && (
          <p style={{ color: 'orange' }}>No data available to export</p>
        )}
      </div>
    </div>
  );
}

// ============================================
// EXAMPLE 8: COMPLETE DASHBOARD
// ============================================

/**
 * Example: Complete Lecturer Dashboard
 * Demonstrates how to combine multiple hooks for a full feature
 */
export function LecturerDashboardExample() {
  const { lecturer, logout } = useAuth();
  const { studentsWithMarks, fetchStudentsWithMarks, isLoading } = useStudents();
  const { statistics, calculateStatistics } = useReporting();

  useEffect(() => {
    if (lecturer?.courseId) {
      fetchStudentsWithMarks(lecturer.courseId);
    }
  }, [lecturer?.courseId, fetchStudentsWithMarks]);

  useEffect(() => {
    if (studentsWithMarks.length > 0 && lecturer) {
      calculateStatistics(studentsWithMarks, lecturer.courseName, lecturer.courseId);
    }
  }, [studentsWithMarks, lecturer, calculateStatistics]);

  if (!lecturer) {
    return <div>Please login</div>;
  }

  return (
    <div>
      <header>
        <h1>Welcome, {lecturer.firstName} {lecturer.lastName}</h1>
        <p>Course: {lecturer.courseName}</p>
        <button onClick={logout}>Logout</button>
      </header>

      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <>
          {/* Quick Statistics */}
          {statistics && (
            <div style={{ background: '#f5f5f5', padding: '20px', margin: '20px 0' }}>
              <h2>Quick Stats</h2>
              <p>Students: {statistics.totalStudents}</p>
              <p>Average: {statistics.averageScore.toFixed(2)}</p>
              <p>Pass Rate: {statistics.passRate.toFixed(2)}%</p>
            </div>
          )}

          {/* Student List */}
          <div>
            <h2>Students</h2>
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Total Score</th>
                  <th>Grade</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {studentsWithMarks.map(student => (
                  <tr key={student.id}>
                    <td>{student.firstName} {student.lastName}</td>
                    <td>{student.marks?.totalScore ?? 'N/A'}</td>
                    <td>{student.marks?.grade ?? 'N/A'}</td>
                    <td>
                      {student.marks
                        ? (student.marks.grade !== 'F' ? 'Pass' : 'Fail')
                        : 'No Marks'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
