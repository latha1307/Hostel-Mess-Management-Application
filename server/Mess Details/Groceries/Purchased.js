const sql = require('mssql/msnodesqlv8');
const express = require("express");
const { openPool } = require('../../database');

const router = express.Router();

// Route to get purchased products with category names
router.get('/admin/grocery/purchased', async (req, res) => {
    try {
        const pool = await openPool();
        const query = `
            SELECT 
                pp.PurchasedID,
                pp.CategoryID,
                c.CategoryName,
                pp.ItemID,
                pp.ItemName,
                pp.PurchasedQty,
                pp.RemainingQty,
                pp.PurchasedCostPerKg,
                pp.PurchasedTotalCost,
                pp.DateofPurchased
            FROM 
                [HostelManagementDB].[dbo].[PurchasedProducts] pp
            JOIN 
                [HostelManagementDB].[dbo].[Category] c ON pp.CategoryID = c.CategoryID
        `;

        const result = await pool.request().query(query);

        const PurchasedProducts = result.recordset.map(product => ({
            PurchasedID: product.PurchasedID,
            CategoryID: product.CategoryID,
            CategoryName: product.CategoryName,
            ItemID: product.ItemID,
            ItemName: product.ItemName,
            RemainingQty: product.RemainingQty,
            PurchasedQty: product.PurchasedQty,
            PurchasedCostPerKg: product.PurchasedCostPerKg,
            PurchasedTotalCost: product.PurchasedTotalCost,
            DateofPurchased: product.DateofPurchased
        }));

        res.status(200).json(PurchasedProducts);
    } catch (error) {
        console.error('Error fetching purchased products:', error);
        res.status(500).json({ message: "Server error: " + error.message });
    }
});

router.post('/admin/grocery/purchased', async (req, res) => {
    const { categoryID, itemName, purchasedQty, purchasedCostPerKg} = req.body;
    console.log(req.body); // Log the request body

    try {
        // Validate input
        if (!categoryID || !itemName || !purchasedQty || !purchasedCostPerKg) {
            return res.status(400).json({ message: 'All fields are required.' });
        }

        const pool = await openPool();

        let itemID;
        let insertItemQuery;

        // Determine the table to check based on categoryID
        if (categoryID === 1) { // Dairy
            insertItemQuery = `
                SELECT DairyProductsID FROM [HostelManagementDB].[dbo].[DairyProducts]
                WHERE ItemName = @ItemName
            `;
        } else if (categoryID === 2) { // Vegetables
            insertItemQuery = `
                SELECT VegetablesID FROM [HostelManagementDB].[dbo].[Vegetables]
                WHERE ItemName = @ItemName
            `;
        } else if (categoryID === 3) { // Provisions
            insertItemQuery = `
                SELECT ProvisionID FROM [HostelManagementDB].[dbo].[Provisions]
                WHERE ItemName = @ItemName
            `;
        } else {
            return res.status(400).json({ message: 'Invalid category ID.' });
        }

        // Check if the item already exists in the appropriate category table
        const checkResult = await pool.request()
            .input('ItemName', sql.NVarChar(255), itemName)
            .query(insertItemQuery);

        if (checkResult.recordset.length > 0) {
            // Item exists, get its ID
            if (categoryID === 1) {
                itemID = checkResult.recordset[0].DairyProductID;
            } else if (categoryID === 2) {
                itemID = checkResult.recordset[0].VegetablesID;
            } else if (categoryID === 3) {
                itemID = checkResult.recordset[0].ProvisionID;
            }
        } else {
            // If the item does not exist, insert it into the corresponding category table
            let insertCategoryQuery;

            if (categoryID === 1) { // Dairy
                insertCategoryQuery = `
                    INSERT INTO [HostelManagementDB].[dbo].[DairyProducts] (ItemName)
                    VALUES (@ItemName);
                    SELECT SCOPE_IDENTITY() AS DairyProductID;
                `;
            } else if (categoryID === 2) { // Vegetables
                insertCategoryQuery = `
                    INSERT INTO [HostelManagementDB].[dbo].[Vegetables] (ItemName)
                    VALUES (@ItemName);
                    SELECT SCOPE_IDENTITY() AS VegetablesID;
                `;
            } else if (categoryID === 3) { // Provisions
                insertCategoryQuery = `
                    INSERT INTO [HostelManagementDB].[dbo].[Provisions] (ItemName)
                    VALUES (@ItemName);
                    SELECT SCOPE_IDENTITY() AS ProvisionID;
                `;
            }

            const insertCategoryResult = await pool.request()
                .input('ItemName', sql.NVarChar(255), itemName)
                .query(insertCategoryQuery);

            // Retrieve the new item ID based on the category
            if (categoryID === 1) {
                itemID = insertCategoryResult.recordset[0].DairyProductID; 
            } else if (categoryID === 2) {
                itemID = insertCategoryResult.recordset[0].VegetablesID; 
            } else if (categoryID === 3) {
                itemID = insertCategoryResult.recordset[0].ProvisionID; 
            }
        }

        // Now, insert the purchased product using the valid itemID
        const insertQuery = `
            INSERT INTO [HostelManagementDB].[dbo].[PurchasedProducts] 
            (CategoryID, ItemID, ItemName, PurchasedQty, PurchasedCostPerKg, DateofPurchased, RemainingQty)
            VALUES (@CategoryID, @ItemID, @ItemName, @PurchasedQty, @PurchasedCostPerKg, GETDATE(), @PurchasedQty)
        `;

        await pool.request()
            .input('CategoryID', sql.Int, categoryID)
            .input('ItemID', sql.Int, itemID) // Using the valid itemID
            .input('ItemName', sql.NVarChar(255), itemName)
            .input('PurchasedQty', sql.Int, purchasedQty)
            .input('PurchasedCostPerKg', sql.Decimal(10, 2), purchasedCostPerKg)
            .query(insertQuery);

        // Return a success message
        return res.status(201).json({ message: 'Item added successfully.' });

    } catch (error) {
        console.error('Error adding purchased product:', error);
        return res.status(500).json({ message: 'Server error: ' + error.message });
    }
});

