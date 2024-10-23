const sql = require('mssql/msnodesqlv8');
const express = require("express");
const { openPool } = require('../database');

const router = express.Router();


router.get('/admin/leave-verification', async (req, res) => {

    try {
        
        const pool = await openPool(); 

        const query = `
            SELECT 
                student_id,
                StudentName,
                RegNo,
                DateFrom,
                DateTo,
                NoOfDays
            FROM [HostelManagementDB].[dbo].[MonthlyLeaveVerification] 
        `;

        const result = await pool.request().query(query);

        const leaveVerification = result.recordset.map(product => ({
            student_id: product.student_id,
            StudentName: product.StudentName,
            RegNo: product.RegNo,
            DateFrom: product.DateFrom,
            DateTo: product.DateTo,
            NoOfDays: product.NoOfDays

        }));

        res.status(200).json(leaveVerification);
    } catch (error) {
        console.error('Error fetching consumed products:', error);
        res.status(500).json({ message: "Server error: " + error.message });
    }
});

router.post('/admin/leave-verification/approved', async (req, res) => {
    const { studentID, dateFrom, dateTo, status, noOfDays, monthYear } = req.body;

    try {
        // Ensure dates are formatted correctly for SQL Server (YYYY-MM-DD)
        const formattedDateFrom = new Date(dateFrom).toISOString().split('T')[0];
        const formattedDateTo = new Date(dateTo).toISOString().split('T')[0];

        const pool = await openPool();

        // Step 1: Update the leave status in the MonthlyLeaveVerification table
        await pool.request()
            .input('student_id', sql.Char(13), studentID)
            .input('DateFrom', sql.Date, formattedDateFrom)
            .input('DateTo', sql.Date, formattedDateTo)
            .input('status', sql.VarChar(50), status) 
            .query(`
                UPDATE [HostelManagementDB].[dbo].[MonthlyLeaveVerification]
                SET status = @status
                WHERE student_id = @student_id AND DateFrom = @DateFrom AND DateTo = @DateTo
            `);

        // If the leave request is approved, update the StudentsAttendance table
        if (status === 'Approved') {
            await pool.request()
                .input('StudentID', sql.Char(13), studentID)
                .input('DateFrom', sql.Date, formattedDateFrom)
                .input('DateTo', sql.Date, formattedDateTo)
                .input('NoOfDays', sql.Int, noOfDays)
                .input('MonthYear', sql.VarChar(7), monthYear)  // Assuming MonthYear is a varchar(7)
                .query(`
                    UPDATE [HostelManagementDB].[dbo].[StudentsAttendance]
                    SET BillableDays = BillableDays - @NoOfDays + 2, NoOfLeaveDays = NoOfLeaveDays + @NoOfDays
                    WHERE StudentID = @StudentID AND calculated = 0 AND MonthYear = @MonthYear
                `);

            // Update the leave status in the StudentsLeaveHistory table
            await pool.request()
                .input('student_id', sql.Char(13), studentID)
                .input('DateFrom', sql.Date, formattedDateFrom)
                .input('DateTo', sql.Date, formattedDateTo)
                .input('status', sql.VarChar(50), status) 
                .query(`
                    UPDATE [HostelManagementDB].[dbo].[StudentsLeaveHistory]
                    SET Status = @status
                    WHERE student_id = @student_id AND DateFrom = @DateFrom AND DateTo = @DateTo
                `);

            // Delete the leave request from MonthlyLeaveVerification table
            await pool.request()
                .input('student_id', sql.Char(13), studentID)
                .input('DateFrom', sql.Date, formattedDateFrom)
                .input('DateTo', sql.Date, formattedDateTo)
                .query(`
                    DELETE FROM [HostelManagementDB].[dbo].[MonthlyLeaveVerification]
                    WHERE student_id = @student_id AND DateFrom = @DateFrom AND DateTo = @DateTo
                `);
        }

        res.status(200).json({ message: 'Leave request processed and deleted successfully' });
    } catch (error) {
        console.error('Error approving leave request:', error);
        res.status(500).json({ message: "Server error: " + error.message });
    }
});





