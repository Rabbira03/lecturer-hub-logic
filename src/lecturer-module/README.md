# Lecturer Module - Logic Layer

**SWE 4070 Group Project 2 - Group 2 (Lecturer Module)**

## Overview

This is the **complete logic layer** for the Lecturer Module of the Online Examination System. This module contains all business logic, API integrations, validation, calculations, and custom React hooks needed for lecturer operations.

**Important:** This module contains **NO UI components** - it is purely the logic layer that will be integrated by Group 4 (Frontend Developers) and Group 5 (Backend Developers).

## 📁 Project Structure

```
src/lecturer-module/
├── types/
│   └── index.ts                 # All TypeScript types and interfaces
├── services/
│   ├── api.ts                   # API service layer (HTTP requests)
│   └── auth.ts                  # (Integrated in api.ts)
├── utils/
│   ├── validation.ts            # Input validation utilities
│   ├── marks.ts                 # Marks calculation & grading
│   └── export.ts                # CSV and HTML export utilities
├── hooks/
│   ├── useAuth.ts               # Authentication hook
│   ├── useStudents.ts           # Student management hook
│   ├── useMarks.ts              # Marks management hook
│   └── useReporting.ts          # Reporting & export hook
├── examples/
│   └── usage-examples.tsx       # Usage examples for UI team
└── README.md                    # This file
```

## 🎯 Features Implemented

### 1. Authentication
- ✅ Lecturer login
- ✅ Lecturer logout
- ✅ Lecturer registration (6 lecturers, 1 course each)
- ✅ Token storage in localStorage
- ✅ Session management
- ✅ Error handling

### 2. Student Management
- ✅ Fetch all students in a course
- ✅ Fetch single student details
- ✅ Fetch students with their marks

### 3. Marks Management
- ✅ Enter marks for a student
- ✅ Update existing marks
- ✅ Bulk marks entry (multiple students)
- ✅ Real-time calculation of total score and grade
- ✅ Input validation (cannot exceed maximum marks)
- ✅ Assessment breakdown:
  - Assignment: max 10
  - Quiz: max 15
  - Project: max 25
  - Midsem: max 20
  - Final Exam: max 30
  - **Total: 100**

### 4. Grading System (EXACT IMPLEMENTATION)
```
A:     90 – 100
A-:    87 – 89
B+:    84 – 86
B:     80 – 83
B-:    77 – 79
C+:    74 – 76
C:     70 – 73
C-:    67 – 69
D+:    64 – 66
D:     62 – 63
D-:    60 – 61
F:     0 – 59
```

### 5. Reporting & Statistics
- ✅ Class statistics (average, highest, lowest, pass rate)
- ✅ Grade distribution
- ✅ CSV export
- ✅ Printable HTML generation
- ✅ Export marks to CSV
- ✅ Print marks directly

## 🚀 Quick Start

### Installation

This logic layer is already integrated into your React + TypeScript project. No additional installation needed.

### Environment Variables

Create a `.env` file with the backend API URL (will be provided by Group 5):

```env
VITE_API_BASE_URL=http://localhost:3000/api
```

### Basic Usage

```tsx
import { useAuth, useStudents, useMarks, useReporting } from './lecturer-module/hooks';

function MyComponent() {
  const { lecturer, login } = useAuth();
  const { students, fetchStudents } = useStudents();
  const { submitMarks } = useMarks();
  const { exportToCSV } = useReporting();

  // Use the hooks...
}
```

## 📚 API Reference

### Custom Hooks

#### `useAuth()`
Manages lecturer authentication.

```tsx
const {
  lecturer,           // Current logged-in lecturer
  isAuthenticated,    // Is user logged in?
  isAuthenticating,   // Is login in progress?
  isRegistering,      // Is registration in progress?
  error,              // Error message
  login,              // Function to login
  logout,             // Function to logout
  register,           // Function to register
  refreshProfile,     // Refresh lecturer data
  clearError,         // Clear error message
} = useAuth();
```

**Example:**
```tsx
const { login, isAuthenticating, error } = useAuth();

const handleLogin = async () => {
  const success = await login({
    email: 'lecturer@example.com',
    password: 'password123'
  });
  
  if (success) {
    console.log('Login successful!');
  }
};
```

