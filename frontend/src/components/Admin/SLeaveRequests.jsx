import { useEffect, useState } from "react";
import axios from "axios";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  TablePagination,
} from "@mui/material";

export const SLeaveRequests = () => {
  const [students, setStudents] = useState([]);
  const [currentPage, setCurrentPage] = useState(0); // Use 0-based index for MUI
  const [studentsPerPage, setStudentsPerPage] = useState(5); // Default to 5 records per page

  useEffect(() => {
    axios
      .get("http://localhost:8081/api/admin/leave-requests")
      .then((response) => {
        if (Array.isArray(response.data)) {
          setStudents(response.data);
        } else {
          console.error("Expected an array but got:", response.data);
        }
      })
      .catch((error) =>
        console.error("Error fetching student requests:", error)
      );
  }, []);

  // Pagination Handlers
  const handleChangePage = (event, newPage) => {
    setCurrentPage(newPage);
    window.scrollTo(0, 0); // Scroll to top on page change
  };

  const handleChangeRowsPerPage = (event) => {
    setStudentsPerPage(parseInt(event.target.value, 10)); // Update rows per page
    setCurrentPage(0); // Reset to first page
  };

  const handleApprove = async (student) => {
    try {
      // Make the POST request to confirm the leave request
      await axios.post("http://localhost:8081/api/admin/leave-request/confirm", {
        studentID: student.student_id,  // Ensure this matches the actual key in the object
        dateFrom: student.DateFrom,
        dateTo: student.DateTo,
        status: "Confirmed",
        noOfDays: student.NoOfDays
      });
  
      console.log("Student leave request approved.");
  
      // Fetch the updated list of leave requests after approval
      const response = await axios.get("http://localhost:8081/api/admin/leave-requests");
      
      // Update the students state with the latest data
      setStudents(response.data);
  
    } catch (error) {
      console.error("Error approving student:", error);
    }
  };
  
  

  const handleReject = async (student) => {
    try {
        // First, send the DELETE request
        await axios.delete("http://localhost:8081/api/admin/leave-request/reject", {
            data: { // For delete request, use 'data' for body
                studentID: student.student_id,
                dateFrom: student.DateFrom,
                dateTo: student.DateTo
            }
        });

        // After successful deletion, fetch the updated list of students
        const response = await axios.get("http://localhost:8081/api/admin/leave-requests");
        setStudents(response.data);

        
        
        console.log('Student rejected successfully');
        
    } catch (error) {
        console.error("Error rejecting student:", error);
    }
};

  
  
  const formatDOB = (dobString) => {
    const date = new Date(dobString);
    return date.toLocaleDateString(); // Format date to show only the date part
  };

  return (
    <div>
      <TableContainer component={Paper}>
        <Table>
          <TableHead className="bg-[#0f3675] text-white">
            <TableRow className=" text-white">
              <TableCell sx={{ borderRight: "1px solid #e0e0e0", color: "white" }}>Student Name</TableCell>
              <TableCell sx={{ borderRight: "1px solid #e0e0e0", color: "white" }}>Register Number</TableCell>
              <TableCell sx={{ borderRight: "1px solid #e0e0e0", color: "white" }}>Date From</TableCell>
              <TableCell sx={{ borderRight: "1px solid #e0e0e0", color: "white" }}>Date To</TableCell>
              <TableCell sx={{ borderRight: "1px solid #e0e0e0", color: "white" }}>No of Leave Days</TableCell>
              <TableCell sx={{ borderRight: "1px solid #e0e0e0", color: "white" }}>Comment</TableCell>
              <TableCell sx={{ color: "white" }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {students.length > 0 ? (
              students.slice(currentPage * studentsPerPage, currentPage * studentsPerPage + studentsPerPage).map((student) => (
                <TableRow key={student.roll_no}>
                  <TableCell sx={{ borderRight: "1px solid #e0e0e0" }}>{student.StudentName}</TableCell>
                  <TableCell sx={{ borderRight: "1px solid #e0e0e0" }}>{student.RegNo}</TableCell>
                  <TableCell sx={{ borderRight: "1px solid #e0e0e0" }}>{formatDOB(student.DateFrom)}</TableCell>
                  <TableCell sx={{ borderRight: "1px solid #e0e0e0" }}>{formatDOB(student.DateTo)}</TableCell>
                  <TableCell sx={{ borderRight: "1px solid #e0e0e0" }}>
                    {student.NoOfDays}
                  </TableCell>
                  <TableCell sx={{ borderRight: "1px solid #e0e0e0" }}>{student.comment}</TableCell>
                  
                  <TableCell>
                    <Button
                      variant="contained"
                      color="success"
                      onClick={() => handleApprove(student)}
                      sx={{ marginRight: 1 }}
                    >
                      Confirm
                    </Button>
                    <Button
                      variant="contained"
                      color="error"
                      onClick={() => handleReject(student)}
                    >
                      Reject
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={9} align="center">
                  No student requests found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination Component */}
      <TablePagination
        rowsPerPageOptions={[5, 10, 15, 20]} // Options for rows per page
        component="div"
        count={students.length}
        rowsPerPage={studentsPerPage}
        page={currentPage}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </div>
  );
};
