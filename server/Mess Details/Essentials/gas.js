const sql = require('mssql/msnodesqlv8');
const express = require("express");
const { openPool } = require('../../database');

const router = express.Router();


router.get('/admin/essentials/gas', async (req, res) => {
    try {
        const pool = await openPool();
        const query = `
            SELECT 
                *
            FROM 
                [HostelManagementDB].[dbo].[GasUsage] 
           
        `;

        const result = await pool.request().query(query);

        const GasUsage = result.recordset.map(product => ({
            UsageID: product.UsageID,
            DateUsed: product.DateUsed,
            CylinderQty: product.CylinderQty,
            CostPerCylinder: product.CostPerCylinder,
            TotalCost: product.TotalCost
        }));

        res.status(200).json(GasUsage);
    } catch (error) {
        console.error('Error fetching gas details:', error);
        res.status(500).json({ message: "Server error: " + error.message });
    }
});



router.post('/admin/essentials/gas', async (req, res) => {
    const { DateUsed, CylinderQty, CostPerCylinder } = req.body;
    
    try {
        const pool = await openPool();
        const query = `
            INSERT INTO [HostelManagementDB].[dbo].[GasUsage] 
            (DateUsed, CylinderQty, CostPerCylinder)
            VALUES (@DateUsed, @CylinderQty, @CostPerCylinder)
        `;
        

        await pool.request()
            .input('DateUsed', sql.Date, DateUsed)
            .input('CylinderQty', sql.Decimal(10, 2), CylinderQty)
            .input('CostPerCylinder', sql.Decimal(10, 2), CostPerCylinder)
            .query(query);

        res.status(201).json({ message: 'Gas usage record added successfully' });
    } catch (error) {
        console.error('Error adding gas usage record:', error);
        res.status(500).json({ message: "Server error: " + error.message });
    }
});


router.put('/admin/essentials/gas/:id', async (req, res) => {
    const { id } = req.params;
    const { DateUsed, CylinderQty, CostPerCylinder } = req.body;

    try {
        const pool = await openPool();
        const query = `
            UPDATE [HostelManagementDB].[dbo].[GasUsage]
            SET DateUsed = @DateUsed,
                CylinderQty = @CylinderQty,
                CostPerCylinder = @CostPerCylinder
            WHERE UsageID = @UsageID
        `;


        await pool.request()
            .input('UsageID', sql.Int, id)
            .input('DateUsed', sql.Date, DateUsed)
            .input('CylinderQty', sql.Decimal(10, 2), CylinderQty)
            .input('CostPerCylinder', sql.Decimal(10, 2), CostPerCylinder)
            .query(query);

        res.status(200).json({ message: 'Gas usage record updated successfully' });
    } catch (error) {
        console.error('Error updating gas usage record:', error);
        res.status(500).json({ message: "Server error: " + error.message });
    }
});



router.delete('/admin/essentials/gas/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const pool = await openPool();
        const query = `
            DELETE FROM [HostelManagementDB].[dbo].[GasUsage]
            WHERE UsageID = @UsageID
        `;

        const result = await pool.request()
            .input('UsageID', sql.Int, id)
            .query(query);

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ message: 'Gas usage record not found' });
        }

        res.status(200).json({ message: 'Gas usage record deleted successfully' });
    } catch (error) {
        console.error('Error deleting gas usage record:', error);
        res.status(500).json({ message: "Server error: " + error.message });
    }
});

module.exports = router;


