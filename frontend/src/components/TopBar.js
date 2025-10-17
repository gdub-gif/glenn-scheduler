import React from 'react';
import { useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Box,
  Typography,
  InputBase,
  Avatar,
  IconButton,
  Badge,
} from '@mui/material';
import {
  Search as SearchIcon,
  Notifications as NotificationsIcon,
  KeyboardArrowDown as ArrowDownIcon,
} from '@mui/icons-material';

export default function TopBar() {
  const location = useLocation();

  // Get page title based on route
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/dashboard') return 'Dashboard';
    if (path === '/calendar') return 'Planning';
    if (path === '/resources') return 'Resources';
    if (path === '/resources/roles') return 'Rollen';
    if (path === '/resources/skills') return 'Skills';
    if (path === '/clients') return 'Klanten';
    if (path === '/projects') return 'Projecten';
    if (path === '/clusters') return 'Clusters';
    if (path === '/analytics') return 'Analytics';
    if (path === '/settings') return 'Settings';
    return 'Dashboard';
  };

  return (
    <AppBar 
      position="sticky" 
      elevation={0}
      sx={{ 
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        color: '#2d3748',
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        {/* Left side - Title */}
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          {getPageTitle()}
        </Typography>

        {/* Right side - Search and User */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {/* Search Bar */}
          <Box sx={{ 
            position: 'relative',
            borderRadius: '8px',
            backgroundColor: '#f7fafc',
            '&:hover': {
              backgroundColor: '#edf2f7',
            },
            width: 350,
          }}>
            <Box sx={{ 
              position: 'absolute',
              pointerEvents: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              pl: 2,
            }}>
              <SearchIcon sx={{ color: '#a0aec0' }} />
            </Box>
            <InputBase
              placeholder="Search..."
              sx={{
                color: 'inherit',
                width: '100%',
                '& .MuiInputBase-input': {
                  padding: '10px 16px 10px 48px',
                  fontSize: '0.9rem',
                },
              }}
            />
          </Box>

          {/* Notifications */}
          <IconButton>
            <Badge badgeContent={3} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>

          {/* User Profile */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center',
            gap: 1.5,
            cursor: 'pointer',
            '&:hover': {
              opacity: 0.8,
            },
          }}>
            <Avatar 
              alt="Prem Shahi" 
              src="/static/images/avatar/1.jpg"
              sx={{ width: 40, height: 40 }}
            />
            <Box sx={{ display: { xs: 'none', md: 'block' } }}>
              <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                Prem Shahi
              </Typography>
              <Typography variant="caption" sx={{ color: '#718096' }}>
                Admin
              </Typography>
            </Box>
            <ArrowDownIcon sx={{ color: '#a0aec0' }} />
          </Box>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
