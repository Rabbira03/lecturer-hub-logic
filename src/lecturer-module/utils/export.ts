/**
 * Lecturer Module - Export Utilities
 * SWE 4070 Group Project 2 - Group 2 (Lecturer Module)
 * 
 * This file contains utilities for exporting marks data.
 * Supports CSV export and printable HTML generation.
 */

import type {
  StudentWithMarks,
  StudentMarks,
  ClassStatistics,
  CSVExportData,
  HTMLExportData,
} from '../types';

// ============================================
// CSV EXPORT
// ============================================

/**
 * Convert array of objects to CSV string
 * 
 * @param headers - Column headers
 * @param rows - Data rows
 * @returns CSV formatted string
 */
function arrayToCSV(headers: string[], rows: (string | number)[][]): string {
  // Escape and quote CSV values
  const escapeCSV = (value: string | number): string => {
    const str = String(value);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  // Build CSV string
  const csvHeaders = headers.map(escapeCSV).join(',');
  const csvRows = rows.map(row => row.map(escapeCSV).join(',')).join('\n');

  return `${csvHeaders}\n${csvRows}`;
}

/**
 * Export student marks to CSV format
 * 
 * @param students - Array of students with their marks
 * @param courseName - Name of the course (for filename)
 * @returns CSV export data
 * 
 * @example
 * const csvData = exportMarksToCSV(studentsWithMarks, 'Data Structures');
 * downloadCSV(csvData); // Triggers browser download
 */
export function exportMarksToCSV(
  students: StudentWithMarks[],
  courseName: string = 'Course'
): CSVExportData {
  // Define CSV headers
  const headers = [
    'Registration Number',
    'First Name',
    'Last Name',
    'Email',
    'Assignment (10)',
    'Quiz (15)',
    'Project (25)',
    'Midsem (20)',
    'Final Exam (30)',
    'Total Score (100)',
    'Grade',
    'Status',
  ];

  // Build data rows
  const rows = students.map(student => {
    const marks = student.marks;

    return [
      student.registrationNumber,
      student.firstName,
      student.lastName,
      student.email,
      marks?.assignment ?? 'N/A',
      marks?.quiz ?? 'N/A',
      marks?.project ?? 'N/A',
      marks?.midsem ?? 'N/A',
      marks?.finalExam ?? 'N/A',
      marks?.totalScore ?? 'N/A',
      marks?.grade ?? 'N/A',
      marks ? (marks.grade !== 'F' ? 'Pass' : 'Fail') : 'No Marks',
    ];
  });

  // Generate CSV string
  const csvContent = arrayToCSV(headers, rows);

  // Generate filename with timestamp
  const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const sanitizedCourseName = courseName.replace(/[^a-z0-9]/gi, '_');
  const filename = `${sanitizedCourseName}_Marks_${timestamp}.csv`;

  return {
    filename,
    data: csvContent,
    mimeType: 'text/csv',
  };
}

/**
 * Export class statistics to CSV format
 * 
 * @param statistics - Class statistics
 * @returns CSV export data
 */
export function exportStatisticsToCSV(statistics: ClassStatistics): CSVExportData {
  const headers = ['Metric', 'Value'];

  const rows = [
    ['Course', statistics.courseName],
    ['Total Students', statistics.totalStudents],
    ['Students with Marks', statistics.studentsWithMarks],
    ['Average Score', statistics.averageScore],
    ['Highest Score', statistics.highestScore],
    ['Lowest Score', statistics.lowestScore],
    ['Pass Rate (%)', statistics.passRate],
    ['', ''], // Empty row
    ['Grade Distribution', ''],
    ['A', statistics.gradeDistribution['A']],
    ['A-', statistics.gradeDistribution['A-']],
    ['B+', statistics.gradeDistribution['B+']],
    ['B', statistics.gradeDistribution['B']],
    ['B-', statistics.gradeDistribution['B-']],
    ['C+', statistics.gradeDistribution['C+']],
    ['C', statistics.gradeDistribution['C']],
    ['C-', statistics.gradeDistribution['C-']],
    ['D+', statistics.gradeDistribution['D+']],
    ['D', statistics.gradeDistribution['D']],
    ['D-', statistics.gradeDistribution['D-']],
    ['F', statistics.gradeDistribution['F']],
  ];

  const csvContent = arrayToCSV(headers, rows);

  const timestamp = new Date().toISOString().split('T')[0];
  const sanitizedCourseName = statistics.courseName.replace(/[^a-z0-9]/gi, '_');
  const filename = `${sanitizedCourseName}_Statistics_${timestamp}.csv`;

  return {
    filename,
    data: csvContent,
    mimeType: 'text/csv',
  };
}

// ============================================
// HTML EXPORT (Printable)
// ============================================

/**
 * Generate printable HTML for student marks
 * Creates a nicely formatted HTML document ready for printing
 * 
 * @param students - Array of students with their marks
 * @param courseName - Name of the course
 * @param lecturerName - Name of the lecturer
 * @returns HTML export data
 * 
 * @example
 * const htmlData = exportMarksToPrintableHTML(studentsWithMarks, 'Data Structures', 'Dr. Smith');
 * printHTML(htmlData); // Opens print dialog
 */
export function exportMarksToPrintableHTML(
  students: StudentWithMarks[],
  courseName: string,
  lecturerName: string = 'Lecturer'
): HTMLExportData {
  const timestamp = new Date().toLocaleString();

  // Build student rows
  const studentRows = students
    .map((student, index) => {
      const marks = student.marks;

      return `
        <tr class="${index % 2 === 0 ? 'even-row' : 'odd-row'}">
          <td>${index + 1}</td>
          <td>${student.registrationNumber}</td>
          <td>${student.firstName} ${student.lastName}</td>
          <td>${marks?.assignment ?? 'N/A'}</td>
          <td>${marks?.quiz ?? 'N/A'}</td>
          <td>${marks?.project ?? 'N/A'}</td>
          <td>${marks?.midsem ?? 'N/A'}</td>
          <td>${marks?.finalExam ?? 'N/A'}</td>
          <td><strong>${marks?.totalScore ?? 'N/A'}</strong></td>
          <td class="grade-${marks?.grade || 'NA'}">${marks?.grade ?? 'N/A'}</td>
          <td>${marks ? (marks.grade !== 'F' ? '<span class="pass">Pass</span>' : '<span class="fail">Fail</span>') : 'No Marks'}</td>
        </tr>
      `;
    })
    .join('');

  // Generate complete HTML document
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${courseName} - Student Marks</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Arial', sans-serif;
      padding: 20px;
      background: white;
      color: #333;
    }

    .header {
      text-align: center;
      margin-bottom: 30px;
      border-bottom: 3px solid #333;
      padding-bottom: 20px;
    }

    .header h1 {
      font-size: 28px;
      margin-bottom: 10px;
      color: #1a1a1a;
    }

    .header p {
      font-size: 14px;
      color: #666;
      margin: 5px 0;
    }

    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      margin-bottom: 30px;
      padding: 15px;
      background: #f5f5f5;
      border-radius: 5px;
    }

    .info-item {
      display: flex;
      gap: 10px;
    }

    .info-label {
      font-weight: bold;
      color: #555;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 30px;
      box-shadow: 0 2px 5px rgba(0,0,0,0.1);
    }

    th {
      background: #333;
      color: white;
      padding: 12px 8px;
      text-align: left;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    td {
      padding: 10px 8px;
      border-bottom: 1px solid #ddd;
      font-size: 13px;
    }

    .even-row {
      background: #f9f9f9;
    }

    .odd-row {
      background: white;
    }

    tr:hover {
      background: #f0f0f0;
    }

    .grade-A, .grade-A- { color: #2ecc71; font-weight: bold; }
    .grade-B, .grade-B-, .grade-Bplus { color: #3498db; font-weight: bold; }
    .grade-C, .grade-C-, .grade-Cplus { color: #f39c12; font-weight: bold; }
    .grade-D, .grade-D-, .grade-Dplus { color: #e67e22; font-weight: bold; }
    .grade-F { color: #e74c3c; font-weight: bold; }

    .pass {
      color: #2ecc71;
      font-weight: bold;
    }

    .fail {
      color: #e74c3c;
      font-weight: bold;
    }

    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 2px solid #ddd;
      text-align: center;
      font-size: 12px;
      color: #666;
    }

    .signature {
      margin-top: 50px;
      text-align: right;
    }

    .signature-line {
      display: inline-block;
      border-top: 2px solid #333;
      padding-top: 5px;
      margin-top: 40px;
      min-width: 200px;
    }

    @media print {
      body {
        padding: 0;
      }

      .no-print {
        display: none;
      }

      table {
        page-break-inside: auto;
      }

      tr {
        page-break-inside: avoid;
        page-break-after: auto;
      }

      thead {
        display: table-header-group;
      }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Student Marks Report</h1>
    <p>${courseName}</p>
  </div>

  <div class="info-grid">
    <div class="info-item">
      <span class="info-label">Course:</span>
      <span>${courseName}</span>
    </div>
    <div class="info-item">
      <span class="info-label">Lecturer:</span>
      <span>${lecturerName}</span>
    </div>
    <div class="info-item">
      <span class="info-label">Total Students:</span>
      <span>${students.length}</span>
    </div>
    <div class="info-item">
      <span class="info-label">Generated:</span>
      <span>${timestamp}</span>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>#</th>
        <th>Reg. No.</th>
        <th>Student Name</th>
        <th>Assignment<br/>(10)</th>
        <th>Quiz<br/>(15)</th>
        <th>Project<br/>(25)</th>
        <th>Midsem<br/>(20)</th>
        <th>Final<br/>(30)</th>
        <th>Total<br/>(100)</th>
        <th>Grade</th>
        <th>Status</th>
      </tr>
    </thead>
    <tbody>
      ${studentRows}
    </tbody>
  </table>

  <div class="signature">
    <div class="signature-line">
      ${lecturerName}<br/>
      <small>Lecturer Signature</small>
    </div>
  </div>

  <div class="footer">
    <p>Online Examination System | SWE 4070 Group Project 2</p>
    <p>Generated on ${timestamp}</p>
  </div>
</body>
</html>
  `;

  const timestamp_filename = new Date().toISOString().split('T')[0];
  const sanitizedCourseName = courseName.replace(/[^a-z0-9]/gi, '_');
  const filename = `${sanitizedCourseName}_Marks_Report_${timestamp_filename}.html`;

  return {
    filename,
    data: html,
    mimeType: 'text/html',
  };
}

// ============================================
// DOWNLOAD UTILITIES
// ============================================

/**
 * Trigger browser download for CSV data
 * Creates a temporary blob and triggers download
 * 
 * @param csvData - CSV export data
 */
export function downloadCSV(csvData: CSVExportData): void {
  const blob = new Blob([csvData.data], { type: csvData.mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = csvData.filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Open print dialog for HTML data
 * Opens HTML in new window and triggers print
 * 
 * @param htmlData - HTML export data
 */
export function printHTML(htmlData: HTMLExportData): void {
  const printWindow = window.open('', '_blank');
  
  if (printWindow) {
    printWindow.document.write(htmlData.data);
    printWindow.document.close();
    
    // Wait for content to load, then print
    printWindow.onload = () => {
      printWindow.print();
    };
  } else {
    console.error('Failed to open print window. Please check popup blocker settings.');
  }
}

/**
 * Download HTML file
 * 
 * @param htmlData - HTML export data
 */
export function downloadHTML(htmlData: HTMLExportData): void {
  const blob = new Blob([htmlData.data], { type: htmlData.mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = htmlData.filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
