import React, { useState, useEffect } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
} from '@mui/material';
import {
  People as PeopleIcon,
  Business as BusinessIcon,
  Work as WorkIcon,
  CalendarMonth as CalendarIcon,
} from '@mui/icons-material';
import { getResources, getClients, getProjects, getBookings } from '../services/api';

export default function Dashboard() {
  const [stats, setStats] = useState({
    resources: 0,
    clients: 0,
    projects: 0,
    bookings: 0,
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [resourcesRes, clientsRes, projectsRes, bookingsRes] = await Promise.all([
        getResources(),
        getClients(),
        getProjects(),
        getBookings(),
      ]);

      setStats({
        resources: resourcesRes.data.length,
        clients: clientsRes.data.length,
        projects: projectsRes.data.length,
        bookings: bookingsRes.data.length,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const statCards = [
    {
      title: 'Resources',
      value: stats.resources,
      icon: <PeopleIcon sx={{ fontSize: 40 }} />,
      color: '#1976d2',
    },
    {
      title: 'Clients',
      value: stats.clients,
      icon: <BusinessIcon sx={{ fontSize: 40 }} />,
      color: '#2e7d32',
    },
    {
      title: 'Projects',
      value: stats.projects,
      icon: <WorkIcon sx={{ fontSize: 40 }} />,
      color: '#ed6c02',
    },
    {
      title: 'Bookings',
      value: stats.bookings,
      icon: <CalendarIcon sx={{ fontSize: 40 }} />,
      color: '#9c27b0',
    },
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <Grid container spacing={3}>
        {statCards.map((card) => (
          <Grid item xs={12} sm={6} md={3} key={card.title}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography color="textSecondary" gutterBottom>
                      {card.title}
                    </Typography>
                    <Typography variant="h4">
                      {card.value}
                    </Typography>
                  </Box>
                  <Box sx={{ color: card.color }}>
                    {card.icon}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      <Box sx={{ mt: 3 }}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Welcome to Glenn's Resource Scheduler
          </Typography>
          <Typography variant="body1">
            Manage your resources, clients, projects, and bookings all in one place.
          </Typography>
        </Paper>
      </Box>
    </Box>
  );
}
