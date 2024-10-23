// src/App.jsx
import './App.css';
import { Routes, Route, useLocation} from 'react-router-dom';
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Home from './Pages/Home';
import About from './Pages/About';
import NewRegister from './Pages/NewRegistration';
import AdminLogin from './Pages/Login/AdminLogin';
import StudentLogin from './Pages/Login/StudentLogin';
import SHomePage from './Pages/Student/HomePage';
import Vacate from './Pages/Student/Vacate';
import AHomePage from './Pages/Admin/HomePage';
import Transition from './components/Transition';
import Contacts from './Pages/ContactPage';
import { StudentRequestPage } from './Pages/Admin/StudentRequestPage';
import { GroceryPurchasedPage } from './Pages/Admin/GroceryPurchasedPage';

import Sidebar from './components/Admin/ASideNavebar';
import { GroceryConsumedPage } from './Pages/Admin/GroceryConsumedPage';
import ApplyLeave from './Pages/Student/ApplyLeave';
import { StudentsAttendancePage } from './Pages/Admin/StudentsAttendancePage';
import { LeaveRequestPage } from './Pages/Admin/LeaveRequestsPage';
import { EssentialGasPage } from './Pages/Admin/EssentialGasPage';
import { StaffSalaryPage } from './Pages/Admin/StaffSalaryPage';
import { IssueMessBillPage } from './Pages/Admin/IssueMessBillPage';
import { MonthlyVerificationPage } from './Pages/Admin/MonthlyVerificationPage';
import MessBill from './Pages/Student/MessBill';

function App() {
  const location = useLocation();
  const [studentData, setStudentData] = useState(null); 

  // Handle successful student login
  const handleStudentLogin = (data) => {
    setStudentData(data); // Store student data in state
  };


  return (
    <AnimatePresence mode="wait">
      <motion.div key={location.pathname} className="relative">
        <Transition />
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/new-student-register" element={<NewRegister />} />
          <Route path="/contact" element={<Contacts />} />
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/admin-home" element={<AHomePage />} />
          <Route path="/admin-student-requests" element={<StudentRequestPage />} />
          <Route path="/admin" element={<Sidebar />} />
          <Route path="/admin-grocery-purchased" element={<GroceryPurchasedPage />} />
          <Route path="/admin-grocery-consumed" element={<GroceryConsumedPage />} />
          <Route path="/student-attendance" element={<StudentsAttendancePage />} />
          <Route path="/student-leave-requests" element={<LeaveRequestPage />} />
          <Route path='/admin/essential/gas' element={<EssentialGasPage/>}/>
          <Route path='/admin/mess-details/staff-salary' element={<StaffSalaryPage/>}/>
          <Route path='/admin/mess-details/issue-bill' element={<IssueMessBillPage/>}/>
          <Route path='/admin/mess-details/leave-verification' element={<MonthlyVerificationPage/>}/>

        
          <Route
            path="/student-login"
            element={<StudentLogin onLoginSuccess={handleStudentLogin} />} 
          />
          <Route
            path="/student-profile"
            element={<SHomePage studentData={studentData || location.state?.student} />} 
          />
          <Route
            path="/student-vacate"
            element={<Vacate studentData={studentData || location.state?.student} />} 
          />
         <Route
        path="/apply-leave"
        element={<ApplyLeave  studentData={studentData || location.state?.student} />} 
      />
      <Route
            path="/mess-bill"
            element={<MessBill studentData={studentData || location.state?.student} />} 
          />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

export default App;
