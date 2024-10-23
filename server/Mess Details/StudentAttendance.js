const express = require("express");
const { openPool } = require('../database');

const router = express.Router();

router.get('/admin/student-attendance', async (req, res) => {
    try {
        const pool = await openPool(); 
        const query = `
            SELECT 
                StudentID,
                StudentName,
                RegNo,
                NoOfLeaveDays,
                PresentDays,
                TotalDays,
                MonthYear,
                BillableDays
            FROM 
                [HostelManagementDB].[dbo].[StudentsAttendance]
        `;

        const result = await pool.request().query(query);

        if (!result || !result.recordset) {
            throw new Error('No data returned from the query');
        }


        const students = result.recordset.map(record => ({
            StudentID: record.StudentID,
            StudentName: record.StudentName,
            RegNo: record.RegNo,
            NoOfLeaveDays: record.NoOfLeaveDays,
            PresentDays: record.PresentDays,
            TotalDays: record.TotalDays,
            MonthYear: record.MonthYear,
            BillableDays: record.BillableDays
        }));

        res.status(200).json(students);
    } catch (error) {
        console.error('Error fetching student attendance:', error);
        res.status(500).json({ message: "Server error: " + error.message });
    }
});

module.exports = router;