router.put('/admin/leave-verification/update', async (req, res) => {
    const { studentID, newDateFrom, newDateTo, noOfDays } = req.body;
    console.log(req.body);  

    try {
        const pool = await openPool();

        // Step 1: Retrieve the old leave details from MonthlyLeaveVerification based on studentID
        const oldLeaveResult = await pool.request()
            .input('student_id', sql.Char(13), studentID)
            .query(`
                SELECT DateFrom, DateTo, NoOfDays 
                FROM [HostelManagementDB].[dbo].[MonthlyLeaveVerification]
                WHERE student_id = @student_id AND status = 'Confirmed'
            `);

        if (oldLeaveResult.recordset.length === 0) {
            return res.status(404).json({ message: 'No leave found for the provided student ID.' });
        }

        const oldLeave = oldLeaveResult.recordset[0];
        const oldDateFrom = oldLeave.DateFrom;
        const oldDateTo = oldLeave.DateTo;
        const oldNoOfDays = oldLeave.NoOfDays;  
        const newDaysCount = noOfDays;

        // Step 2: Update leave details in the MonthlyLeaveVerification table
        await pool.request()
            .input('student_id', sql.Char(13), studentID)
            .input('OldDateFrom', sql.Date, oldDateFrom)
            .input('OldDateTo', sql.Date, oldDateTo)
            .input('NewDateFrom', sql.Date, newDateFrom)
            .input('NewDateTo', sql.Date, newDateTo)
            .input('NoOfDays', sql.Int, newDaysCount)
            .query(`
                UPDATE [HostelManagementDB].[dbo].[MonthlyLeaveVerification]
                SET DateFrom = @NewDateFrom, 
                    DateTo = @NewDateTo, 
                    NoOfDays = @NoOfDays 
                WHERE student_id = @student_id 
                  AND DateFrom = @OldDateFrom 
                  AND DateTo = @OldDateTo
            `);

        // Step 3: Update leave history in StudentsLeaveHistory
        await pool.request()
            .input('student_id', sql.Char(13), studentID)
            .input('OldDateFrom', sql.Date, oldDateFrom)
            .input('OldDateTo', sql.Date, oldDateTo)
            .input('NewDateFrom', sql.Date, newDateFrom)
            .input('NewDateTo', sql.Date, newDateTo)
            .input('NoOfDays', sql.Int, newDaysCount)
            .query(`
                UPDATE [HostelManagementDB].[dbo].[StudentsLeaveHistory]
                SET DateFrom = @NewDateFrom, 
                    DateTo = @NewDateTo, 
                    NoOfDays = @NoOfDays
                WHERE student_id = @student_id 
                  AND DateFrom = @OldDateFrom 
                  AND DateTo = @OldDateTo
            `);

        // Response after updates
        res.status(200).json({ message: 'Leave verification details updated successfully' });

    } catch (error) {
        // Handle errors
        console.error('Error in updating leave details:', error);
        res.status(500).json({ message: "Server error: " + error.message });
    }
});




router.delete('/admin/leave-verification/reject', async (req, res) => {
    const { studentID, dateFrom, dateTo, noOfDays } = req.body;


     // Check if all required inputs are provided
     if (!studentID || !dateFrom || !dateTo || !noOfDays) {
        return res.status(400).json({ message: 'studentID, dateFrom, dateTo, noOfDays are required.' });
    }

    try {
        const pool = await openPool();

       
        await pool.request()
            .input('student_id', sql.Char(13), studentID)
            .input('DateFrom', sql.Date, dateFrom)
            .input('DateTo', sql.Date, dateTo)
            .input('NoOfDays', sql.Int, noOfDays)
            .query(`
                UPDATE [HostelManagementDB].[dbo].[MonthlyLeaveVerification]
                SET Status = 'Rejected' 
                WHERE student_id = @student_id AND DateFrom = @dateFrom AND DateTo = @dateTo
            `);

            // Delete the leave request from StudentsLeaveRequests table
            await pool.request()
            .input('student_id', sql.Char(13), studentID)
            .input('DateFrom', sql.Date, dateFrom)
            .input('DateTo', sql.Date, dateTo)
            .query(`
                UPDATE [HostelManagementDB].[dbo].[StudentsLeaveHistory]
                SET Status = 'Rejected' 
                WHERE student_id = @student_id AND DateFrom = @DateFrom AND DateTo = @DateTo
            `);

        await pool.request()
            .input('student_id', sql.Char(13), studentID)
            .input('DateFrom', sql.Date, dateFrom)
            .input('DateTo', sql.Date, dateTo)
            .input('NoOfDays', sql.Int, noOfDays)
            .query(`
                DELETE [HostelManagementDB].[dbo].[MonthlyLeaveVerification]
                WHERE student_id = @student_id AND DateFrom = @dateFrom AND DateTo = @dateTo
            `);

            res.status(200).json({ message: 'Leave request deleted successfully and status updated in history' });
        

    } catch (error) {
        console.error('Error deleting leave request:', error);
        res.status(500).json({ message: "Server error: " + error.message });
    }
});

module.exports = router;
