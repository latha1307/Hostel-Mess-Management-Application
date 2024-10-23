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
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

export const EssentialGasTable = () => {
  const [gasProducts, setGasProducts] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [selectedMonth, setSelectedMonth] = useState(-1); 

  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [CylinderQty, setCylinderQty] = useState('');
  const [CostPerCylinder, setCostPerCylinder] = useState('');
  const [DateUsed, setDateUsed] = useState('');
  const [UsageID, setUsageID] = useState('');


  const [editingItem, setEditingItem] = useState(null);
  const months = [
    "ALL",
    "January", "February", "March", "April", "May", "June", 
    "July", "August", "September", "October", "November", "December"
  ];

  const years = Array.from(new Array(5), (v, i) => new Date().getFullYear() - i);


  const filteredGasProducts = gasProducts.filter(product => {
    const purchasedDate = new Date(product.DateUsed);

    const yearMatches = purchasedDate.getFullYear() === selectedYear;

    if (selectedMonth === -1) {
      return yearMatches; 
    }

    return yearMatches && purchasedDate.getMonth() === selectedMonth - 1;
  });


  useEffect(() => {
    const fetchGasProducts = async () => {
      try {
        const response = await axios.get("http://localhost:8081/api/admin/essentials/gas");
        if (Array.isArray(response.data)) {
          setGasProducts(response.data);
        } else {
          console.error("Expected an array but got:", response.data);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchGasProducts();
  }, []);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Dialog handlers
  const handleDialogOpen = (item = null) => {
    if (item) {
      setUsageID(item.UsageID);
      setEditingItem(item);
      setCylinderQty(item.CylinderQty); 
      setCostPerCylinder(item.CostPerCylinder); 
      setDateUsed(item.DateUsed ? item.DateUsed.split('T')[0] : '');
     }
    else {
      setUsageID(null);
      setCylinderQty('');
      setCostPerCylinder('');
      setDateUsed('');
      setEditingItem(null)
    }
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setEditingItem(null); 
  };

  const handleAddOrUpdateItem = async () => {
    const newItem = {
      CylinderQty: CylinderQty,
      CostPerCylinder: CostPerCylinder,
      DateUsed: DateUsed 
    };

    try {
      if (editingItem) {
        // Update existing item
        await axios.put(`http://localhost:8081/api/admin/essentials/gas/${UsageID}`, newItem);
      } else {
        // Add new item
        await axios.post("http://localhost:8081/api/admin/essentials/gas", newItem);
      }

      handleDialogClose(); 
      // Refetch the data after adding/updating
      const response = await axios.get("http://localhost:8081/api/admin/essentials/gas");
      setGasProducts(response.data);
    } catch (err) {
      console.error("Error adding/updating item:", err);
      alert("Failed to add/update item: " + err.response?.data?.message || err.message);
    }
  };

  const handleDeleteItem = async (id) => {
    try {
      await axios.delete(`http://localhost:8081/api/admin/essentials/gas/${id}`);
      // Refetch the data after deletion
      const response = await axios.get("http://localhost:8081/api/admin/essentials/gas");
      setGasProducts(response.data);
    } catch (err) {
      console.error("Error deleting item:", err);
      alert("Failed to delete item: " + err.response?.data?.message || err.message);
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
      <Button variant="contained" sx={ {marginBottom: '20px'}} color="primary" onClick={() => handleDialogOpen(null)}>
        Add Item
      </Button>
      </div>

      <Dialog open={dialogOpen} onClose={handleDialogClose}>
        <DialogTitle>{editingItem ? 'Edit Gas Details' : 'Add Gas Details'}</DialogTitle>
        <DialogContent>
         
          <TextField
            label="Cylinder Quantity"
            type="number"
            fullWidth
            value={CylinderQty}
            onChange={(e) => setCylinderQty(e.target.value)}
            margin="dense"
          />
          <TextField
            label="Cost Per Cylinder"
            type="number"
            fullWidth
            value={CostPerCylinder}
            onChange={(e) => setCostPerCylinder(e.target.value)}
            margin="dense"
          />
          <TextField
            label="Date Of Used"
            type="date"
            fullWidth
            value={DateUsed}
            onChange={(e) => setDateUsed(e.target.value)}
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
          <Button onClick={handleAddOrUpdateItem} color="primary">
            {editingItem ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
      
      <Paper>
  <TableContainer style={{ maxHeight: '400px', overflowY: 'auto' }}>
    <Table stickyHeader>
      <TableHead>
        <TableRow>
        <TableCell sx={{ backgroundColor: '#3f51b5', color: '#fff' }}>S. No</TableCell>
          <TableCell sx={{ backgroundColor: '#3f51b5', color: '#fff' }}>Cylinder Quantity</TableCell>
          <TableCell sx={{ backgroundColor: '#3f51b5', color: '#fff' }}>Cost Per Cylinder</TableCell>
          <TableCell sx={{ backgroundColor: '#3f51b5', color: '#fff' }}>Total Cost</TableCell>
          <TableCell sx={{ backgroundColor: '#3f51b5', color: '#fff' }}>Date of Used</TableCell>
          <TableCell sx={{ backgroundColor: '#3f51b5', color: '#fff' }}>Actions</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {filteredGasProducts.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((product, index) => (
          <TableRow key={index}>
            <TableCell>{page * rowsPerPage + index + 1}</TableCell>
            <TableCell>{product.CylinderQty}</TableCell>
            <TableCell>₹{product.CostPerCylinder}</TableCell>
            <TableCell>₹{product.TotalCost}</TableCell>
            <TableCell>{new Date(product.DateUsed).toLocaleDateString()}</TableCell>
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
    onClick={() =>handleDialogOpen(product)}
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
    onClick={() => handleDeleteItem(product.UsageID)}
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
    count={filteredGasProducts.length}
    rowsPerPage={rowsPerPage}
    page={page}
    onPageChange={handleChangePage}
    onRowsPerPageChange={handleChangeRowsPerPage}
  />
</Paper>

    </div>
  );
};
