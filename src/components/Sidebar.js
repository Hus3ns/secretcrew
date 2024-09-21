// src/components/Sidebar.js

import React from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase/firebase'; // Adjusted path
import { styled, useTheme } from '@mui/material/styles';
import MuiDrawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import HomeIcon from '@mui/icons-material/Home';
import GroupIcon from '@mui/icons-material/Group';
import PersonIcon from '@mui/icons-material/Person';
import AssessmentIcon from '@mui/icons-material/Assessment';
import LogoutIcon from '@mui/icons-material/Logout';
import { Link, useNavigate } from 'react-router-dom';

const drawerWidth = 240;

const openedMixin = (theme) => ({
  width: drawerWidth,
  backgroundColor: theme.palette.background.paper,
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: 'hidden',
});

const closedMixin = (theme) => ({
  backgroundColor: theme.palette.background.paper,
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: 'hidden',
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up('sm')]: {
    width: `calc(${theme.spacing(9)} + 1px)`,
  },
});

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
}));

const DrawerStyled = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: 'nowrap',
    boxSizing: 'border-box',
    boxShadow: '2px 0 5px rgba(0, 0, 0, 0.1)', // Subtle shadow for better separation
    ...(open && {
      ...openedMixin(theme),
      '& .MuiDrawer-paper': openedMixin(theme),
    }),
    ...(!open && {
      ...closedMixin(theme),
      '& .MuiDrawer-paper': closedMixin(theme),
    }),
  }),
);

const Sidebar = ({ open, handleDrawerClose }) => {
  const theme = useTheme();
  const navigate = useNavigate();

  const handleLogOut = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  };

  return (
    <DrawerStyled variant="permanent" open={open}>
      <DrawerHeader>
        <IconButton onClick={handleDrawerClose}>
          {theme.direction === 'rtl' ? <ChevronRightIcon /> : <ChevronLeftIcon />}
        </IconButton>
      </DrawerHeader>
      <Divider />

      <List>
        <ListItem button component={Link} to="/">
          <ListItemIcon>
            <HomeIcon sx={{ color: theme.palette.primary.main }} />
          </ListItemIcon>
          <ListItemText primary="Home" />
        </ListItem>

        <ListItem button component={Link} to="/host-management">
          <ListItemIcon>
            <GroupIcon sx={{ color: theme.palette.primary.main }} />
          </ListItemIcon>
          <ListItemText primary="Host Management" />
        </ListItem>

        <ListItem button component={Link} to="/user-management">
          <ListItemIcon>
            <PersonIcon sx={{ color: theme.palette.primary.main }} />
          </ListItemIcon>
          <ListItemText primary="User Management" />
        </ListItem>

        <ListItem button component={Link} to="/reports">
          <ListItemIcon>
            <AssessmentIcon sx={{ color: theme.palette.primary.main }} />
          </ListItemIcon>
          <ListItemText primary="Reports" />
        </ListItem>

        <Divider sx={{ my: 1 }} />

        <ListItem button onClick={handleLogOut}>
          <ListItemIcon>
            <LogoutIcon sx={{ color: theme.palette.error.main }} />
          </ListItemIcon>
          <ListItemText primary="Logout" />
        </ListItem>
      </List>
    </DrawerStyled>
  );
};

export default Sidebar;
