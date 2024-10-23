const express = require("express");
const cors = require("cors");
const studentDetails = require('./routes/newStudent'); 
const GroceryPurchased = require('./Mess Details/Groceries/Purchased');
const GroceryConsumed = require('./Mess Details/Groceries/Consumed');
const StudentLeaveRequest = require('./Leave/StudentLeave')
const StudentAttendance = require('./Mess Details/StudentAttendance')
const LeaveRequests = require('./Leave/LeaveRequests')
const GasUsage = require('./Mess Details/Essentials/gas')
const StaffSalary = require('./Mess Details/StaffSalary')
const leaveVerification = require('./Leave/LeaveVerification')
const calculatemessbill = require('./Mess Details/IssueMessBill')
const StudentMessBill = require('./routes/StudentMessBill')

const app = express();

app.use(cors());
app.use(express.json());

const PORT = 8081;

// Use routes
app.use('/api', studentDetails);
app.use('/api', GroceryPurchased);
app.use('/api', GroceryConsumed);
app.use('/api', StudentLeaveRequest);
app.use('/api', StudentAttendance);
app.use('/api', LeaveRequests);
app.use('/api', GasUsage);
app.use('/api', StaffSalary);
app.use('/api', leaveVerification);
app.use('/api', calculatemessbill);
app.use('/api', StudentMessBill);


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});



// Example route

