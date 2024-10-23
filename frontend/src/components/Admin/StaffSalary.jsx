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


export const StaffSalaryTable = () => {
  const [salaryDetails, setSalaryDetails] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [SalaryID, setSalaryID] = useState(null);
  const [TypeofWork, setTypeofWork] = useState('');
 
 
  
  
  const [selectedMonth, setSelectedMonth] = useState(-1); 

  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [showNewTypeInput, setShowNewTypeInput] = useState(false);
  const [newTypeofWork, setNewTypeofWork] = useState('');
  const [Salary, setSalary] = useState('');
  const [DateIssued, setDateIssued] = useState('');

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const months = [
    "ALL","January", "February", "March", "April", "May", "June", 
    "July", "August", "September", "October", "November", "December"
  ];

  const workTypes = [
    'Head Cheif',
    'Assistant Cheif',
    'Cutter',
    
  ];

  const combinedWorkTypes = [...workTypes, newTypeofWork].filter(type => type);
  const years = Array.from(new Array(5), (v, i) => new Date().getFullYear() - i);

  const filteredSalaryDetails = salaryDetails.filter(product => {
    const issuedDate = new Date(product.DateIssued);

    const yearMatches = issuedDate.getFullYear() === selectedYear;

    if (selectedMonth === -1) {
      return yearMatches; 
    }

    return yearMatches && issuedDate.getMonth() === selectedMonth - 1;
  });
  

  const fetchSalaryDetails = async () => {
    try {
      const response = await axios.get("http://localhost:8081/api/admin/staff-salaries");
      console.log(response.data)
      if (Array.isArray(response.data)) {
        setSalaryDetails(response.data);
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
    fetchSalaryDetails(); // Call the function to fetch data
  }, []);



  

 
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
    setTypeofWork('');
    setNewTypeofWork(''); // Reset new type input
    setSalary(''); // Reset salary
    setDateIssued(''); // Reset date issued
  };
  


  const handleAddItem = async () => {
    const newItem = {
      TypeofWork: showNewTypeInput ? newTypeofWork : TypeofWork, // Use the new type if applicable
      Salary: Salary,
      DateIssued: DateIssued
    };

    try {
      await axios.post("http://localhost:8081/api/admin/staff-salaries", newItem);
      handleDialogClose();
      await fetchSalaryDetails();
    } catch (err) {
      console.error("Error adding staff salary details:", err);
      alert("Failed to add staff salary details: " + err.response?.data?.message || err.message);
    }
  };

const handleEditDialogOpen = (product) => {
  setEditingProduct(product);
  setSalaryID(product.SalaryID)
  setTypeofWork(product.TypeofWork);
  setSalary(product.Salary);
  setDateIssued(new Date(product.DateIssued).toISOString().split('T')[0]); // Format date
  setEditDialogOpen(true);
};

const handleEditDialogClose = () => {
    setEditDialogOpen(false);
    setEditingProduct(null);
    
    // Reset editing fields
    setSalaryID(null);
    setTypeofWork('');
    setSalary('');
    setDateIssued('');
  };
  


const handleEditItem = async () => {
  const updatedItem = {
    ...editingProduct,
    SalaryID, 
    TypeofWork: TypeofWork,
    Salary: Salary,
    DateIssued: DateIssued
  };

  try {
    await axios.put(`http://localhost:8081/api/admin/staff-salaries/${SalaryID}`, updatedItem);
    handleEditDialogClose(); 
    // Re-fetch the data after editing
    await fetchSalaryDetails();
  } catch (err) {
    console.error("Error updating salary details:", err);
    alert("Failed to update salary details: " + err.response?.data?.message || err.message);
  }
};


const handleDeleteItem = async (id) => {
  if (window.confirm("Are you sure you want to delete this item?")) {
    try {
      // Log the ID to ensure it's correct
      console.log("Deleting item with ID:", id);

      await axios.delete(`http://localhost:8081/api/admin/staff-salaries/${id}`);
      await fetchSalaryDetails(); // Re-fetch the data after deletion
    } catch (err) {
      console.error("Error deleting salary details:", err);
      alert("Failed to delete salary details: " + err.response?.data?.message || err.message);
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
        Add Worker
      </Button>
      </div>

      <Dialog open={dialogOpen} onClose={handleDialogClose}>
        <DialogTitle>Add Worker Details</DialogTitle>
        <DialogContent>

        <TextField
            select
            label="Type of Work"
            fullWidth
            value={TypeofWork}
            onChange={(e) => {
              if (e.target.value === 'Add New') {
                setShowNewTypeInput(true);
                setTypeofWork(''); // Clear current selection
              } else {
                setTypeofWork(e.target.value);
                setShowNewTypeInput(false); // Hide input for new type of work
              }
            }}
            margin="dense"
          >
            {combinedWorkTypes.map((type, index) => (
              <MenuItem key={index} value={type}>
                {type}
              </MenuItem>
            ))}
            <MenuItem value='Add New'>Add New</MenuItem> {/* Option to add new type */}
          </TextField>

          {showNewTypeInput && (
            <TextField
              label="New Type of Work"
              fullWidth
              value={newTypeofWork}
              onChange={(e) => setNewTypeofWork(e.target.value)}
              margin="dense"
            />
          )}

          
<TextField
  label="Salary in Rs"
  type="number"
  fullWidth
  value={Salary}
  onChange={(e) => { setSalary(e.target.value)}}
  margin="dense"
/>

          <TextField
      label="Date Of Salary Issued"
      type="date"
      fullWidth
      value={DateIssued} 
      onChange={(e) => setDateIssued(e.target.value)} 
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
        <DialogTitle>Edit Worker Details</DialogTitle>
        <DialogContent>
       
          <TextField
            select
            label="Type of Work"
            fullWidth
            value={TypeofWork} // This will automatically be set based on the selected item
            onChange={(e) => setTypeofWork(e.target.value)}
            margin="dense"
          >
            <MenuItem value='Head Cheif'>Head Cheif</MenuItem>
            <MenuItem value='Assistant Cheif'>Assistant Cheif</MenuItem>
            <MenuItem value='Cutter'>Cutter</MenuItem>
          </TextField>
          <TextField
            label="Salary"
            type="number"
            fullWidth
            value={Salary}
            onChange={(e) => setSalary(e.target.value)}
            margin="dense"
          />
          <TextField
            label="Date of Salary Issued"
            type="date"
            fullWidth
            value={DateIssued}
            onChange={(e) => setDateIssued(e.target.value)}
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
          <TableCell sx={{ backgroundColor: '#3f51b5', color: '#fff' }}>S. No</TableCell>
          <TableCell sx={{ backgroundColor: '#3f51b5', color: '#fff' }}>Type of Work</TableCell>
          <TableCell sx={{ backgroundColor: '#3f51b5', color: '#fff' }}>Salary</TableCell>
          <TableCell sx={{ backgroundColor: '#3f51b5', color: '#fff' }}>Date of Salary Issued</TableCell>
          <TableCell sx={{ backgroundColor: '#3f51b5', color: '#fff' }}>Actions</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {filteredSalaryDetails.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((product, index) => (
          <TableRow key={index}>
            <TableCell>{page * rowsPerPage + index + 1}</TableCell>
            <TableCell>{product.TypeofWork}</TableCell>
            <TableCell>₹{product.Salary}</TableCell>
            <TableCell>{new Date(product.DateIssued).toLocaleDateString()}</TableCell>
           

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
    onClick={() => handleDeleteItem(product.SalaryID)}
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
    count={filteredSalaryDetails.length}
    rowsPerPage={rowsPerPage}
    page={page}
    onPageChange={handleChangePage}
    onRowsPerPageChange={handleChangeRowsPerPage}
  />

</Paper>
    </div>  
  );
};