router.put('/admin/grocery/purchased/:id', async (req, res) => {
    const { categoryID, itemName, purchasedQty, purchasedCostPerKg } = req.body;
    const purchasedID = req.params.id; // Get the purchased ID from the URL parameter
    console.log(req.body); // Log the request body

    try {
        // Validate input
        if (!categoryID || !itemName || !purchasedQty || !purchasedCostPerKg) {
            return res.status(400).json({ message: 'All fields are required.' });
        }

        const pool = await openPool();

        // Check if the purchased product exists
        const checkProductQuery = `
            SELECT * FROM [HostelManagementDB].[dbo].[PurchasedProducts]
            WHERE PurchasedID = @PurchasedID
        `;

        const checkResult = await pool.request()
            .input('PurchasedID', sql.Int, purchasedID)
            .query(checkProductQuery);

        if (checkResult.recordset.length === 0) {
            return res.status(404).json({ message: 'Purchased product not found.' });
        }

        // Update the purchased product
        const updateQuery = `
            UPDATE [HostelManagementDB].[dbo].[PurchasedProducts]
            SET CategoryID = @CategoryID,
                ItemName = @ItemName,
                PurchasedQty = @PurchasedQty,
                PurchasedCostPerKg = @PurchasedCostPerKg,
                DateofPurchased = GETDATE() -- Optional: update purchase date to current date
            WHERE PurchasedID = @PurchasedID
        `;

        await pool.request()
            .input('CategoryID', sql.Int, categoryID)
            .input('ItemName', sql.NVarChar(255), itemName)
            .input('PurchasedQty', sql.Int, purchasedQty)
            .input('PurchasedCostPerKg', sql.Decimal(10, 2), purchasedCostPerKg)
            .input('PurchasedID', sql.Int, purchasedID) 
            .query(updateQuery);

        // Return a success message
        return res.status(200).json({ message: 'Purchased product updated successfully.' });

    } catch (error) {
        console.error('Error updating purchased product:', error);
        return res.status(500).json({ message: 'Server error: ' + error.message });
    }
});

router.delete('/admin/grocery/purchased/:id', async (req, res) => {
    const purchasedID = req.params.id; // Get the purchased ID from the URL parameter
    console.log(`Deleting product with ID: ${purchasedID}`);

    try {
        const pool = await openPool();

        // Check if the purchased product exists
        const checkProductQuery = `
            SELECT * FROM [HostelManagementDB].[dbo].[PurchasedProducts]
            WHERE PurchasedID = @PurchasedID
        `;

        const checkResult = await pool.request()
            .input('PurchasedID', sql.Int, purchasedID)
            .query(checkProductQuery);

        if (checkResult.recordset.length === 0) {
            return res.status(404).json({ message: 'Purchased product not found.' });
        }

        // Delete the purchased product
        const deleteQuery = `
            DELETE FROM [HostelManagementDB].[dbo].[PurchasedProducts]
            WHERE PurchasedID = @PurchasedID
        `;

        await pool.request()
            .input('PurchasedID', sql.Int, purchasedID) // Use the ID of the product to delete
            .query(deleteQuery);

        // Return a success message
        return res.status(200).json({ message: 'Purchased product deleted successfully.' });

    } catch (error) {
        console.error('Error deleting purchased product:', error);
        return res.status(500).json({ message: 'Server error: ' + error.message });
    }
});

module.exports = router;


