const sql = require('mssql/msnodesqlv8');
const express = require("express");
const { openPool } = require('../database');

const router = express.Router();


router.get('/admin/leave-requests', async (req, res) => {

    try {
        
        const pool = await openPool(); 

        const query = `
            SELECT 
                student_id,
                StudentName,
                RegNo,
                DateFrom,
                DateTo,
                NoOfDays,
                comment
            FROM 
                [HostelManagementDB].[dbo].[StudentsLeaveRequests] 
        `;

        const result = await pool.request().query(query);

        const leaveRequests = result.recordset.map(product => ({
            student_id: product.student_id,
            StudentName: product.StudentName,
            RegNo: product.RegNo,
            DateFrom: product.DateFrom,
            DateTo: product.DateTo,
            NoOfDays: product.NoOfDays,
            comment: product.comment,
        }));

        res.status(200).json(leaveRequests);
    } catch (error) {
        console.error('Error fetching consumed products:', error);
        res.status(500).json({ message: "Server error: " + error.message });
    }
});

router.post('/admin/leave-request/confirm', async (req, res) => {
    const { studentID, dateFrom, dateTo, status, noOfDays } = req.body;
    console.log(req.body);
    
    try {
        const pool = await openPool();

        // Step 1: Update the leave status in the StudentsLeaveHistory table
        await pool.request()
            .input('student_id', sql.Char(13), studentID)
            .input('DateFrom', sql.Date, dateFrom)
            .input('DateTo', sql.Date, dateTo)
            .input('Status', sql.VarChar(50), status) 
            .query(`
                UPDATE [HostelManagementDB].[dbo].[StudentsLeaveHistory]
                SET Status = @Status
                WHERE student_id = @student_id AND DateFrom = @DateFrom AND DateTo = @DateTo
            `);

        // Step 2: Insert into MonthlyLeaveVerification if status is 'Confirmed'
        if (status === 'Confirmed') {
            // Fetch student details like StudentName and RegNo
            const studentDetails = await pool.request()
                .input('student_id', sql.Char(13), studentID)
                .query(`
                    SELECT student_name AS StudentName, roll_no AS RegNo
                    FROM [HostelManagementDB].[dbo].[StudentDetails]
                    WHERE student_id = @student_id
                `);
            
            const { StudentName, RegNo } = studentDetails.recordset[0]; // Assuming the student exists

            // Insert confirmed leave request into MonthlyLeaveVerification
            await pool.request()
                .input('student_id', sql.Char(13), studentID)
                .input('StudentName', sql.VarChar(100), StudentName)
                .input('RegNo', sql.BigInt, RegNo)
                .input('DateFrom', sql.Date, dateFrom)
                .input('DateTo', sql.Date, dateTo)
                .input('NoOfDays', sql.Int, noOfDays)
                .input('Status', sql.VarChar(50), status) 
                .query(`
                    INSERT INTO [HostelManagementDB].[dbo].[MonthlyLeaveVerification]
                    (student_id, StudentName, RegNo, DateFrom, DateTo, NoOfDays, Status)
                    VALUES (@student_id, @StudentName, @RegNo, @DateFrom, @DateTo, @NoOfDays, @Status)
                `);

            await pool.request()
            .input('student_id', sql.Char(13), studentID)
            .input('DateFrom', sql.Date, dateFrom)
            .input('DateTo', sql.Date, dateTo)
            .query(`
                DELETE FROM [HostelManagementDB].[dbo].[StudentsLeaveRequests]
                WHERE student_id = @student_id AND DateFrom = @DateFrom AND DateTo = @DateTo
            `);
        }


        res.status(200).json({ message: 'Leave request confirmed, processed successfully, and deleted from request table' });
        
    } catch (error) {
        console.error('Error approving leave request:', error);
        res.status(500).json({ message: "Server error: " + error.message });
    }
});





router.delete('/admin/leave-request/reject', async (req, res) => {
    const { studentID, dateFrom, dateTo } = req.body;

    // Check if all required inputs are provided
    if (!studentID || !dateFrom || !dateTo) {
        return res.status(400).json({ message: 'studentID, dateFrom, and dateTo are required.' });
    }

    try {
        const pool = await openPool();

        // First, update the status in the StudentsLeaveHistory table
        await pool.request()
            .input('student_id', sql.Char(13), studentID)
            .input('DateFrom', sql.Date, dateFrom)
            .input('DateTo', sql.Date, dateTo)
            .query(`
                UPDATE [HostelManagementDB].[dbo].[StudentsLeaveHistory]
                SET Status = 'Rejected' 
                WHERE student_id = @student_id AND DateFrom = @DateFrom AND DateTo = @DateTo
            `);

        // Then, delete the leave request from StudentsLeaveRequests table
        await pool.request()
            .input('student_id', sql.Char(13), studentID)
            .input('DateFrom', sql.Date, dateFrom)
            .input('DateTo', sql.Date, dateTo)
            .query(`
                DELETE FROM [HostelManagementDB].[dbo].[StudentsLeaveRequests]
                WHERE student_id = @student_id AND DateFrom = @DateFrom AND DateTo = @DateTo
            `);

        // If both queries run successfully, return success message
        res.status(200).json({ message: 'Leave request deleted successfully and status updated in history' });

    } catch (error) {
        console.error('Error deleting leave request:', error);
        res.status(500).json({ message: 'Server error: ' + error.message });
    }
});

module.exports = router;