#### `useStudents(courseId?)`
Manages student data for a course.

```tsx
const {
  students,                  // Array of students
  studentsWithMarks,         // Students with their marks
  isLoading,                 // Loading state
  isRefreshing,              // Refreshing state
  error,                     // Error message
  fetchStudents,             // Fetch students
  fetchStudentsWithMarks,    // Fetch students + marks
  fetchStudent,              // Fetch single student
  refresh,                   // Refresh data
  clearError,                // Clear error
} = useStudents(courseId);
```

**Example:**
```tsx
const { students, fetchStudents } = useStudents();

useEffect(() => {
  fetchStudents('COURSE_001');
}, []);
```

#### `useMarks()`
Manages marks entry and updates.

```tsx
const {
  currentMarks,        // Current marks data
  isSubmitting,        // Submitting state
  isUpdating,          // Updating state
  success,             // Success flag
  error,               // Error message
  submitMarks,         // Submit new marks
  updateStudentMarks,  // Update existing marks
  submitBulkMarks,     // Submit multiple marks
  fetchMarks,          // Fetch student's marks
  validateMarksInput,  // Validate without submitting
  previewCalculation,  // Calculate total & grade
  clearStatus,         // Clear success/error
} = useMarks();
```

**Example:**
```tsx
const { submitMarks, previewCalculation } = useMarks();

const marksInput = {
  studentId: 'S001',
  assignment: 8,
  quiz: 12,
  project: 20,
  midsem: 18,
  finalExam: 25
};

// Preview calculation
const { totalScore, grade } = previewCalculation(marksInput);
console.log(totalScore, grade); // 83, "B"

// Submit marks
const success = await submitMarks(marksInput);
```

#### `useReporting()`
Manages statistics and data export.

```tsx
const {
  statistics,              // Course statistics
  isLoadingStatistics,     // Loading state
  isExporting,             // Export in progress
  error,                   // Error message
  fetchStatistics,         // Fetch from backend
  calculateStatistics,     // Calculate client-side
  exportToCSV,             // Export to CSV
  exportStatisticsCSV,     // Export stats to CSV
  exportToPrintableHTML,   // Export to HTML
  printMarks,              // Open print dialog
  clearError,              // Clear error
} = useReporting();
```

**Example:**
```tsx
const { exportToCSV, printMarks } = useReporting();

// Export to CSV
exportToCSV(studentsWithMarks, 'Data Structures');

// Print marks
printMarks(studentsWithMarks, 'Data Structures', 'Dr. Smith');
```

## 🔧 Utilities

### Validation (`utils/validation.ts`)

```tsx
import { validateMarks, validateEmail, validatePassword } from './utils/validation';

// Validate marks
const result = validateMarks({
  studentId: 'S001',
  assignment: 8,
  quiz: 12,
  project: 20,
  midsem: 18,
  finalExam: 25
});

if (!result.isValid) {
  console.log(result.errors); // Array of errors
}

// Validate email
const emailResult = validateEmail('test@example.com');
```

### Marks Calculation (`utils/marks.ts`)

```tsx
import { calculateGrade, calculateTotalScore } from './utils/marks';

// Calculate total score
const total = calculateTotalScore({
  assignment: 8,
  quiz: 12,
  project: 20,
  midsem: 18,
  finalExam: 25
});
console.log(total); // 83

// Calculate grade
const grade = calculateGrade(83);
console.log(grade); // "B"
```

### Export (`utils/export.ts`)

```tsx
import { exportMarksToCSV, downloadCSV } from './utils/export';

// Generate CSV data
const csvData = exportMarksToCSV(studentsWithMarks, 'Data Structures');

// Trigger download
downloadCSV(csvData);
```

## 📝 Types

All TypeScript types are defined in `types/index.ts`. Key types include:

```tsx
// Lecturer
interface Lecturer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  courseId: string;
  courseName: string;
}

// Student
interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  registrationNumber: string;
  courseId: string;
}

// Marks Input
interface MarksInput {
  studentId: string;
  assignment: number;    // Max: 10
  quiz: number;          // Max: 15
  project: number;       // Max: 25
  midsem: number;        // Max: 20
  finalExam: number;     // Max: 30
}

// Student Marks (with calculated fields)
interface StudentMarks extends MarksInput {
  id: string;
  courseId: string;
  lecturerId: string;
  totalScore: number;    // Auto-calculated
  grade: Grade;          // Auto-calculated
  submittedAt?: string;
}
```

