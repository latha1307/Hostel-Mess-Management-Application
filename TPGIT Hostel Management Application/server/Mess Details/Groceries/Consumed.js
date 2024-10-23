const sql = require('mssql/msnodesqlv8');
const express = require("express");
const { openPool } = require('../../database');

const router = express.Router();


router.get('/admin/grocery/consumed', async (req, res) => {
    try {
        const pool = await openPool();
        const query = `
            SELECT 
                cc.ConsumedID,
                pp.PurchasedID,
                pp.CategoryID,
                c.CategoryName,
                pp.ItemName,
                cc.ConsumedQty,
                pp.PurchasedQty,
                cc.ConsumedCostTotal,
                pp.PurchasedCostPerKg,
                pp.RemainingQty,
                pp.PurchasedTotalCost,
                cc.DateofConsumed
            FROM 
                [HostelManagementDB].[dbo].[ConsumedProducts] cc
            JOIN 
                [HostelManagementDB].[dbo].[PurchasedProducts] pp ON cc.PurchasedID = pp.PurchasedID
            JOIN 
                [HostelManagementDB].[dbo].[Category] c ON pp.CategoryID = c.CategoryID
        `;

        const result = await pool.request().query(query);

        const ConsumedProducts = result.recordset.map(product => ({
            ConsumedID: product.ConsumedID,
            PurchasedID: product.PurchasedID,
            CategoryID: product.CategoryID,
            CategoryName: product.CategoryName,
            ItemName: product.ItemName,
            ConsumedQty: product.ConsumedQty,
            RemainingQty: product.RemainingQty,
            PurchasedQty: product.PurchasedQty,
            ConsumedCostTotal: product.ConsumedCostTotal,
            PurchasedCostPerKg: product.PurchasedCostPerKg,
            PurchasedTotalCost: product.PurchasedTotalCost,
            DateofConsumed: product.DateofConsumed
        }));

        res.status(200).json(ConsumedProducts);
    } catch (error) {
        console.error('Error fetching consumed products:', error);
        res.status(500).json({ message: "Server error: " + error.message });
    }
});



router.get('/admin/grocery/purchased/item-name', async (req, res) => {
    try {
        const pool = await openPool();
        const query = `
            SELECT ItemName, CategoryID, PurchasedQty
            FROM [HostelManagementDB].[dbo].[PurchasedProducts]
        `;

        const result = await pool.request().query(query);

        res.status(200).json(result.recordset); 
    } catch (error) {
        console.error('Error fetching item names and categories:', error);
        res.status(500).json({ message: "Server error: " + error.message });
    }
});


router.post('/admin/grocery/consumed', async (req, res) => {
    const { categoryID, itemName, consumedQty, dateOfConsuming } = req.body;
    console.log(req.body); // Log the request body

    try {
        // Validate input
        if (!categoryID || !itemName || !consumedQty || !dateOfConsuming) {
            return res.status(400).json({ message: 'All fields are required.' });
        }

        const pool = await openPool();

        // Step 1: Get PurchasedID and RemainingQty
        const purchasedQuery = `
            SELECT PurchasedID, RemainingQty, PurchasedCostPerKg
            FROM [HostelManagementDB].[dbo].[PurchasedProducts]
            WHERE ItemName = @itemName AND CategoryID = @categoryID
        `;

        const purchasedResult = await pool.request()
            .input('itemName', sql.NVarChar(255), itemName)
            .input('categoryID', sql.Int, categoryID)
            .query(purchasedQuery);

        if (purchasedResult.recordset.length === 0) {
            return res.status(404).json({ message: 'Item not found in purchased products.' });
        }

        const { PurchasedID, RemainingQty, PurchasedCostPerKg } = purchasedResult.recordset[0];

        // Step 2: Check if consumed quantity exceeds remaining quantity
        if (consumedQty > RemainingQty) {
            return res.status(400).json({ message: 'Consumed quantity exceeds available remaining quantity.' });
        }

        // Step 3: Insert into ConsumedProducts table
        const insertQuery = `
            INSERT INTO [HostelManagementDB].[dbo].[ConsumedProducts] 
            (PurchasedID, ConsumedQty, ConsumedCostPerKg, DateofConsumed)
            VALUES (@PurchasedID, @consumedQty, @PurchasedCostPerKg, @dateOfConsuming)
        `;

        await pool.request()
            .input('PurchasedID', sql.Int, PurchasedID)
            .input('consumedQty', sql.Int, consumedQty)
            .input('PurchasedCostPerKg', sql.Decimal(10, 2), PurchasedCostPerKg)
            .input('dateOfConsuming', sql.Date, dateOfConsuming)
            .query(insertQuery);

        // Step 4: Update RemainingQty in PurchasedProducts table
        const updateRemainingQtyQuery = `
            UPDATE [HostelManagementDB].[dbo].[PurchasedProducts]
            SET RemainingQty = RemainingQty - @consumedQty
            WHERE PurchasedID = @PurchasedID
        `;

        await pool.request()
            .input('consumedQty', sql.Int, consumedQty)
            .input('PurchasedID', sql.Int, PurchasedID)
            .query(updateRemainingQtyQuery);

        return res.status(201).json({ message: 'Item added successfully.' });

    } catch (error) {
        console.error('Error adding consumed product:', error);
        return res.status(500).json({ message: 'Server error: ' + error.message });
    }
});



