import { useState, useEffect } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';
import {
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Box,
  Grid,
  TablePagination,
  Button
} from '@mui/material';

const SMessDetails = ({ studentData }) => {
  const [billData, setBillData] = useState([]);
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0); // Pagination page state
  const [rowsPerPage, setRowsPerPage] = useState(5); // Rows per page state

  useEffect(() => {
    const fetchBillData = async () => {
      setLoading(true);

      try {
        // Fetch current mess bill
        const billResponse = await axios.get('http://localhost:8081/api/student-mess-bill', {
          params: { StudentID: studentData.student_id, Status: 'Unpaid' },
        });
        setBillData(billResponse.data);

        // Fetch mess bill history
        const historyResponse = await axios.get('http://localhost:8081/api/student-mess-bill-history', {
          params: { StudentID: studentData.student_id, Status: 'Paid' },
        });
        setHistoryData(historyResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBillData();
  }, [studentData.student_id]);

  // Format date helper
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return isNaN(date) ? 'Invalid Date' : date.toLocaleDateString();
  };

  // Handle pagination page change
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  const currentBill = billData.length > 0 ? billData[0] : null;

  return (
    <Box sx={{ padding: 4 }}>
      <Grid container spacing={3}>
        {/* Current Mess Bill Section */}
        <Grid item xs={12} md={6}>
          {currentBill && (
            <Card sx={{ height: '100%', border: '1px solid #ccc', boxShadow: 3 }}>
              <CardContent>
                <Typography variant="h4" sx={{ textAlign: 'center', alignItems: 'center', mb: 2 }}>
                  Mess Bill
                  <Box
                    component="hr"
                    sx={{
                      border: '3px solid',
                      borderColor: '#741f0a',
                      borderRadius: 2,
                      width: '160px', // Equivalent to Tailwind's w-32
                      margin: 'auto', // Centering the line horizontally
                      mt: 1 // Adding margin to the top to separate from text
                    }}
                  />
                </Typography>

                <div className='m-10 space-y-4'>
                  <Typography variant="h6">
                    <span className='font-semibold'>Date Issued:</span> {formatDate(currentBill.DateOfIssued)}
                  </Typography>
                  <Typography variant="h6"><span className='font-semibold'>Billable Days:</span> {currentBill.BillableDays}</Typography>
                  <Typography variant="h6"><span className='font-semibold'>Leave Taken:</span> {currentBill.LeaveDays}</Typography>
                  <Typography variant="h6"><span className='font-semibold'>Total Days:</span> {currentBill.TotalDays}</Typography>
                  <Typography variant="h6"><span className='font-semibold'>Per Day Amount:</span> ₹{currentBill.PerDayAmount}</Typography>
                  <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold' }}>
                    Total Amount: ₹{currentBill.TotalAmount}
                  </Typography>
                </div>
              </CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 2 }}>
                <Button variant="contained" sx={{ alignSelf: 'flex-end', backgroundColor: '#2C9209', margin: '10px' }}>
                  Pay Now
                </Button>
              </Box>
            </Card>
          )}
        </Grid>

        {/* History of Mess Bills Section with Pagination */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ display: 'flex', flexDirection: 'column', height: '100%', padding: 2, boxShadow: 3 }}>
            <Typography variant="h5" sx={{ textAlign: 'center', alignItems: 'center', mb: 2, fontWeight: 'bold' }}>
              History of Mess Bills
            </Typography>
            <TableContainer sx={{ flexGrow: 1 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell className="bg-blue-800 !text-white font-bold">Date Issued</TableCell>
                    <TableCell className="bg-blue-800 !text-white font-bold">Billable Days</TableCell>
                    <TableCell className="bg-blue-800 !text-white font-bold">Leave Days</TableCell>
                    <TableCell className="bg-blue-800 !text-white font-bold">Total Days</TableCell>
                    <TableCell className="bg-blue-800 !text-white font-bold">Per Day Amount</TableCell>
                    <TableCell className="bg-blue-800 !text-white font-bold">Total Amount</TableCell>
                    <TableCell className="bg-blue-800 !text-white font-bold">Date of Payment</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {historyData.length > 0 ? (
                    historyData
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((history, index) => (
                        <TableRow key={index}>
                          <TableCell>{formatDate(history.DateOfIssued)}</TableCell>
                          <TableCell>{history.BillableDays}</TableCell>
                          <TableCell>{history.LeaveDays}</TableCell>
                          <TableCell>{history.TotalDays}</TableCell>
                          <TableCell>₹{history.PerDayAmount}</TableCell>
                          <TableCell>₹{history.TotalAmount}</TableCell>
                          <TableCell>{formatDate(history.DateOfPayment)}</TableCell>
                        </TableRow>
                      ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        No history available.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              sx={{ display: 'flex', justifyContent: 'flex-end', p: 2 }}
              component="div"
              count={historyData.length}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SMessDetails;

SMessDetails.propTypes = {
  studentData: PropTypes.shape({
    student_id: PropTypes.string.isRequired,
  }).isRequired,
};
