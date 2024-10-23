import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
} from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import TablePagination from '@mui/material/TablePagination';

export const SLeave = ({ studentData }) => {
  const [formData, setFormData] = useState({
    Date_From: '',
    Date_To: '',
    No_of_Days: '',
    Comment: '',
  });
  const [errors, setErrors] = useState({});
  const [leaveHistory, setLeaveHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  useEffect(() => {
    const fetchLeaveHistory = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`http://localhost:8081/api/student/leave-history/${studentData.student_id}`);
        setLeaveHistory(response.data); // Assuming the response is an array of leave history
      } catch (error) {
        console.error('Error fetching leave history:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaveHistory();
  }, [studentData.student_id]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleInput = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Dynamically calculate and validate the number of days when Date_From or Date_To is changed
    if (name === 'Date_From' || name === 'Date_To') {
      const { Date_From, Date_To } = formData;
      const noOfDays = calculateNoOfDays(name === 'Date_From' ? value : Date_From, name === 'Date_To' ? value : Date_To);
      setFormData(prevFormData => ({
        ...prevFormData,
        [name]: value,
        No_of_Days: noOfDays
      }));

      // Validate the number of days
      let validationErrors = {};
      if (noOfDays !== '' && (noOfDays < 7 || noOfDays > 31)) {
        validationErrors.No_of_Days = 'Number of days must be between 7 and 31.';
      }
      setErrors(validationErrors); // Update the errors state with validation
    }
  };

  const calculateNoOfDays = (dateFrom, dateTo) => {
    if (dateFrom && dateTo) {
      const fromDate = new Date(dateFrom);
      const toDate = new Date(dateTo);
      return Math.floor((toDate - fromDate) / (1000 * 60 * 60 * 24)) + 1;
    }
    return '';
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Pending':
        return { color: 'orange' };
      case 'Confirmed':
        return { color: 'blue' };
      case 'Approved':
        return { color: 'green' };
      case 'Rejected':
        return { color: 'red' };
      default:
        return {};
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (Object.keys(errors).length === 0) {
      const leaveRequestData = {
        student_id: studentData.student_id,
        DateFrom: formData.Date_From,
        DateTo: formData.Date_To,
        NoOfDays: formData.No_of_Days,
        Comment: formData.Comment,
      };

      try {
        await axios.post('http://localhost:8081/api/student/leave-request', leaveRequestData);
        setFormData({
          Date_From: '',
          Date_To: '',
          No_of_Days: '',
          Comment: '',
        });
        setErrors({});
        alert('Leave request submitted successfully!');
        // Refetch the leave history after submitting a new request
        const response = await axios.get(`http://localhost:8081/api/student/leave-history/${studentData.student_id}`);
        setLeaveHistory(response.data);
      } catch (error) {
        if (error.response) {
          const errorData = error.response.data;
          setErrors({ ...errors, ...errorData });
          console.error('Error submitting leave request:', errorData);
        } else {
          console.error('Error:', error);
          setErrors({ ...errors, Server: 'Server error. Please try again later.' });
        }
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 mx-4 md:mx-32 space-x-12 fixed">
      <div className="mt-6 border  max-w-4xl rounded-lg p-6 bg-white shadow-md">
        <h1 className="text-3xl font-bold text-blue-900 text-center mb-6">Apply Leave</h1>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="font-sans font-medium text-lg mb-2 block">Date From</label>
              <input
                name="Date_From"
                onChange={handleInput}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:border-blue-500"
                type="date"
                value={formData.Date_From}
              />
              {errors.Date_From && <p className="text-red-500 text-xs mt-1">{errors.Date_From}</p>}
            </div>

            <div>
              <label className="font-sans font-medium text-lg mb-2 block">Date To</label>
              <input
                name="Date_To"
                onChange={handleInput}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:border-blue-500"
                type="date"
                value={formData.Date_To}
              />
              {errors.Date_To && <p className="text-red-500 text-xs mt-1">{errors.Date_To}</p>}
            </div>

            <div>
              <label className="font-sans font-medium text-lg mb-2 block">No of Days</label>
              <input
                name="No_of_Days"
                value={formData.No_of_Days} // Calculated value
                className="w-full px-4 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:border-blue-500"
                type="number"
                min="7"
                max="31"
                readOnly // No direct modification by the user
              />
              {errors.No_of_Days && <p className="text-red-500 text-xs mt-1">{errors.No_of_Days}</p>}
            </div>

            <div className="col-span-2">
              <label className="font-sans font-medium text-lg mb-2 block">Comment</label>
              <textarea
                name="Comment"
                onChange={handleInput}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:border-blue-500"
                rows="4"
                value={formData.Comment}
              ></textarea>
              {errors.Comment && <p className="text-red-500 text-xs mt-1">{errors.Comment}</p>}
            </div>
          </div>

          <div className="flex justify-center mt-6">
          <button
              type="submit"
              className="px-8 py-2 bg-blue-800 text-white rounded-full font-bold shadow-lg hover:bg-blue-700 transition duration-300"
              disabled={Object.keys(errors).length > 0} // Disable submit if there are errors
            >
              Submit
            </button>
          </div>
        </form>
      </div>

      {/* Leave History Table */}
      <div className="mt-6 w-full max-w-4xl overflow-auto">
        <h2 className="text-2xl font-bold text-yellow-600 text-center mb-4">Leave History <AccessTimeIcon className="mr-2" /></h2>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell className="bg-blue-800 !text-white font-bold">S.No</TableCell>
                <TableCell className="bg-blue-800 !text-white font-bold">Date From</TableCell>
                <TableCell className="bg-blue-800 !text-white font-bold">Date To</TableCell>
                <TableCell className="bg-blue-800 !text-white font-bold">No of Days</TableCell>
                <TableCell className="bg-blue-800 !text-white font-bold">Comment</TableCell>
                <TableCell className="bg-blue-800 !text-white font-bold">Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : (
                leaveHistory.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((leave, index) => (
                  <TableRow key={leave.id}>
                    <TableCell>{index + 1 + page * rowsPerPage}</TableCell>
                    <TableCell>{formatDate(leave.DateFrom)}</TableCell>
                    <TableCell>{formatDate(leave.DateTo)}</TableCell>
                    <TableCell>{leave.NoOfDays}</TableCell>
                    <TableCell>{leave.Comment}</TableCell>
                    <TableCell style={getStatusStyle(leave.Status)}>{leave.Status}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          <TablePagination
          rowsPerPageOptions={[5]}
          component="div"
          count={leaveHistory.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
        </TableContainer>
        
      </div>
    </div>
  );
};

SLeave.propTypes = {
  studentData: PropTypes.shape({
    student_id: PropTypes.string.isRequired,
  }).isRequired,
};
