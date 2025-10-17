import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
  Collapse,
  Divider,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Business as BusinessIcon,
  Work as WorkIcon,
  CalendarMonth as CalendarIcon,
  Assessment as AssessmentIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  ExpandLess,
  ExpandMore,
  WorkOutline as RolesIcon,
  Stars as SkillsIcon,
  AccountTree as ClustersIcon,
} from '@mui/icons-material';

const drawerWidth = 240;

const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
  { text: 'Planning', icon: <CalendarIcon />, path: '/calendar' },
  { 
    text: 'Resources', 
    icon: <PeopleIcon />, 
    path: '/resources',
    submenu: [
      { text: 'Alle Resources', path: '/resources' },
      { text: 'Rollen', icon: <RolesIcon />, path: '/resources/roles' },
      { text: 'Skills', icon: <SkillsIcon />, path: '/resources/skills' },
    ]
  },
  { text: 'Klanten', icon: <BusinessIcon />, path: '/clients' },
  { text: 'Projecten', icon: <WorkIcon />, path: '/projects' },
  { text: 'Clusters', icon: <ClustersIcon />, path: '/clusters' },
  { text: 'Analytics', icon: <AssessmentIcon />, path: '/analytics' },
  { text: 'Setting', icon: <SettingsIcon />, path: '/settings' },
];

export default function Navigation() {
  const location = useLocation();
  const [resourcesOpen, setResourcesOpen] = useState(true);

  const handleResourcesClick = () => {
    setResourcesOpen(!resourcesOpen);
  };

  const isActivePath = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          backgroundColor: '#0a2351',
          color: '#fff',
          border: 'none',
        },
      }}
    >
      {/* Logo/Header */}
      <Box sx={{ 
        p: 2.5, 
        display: 'flex', 
        alignItems: 'center',
        gap: 1.5,
      }}>
        <Box sx={{ 
          width: 40, 
          height: 40, 
          borderRadius: '8px',
          backgroundColor: '#1e3a8a',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 700,
          fontSize: '1.25rem',
          color: '#fff',
        }}>
          G
        </Box>
        <Typography variant="h6" sx={{ 
          fontWeight: 600,
          fontSize: '1.25rem',
        }}>
          CodingLab
        </Typography>
      </Box>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', mx: 2 }} />

      {/* Menu Items */}
      <List sx={{ px: 1.5, pt: 2 }}>
        {menuItems.map((item) => (
          <React.Fragment key={item.text}>
            {item.submenu ? (
              <>
                <ListItem disablePadding sx={{ mb: 0.5 }}>
                  <ListItemButton
                    onClick={handleResourcesClick}
                    sx={{
                      borderRadius: '8px',
                      '&:hover': {
                        backgroundColor: 'rgba(255,255,255,0.08)',
                      },
                      ...(isActivePath(item.path) && {
                        backgroundColor: 'rgba(255,255,255,0.12)',
                      }),
                    }}
                  >
                    <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText 
                      primary={item.text}
                      primaryTypographyProps={{
                        fontSize: '0.95rem',
                        fontWeight: isActivePath(item.path) ? 600 : 400,
                      }}
                    />
                    {resourcesOpen ? <ExpandLess /> : <ExpandMore />}
                  </ListItemButton>
                </ListItem>
                <Collapse in={resourcesOpen} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    {item.submenu.map((subItem) => (
                      <ListItem key={subItem.text} disablePadding sx={{ mb: 0.5 }}>
                        <ListItemButton
                          component={Link}
                          to={subItem.path}
                          sx={{
                            pl: 4,
                            borderRadius: '8px',
                            '&:hover': {
                              backgroundColor: 'rgba(255,255,255,0.08)',
                            },
                            ...(location.pathname === subItem.path && {
                              backgroundColor: 'rgba(255,255,255,0.12)',
                            }),
                          }}
                        >
                          {subItem.icon && (
                            <ListItemIcon sx={{ color: 'inherit', minWidth: 36 }}>
                              {subItem.icon}
                            </ListItemIcon>
                          )}
                          <ListItemText 
                            primary={subItem.text}
                            primaryTypographyProps={{
                              fontSize: '0.9rem',
                              fontWeight: location.pathname === subItem.path ? 600 : 400,
                            }}
                          />
                        </ListItemButton>
                      </ListItem>
                    ))}
                  </List>
                </Collapse>
              </>
            ) : (
              <ListItem disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  component={Link}
                  to={item.path}
                  sx={{
                    borderRadius: '8px',
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.08)',
                    },
                    ...(location.pathname === item.path && {
                      backgroundColor: 'rgba(255,255,255,0.12)',
                    }),
                  }}
                >
                  <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={item.text}
                    primaryTypographyProps={{
                      fontSize: '0.95rem',
                      fontWeight: location.pathname === item.path ? 600 : 400,
                    }}
                  />
                </ListItemButton>
              </ListItem>
            )}
          </React.Fragment>
        ))}
      </List>

      {/* Logout Button at Bottom */}
      <Box sx={{ mt: 'auto', p: 1.5 }}>
        <ListItem disablePadding>
          <ListItemButton
            sx={{
              borderRadius: '8px',
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.08)',
              },
            }}
          >
            <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText 
              primary="Log out"
              primaryTypographyProps={{
                fontSize: '0.95rem',
              }}
            />
          </ListItemButton>
        </ListItem>
      </Box>
    </Drawer>
  );
}
