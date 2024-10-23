import { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  CircularProgress,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
} from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';


export const GroceryConsumedTable = () => {
  const [consumedProducts, setConsumedProducts] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [consumedID, setConsumedID] = useState(null);


  
  const [selectedMonth, setSelectedMonth] = useState(-1); 

  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [itemCategory, setItemCategory] = useState('');
  const [itemName, setItemName] = useState('');
  const [consumedQty, setConsumedQty] = useState('');
  const [dateOfConsuming, setDateOfConsuming] = useState('');
  const [availableItems, setAvailableItems] = useState([]); 
  const [maxQty, setMaxQty] = useState(0);

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const months = [
    "ALL","January", "February", "March", "April", "May", "June", 
    "July", "August", "September", "October", "November", "December"
  ];


  const years = Array.from(new Array(5), (v, i) => new Date().getFullYear() - i);

  const filteredConsumedProducts = consumedProducts.filter(product => {
    const consumeDate = new Date(product.DateofConsumed);

    const yearMatches = consumeDate.getFullYear() === selectedYear;

    if (selectedMonth === -1) {
      return yearMatches; 
    }

    return yearMatches && consumeDate.getMonth() === selectedMonth - 1;
  });
  

  const fetchConsumedProducts = async () => {
    try {
      const response = await axios.get("http://localhost:8081/api/admin/grocery/consumed");
      console.log(response.data)
      if (Array.isArray(response.data)) {
        setConsumedProducts(response.data);
      } else {
        console.error("Expected an array but got:", response.data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false); // Set loading to false after fetching data
    }
  };

  useEffect(() => {
    fetchConsumedProducts(); // Call the function to fetch data
  }, []);

  useEffect(() => {
    const fetchPurchasedItems = async () => {
      try {
        const response = await axios.get('http://localhost:8081/api/admin/grocery/purchased/item-name');
        setAvailableItems(response.data); // Set the fetched items
        console.log('Fetched items:', response.data); 
      } catch (error) {
        console.error('Error fetching items:', error);
      }
    };

    fetchPurchasedItems();
  }, []);

  const handleItemSelection = (event, value) => {
    const selectedItem = availableItems.find(item => item.ItemName === value);
  
    if (selectedItem) {
      setItemName(selectedItem.ItemName);
      setItemCategory(selectedItem.CategoryID); // Automatically set the category
      setMaxQty(selectedItem.PurchasedQty || 0); // Ensure max quantity is set
    }
  };
  

 
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Dialog handlers
  const handleDialogOpen = () => {
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    // Reset form fields when closing the dialog
    setItemCategory('');
    setItemName('');
    setConsumedQty('');
  };


  const handleAddItem = async () => {
    const newItem = {
      categoryID: itemCategory, 
      itemName: itemName, 
      consumedQty: consumedQty, 
      dateOfConsuming: dateOfConsuming
    };

    try {

      await axios.post("http://localhost:8081/api/admin/grocery/consumed", newItem);

      handleDialogClose(); 
      await fetchConsumedProducts(); 
    } catch (err) {
      console.error("Error adding item:", err);

      alert("Failed to add item: " + err.response?.data?.message || err.message);
    }
};

const handleEditDialogOpen = (product) => {
  setEditingProduct(product);
  setConsumedID(product.ConsumedID)
  setItemName(product.ItemName);
  setItemCategory(product.CategoryID);
  setConsumedQty(product.ConsumedQty);
  setDateOfConsuming(new Date(product.DateofConsumed).toISOString().split('T')[0]); // Format date
  setEditDialogOpen(true);
};

const handleEditDialogClose = () => {
  setEditDialogOpen(false);
  setEditingProduct(null);
};


const handleEditItem = async () => {
  const updatedItem = {
    ...editingProduct,
    consumedID, 
    categoryID: itemCategory,
    itemName: itemName,
    consumedQty: consumedQty,
    dateOfConsuming: dateOfConsuming
  };

  try {
    await axios.put(`http://localhost:8081/api/admin/grocery/consumed/${consumedID}`, updatedItem);
    handleEditDialogClose(); 
    // Re-fetch the data after editing
    await fetchConsumedProducts();
  } catch (err) {
    console.error("Error updating item:", err);
    alert("Failed to update item: " + err.response?.data?.message || err.message);
  }
};


const handleDeleteItem = async (id) => {
  if (window.confirm("Are you sure you want to delete this item?")) {
    try {

      console.log("Deleting item with ID:", id);

      await axios.delete(`http://localhost:8081/api/admin/grocery/consumed/${id}`);
      await fetchConsumedProducts(); // Re-fetch the data after deletion
    } catch (err) {
      console.error("Error deleting item:", err);
      alert("Failed to delete item: " + err.response?.data?.message || err.message);
    }
  }
};

  if (loading) {
    return (
      <Paper>
        <CircularProgress />
        <Typography>Loading...</Typography>
      </Paper>
    );
  }

  if (error) {
    return (
      <Paper>
        <Typography color="error">Error fetching data: {error}</Typography>
      </Paper>
    );
  }

  return (
    <div>
      <div className='flex justify-between'>
      
      <div style={{ marginBottom: '20px' }}>
      <TextField
          select
          label="Select Month"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          sx={{ marginRight: '20px' }}
        >
          {months.map((month, index) => (
            <MenuItem key={index} value={index === 0 ? -1 : index}>{month}</MenuItem>
          ))}
        </TextField>

        <TextField
          select
          label="Select Year"
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
        >
          {years.map((year) => (
            <MenuItem key={year} value={year}>
              {year}
            </MenuItem>
          ))}
        </TextField>
      </div>
      <Button variant="contained" sx={ {marginBottom: '20px'}} color="primary" onClick={handleDialogOpen}>
        Add Item
      </Button>
      </div>

      <Dialog open={dialogOpen} onClose={handleDialogClose}>
        <DialogTitle>Add Grocery Item</DialogTitle>
        <DialogContent>
        <Autocomplete
  options={availableItems.map(item => item.ItemName)} 
  value={itemName}
  onChange={handleItemSelection} 
  renderInput={(params) => (
    <TextField
      {...params}
      label="Item Name"
      fullWidth
      margin="dense"
    />
  )}
/>



<TextField
  select
  label="Item Category"
  fullWidth
  value={itemCategory} // This will automatically be set based on the selected item
  onChange={(e) => setItemCategory(e.target.value)}
  margin="dense"
>
  <MenuItem value={1}>Dairy</MenuItem>
  <MenuItem value={2}>Vegetables</MenuItem>
  <MenuItem value={3}>Provisions</MenuItem>
</TextField>

          
<TextField
  label="Consumed Quantity"
  type="number"
  fullWidth
  value={consumedQty}
  onChange={(e) => {
    const value = e.target.value;
    if (value <= maxQty) {
      setConsumedQty(value); // Only set the value if it is less than or equal to maxQty
    } else {
      // Optional: You can also set it to maxQty if the user tries to input a higher value
      setConsumedQty(maxQty);
      alert(`Maximum allowed quantity is ${maxQty} kg.`); // Optional: Show an alert
    }
  }}
  margin="dense"
  inputProps={{
    max: maxQty, // Set maximum quantity allowed
  }}
  helperText={`Max: ${maxQty} kg`} // Show max value as a helper text
/>

          <TextField
      label="Date Of Consumed"
      type="date"
      fullWidth
      value={dateOfConsuming} 
      onChange={(e) => setDateOfConsuming(e.target.value)} 
      margin="dense"
      InputLabelProps={{
        shrink: true, 
      }}
    />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleAddItem} color="primary">
            Add
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={editDialogOpen} onClose={handleEditDialogClose}>
        <DialogTitle>Edit Grocery Item</DialogTitle>
        <DialogContent>
          <Autocomplete
            options={availableItems.map(item => item.ItemName)}
            value={itemName}
            onChange={handleItemSelection}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Item Name"
                fullWidth
                margin="dense"
              />
            )}
          />
          <TextField
            select
            label="Item Category"
            fullWidth
            value={itemCategory} // This will automatically be set based on the selected item
            onChange={(e) => setItemCategory(e.target.value)}
            margin="dense"
          >
            <MenuItem value={1}>Dairy</MenuItem>
            <MenuItem value={2}>Vegetables</MenuItem>
            <MenuItem value={3}>Provisions</MenuItem>
          </TextField>
          <TextField
            label="Consumed Quantity"
            type="number"
            fullWidth
            value={consumedQty}
            onChange={(e) => setConsumedQty(e.target.value)}
            margin="dense"
            InputProps={{ inputProps: { min: 0, max: maxQty } }} // Limit input
          />
          <TextField
            label="Date of Consuming"
            type="date"
            fullWidth
            value={dateOfConsuming}
            onChange={(e) => setDateOfConsuming(e.target.value)}
            margin="dense"
            InputLabelProps={{ shrink: true }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditDialogClose}>Cancel</Button>
          <Button onClick={handleEditItem} color="primary">Save</Button>
        </DialogActions>
      </Dialog>

      <Paper>
  <TableContainer style={{ maxHeight: '400px', overflowY: 'auto' }}>
    <Table stickyHeader>
      <TableHead>
        <TableRow>
          <TableCell sx={{ backgroundColor: '#3f51b5', color: '#fff' }}>Item Name</TableCell>
          <TableCell sx={{ backgroundColor: '#3f51b5', color: '#fff' }}>Category Name</TableCell>
          <TableCell sx={{ backgroundColor: '#3f51b5', color: '#fff' }}>Consumed Quantity</TableCell>
          <TableCell sx={{ backgroundColor: '#3f51b5', color: '#fff' }}>Total Cost</TableCell>
          <TableCell sx={{ backgroundColor: '#3f51b5', color: '#fff' }}>Date of Consumed</TableCell>
          <TableCell sx={{ backgroundColor: '#3f51b5', color: '#fff' }}>Actions</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {filteredConsumedProducts.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((product, index) => (
          <TableRow key={index}>
            <TableCell>{product.ItemName}</TableCell>
            <TableCell>{product.CategoryName}</TableCell>
            <TableCell>{product.ConsumedQty}</TableCell>
            <TableCell>₹{product.ConsumedCostTotal}</TableCell>
            <TableCell>{new Date(product.DateofConsumed).toLocaleDateString()}</TableCell>
           

            <TableCell>
  <Button
    style={{
      color: 'darkblue', // Dark blue for the edit icon
      borderRadius: '50%', // To make it round
      minWidth: '0', // To remove extra padding
      padding: '6px', // Adjust padding as needed
      marginRight: '8px',
      backgroundColor: 'transparent', // No background
      transition: 'background-color 0.3s', // Smooth transition for hover effect
    }}
    onClick={() => handleEditDialogOpen(product)}
    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.1)')}
    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
  >
    <EditIcon />
  </Button>
  <Button
    style={{
      color: 'red', // Red for the delete icon
      borderRadius: '50%', // To make it round
      minWidth: '0', // To remove extra padding
      padding: '6px', // Adjust padding as needed
      backgroundColor: 'transparent', // No background
      transition: 'background-color 0.3s', // Smooth transition for hover effect
    }}
    onClick={() => handleDeleteItem(product.ConsumedID)}
    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.1)')}
    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
  >
    <DeleteIcon />
  </Button>
</TableCell>



          </TableRow>
        ))}
      </TableBody>
    </Table>
  </TableContainer>
  <TablePagination
    rowsPerPageOptions={[5, 10, 15, 20]}
    component="div"
    count={filteredConsumedProducts.length}
    rowsPerPage={rowsPerPage}
    page={page}
    onPageChange={handleChangePage}
    onRowsPerPageChange={handleChangeRowsPerPage}
  />

</Paper>


    </div>  
  );
};
