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

  TextField,
  MenuItem,
} from '@mui/material';


export const StudentAttendanceTable = () => {
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [selectedMonth, setSelectedMonth] = useState(-1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());


  const months = [
    "ALL",
    "January", "February", "March", "April", "May", "June", 
    "July", "August", "September", "October", "November", "December"
  ];

  const years = Array.from(new Array(5), (v, i) => new Date().getFullYear() - i);

  const filteredAttendanceRecords = attendanceRecords.filter(record => {
    const recordDate = new Date(record.MonthYear);

    const yearMatches = recordDate.getFullYear() === selectedYear;

    if (selectedMonth === -1) {
      return yearMatches; 
    }

    return yearMatches && recordDate.getMonth() === selectedMonth - 1;
  });

  useEffect(() => {
    const fetchAttendanceRecords = async () => {
      try {
        const response = await axios.get("http://localhost:8081/api/admin/student-attendance");
        if (Array.isArray(response.data)) {
          setAttendanceRecords(response.data);
        } else {
          console.error("Expected an array but got:", response.data);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendanceRecords();
  }, []);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
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
    
      </div>

     
      <Paper>
        <TableContainer style={{ maxHeight: '400px', overflowY: 'auto' }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ backgroundColor: '#3f51b5', color: '#fff' }}>Student Name</TableCell>
                <TableCell sx={{ backgroundColor: '#3f51b5', color: '#fff' }}>Student Register No.</TableCell>
                <TableCell sx={{ backgroundColor: '#3f51b5', color: '#fff' }}>No Of Leave Days</TableCell>
                <TableCell sx={{ backgroundColor: '#3f51b5', color: '#fff' }}>Present Days</TableCell>
                <TableCell sx={{ backgroundColor: '#3f51b5', color: '#fff' }}>Total Days</TableCell>
                <TableCell sx={{ backgroundColor: '#3f51b5', color: '#fff' }}>Billable Days</TableCell>
                <TableCell sx={{ backgroundColor: '#3f51b5', color: '#fff' }}>Month Year</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredAttendanceRecords.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((record, index) => (
                <TableRow key={index}>
                  <TableCell>{record.StudentName}</TableCell>
                  <TableCell>{record.RegNo}</TableCell>
                  <TableCell>{record.NoOfLeaveDays}</TableCell>
                  <TableCell>{record.PresentDays}</TableCell>
                  <TableCell>{record.TotalDays}</TableCell>
                  <TableCell>{record.BillableDays}</TableCell>
                  <TableCell>{new Date(record.MonthYear).toLocaleString('default', { month: 'long', year: 'numeric' })}</TableCell>
                 
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[10, 25, 50]}
          component="div"
          count={filteredAttendanceRecords.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </div>
  );
};

export default StudentAttendanceTable;
