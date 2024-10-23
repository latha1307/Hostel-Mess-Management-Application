import { useState, useEffect  } from "react";
import {
  Button,
  TextField,
  MenuItem,
  Box,
  Card,
  CardContent,
  Typography,
  Divider,
 
} from "@mui/material";
import axios from "axios"; // Assuming you're using Axios for fetching data.

const IssueMessBill = () => {
  const [selectedMonth, setSelectedMonth] = useState(-1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [billData, setBillData] = useState({}); // To store fetched bill data.
  const [foodWaste, setFoodWaste] = useState(0);
  const [finalAmount, setFinalAmount] = useState(0);
  const [perDayAmount, setPerDayAmount] = useState(0);

  const [totals, setTotals] = useState({});

  const months = [
    "ALL",
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const years = Array.from(
    new Array(5),
    (v, i) => new Date().getFullYear() - i
  );
 
  useEffect(() => {
    const updatedTotalReduction = foodWaste || 0;
    setBillData((prevBillData) => ({
      ...prevBillData,
      TotalReduction: updatedTotalReduction,
    }));

    // Calculate Final Amount when any of the totals or reductions change
    const summationTotal =
      (totals.totalGroceries || 0) +
      (totals.totalEssentials || 0) +
      (totals.totalStaffSalaries || 0);
    const final = summationTotal - updatedTotalReduction;
    setFinalAmount(final);

    // Calculate Per Day Amount based on head count
    if (totals.totalHeadCount > 0) {
      const perDay = final / totals.totalHeadCount;
      setPerDayAmount(perDay);
    } else {
      setPerDayAmount(0); // Default to 0 if head count is 0 or undefined
    }
  }, [foodWaste, totals]);
  const calculateTotal = () => {
    const total =
      (totals.totalGroceries || 0) +
      (totals.totalEssentials || 0) +
      (totals.totalStaffSalaries || 0);
    return total;
  };

  const calculate = async () => {
    try {
      // Ensure month and year are provided
      if (selectedMonth === -1 || !selectedYear) {
        alert('Please select both month and year');
        return;
      }
  
      // Replace with your API endpoint
      const response = await axios.post('http://localhost:8081/api/calculate-bill', {
        selectedMonth: selectedMonth,
        selectedYear: selectedYear,
      });
  
      // Update the state with the returned totals data
      setTotals(response.data);
    } catch (err) {
      console.error('Error calculating bill:', err);
      setTotals(null); 
    }
  };

  const handleDistributeBill = async () => {
    try {
      // Ensure all data is available before sending it to the backend
      if (!finalAmount || !perDayAmount || !selectedMonth || !selectedYear) {
        alert('Please calculate the bill before distributing.');
        return;
      }
  
      const requestData = {
        TotalGroceries: totals.totalGroceries || 0,
        TotalEssentials: totals.totalEssentials || 0,
        TotalStaffSalaries: totals.totalStaffSalaries || 0,
        TotalReduction: billData.TotalReduction || 0,
        TotalHeadCounts: totals.totalHeadCount || 0,
        FinalAmount: finalAmount,
        PerDayAmount: perDayAmount,
        MonthYear: `${selectedYear}-${selectedMonth}`, // Format month and year
      };
  
      // Send the data to the backend using Axios
      const response = await axios.post("http://localhost:8081/api/admin/issue-mess-bill", requestData);
  
      if (response.status === 200) {
        alert("Mess bill successfully distributed!");
      } else {
        alert("Failed to distribute the mess bill.");
      }
    } catch (err) {
      console.error("Error distributing mess bill:", err);
      alert("An error occurred while distributing the mess bill.");
    }
  };
  
  


 
  return (
    <>
      <div className="flex justify-between">
        <div style={{ marginBottom: "20px" }}>
          <TextField
            select
            label="Select Month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            sx={{ marginRight: "20px" }}
          >
            {months.map((month, index) => (
              <MenuItem key={index} value={index === 0 ? -1 : index}>
                {month}
              </MenuItem>
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
          <Button
  variant="contained"
  color="primary"
  sx={{
    backgroundColor: "#cc0000", 
    color: "white", 
    padding: "10px 20px", 
    marginLeft: "10px", 
    "&:hover": {
      backgroundColor: "#b30000", 
    },
  }}
  onClick={calculate} 

>
  Calculate
</Button>

        </div>
        
      </div>

      <div className="grid grid-flow-col grid-cols-3 gap-4">
        <Box sx={{ minWidth: 275 }}>
          <Card
            variant="outlined"
            sx={{
              backgroundColor: "#009c7b",
              color: "white",
              padding: "20px",
              height: "400px", 
            }}
          >
            <CardContent
             sx={{
              display: "flex",
              flexDirection: "column",
              height: "100%",
            }}>
              <Typography
                gutterBottom
                sx={{ fontSize: 24, textAlign: "center", fontWeight: "bold" }}
              >
                Summation
              </Typography>
              <div className="flex space-x-10">
                <Typography variant="body2" sx={{ fontSize: 19 }}>
                  Groceries: ₹
                </Typography>
                <TextField
                  value={totals.totalGroceries || 0}
                  InputProps={{ readOnly: true }}
                  sx={{ backgroundColor: "#fff", marginBottom: "10px" }}
                />
              </div>
              <div className="flex space-x-8">
                <Typography variant="body2" sx={{ fontSize: 19 }}>
                  Essentials: ₹
                </Typography>
                <TextField
                  value={totals.totalEssentials || 0}
                  InputProps={{ readOnly: true }}
                  sx={{ backgroundColor: "#fff", marginBottom: "10px" }}
                />
              </div>
              <div className="flex space-x-1">
                <Typography variant="body2" sx={{ fontSize: 19 }}>
                  Staff Salaries: ₹
                </Typography>
                <TextField
                  value={totals.totalStaffSalaries || 0}
                  InputProps={{ readOnly: true }}
                  sx={{ backgroundColor: "#fff", marginBottom: "10px" }}
                />
              </div>
              <Divider sx={{ margin: "20px 0" }} />
              <Typography variant="h6" sx={{ fontWeight: "bold", marginTop: "auto"  }}>
                Total: ₹ {calculateTotal()}
              </Typography>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ minWidth: 275 }}>
          <Card
            variant="outlined"
            sx={{
              backgroundColor: "#009c7b",
              color: "white",
              padding: "20px",
              height: "400px", // Set a consistent height
            }}
          >
            <CardContent  sx={{
    display: "flex",
    flexDirection: "column",
    height: "100%",
  }}>
              <Typography
                gutterBottom
                sx={{ fontSize: 24, textAlign: "center", fontWeight: "bold" }}
              >
                Reduction
              </Typography>
              <div className="flex space-x-4">
                <Typography variant="body2" sx={{ fontSize: 20 }}>
                  Food Waste: ₹
                </Typography>
                <TextField
                  value={foodWaste}
                  onChange={(e) => setFoodWaste(parseFloat(e.target.value))}
                  sx={{ backgroundColor: "#fff", marginBottom: "10px" }}
                />
              </div>

              <Divider sx={{ margin: "20px 0" }} />
              <Typography variant="h6" sx={{ fontWeight: "bold", marginTop: "auto"  }}>
                Total Reduction: ₹ {billData.TotalReduction || 0}
              </Typography>
         
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ minWidth: 275 }}>
          <Card
            variant="outlined"
            sx={{
              backgroundColor: "#009c7b",
              color: "white",
              padding: "20px",
              height: "400px", // Set a consistent height
            }}
          >
            <CardContent
             sx={{
              display: "flex",
              flexDirection: "column",
              height: "100%", // Ensure it takes full height of the card
            }}>
              <Typography
                gutterBottom
                sx={{ fontSize: 24, textAlign: "center", fontWeight: "bold" }}
              >
                Distribution
              </Typography>
              <div className="flex ">
                <Typography variant="body2" sx={{ fontSize: 20 }}>
                  Head Count of Students:{" "}
                </Typography>
                <TextField
                  value={totals.totalHeadCount || 0}
                  InputProps={{ readOnly: true }}
                  sx={{ backgroundColor: "#fff", marginBottom: "10px" }}
                />
              </div>

              <Divider sx={{ margin: "20px 0" }} />
              <Typography variant="h6" sx={{ fontWeight: "bold", marginTop: "auto"  }}>
                Total Students: {totals.totalHeadCount || 0}
              </Typography>
            </CardContent>
          </Card>

         
        </Box>
    
      </div>
      <div className="flex justify-between">
        <div className="flex flex-col mt-4">
          <Typography variant="h6" sx={{ fontWeight: "bold" }}>
            Final Amount: ₹ {finalAmount || 0}
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: "bold" }}>
            Per Day Amount: ₹ {perDayAmount.toFixed(2)}
          </Typography>
        </div>
        <Box display="flex" justifyContent="center" mt={2}>
          <Button variant="contained" color="error" sx={{marginBottom: '30px'}} onClick={handleDistributeBill}>
            Distribute Mess Bill
          </Button>
        </Box>
      </div>


    </>
  );
};

export default IssueMessBill;
