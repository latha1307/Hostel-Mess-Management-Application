import { useEffect, useState } from "react";
import axios from "axios";
import { FaFilePdf } from "react-icons/fa";
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
  Avatar,
} from "@mui/material";

export const StudentRequests = () => {
  const [students, setStudents] = useState([]);
  const [currentPage, setCurrentPage] = useState(0); // Use 0-based index for MUI
  const [studentsPerPage, setStudentsPerPage] = useState(5); // Default to 5 records per page

  useEffect(() => {
    axios
      .get("http://localhost:8081/api/student-requests")
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

  const handleApprove = (studentId) => {
    axios
      .post("http://localhost:8081/api/student-requests/approve", {
        roll_no: studentId,
      })
      .then((response) => {
        console.log(response.data);
        setStudents(
          students.filter((student) => student.roll_no !== studentId)
        );
      })
      .catch((error) => console.error("Error approving student:", error));
  };

  const handleReject = (studentId) => {
    axios
      .post("http://localhost:8081/api/student-requests/reject", {
        roll_no: studentId,
      })
      .then((response) => {
        console.log(response.data);
        setStudents(
          students.filter((student) => student.roll_no !== studentId)
        );
      })
      .catch((error) => console.error("Error rejecting student:", error));
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
              <TableCell sx={{ borderRight: "1px solid #e0e0e0", color: "white" }}>Course</TableCell>
              <TableCell sx={{ borderRight: "1px solid #e0e0e0", color: "white" }}>Year</TableCell>
              <TableCell sx={{ borderRight: "1px solid #e0e0e0", color: "white" }}>DOB</TableCell>
              <TableCell sx={{ borderRight: "1px solid #e0e0e0", color: "white" }}>Gender</TableCell>
              <TableCell sx={{ borderRight: "1px solid #e0e0e0", color: "white" }}>Photo</TableCell>
              <TableCell sx={{ borderRight: "1px solid #e0e0e0", color: "white" }}>Fees Receipt</TableCell>
              <TableCell sx={{ color: "white" }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {students.length > 0 ? (
              students.slice(currentPage * studentsPerPage, currentPage * studentsPerPage + studentsPerPage).map((student) => (
                <TableRow key={student.roll_no}>
                  <TableCell sx={{ borderRight: "1px solid #e0e0e0" }}>{student.student_name}</TableCell>
                  <TableCell sx={{ borderRight: "1px solid #e0e0e0" }}>{student.roll_no}</TableCell>
                  <TableCell sx={{ borderRight: "1px solid #e0e0e0" }}>{student.course}</TableCell>
                  <TableCell sx={{ borderRight: "1px solid #e0e0e0" }}>{student.year}</TableCell>
                  <TableCell sx={{ borderRight: "1px solid #e0e0e0" }}>
                    {formatDOB(student.DOB)}
                  </TableCell>
                  <TableCell sx={{ borderRight: "1px solid #e0e0e0" }}>{student.gender}</TableCell>
                  <TableCell sx={{ borderRight: "1px solid #e0e0e0" }}>
                    <Avatar
                      alt="Student"
                      src={`data:image/jpeg;base64,${student.student_photo}`}
                    />
                  </TableCell>
                  <TableCell sx={{ borderRight: "1px solid #e0e0e0" }}>
                    <a
                      href={`data:application/pdf;base64,${student.fees_receipt}`}
                      download={`fees_receipt_${student.roll_no}.pdf`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <FaFilePdf className="text-red-500" />
                    </a>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="contained"
                      color="success"
                      onClick={() => handleApprove(student.roll_no)}
                      sx={{ marginRight: 1 }}
                    >
                      Approve
                    </Button>
                    <Button
                      variant="contained"
                      color="error"
                      onClick={() => handleReject(student.roll_no)}
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