router.put('/admin/grocery/consumed/:id', async (req, res) => {
    const { categoryID, itemName, consumedQty, dateOfConsuming } = req.body;
    const consumedID = req.params.id; // Get the ID from the URL parameter

    try {
        // Validate input
        if (!categoryID || !itemName || !consumedQty || !dateOfConsuming) {
            return res.status(400).json({ message: 'All fields are required.' });
        }

        const pool = await openPool();

        // Step 1: Get PurchasedID, old ConsumedQty, and RemainingQty for this ConsumedID
        const consumedQuery = `
            SELECT cc.PurchasedID, cc.ConsumedQty, pp.RemainingQty, pp.PurchasedCostPerKg
            FROM [HostelManagementDB].[dbo].[ConsumedProducts] cc
            JOIN [HostelManagementDB].[dbo].[PurchasedProducts] pp 
            ON cc.PurchasedID = pp.PurchasedID
            WHERE cc.ConsumedID = @consumedID
        `;

        const consumedResult = await pool.request()
            .input('consumedID', sql.Int, consumedID)
            .query(consumedQuery);

        if (consumedResult.recordset.length === 0) {
            return res.status(404).json({ message: 'Consumed product not found.' });
        }

        const { PurchasedID, ConsumedQty: oldConsumedQty, RemainingQty, PurchasedCostPerKg } = consumedResult.recordset[0];

        // Step 2: Calculate the difference in consumed quantity
        const qtyDifference = consumedQty - oldConsumedQty;

        if (qtyDifference > 0 && qtyDifference > RemainingQty) {
            return res.status(400).json({ message: 'Increased consumed quantity exceeds available remaining quantity.' });
        }

        // Step 3: Update ConsumedProducts table with new consumedQty and date
        const updateConsumedQuery = `
            UPDATE [HostelManagementDB].[dbo].[ConsumedProducts]
            SET ConsumedQty = @consumedQty, 
                ConsumedCostPerKg = @PurchasedCostPerKg, 
                DateofConsumed = @dateOfConsuming
            WHERE ConsumedID = @consumedID
        `;

        await pool.request()
            .input('consumedQty', sql.Int, consumedQty)
            .input('PurchasedCostPerKg', sql.Decimal(10, 2), PurchasedCostPerKg)
            .input('dateOfConsuming', sql.Date, dateOfConsuming)
            .input('consumedID', sql.Int, consumedID)
            .query(updateConsumedQuery);

        // Step 4: Update RemainingQty in PurchasedProducts table
        let updateRemainingQtyQuery = '';
        if (qtyDifference < 0) {
            // Decrease in consumed quantity, add back to RemainingQty
            updateRemainingQtyQuery = `
                UPDATE [HostelManagementDB].[dbo].[PurchasedProducts]
                SET RemainingQty = RemainingQty + @qtyDifference
                WHERE PurchasedID = @PurchasedID
            `;
        } else if (qtyDifference > 0) {
            // Increase in consumed quantity, subtract from RemainingQty
            updateRemainingQtyQuery = `
                UPDATE [HostelManagementDB].[dbo].[PurchasedProducts]
                SET RemainingQty = RemainingQty - @qtyDifference
                WHERE PurchasedID = @PurchasedID
            `;
        }

        if (qtyDifference !== 0) {
            await pool.request()
                .input('qtyDifference', sql.Int, Math.abs(qtyDifference)) // Use absolute value
                .input('PurchasedID', sql.Int, PurchasedID)
                .query(updateRemainingQtyQuery);
        }

        // Return a success message
        return res.status(200).json({ message: 'Item updated successfully.' });

    } catch (error) {
        console.error('Error updating consumed product:', error);
        return res.status(500).json({ message: 'Server error: ' + error.message });
    }
});

router.delete('/admin/grocery/consumed/:id', async (req, res) => {
    const consumedID = req.params.id; 

    try {
        const pool = await openPool();

        // Step 1: Get the consumed product details
        const consumedQuery = `
            SELECT PurchasedID, ConsumedQty
            FROM [HostelManagementDB].[dbo].[ConsumedProducts]
            WHERE ConsumedID = @consumedID
        `;

        const consumedResult = await pool.request()
            .input('consumedID', sql.Int, consumedID)
            .query(consumedQuery);

        if (consumedResult.recordset.length === 0) {
            return res.status(404).json({ message: 'Consumed product not found.' });
        }

        const { PurchasedID, ConsumedQty } = consumedResult.recordset[0];

        // Step 2: Update the RemainingQty in PurchasedProducts table
        const updateRemainingQtyQuery = `
            UPDATE [HostelManagementDB].[dbo].[PurchasedProducts]
            SET RemainingQty = RemainingQty + @consumedQty
            WHERE PurchasedID = @PurchasedID
        `;

        await pool.request()
            .input('consumedQty', sql.Int, ConsumedQty)
            .input('PurchasedID', sql.Int, PurchasedID)
            .query(updateRemainingQtyQuery);

        // Step 3: Delete the consumed product
        const deleteQuery = `
            DELETE FROM [HostelManagementDB].[dbo].[ConsumedProducts]
            WHERE ConsumedID = @consumedID
        `;

        await pool.request()
            .input('consumedID', sql.Int, consumedID)
            .query(deleteQuery);

        return res.status(200).json({ message: 'Item deleted successfully.' });

    } catch (error) {
        console.error('Error deleting consumed product:', error);
        return res.status(500).json({ message: 'Server error: ' + error.message });
    }
});




module.exports = router;