## 🔗 Integration Guide

### For Group 4 (Frontend/UI Team)

1. **Import the hooks** in your UI components
2. **Use the provided examples** in `examples/usage-examples.tsx` as reference
3. **Build your UI** around the hook states and actions
4. **Handle loading states** and errors appropriately
5. **Display data** returned from hooks in your components

**Important:** You do NOT need to modify any logic files. Just use the hooks.

### For Group 5 (Backend Team)

1. **Update API endpoints** in `services/api.ts` (update the `ENDPOINTS` object and `API_BASE_URL`)
2. **Ensure API responses** match the expected format (see types in `types/index.ts`)
3. **Implement authentication** token validation
4. **Return consistent error formats** as defined in `ApiErrorResponse` type

**API Response Format:**
```json
// Success
{
  "success": true,
  "data": { ... },
  "message": "Optional message"
}

// Error
{
  "success": false,
  "error": "ERROR_CODE",
  "message": "Human-readable error message",
  "statusCode": 400
}
```

## ✅ Validation Rules

### Email
- Must be valid email format
- Max 255 characters

### Phone
- 10-15 digits
- Non-digit characters allowed (will be stripped)

### Password
- Min 8 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 number

### Marks
- Each component must be within its maximum value
- Cannot be negative
- Max 2 decimal places
- Total cannot exceed 100

## 📊 Grading System

The grading system is implemented **exactly** as specified:

| Grade | Range      |
|-------|------------|
| A     | 90 - 100   |
| A-    | 87 - 89    |
| B+    | 84 - 86    |
| B     | 80 - 83    |
| B-    | 77 - 79    |
| C+    | 74 - 76    |
| C     | 70 - 73    |
| C-    | 67 - 69    |
| D+    | 64 - 66    |
| D     | 62 - 63    |
| D-    | 60 - 61    |
| F     | 0 - 59     |

Passing grade: **D- (60 points) and above**

## 🎨 Usage Examples

Complete usage examples are available in `examples/usage-examples.tsx`, including:

1. Login flow
2. Registration flow
3. Viewing students
4. Entering marks (with real-time calculation)
5. Viewing marks
6. Statistics dashboard
7. Export functionality
8. Complete dashboard example

## 🧪 Testing

To test the logic layer:

1. **Unit Tests**: Test individual utilities in isolation
   ```tsx
   import { calculateGrade } from './utils/marks';
   
   expect(calculateGrade(85)).toBe('B+');
   expect(calculateGrade(90)).toBe('A');
   ```

2. **Integration Tests**: Test hooks with mock API responses

3. **Manual Testing**: Use the examples in `examples/usage-examples.tsx`

## 🐛 Troubleshooting

### "Cannot find module"
Make sure all imports use the correct relative paths from your component location.

### "API call failed"
Check that `VITE_API_BASE_URL` is set correctly and backend is running.

### "Validation errors"
Check the `error` property from hooks - it contains the validation message.

### "Token expired"
Call `logout()` to clear the token and redirect to login.

## 📞 Support

For issues or questions:
- **Group 4 (UI)**: Refer to usage examples and this README
- **Group 5 (Backend)**: Check API service layer and type definitions

## 🎓 Team Information

**Project:** SWE 4070 Group Project 2  
**Module:** Lecturer Module (Group 2)  
**Type:** Logic Layer Only (No UI)  
**Technologies:** React, TypeScript, Custom Hooks  
**Integration:** Designed for Group 4 (UI) and Group 5 (Backend)

## ✨ Key Features Summary

✅ Complete TypeScript types  
✅ Full API service layer with placeholder endpoints  
✅ Comprehensive validation (email, phone, password, marks)  
✅ Exact grading system implementation  
✅ Marks calculation utilities  
✅ CSV and printable HTML export  
✅ Custom React hooks for all operations  
✅ Usage examples for UI team  
✅ Detailed documentation  
✅ NO UI components (logic only)  
✅ NO local data (only token in localStorage)  

---

**Ready for integration by Group 4 and Group 5!** 🚀
