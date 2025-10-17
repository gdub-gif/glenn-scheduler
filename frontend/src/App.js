import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Navigation from './components/Navigation';
import Dashboard from './components/Dashboard';
import Resources from './components/Resources';
import Roles from './components/Roles';
import Skills from './components/Skills';
import Clients from './components/Clients';
import Projects from './components/Projects';
import Scheduler from './components/Scheduler';
import CalendarView from './components/CalendarView';
import Clusters from './components/Clusters';
import TopBar from './components/TopBar';

// Modern CodingLab stijl
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { 
      main: '#4a90e2',
      light: '#6fa8ec',
      dark: '#357abd',
    },
    secondary: { 
      main: '#11cdef',
      light: '#40d7f3',
      dark: '#0ba5c7',
    },
    success: {
      main: '#2dce89',
      light: '#57d8a3',
      dark: '#20a56d',
    },
    warning: {
      main: '#fb6340',
      light: '#fc8366',
      dark: '#f9431f',
    },
    error: {
      main: '#f5365c',
      light: '#f75e7d',
      dark: '#f3124d',
    },
    background: {
      default: '#f5f7fa',
      paper: '#ffffff',
    },
    text: {
      primary: '#2d3748',
      secondary: '#718096',
    },
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: "'Inter', 'Segoe UI', 'Roboto', sans-serif",
    fontSize: 14,
    h4: { 
      fontWeight: 700,
      fontSize: '1.75rem',
      color: '#2d3748',
    },
    h5: { 
      fontWeight: 600,
      fontSize: '1.5rem',
      color: '#2d3748',
    },
    h6: { 
      fontWeight: 600,
      fontSize: '1.25rem',
      color: '#2d3748',
    },
    subtitle1: { 
      fontWeight: 500,
      color: '#718096',
    },
    body1: {
      fontSize: '0.95rem',
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          border: '1px solid #e2e8f0',
          borderRadius: 12,
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
          transition: 'transform 0.2s, box-shadow 0.2s',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
          fontWeight: 600,
          padding: '8px 16px',
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontWeight: 600,
          color: '#4a5568',
          backgroundColor: '#f7fafc',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 500,
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box sx={{ display: 'flex', backgroundColor: '#f5f7fa', minHeight: '100vh' }}>
          <Navigation />
          <Box
            component="main"
            sx={{
              flexGrow: 1,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <TopBar />
            <Box sx={{ p: 3, flexGrow: 1 }}>
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/calendar" element={<CalendarView />} />
                <Route path="/resources" element={<Resources />} />
                <Route path="/resources/roles" element={<Roles />} />
                <Route path="/resources/skills" element={<Skills />} />
                <Route path="/clients" element={<Clients />} />
                <Route path="/projects" element={<Projects />} />
                <Route path="/clusters" element={<Clusters />} />
                <Route path="/scheduler" element={<Scheduler />} />
                <Route path="/analytics" element={<Dashboard />} />
                <Route path="/settings" element={<Dashboard />} />
              </Routes>
            </Box>
          </Box>
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App;
