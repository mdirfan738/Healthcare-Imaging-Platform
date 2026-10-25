import React, { useState } from 'react';
import {
  Outlet,
  useNavigate,
  Link as RouterLink,
  useLocation,
} from 'react-router-dom';

import {
  AppBar,
  Toolbar,
  Typography,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  Chip,
} from '@mui/material';

import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import SearchIcon from '@mui/icons-material/Search';
import EventIcon from '@mui/icons-material/Event';
import AssignmentIcon from '@mui/icons-material/Assignment';
import DescriptionIcon from '@mui/icons-material/Description';
import HistoryIcon from '@mui/icons-material/History';

import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { logout } from '../../features/auth/authSlice';
import Can from '../rbac/Can';

const drawerWidth = 240;

type Permission =
  | 'PATIENT_CREATE'
  | 'APPOINTMENT_MANAGE'
  | 'WORKLIST_VIEW'
  | 'REPORT_WRITE'
  | 'AUDIT_VIEW'
  | null;

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  permission: Permission;
}

const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    path: '/dashboard',
    icon: <DashboardIcon />,
    permission: null,
  },
  {
    label: 'Register Patient',
    path: '/patients/register',
    icon: <PersonAddIcon />,
    permission: 'PATIENT_CREATE',
  },
  {
    label: 'Search Patients',
    path: '/patients/search',
    icon: <SearchIcon />,
    permission: null,
  },
  {
    label: 'Appointments',
    path: '/appointments',
    icon: <EventIcon />,
    permission: 'APPOINTMENT_MANAGE',
  },
  {
    label: 'Radiologist Worklist',
    path: '/worklist',
    icon: <AssignmentIcon />,
    permission: 'WORKLIST_VIEW',
  },
  {
    label: 'Reports',
    path: '/reports',
    icon: <DescriptionIcon />,
    permission: 'REPORT_WRITE',
  },
  {
    label: 'Audit Logs',
    path: '/audit-logs',
    icon: <HistoryIcon />,
    permission: 'AUDIT_VIEW',
  },
];

const AppLayout: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { user } = useAppSelector((state) => state.auth);

  const handleDrawerToggle = () => {
    setMobileOpen((prev) => !prev);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    handleMenuClose();
    await dispatch(logout());
    navigate('/login');
  };

  const drawerContent = (
    <>
      <Toolbar>
        <Typography
          component="div"
          variant="h6"
          noWrap
          color="primary"
          sx={{ fontWeight: 700 }}
        >
          RIS
        </Typography>
      </Toolbar>

      <Divider />

      <List>
        {navItems.map((item) => {
          const button = (
            <ListItemButton
              key={item.path}
              component={RouterLink}
              to={item.path}
              selected={location.pathname.startsWith(item.path)}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>

              <ListItemText primary={item.label} />
            </ListItemButton>
          );

          return item.permission ? (
            <Can
              key={item.path}
              permission={item.permission}
            >
              {button}
            </Can>
          ) : (
            button
          );
        })}
      </List>
    </>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            aria-label="open navigation"
            onClick={handleDrawerToggle}
            sx={{
              mr: 2,
              display: {
                sm: 'none',
              },
            }}
          >
            <MenuIcon />
          </IconButton>

          <Typography
            component="div"
            variant="h6"
            noWrap
            sx={{
              flexGrow: 1,
            }}
          >
            Radiology Information System
          </Typography>

          {user && (
            <Chip
              label={user.role}
              size="small"
              sx={{
                mr: 2,
                bgcolor: 'rgba(255,255,255,0.2)',
                color: '#fff',
              }}
            />
          )}

          <IconButton
            aria-label="Account menu"
            onClick={(event) => setAnchorEl(event.currentTarget)}
          >
            <Avatar
              sx={{
                width: 32,
                height: 32,
                bgcolor: 'secondary.main',
              }}
            >
              {user?.fullName?.charAt(0) ?? '?'}
            </Avatar>
          </IconButton>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem disabled>
              {user?.fullName ?? 'Unknown User'}
            </MenuItem>

            <Divider />

            <MenuItem onClick={handleLogout}>
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{
          width: {
            sm: drawerWidth,
          },
          flexShrink: {
            sm: 0,
          },
        }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: {
              xs: 'block',
              sm: 'none',
            },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
            },
          }}
        >
          {drawerContent}
        </Drawer>

        <Drawer
          variant="permanent"
          open
          sx={{
            display: {
              xs: 'none',
              sm: 'block',
            },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
            },
          }}
        >
          {drawerContent}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          mt: 8,
          width: {
            sm: `calc(100% - ${drawerWidth}px)`,
          },
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default AppLayout;