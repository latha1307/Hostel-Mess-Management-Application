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
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField
} from "@mui/material";

export const LeaveVerification = () => {
  const [students, setStudents] = useState([]);
  const [currentPage, setCurrentPage] = useState(0); 
  const [studentsPerPage, setStudentsPerPage] = useState(5); 
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [DateFrom, setDateFrom] = useState('');
  const [DateTo, setDateTo] = useState('');
  const [NoOfDays, setNoOfDays] = useState('');

  const [dateError, setDateError] = useState("");
  useEffect(() => {
    axios
      .get("http://localhost:8081/api/admin/leave-verification")
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



 
  const handleChangePage = (event, newPage) => {
    setCurrentPage(newPage);
    window.scrollTo(0, 0); 
  };

  const handleChangeRowsPerPage = (event) => {
    setStudentsPerPage(parseInt(event.target.value, 10)); 
    setCurrentPage(0); 
  };

  const handleEdit = (student) => {
    setSelectedStudent(student);
    setDateFrom(new Date(student.DateFrom).toISOString().split('T')[0]); 
    setDateTo(new Date(student.DateTo).toISOString().split('T')[0]); 
    setNoOfDays(student.NoOfDays)
    setEditDialogOpen(true);
  };

  const handleDialogClose = () => {
    setEditDialogOpen(false);
    setSelectedStudent(null);
    setDateError("");
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
  
    // Update the corresponding state based on the input field name
    if (name === "DateFrom") {
      setDateFrom(value);
    } else if (name === "DateTo") {
      setDateTo(value);
    }
  
    // After setting the updated state, calculate the number of days
    const updatedDateFrom = name === "DateFrom" ? value : DateFrom;
    const updatedDateTo = name === "DateTo" ? value : DateTo;
  
    // Only calculate when both dates are present
    if (updatedDateFrom && updatedDateTo) {
      const noOfDays = calculateNoOfDays(updatedDateFrom, updatedDateTo);
  
      // Validate the number of days and set error if not in range
      if (noOfDays < 7 || noOfDays > 31) {
        setDateError("The number of leave days must be between 7 and 31.");
      } else {
        setDateError("");
      }
      setNoOfDays(noOfDays);
    }
  };
  
  

  const calculateNoOfDays = (dateFrom, dateTo) => {
    const fromDate = new Date(dateFrom);
    const toDate = new Date(dateTo);
    return Math.floor((toDate - fromDate) / (1000 * 60 * 60 * 24)) + 1;
  };

  const handleSave = () => {
    // If there's a date validation error, prevent save
    if (dateError) {
      return; 
    }
  
    // Validate if DateFrom, DateTo, and NoOfDays are present
    if (!DateFrom || !DateTo || !NoOfDays) {
      setDateError("Please fill out all the fields correctly.");
      return;
    }
  
    // Ensure that a student is selected
    if (!selectedStudent) {
      setDateError("No student selected. Please try again.");
      return;
    }
  
    // Prepare the data to send to the backend
    const requestData = {
      studentID: selectedStudent.student_id,  // Ensure studentID is correct
      newDateFrom: new Date(DateFrom).toISOString().split('T')[0],  // Convert to YYYY-MM-DD
      newDateTo: new Date(DateTo).toISOString().split('T')[0],      // Convert to YYYY-MM-DD
      noOfDays: NoOfDays,
    };
  
    // Send the updated leave details to the backend
    axios
      .put("http://localhost:8081/api/admin/leave-verification/update", requestData)
      .then((response) => {
        console.log(response.data);
  
        // Update the students state with the updated leave details
        setStudents((prevStudents) =>
          prevStudents.map((student) =>
            student.student_id === selectedStudent.student_id
              ? { ...student, DateFrom, DateTo, NoOfDays }
              : student
          )
        );
  
        // Close the dialog after successful update
        handleDialogClose();
      })
      .catch((error) => {
        console.error("Error updating student:", error);
  
        // Check if the error contains a response and provide more details
        if (error.response && error.response.data) {
          setDateError(`Error: ${error.response.data.message}`);
        } else {
          setDateError("Failed to update leave details. Please try again.");
        }
      });
  };
  
  

  const handleApprove = async(student) => {
    const dateFrom = new Date(student.DateFrom);

  // Format monthYear based on DateFrom (could be based on DateTo if required)
  const monthYear = `${dateFrom.getFullYear()}-${(dateFrom.getMonth() + 1).toString().padStart(2, '0')}`;
    try{
    await axios.post("http://localhost:8081/api/admin/leave-verification/approved", {
        studentID: student.student_id,  
        dateFrom: student.DateFrom,
        dateTo: student.DateTo,
        status: "Approved",
        noOfDays: student.NoOfDays,
        monthYear: monthYear
      })
      
    
        const response = await axios.get("http://localhost:8081/api/admin/leave-verification");
        setStudents(response.data);
  
      }catch(error) {
         console.error("Error approving student:", error);
      }
  };
  

  const handleReject = async (student) => {
    try{

    await axios.delete("http://localhost:8081/api/admin/leave-verification/reject", {
        data: { 
          studentID: student.student_id,
          dateFrom: student.DateFrom,
          dateTo: student.DateTo,
          noOfDays: student.NoOfDays
        }
      });

        const response = await axios.get("http://localhost:8081/api/admin/leave-verification");
        setStudents(response.data);

        console.log('Leave rejected successfully');
    }catch(error) {
      console.error("Error rejecting student:", error);
    } 
  };
  
  
  const formatDOB = (dobString) => {
    const date = new Date(dobString);
    return date.toLocaleDateString(); 
  };

  return (
    <>
      <TableContainer component={Paper}>
        <Table>
          <TableHead className="bg-[#0f3675] text-white">
            <TableRow className=" text-white">
              <TableCell sx={{ borderRight: "1px solid #e0e0e0", color: "white" }}>Student Name</TableCell>
              <TableCell sx={{ borderRight: "1px solid #e0e0e0", color: "white" }}>Register Number</TableCell>
              <TableCell sx={{ borderRight: "1px solid #e0e0e0", color: "white" }}>Date From</TableCell>
              <TableCell sx={{ borderRight: "1px solid #e0e0e0", color: "white" }}>Date To</TableCell>
              <TableCell sx={{ borderRight: "1px solid #e0e0e0", color: "white" }}>No of Leave Days</TableCell>
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
                  
                  <TableCell>
                  <Button
                      variant="contained"
                      color="primary"
                      onClick={() => handleEdit(student)}
                      sx={{ marginRight: 1 }}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="contained"
                      color="success"
                      onClick={() => handleApprove(student)}
                      sx={{ marginRight: 1 }}
                    >
                      Approve
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

     
      <TablePagination
        rowsPerPageOptions={[5, 10, 15, 20]} 
        component="div"
        count={students.length}
        rowsPerPage={studentsPerPage}
        page={currentPage}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />

      <Dialog open={editDialogOpen} onClose={handleDialogClose}>
        <DialogTitle>Edit Leave Details</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Date From"
            type="date"
            name="DateFrom"
            value={DateFrom}
            onChange={handleFormChange}
            fullWidth
          />
          <TextField
            margin="dense"
            label="Date To"
            type="date"
            name="DateTo"
            value={DateTo}
            onChange={handleFormChange}
            fullWidth
          />
          <TextField
            margin="dense"
            label="No Of Days"
            type="text"
            name="NoOfDays"
            value={NoOfDays}
            onChange={handleFormChange}
            fullWidth
            disabled
          />
          {dateError && <p style={{ color: "red" }}>{dateError}</p>}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleSave} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}