import React, { useState, useEffect } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  Chip,
} from '@mui/material';
import {
  People as PeopleIcon,
  Business as BusinessIcon,
  Work as WorkIcon,
  CalendarMonth as CalendarIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import { getResources, getClients, getProjects, getBookings } from '../services/api';

export default function Dashboard() {
  const [stats, setStats] = useState({
    resources: 0,
    clients: 0,
    projects: 0,
    bookings: 0,
  });
  const [resourceUtilization, setResourceUtilization] = useState([]);
  const [skillUtilization, setSkillUtilization] = useState([]);

  useEffect(() => {
    loadStats();
    loadUtilization();
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

  const loadUtilization = async () => {
    try {
      const [resourcesRes, bookingsRes] = await Promise.all([
        getResources(),
        getBookings(),
      ]);

      const resources = resourcesRes.data;
      const bookings = bookingsRes.data;

      // Calculate resource utilization
      const resourceUtil = resources
        .filter(r => r.availableHours > 0)
        .map(resource => {
          const resourceBookings = bookings.filter(b => b.resourceId === resource.id);
          const bookedHours = resourceBookings.reduce((sum, b) => sum + (b.hours || 0), 0);
          const utilization = (bookedHours / resource.availableHours) * 100;

          return {
            id: resource.id,
            name: resource.name,
            availableHours: resource.availableHours,
            bookedHours: bookedHours,
            utilization: Math.min(utilization, 100),
            skills: resource.skills || [],
            roles: resource.roles || [],
          };
        })
        .sort((a, b) => b.utilization - a.utilization);

      setResourceUtilization(resourceUtil);

      // Calculate skill utilization
      const skillMap = new Map();
      
      resources.forEach(resource => {
        if (resource.skills && resource.availableHours > 0) {
          resource.skills.forEach(skill => {
            if (!skillMap.has(skill)) {
              skillMap.set(skill, {
                skill: skill,
                totalAvailableHours: 0,
                totalBookedHours: 0,
                resourceCount: 0,
              });
            }
            
            const skillData = skillMap.get(skill);
            skillData.totalAvailableHours += resource.availableHours;
            skillData.resourceCount += 1;

            // Add booked hours for this resource
            const resourceBookings = bookings.filter(b => b.resourceId === resource.id);
            const bookedHours = resourceBookings.reduce((sum, b) => sum + (b.hours || 0), 0);
            skillData.totalBookedHours += bookedHours;
          });
        }
      });

      const skillUtil = Array.from(skillMap.values())
        .map(skill => ({
          ...skill,
          utilization: (skill.totalBookedHours / skill.totalAvailableHours) * 100,
        }))
        .sort((a, b) => b.utilization - a.utilization);

      setSkillUtilization(skillUtil);

    } catch (error) {
      console.error('Error loading utilization:', error);
    }
  };

  const getUtilizationColor = (utilization) => {
    if (utilization >= 90) return 'error';
    if (utilization >= 70) return 'warning';
    if (utilization >= 40) return 'success';
    return 'info';
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

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
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

      {/* Resource Utilization */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <TrendingUpIcon sx={{ mr: 1, color: '#1976d2' }} />
              <Typography variant="h6">
                Resource Utilization
              </Typography>
            </Box>
            {resourceUtilization.length === 0 ? (
              <Typography color="textSecondary">
                No resources with available hours yet.
              </Typography>
            ) : (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell align="right">Booked</TableCell>
                      <TableCell align="right">Available</TableCell>
                      <TableCell align="right">Utilization</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {resourceUtilization.map((resource) => (
                      <TableRow key={resource.id}>
                        <TableCell>
                          <Box>
                            <Typography variant="body2">{resource.name}</Typography>
                            {resource.roles.length > 0 && (
                              <Box sx={{ mt: 0.5 }}>
                                {resource.roles.slice(0, 2).map((role, idx) => (
                                  <Chip
                                    key={idx}
                                    label={role}
                                    size="small"
                                    sx={{ mr: 0.5, height: 18, fontSize: '0.7rem' }}
                                  />
                                ))}
                              </Box>
                            )}
                          </Box>
                        </TableCell>
                        <TableCell align="right">{resource.bookedHours.toFixed(1)}h</TableCell>
                        <TableCell align="right">{resource.availableHours}h</TableCell>
                        <TableCell align="right">
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                            <Box sx={{ width: 60, mr: 1 }}>
                              <LinearProgress
                                variant="determinate"
                                value={resource.utilization}
                                color={getUtilizationColor(resource.utilization)}
                              />
                            </Box>
                            <Typography variant="body2" color="textSecondary">
                              {resource.utilization.toFixed(0)}%
                            </Typography>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        </Grid>

        {/* Skill Utilization */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <TrendingUpIcon sx={{ mr: 1, color: '#2e7d32' }} />
              <Typography variant="h6">
                Skill Utilization
              </Typography>
            </Box>
            {skillUtilization.length === 0 ? (
              <Typography color="textSecondary">
                No skills defined yet.
              </Typography>
            ) : (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Skill</TableCell>
                      <TableCell align="right">Resources</TableCell>
                      <TableCell align="right">Booked</TableCell>
                      <TableCell align="right">Available</TableCell>
                      <TableCell align="right">Utilization</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {skillUtilization.map((skill) => (
                      <TableRow key={skill.skill}>
                        <TableCell>
                          <Chip
                            label={skill.skill}
                            size="small"
                            color="primary"
                          />
                        </TableCell>
                        <TableCell align="right">{skill.resourceCount}</TableCell>
                        <TableCell align="right">{skill.totalBookedHours.toFixed(1)}h</TableCell>
                        <TableCell align="right">{skill.totalAvailableHours}h</TableCell>
                        <TableCell align="right">
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                            <Box sx={{ width: 60, mr: 1 }}>
                              <LinearProgress
                                variant="determinate"
                                value={Math.min(skill.utilization, 100)}
                                color={getUtilizationColor(skill.utilization)}
                              />
                            </Box>
                            <Typography variant="body2" color="textSecondary">
                              {skill.utilization.toFixed(0)}%
                            </Typography>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        </Grid>
      </Grid>

      <Box sx={{ mt: 3 }}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Welcome to Glenn's Resource Scheduler
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Track your resources, monitor utilization, and optimize your team's capacity.
          </Typography>
        </Paper>
      </Box>
    </Box>
  );
}
