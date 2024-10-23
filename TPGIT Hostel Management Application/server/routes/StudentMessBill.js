const express = require('express');
const router = express.Router();
const sql = require('mssql');
const { openPool } = require('../database'); // Adjust the path based on your structure

// Fetch current mess bill for a student
router.get('/student-mess-bill/:id', async (req, res) => {
    const studentId = req.params.id;

    try {
        const pool = await openPool();
        const query = `
            SELECT [StudentID], [StudentName], [RegNo], [DateIssued], [lastDate],
                         [BillableDays], [LeaveTaken], [TotalDays], [PerDayAmount], 
                         [TotalAmount], [Status]
            FROM [dbo].[HistoryOfStudentMessBill]
            WHERE [StudentID] = @studentId
            ORDER BY [DateIssued] DESC
        `;

        const result = await pool.request()
            .input('studentId', sql.VarChar, studentId)
            .query(query);

        if (result.recordset.length === 0) {
            return res.status(404).json({ message: 'No mess bill found for this student.' });
        }

        const billData = result.recordset[0];
        res.status(200).json(billData);
    } catch (error) {
        console.error('Error fetching mess bill:', error);
        res.status(500).json({ message: 'Server error: ' + error.message });
    }
});

// Fetch mess bill history for a student
router.get('/student-mess-bill-history/:id', async (req, res) => {
    const studentId = req.params.id;

    try {
        const pool = await openPool();
        const query = `
            SELECT [StudentID], [StudentName], [RegNo], [DateIssued], [lastDate],
                   [BillableDays], [LeaveTaken], [TotalDays], [PerDayAmount], 
                   [TotalAmount], [Status]
            FROM [dbo].[HistoryOfStudentMessBill]
            WHERE [StudentID] = @studentId
            ORDER BY [DateIssued] DESC
        `;

        const result = await pool.request()
            .input('studentId', sql.VarChar, studentId)
            .query(query);

        const historyData = result.recordset;

        if (historyData.length === 0) {
            return res.status(404).json({ message: 'No mess bill history found for this student.' });
        }

        res.status(200).json(historyData);
    } catch (error) {
        console.error('Error fetching mess bill history:', error);
        res.status(500).json({ message: 'Server error: ' + error.message });
    }
});

module.exports = router;
