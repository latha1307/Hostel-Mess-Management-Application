const sql = require('mssql/msnodesqlv8');
const express = require("express");
const { openPool } = require('../database');

const router = express.Router();

router.get('/admin/staff-salaries', async (req, res) => {
    try {
        const pool = await openPool();
        const query = `
            SELECT 
                SalaryID,
                TypeofWork,  
                Salary,
                DateIssued
            FROM 
                [HostelManagementDB].[dbo].[StaffSalaries] 
        `;

        const result = await pool.request().query(query);

       
        const StaffSalaries = result.recordset.map(record => ({
            SalaryID: record.SalaryID,
            TypeofWork: record.TypeofWork,  
            Salary: record.Salary,
            DateIssued: record.DateIssued
        }));

        res.status(200).json(StaffSalaries);
    } catch (error) {
        console.error('Error fetching staff salaries:', error);
        res.status(500).json({ message: "Server error: " + error.message });
    }
});


router.post('/admin/staff-salaries', async (req, res) => {
    const { TypeofWork, Salary, DateIssued } = req.body;

    try {
        // Validate input
        if (!TypeofWork || !Salary || !DateIssued) {
            return res.status(400).json({ message: 'All fields are required.' });
        }

        const pool = await openPool();


        const insertSalaryQuery = `
            INSERT INTO [HostelManagementDB].[dbo].[StaffSalaries] 
            (TypeofWork, Salary, DateIssued)
            VALUES (@TypeofWork, @Salary, @DateIssued)
        `;
        
        await pool.request()
            .input('TypeofWork', sql.VarChar, TypeofWork)
            .input('Salary', sql.BigInt, Salary)
            .input('DateIssued', sql.Date, DateIssued)
            .query(insertSalaryQuery);

        return res.status(201).json({ message: 'Staff salary added successfully.' });

    } catch (error) {
        console.error('Error adding staff salary:', error);
        return res.status(500).json({ message: 'Server error: ' + error.message });
    }
});


router.put('/admin/staff-salaries/:id', async (req, res) => {
    const { TypeofWork, Salary, DateIssued } = req.body;
    const salaryID = req.params.id;

    try {
        // Validate input
        if (!TypeofWork || !Salary || !DateIssued ) {
            return res.status(400).json({ message: 'All fields are required.' });
        }

        const pool = await openPool();

       

        // Update staff salary
        const updateSalaryQuery = `
            UPDATE [HostelManagementDB].[dbo].[StaffSalaries]
            SET TypeofWork = @TypeofWork, Salary = @Salary, DateIssued = @DateIssued
            WHERE SalaryID = @salaryID
        `;
        
        await pool.request()
            .input('TypeofWork', sql.VarChar, TypeofWork)
            .input('Salary', sql.BigInt, Salary)
            .input('DateIssued', sql.Date, DateIssued)
            .input('salaryID', sql.Int, salaryID)
            .query(updateSalaryQuery);

        return res.status(200).json({ message: 'Staff salary updated successfully.' });

    } catch (error) {
        console.error('Error updating staff salary:', error);
        return res.status(500).json({ message: 'Server error: ' + error.message });
    }
});


router.delete('/admin/staff-salaries/:id', async (req, res) => {
    const salaryID = req.params.id;

    try {
        const pool = await openPool();

        // Delete staff salary
        const deleteQuery = `
            DELETE FROM [HostelManagementDB].[dbo].[StaffSalaries]
            WHERE SalaryID = @salaryID
        `;

        await pool.request()
            .input('salaryID', sql.Int, salaryID)
            .query(deleteQuery);

        return res.status(200).json({ message: 'Staff salary deleted successfully.' });

    } catch (error) {
        console.error('Error deleting staff salary:', error);
        return res.status(500).json({ message: 'Server error: ' + error.message });
    }
});





module.exports = router;


