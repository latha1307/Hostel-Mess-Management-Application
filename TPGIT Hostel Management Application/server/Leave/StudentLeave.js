const sql = require('mssql/msnodesqlv8');
const express = require("express");
const { openPool } = require('../database');

const router = express.Router();




router.post('/student/leave-request', async (req, res) => {
    const { student_id, DateFrom, DateTo, NoOfDays, Comment } = req.body;

    console.log(req.body); 

    try {

        if (!student_id || !DateFrom || !DateTo || !NoOfDays || !Comment) {
            return res.status(400).json({ message: 'All fields are required.' });
        }

        if (NoOfDays < 7 || NoOfDays > 31) {
            return res.status(400).json({ message: 'Number of days must be between 7 and 31.' });
        }

        const pool = await openPool();

 
        const studentDetailsQuery = `
            SELECT roll_no as RegNo, student_name as StudentName 
            FROM [HostelManagementDB].[dbo].[StudentDetails] 
            WHERE student_id = @student_id
        `;

        const studentDetailsResult = await pool.request()
            .input('student_id', sql.VarChar, student_id)
            .query(studentDetailsQuery);

        if (studentDetailsResult.recordset.length === 0) {
            return res.status(404).json({ message: 'Student not found.' });
        }

        const { RegNo, StudentName } = studentDetailsResult.recordset[0];

     
        const insertLeaveQuery = `
            INSERT INTO [HostelManagementDB].[dbo].[StudentsLeaveRequests] 
            (student_id, RegNo, StudentName, DateFrom, DateTo, NoOfDays, Comment)
            VALUES (@student_id, @RegNo, @StudentName, @DateFrom, @DateTo, @NoOfDays, @Comment)
        `;

        await pool.request()
            .input('student_id', sql.VarChar, student_id)
            .input('RegNo', sql.BigInt, RegNo)
            .input('StudentName', sql.VarChar(255), StudentName)
            .input('DateFrom', sql.Date, DateFrom)
            .input('DateTo', sql.Date, DateTo)
            .input('NoOfDays', sql.Int, NoOfDays)
            .input('Comment', sql.VarChar, Comment)
   
            .query(insertLeaveQuery);

      
        const insertHistoryQuery = `
            INSERT INTO [HostelManagementDB].[dbo].[StudentsLeaveHistory] 
            (student_id, RegNo, StudentName, DateFrom, DateTo, NoOfDays, Comment, Status)
            VALUES (@student_id, @RegNo, @StudentName, @DateFrom, @DateTo, @NoOfDays, @Comment, @Status)
        `;

        await pool.request()
            .input('student_id', sql.VarChar, student_id)
            .input('RegNo', sql.BigInt, RegNo)
            .input('StudentName', sql.VarChar(255), StudentName)
            .input('DateFrom', sql.Date, DateFrom)
            .input('DateTo', sql.Date, DateTo)
            .input('NoOfDays', sql.Int, NoOfDays)
            .input('Comment', sql.VarChar(255), Comment)
            .input('Status', sql.VarChar(50), 'Pending') 
            .query(insertHistoryQuery);

        return res.status(201).json({ message: 'Leave request submitted successfully.' });

    } catch (error) {
        console.error('Error adding leave request:', error);
        return res.status(500).json({ message: 'Server error: ' + error.message });
    }
});
router.get('/student/leave-history/:studentId', async (req, res) => {
    const studentId = req.params.studentId; // Extract student ID from request parameters

    console.log(req.params); // Log the student ID for debugging

    try {
        // Validate the studentId
        if (!studentId) {
            return res.status(400).json({ message: 'Student ID is required.' });
        }

        const pool = await openPool(); // Use the same connection pooling method

        // Query to fetch leave history
        const result = await pool.request()
            .input('student_id', sql.VarChar, studentId) // Bind parameter to avoid SQL injection
            .query(`
                SELECT TOP (1000) 
                    [HistoryID],
                    [student_id],
                    [RegNo],
                    [StudentName],
                    [DateFrom],
                    [DateTo],
                    [NoOfDays],
                    [Comment],
                    [Status],
                    [RequestDate]
                    FROM [dbo].[StudentsLeaveHistory]
                WHERE [student_id]  = @student_id
                ORDER BY [RequestDate] DESC
            `);
        
        // Check if any records were found
        if (result.recordset.length === 0) {
            return res.status(404).json({ message: 'No leave history found for this student.' });
        }

        // Send the retrieved data as a JSON response
        res.json(result.recordset);
    } catch (error) {
        console.error('Error fetching leave history:', error);
        return res.status(500).json({ message: 'Server error: ' + error.message });
    }
});

module.exports = router;
