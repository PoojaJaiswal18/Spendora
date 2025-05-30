import React, { useState } from 'react';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Switch,
  Tooltip,
  Fade,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  CloudUpload as UploadIcon,
  Assessment as ReportsIcon,
  Analytics as AnalyticsIcon,
  EmojiEvents as ChallengesIcon,
  Settings as SettingsIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
  AccountCircle,
  Notifications,
} from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';
import { useThemeContext } from '../../App';
import { ANIMATION_DURATIONS } from '../../utils/constants';
import { localStorage } from '../../utils/localStorage';

const drawerWidth = 280;

interface LayoutProps {
  children: React.ReactNode;
}

const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
  { text: 'Upload Receipt', icon: <UploadIcon />, path: '/upload' },
  { text: 'Reports', icon: <ReportsIcon />, path: '/reports' },
  { text: 'Analytics', icon: <AnalyticsIcon />, path: '/analytics' },
  { text: 'Challenges', icon: <ChallengesIcon />, path: '/challenges' },
];

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const { darkMode, toggleDarkMode } = useThemeContext();
  const location = useLocation();
  const navigate = useNavigate();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    if (isMobile) {
      setMobileOpen(false);
    }
    
    // Store recent navigation for analytics
    const recentPages = localStorage.getItem('recentPages', []);
    const updatedPages = [path, ...recentPages.filter(p => p !== path)].slice(0, 5);
    localStorage.setItem('recentPages', updatedPages);
  };

  const drawer = (
    <Box
      sx={{
        height: '100%',
        background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.primary.dark}15 100%)`,
        backdropFilter: 'blur(10px)',
      }}
    >
      <Box
        sx={{
          p: 3,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: '12px',
            background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            animation: 'pulse 2s infinite',
          }}
        >
          <Typography variant="h6" fontWeight="bold" color="white">
            S
          </Typography>
        </Box>
        <Typography
          variant="h6"
          fontWeight="bold"
          className="gradient-text"
          sx={{ fontSize: '1.5rem' }}
        >
          Spendora
        </Typography>
      </Box>

      <List sx={{ px: 2, py: 1 }}>
        {menuItems.map((item, index) => (
          <Fade in timeout={ANIMATION_DURATIONS.MEDIUM + index * 100} key={item.text}>
            <ListItem disablePadding sx={{ mb: 1 }}>
              <ListItemButton
                onClick={() => handleNavigation(item.path)}
                selected={location.pathname === item.path}
                sx={{
                  borderRadius: '12px',
                  py: 1.5,
                  px: 2,
                  transition: `all ${ANIMATION_DURATIONS.MEDIUM}ms cubic-bezier(0.4, 0, 0.2, 1)`,
                  '&.Mui-selected': {
                    background: `linear-gradient(135deg, ${theme.palette.primary.main}20, ${theme.palette.secondary.main}10)`,
                    border: `1px solid ${theme.palette.primary.main}30`,
                    '&:hover': {
                      background: `linear-gradient(135deg, ${theme.palette.primary.main}30, ${theme.palette.secondary.main}15)`,
                    },
                  },
                  '&:hover': {
                    background: `${theme.palette.action.hover}`,
                    transform: 'translateX(4px)',
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    color: location.pathname === item.path 
                      ? theme.palette.primary.main 
                      : theme.palette.text.secondary,
                    minWidth: 40,
                    transition: `color ${ANIMATION_DURATIONS.MEDIUM}ms ease`,
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  sx={{
                    '& .MuiListItemText-primary': {
                      fontWeight: location.pathname === item.path ? 600 : 400,
                      color: location.pathname === item.path 
                        ? theme.palette.primary.main 
                        : theme.palette.text.primary,
                    },
                  }}
                />
              </ListItemButton>
            </ListItem>
          </Fade>
        ))}
      </List>

      <Divider sx={{ mx: 2, my: 2 }} />

      <Box sx={{ px: 3, py: 2 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            p: 2,
            borderRadius: '12px',
            background: `${theme.palette.background.default}50`,
            border: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {darkMode ? <DarkModeIcon /> : <LightModeIcon />}
            <Typography variant="body2">
              {darkMode ? 'Dark' : 'Light'} Mode
            </Typography>
          </Box>
          <Switch
            checked={darkMode}
            onChange={toggleDarkMode}
            size="small"
            sx={{
              '& .MuiSwitch-thumb': {
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              },
            }}
          />
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', width: '100%' }}>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          background: `${theme.palette.background.paper}95`,
          backdropFilter: 'blur(10px)',
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton
              color="inherit"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ display: { md: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
            <Typography
              variant="h6"
              component="div"
              sx={{
                fontWeight: 600,
                color: theme.palette.text.primary,
              }}
            >
              {menuItems.find(item => item.path === location.pathname)?.text || 'Dashboard'}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Tooltip title="Notifications">
              <IconButton
                sx={{
                  color: theme.palette.text.primary,
                  transition: `all ${ANIMATION_DURATIONS.MEDIUM}ms ease`,
                  '&:hover': {
                    background: `${theme.palette.primary.main}20`,
                    transform: 'scale(1.1)',
                  },
                }}
              >
                <Notifications />
              </IconButton>
            </Tooltip>
            <Tooltip title="Profile">
              <IconButton
                sx={{
                  color: theme.palette.text.primary,
                  transition: `all ${ANIMATION_DURATIONS.MEDIUM}ms ease`,
                  '&:hover': {
                    background: `${theme.palette.primary.main}20`,
                    transform: 'scale(1.1)',
                  },
                }}
              >
                <Avatar
                  sx={{
                    width: 32,
                    height: 32,
                    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  }}
                >
                  <AccountCircle />
                </Avatar>
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              border: 'none',
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              border: 'none',
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          mt: '64px',
          minHeight: 'calc(100vh - 64px)',
          background: `linear-gradient(135deg, ${theme.palette.background.default} 0%, ${theme.palette.primary.dark}05 100%)`,
        }}
      >
        <Fade in timeout={ANIMATION_DURATIONS.LONG}>
          <Box className="fade-in-up">
            {children}
          </Box>
        </Fade>
      </Box>
    </Box>
  );
};

export default Layout;
