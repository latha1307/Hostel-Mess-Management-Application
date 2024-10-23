import React from 'react';
import PropTypes from 'prop-types'; // Import PropTypes
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import { Collapse, ListItemIcon } from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';
import PersonIcon from '@mui/icons-material/Person';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import ChecklistIcon from '@mui/icons-material/Checklist';
import ReceiptIcon from '@mui/icons-material/Receipt'; 
import VisibilityIcon from '@mui/icons-material/Visibility'; 
import logo from '../../assets/TPGIT_logo_created.png';
import CheckIcon from '@mui/icons-material/Check';
import { Link } from 'react-router-dom'; 

const drawerWidth = 240;

const AppBarStyled = styled(AppBar)(({ theme }) => ({
  zIndex: theme.zIndex.drawer + 1,
}));

function Sidebar({ isOpen, onToggle }) {
  const [openSubmenu, setOpenSubmenu] = React.useState({
    mess: false,
    groceries: false,
    essentials: false,
  });

  const handleSubmenuToggle = (menu) => {
    setOpenSubmenu((prev) => ({ ...prev, [menu]: !prev[menu] }));
  };

  return (
    <Box sx={{ display: 'flex' }}>
  
      <AppBarStyled position="fixed">
  <Toolbar sx={{backgroundColor:'#670406'}} className="flex justify-between items-center space-x-4">
    <div className="flex items-center">
      <IconButton color="inherit" aria-label="open drawer" onClick={onToggle}>
        <MenuIcon />
      </IconButton>
      <img src={logo} alt="TPGIT Logo" className="inline-block bg-white w-40 m-1" />
    </div>
    <div className='text-2xl font-sans font-bold text-center flex-1 -ml-12'>
      Admin Portal
    </div>

  </Toolbar>
</AppBarStyled>


      <Drawer
        sx={{
          width: isOpen ? drawerWidth : 80,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: isOpen ? drawerWidth : 80,
            boxSizing: 'border-box',
            marginTop: '15px',
          },
        }}
        variant="persistent"
        anchor="left"
        open={isOpen}
        
      >
        <Toolbar />
        <Divider />
        <List>
          {/* Link for Student Requests */}
          <ListItemButton component={Link} to="/admin-student-requests">
            <ListItemIcon >
              <PersonIcon />
            </ListItemIcon>
            <ListItemText primary={isOpen ? "Student Requests" : ""} />
          </ListItemButton>


          <ListItemButton component={Link} to='/student-leave-requests'>
            <ListItemIcon>
              <ChecklistIcon />
            </ListItemIcon>
            <ListItemText primary={isOpen ? "Leave Requests" : ""} />
          </ListItemButton>

          
          <ListItemButton onClick={() => handleSubmenuToggle('mess')}>
            <ListItemIcon>
              <RestaurantIcon />
            </ListItemIcon>
            <ListItemText primary={isOpen ? "Mess Details" : ""} />
            {isOpen && (openSubmenu.mess ? <ExpandLessIcon /> : <ExpandMoreIcon />)}
          </ListItemButton>

          <Collapse in={openSubmenu.mess} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              <ListItemButton sx={{ pl: 4 }} onClick={() => handleSubmenuToggle('groceries')}>
                <ListItemIcon>
                  <ShoppingCartIcon />
                </ListItemIcon>
                <ListItemText primary={isOpen ? "Groceries" : ""} />
                {isOpen && (openSubmenu.groceries ? <ExpandLessIcon /> : <ExpandMoreIcon />)}
              </ListItemButton>

              <Collapse in={openSubmenu.groceries} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  <ListItemButton sx={{ pl: 6 }} style={{ backgroundColor: '#f0f0f0' }} component={Link} to='/admin-grocery-purchased'>
                    <ListItemText primary={isOpen ? "Purchased" : ""} />
                  </ListItemButton>
                  <ListItemButton sx={{ pl: 6 }} style={{ backgroundColor: '#f0f0f0' }} component={Link} to='/admin-grocery-consumed'>
                    <ListItemText primary={isOpen ? "Consumed" : ""} />
                  </ListItemButton>
                </List>
              </Collapse>
            </List>

            <List component="div" disablePadding>
              <ListItemButton sx={{ pl: 4 }} onClick={() => handleSubmenuToggle('essentials')}>
                <ListItemIcon>
                  <LocalGasStationIcon />
                </ListItemIcon>
                <ListItemText primary={isOpen ? "Essentials" : ""} />
                {isOpen && (openSubmenu.essentials ? <ExpandLessIcon /> : <ExpandMoreIcon />)}
              </ListItemButton>

              <Collapse in={openSubmenu.essentials} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  <ListItemButton sx={{ pl: 6 }} style={{ backgroundColor: '#f0f0f0' }} component={Link} to='/admin/essential/gas'>
                    <ListItemText primary={isOpen ? "Gas" : ""} />
                  </ListItemButton>
                </List>
              </Collapse>

              <ListItemButton sx={{ pl: 4 }} component={Link} to='/admin/mess-details/staff-salary'>
                <ListItemIcon>
                  <AssignmentTurnedInIcon />
                </ListItemIcon>
                <ListItemText primary={isOpen ? "Staff Salaries" : ""} />
              </ListItemButton>

              <ListItemButton sx={{ pl: 4 }} component={Link} to='/admin/mess-details/leave-verification'>
                <ListItemIcon>
                  <VisibilityIcon />
                </ListItemIcon>
                <ListItemText primary={isOpen ? "Monthly Leave Verification" : ""} />
              </ListItemButton>

              <ListItemButton sx={{ pl: 4 }} component={Link} to='/student-attendance'>
                <ListItemIcon>
                  <CheckIcon />
                </ListItemIcon>
                <ListItemText primary={isOpen ? "Student Attendance" : ""} />
              </ListItemButton>
              
              <ListItemButton sx={{ pl: 4 }} component={Link} to='/admin/mess-details/issue-bill'>
                <ListItemIcon>
                  <ReceiptIcon />
                </ListItemIcon>
                <ListItemText primary={isOpen ? "Issue Mess Bill" : ""} />
              </ListItemButton>
              {/* <ListItemButton sx={{ pl: 4 }}>
                <ListItemIcon>
                  <VisibilityIcon />
                </ListItemIcon>
                <ListItemText primary={isOpen ? "View Bill Status" : ""} />
              </ListItemButton> */}
            </List>
          </Collapse>

          

          {/* <ListItemButton>
            <ListItemIcon>
              <WorkIcon />
            </ListItemIcon>
            <ListItemText primary={isOpen ? "Vacate Requests" : ""} />
          </ListItemButton> */}
        </List>
      </Drawer>
    </Box>
  );
}


Sidebar.propTypes = {
  isOpen: PropTypes.bool.isRequired, 
  onToggle: PropTypes.func.isRequired, 
};

export default Sidebar;
