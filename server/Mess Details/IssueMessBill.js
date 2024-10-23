const express = require('express');
const { openPool } = require('../database');
const sql = require('mssql'); 
const router = express.Router();

router.post('/calculate-bill', async (req, res) => {
    const { selectedMonth, selectedYear } = req.body;
    console.log(req.body);

    // Validate input
    if (selectedMonth < 1 || selectedMonth > 12 || selectedYear < 1900) {
        return res.status(400).json({ error: 'Invalid month or year.' });
    }

    try {
        const pool = await openPool();
        const request = pool.request();


        const monthYear = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`;

        // Set the input parameters before using them in the query
        request.input('Month', sql.Int, selectedMonth);
        request.input('Year', sql.Int, selectedYear);
        request.input('monthYear', sql.VarChar(7), monthYear);

        // Fetch total groceries consumed
        const groceriesResult = await request.query(`
            SELECT SUM(ConsumedCostTotal) AS TotalGroceries
            FROM ConsumedProducts
            WHERE MONTH(DateofConsumed) = @Month AND YEAR(DateofConsumed) = @Year
        `);

        const totalGroceries = groceriesResult.recordset[0]?.TotalGroceries || 0;

        // Fetch total essentials
        const essentialsResult = await request.query(`
            SELECT SUM(TotalCost) AS TotalEssentials
            FROM GasUsage
            WHERE MONTH(DateUsed) = @Month AND YEAR(DateUsed) = @Year
        `);

        const totalEssentials = essentialsResult.recordset[0]?.TotalEssentials || 0;

        // Fetch total staff salaries
        const salariesResult = await request.query(`
            SELECT SUM(Salary) AS TotalStaffSalaries
            FROM StaffSalaries
            WHERE MONTH(DateIssued) = @Month AND YEAR(DateIssued) = @Year
        `);

        const totalStaffSalaries = salariesResult.recordset[0]?.TotalStaffSalaries || 0;

        // Fetch total headcount
        const attendanceResult = await request.query(`
            SELECT SUM(BillableDays) AS TotalHeadCount
            FROM StudentsAttendance
            WHERE MonthYear = @monthYear
        `);

        const totalHeadCount = attendanceResult.recordset[0]?.TotalHeadCount || 0;

        // Construct the response
        const response = {
            totalGroceries,
            totalEssentials,
            totalStaffSalaries,
            totalHeadCount,
        };

        // Send the response
        res.status(200).json(response);
    } catch (error) {
        console.error('Error calculating bill:', error);
        res.status(500).json({ error: 'An error occurred while calculating the bill.' });
    }
});

router.post("/admin/issue-mess-bill", async (req, res) => {
    const {
        TotalGroceries, TotalEssentials, TotalStaffSalaries, 
        TotalReduction, TotalHeadCounts, FinalAmount, 
        PerDayAmount, MonthYear
    } = req.body;

    try {
        const pool = await openPool();

        // First Query: Insert into HistoryOfMessBill
        const insertMessBillQuery = `
            INSERT INTO [HostelManagementDB].[dbo].[HistoryOfMessBill] 
            (TotalGroceries, TotalEssentials, TotalStaffSalaries, 
             TotalReduction, TotalHeadCounts, FinalAmount, 
             PerDayAmount, MonthYear, DateOfIssued)
            VALUES (@TotalGroceries, @TotalEssentials, @TotalStaffSalaries, 
                    @TotalReduction, @TotalHeadCounts, @FinalAmount, 
                    @PerDayAmount, @MonthYear, GETDATE())`;

        // Execute the first query using a new request object
        await pool.request()
            .input('TotalGroceries', sql.Decimal(10, 2), TotalGroceries)
            .input('TotalEssentials', sql.Decimal(10, 2), TotalEssentials)
            .input('TotalStaffSalaries', sql.Decimal(10, 2), TotalStaffSalaries)
            .input('TotalReduction', sql.Decimal(10, 2), TotalReduction)
            .input('TotalHeadCounts', sql.BigInt, TotalHeadCounts)
            .input('FinalAmount', sql.Decimal(10, 2), FinalAmount)
            .input('PerDayAmount', sql.Decimal(10, 2), PerDayAmount)
            .input('MonthYear', sql.VarChar(7), MonthYear)
            .query(insertMessBillQuery);

        // Second Query: Insert into StudentMessBill for each student
        const selectStudentsQuery = `
            SELECT sd.student_id AS StudentID, sd.student_name AS StudentName, sd.roll_no AS RegNo, sa.BillableDays, sa.TotalDays, sa.NoOfLeaveDays
            FROM [HostelManagementDB].[dbo].[StudentDetails] sd
            INNER JOIN [HostelManagementDB].[dbo].[StudentsAttendance] sa ON sd.student_id = sa.StudentID
            WHERE sa.MonthYear = @MonthYear`;

        const studentsResult = await pool.request()
            .input('MonthYear', sql.VarChar(7), MonthYear)
            .query(selectStudentsQuery);

        // If no students found, return an error response
        if (studentsResult.recordset.length === 0) {
            return res.status(404).json({ message: 'No student data found.' });
        }

        // Insert each student's bill into StudentMessBill table
        for (const student of studentsResult.recordset) {
            const insertStudentBillQuery = `
                INSERT INTO StudentMessBill (DateOfIssued, MonthYear, StudentID, StudentName, RegNo, PerDayAmount, BillableDays, Status, TotalDays, LeaveDays)
                VALUES (GETDATE(), @MonthYear, @StudentID, @StudentName, @RegNo, @PerDayAmount, @BillableDays, 'UnPaid', @TotalDays, @NoOfLeaveDays)`;

            // Create a new request object for each insert operation
            await pool.request()
                .input('MonthYear', sql.VarChar(7), MonthYear)
                .input('StudentID', sql.Char(13), student.StudentID)
                .input('StudentName', sql.VarChar, student.StudentName)
                .input('RegNo', sql.BigInt, student.RegNo)
                .input('PerDayAmount', sql.Decimal(10, 2), PerDayAmount)
                .input('BillableDays', sql.Int, student.BillableDays)
                .input('TotalDays', sql.Int, student.TotalDays)
                .input('NoOfLeaveDays', sql.Int, student.NoOfLeaveDays)
                .query(insertStudentBillQuery);
        }

        // Send success response after all student bills are inserted
        res.status(200).json({ message: "Mess bill and student mess bills issued successfully!" });

    } catch (error) {
        console.error("Error issuing mess bill:", error);
        res.status(500).json({ error: "An error occurred while issuing the mess bill." });
    }
});

router.get("/student-mess-bill", async (req, res) => {
    const { StudentID, Status } = req.query; // Using query parameters in GET request

    // Ensure that the Status is 'Unpaid'
    if (Status === 'Unpaid') {
        try {
            const pool = await openPool();

            // Prepare the SQL query to fetch student mess bill details
            const getStudentMessBillQuery = `
                SELECT DateOfIssued, PerDayAmount, BillableDays,TotalAmount, TotalDays,LeaveDays
                FROM [HostelManagementDB].[dbo].[StudentMessBill]
                WHERE StudentID = @StudentID AND Status = @Status`;

            // Execute the query with input parameters
            const result = await pool.request()
                .input('StudentID', sql.Char(13), StudentID) // Assuming StudentID is of type char(13)
                .input('Status', sql.VarChar(10), Status) // Assuming Status is varchar(10)
                .query(getStudentMessBillQuery);

            // If no results found, return a 404
            if (result.recordset.length === 0) {
                return res.status(404).json({ message: 'No unpaid mess bill found for the student.' });
            }

            // Return the result as JSON
            res.status(200).json(result.recordset);

        } catch (error) {
            console.error("Error fetching student mess bill:", error);
            res.status(500).json({ error: "An error occurred while fetching the student mess bill." });
        }
    } else {
        res.status(400).json({ message: 'Invalid status. Only "Unpaid" status is supported.' });
    }
});

router.get("/student-mess-bill-history", async (req, res) => {
    const { StudentID, Status } = req.query; // Using query parameters in GET request

    // Ensure that the Status is 'Unpaid'
    if (Status === 'Paid') {
        try {
            const pool = await openPool();

            // Prepare the SQL query to fetch student mess bill details
            const getStudentMessBillQuery = `
                SELECT DateOfIssued, PerDayAmount, BillableDays,TotalAmount, DateOfPayment, TotalDays,LeaveDays
                FROM [HostelManagementDB].[dbo].[StudentMessBill]
                WHERE StudentID = @StudentID AND Status = @Status`;

            // Execute the query with input parameters
            const result = await pool.request()
                .input('StudentID', sql.Char(13), StudentID) // Assuming StudentID is of type char(13)
                .input('Status', sql.VarChar(10), Status) // Assuming Status is varchar(10)
                .query(getStudentMessBillQuery);

            // If no results found, return a 404
            if (result.recordset.length === 0) {
                return res.status(404).json({ message: 'No unpaid mess bill found for the student.' });
            }

            // Return the result as JSON
            res.status(200).json(result.recordset);

        } catch (error) {
            console.error("Error fetching student mess bill:", error);
            res.status(500).json({ error: "An error occurred while fetching the student mess bill." });
        }
    } else {
        res.status(400).json({ message: 'Invalid status. Only "Unpaid" status is supported.' });
    }
});




module.exports = router;
