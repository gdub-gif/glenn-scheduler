import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  IconButton,
  Chip,
  Tooltip,
  ToggleButtonGroup,
  ToggleButton,
} from '@mui/material';
import {
  ChevronLeft,
  ChevronRight,
  Add as AddIcon,
  CalendarViewWeek,
  CalendarViewMonth,
} from '@mui/icons-material';
import {
  getBookings,
  createBooking,
  updateBooking,
  deleteBooking,
  getResources,
  getProjects,
} from '../services/api';

const COLORS = [
  '#1976d2', '#2e7d32', '#ed6c02', '#9c27b0', '#d32f2f',
  '#0288d1', '#388e3c', '#f57c00', '#7b1fa2', '#c62828',
];

const HOURS = Array.from({ length: 10 }, (_, i) => i + 8); // 8:00 - 17:00

export default function CalendarView() {
  const [bookings, setBookings] = useState([]);
  const [resources, setResources] = useState([]);
  const [projects, setProjects] = useState([]);
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [view, setView] = useState('week');
  const [open, setOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [formData, setFormData] = useState({
    resourceId: '',
    projectId: '',
    startDate: '',
    endDate: '',
    hours: '',
    notes: '',
    status: 'confirmed',
  });
  const [draggedBooking, setDraggedBooking] = useState(null);
  const [projectColors, setProjectColors] = useState({});

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    // Assign colors to projects
    const colors = {};
    projects.forEach((project, index) => {
      colors[project.id] = COLORS[index % COLORS.length];
    });
    setProjectColors(colors);
  }, [projects]);

  const loadData = async () => {
    try {
      const [bookingsRes, resourcesRes, projectsRes] = await Promise.all([
        getBookings(),
        getResources(),
        getProjects(),
      ]);

      setBookings(bookingsRes.data);
      setResources(resourcesRes.data);
      setProjects(projectsRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const getWeekDates = () => {
    const start = new Date(currentWeek);
    start.setDate(start.getDate() - start.getDay() + 1); // Monday
    const dates = [];
    for (let i = 0; i < 5; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const weekDates = getWeekDates();

  const navigateWeek = (direction) => {
    const newDate = new Date(currentWeek);
    newDate.setDate(newDate.getDate() + direction * 7);
    setCurrentWeek(newDate);
  };

  const getBookingsForResourceAndDate = (resourceId, date) => {
    return bookings.filter(booking => {
      const bookingStart = new Date(booking.startDate);
      const bookingEnd = new Date(booking.endDate);
      const checkDate = new Date(date);
      checkDate.setHours(0, 0, 0, 0);
      bookingStart.setHours(0, 0, 0, 0);
      bookingEnd.setHours(0, 0, 0, 0);
      
      return booking.resourceId === resourceId && 
             checkDate >= bookingStart && 
             checkDate <= bookingEnd;
    });
  };

  const hasConflict = (resourceId, date, excludeBookingId = null) => {
    const resourceBookings = getBookingsForResourceAndDate(resourceId, date);
    return resourceBookings.some(b => b.id !== excludeBookingId && b.status !== 'cancelled');
  };

  const getProjectName = (projectId) => {
    const project = projects.find(p => p.id === projectId);
    return project ? project.name : 'Unknown';
  };

  const getResourceName = (resourceId) => {
    const resource = resources.find(r => r.id === resourceId);
    return resource ? resource.name : 'Unknown';
  };

  const handleCellClick = (resourceId, date) => {
    setSelectedSlot({ resourceId, date });
    setFormData({
      resourceId,
      projectId: '',
      startDate: date.toISOString().split('T')[0],
      endDate: date.toISOString().split('T')[0],
      hours: '8',
      notes: '',
      status: 'confirmed',
    });
    setEditingBooking(null);
    setOpen(true);
  };

  const handleBookingClick = (booking) => {
    setEditingBooking(booking);
    setFormData({
      resourceId: booking.resourceId,
      projectId: booking.projectId,
      startDate: booking.startDate ? booking.startDate.split('T')[0] : '',
      endDate: booking.endDate ? booking.endDate.split('T')[0] : '',
      hours: booking.hours || '',
      notes: booking.notes || '',
      status: booking.status,
    });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingBooking(null);
    setSelectedSlot(null);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async () => {
    try {
      const data = {
        ...formData,
        hours: formData.hours ? parseFloat(formData.hours) : undefined,
      };

      if (editingBooking) {
        await updateBooking(editingBooking.id, data);
      } else {
        await createBooking(data);
      }

      handleClose();
      loadData();
    } catch (error) {
      console.error('Error saving booking:', error);
    }
  };

  const handleDelete = async () => {
    if (editingBooking && window.confirm('Are you sure you want to delete this booking?')) {
      try {
        await deleteBooking(editingBooking.id);
        handleClose();
        loadData();
      } catch (error) {
        console.error('Error deleting booking:', error);
      }
    }
  };

  const handleDragStart = (e, booking) => {
    setDraggedBooking(booking);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e, resourceId, date) => {
    e.preventDefault();
    if (!draggedBooking) return;

    try {
      const newStartDate = date.toISOString().split('T')[0];
      const originalStart = new Date(draggedBooking.startDate);
      const originalEnd = new Date(draggedBooking.endDate);
      const duration = Math.ceil((originalEnd - originalStart) / (1000 * 60 * 60 * 24));
      
      const newEndDate = new Date(date);
      newEndDate.setDate(newEndDate.getDate() + duration);

      await updateBooking(draggedBooking.id, {
        ...draggedBooking,
        resourceId,
        startDate: newStartDate,
        endDate: newEndDate.toISOString().split('T')[0],
      });

      setDraggedBooking(null);
      loadData();
    } catch (error) {
      console.error('Error moving booking:', error);
    }
  };

  const formatDateHeader = (date) => {
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h4">Calendar</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton onClick={() => navigateWeek(-1)}>
              <ChevronLeft />
            </IconButton>
            <Typography variant="h6" sx={{ minWidth: 200, textAlign: 'center' }}>
              {weekDates[0].toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </Typography>
            <IconButton onClick={() => navigateWeek(1)}>
              <ChevronRight />
            </IconButton>
            <Button size="small" onClick={() => setCurrentWeek(new Date())}>
              Today
            </Button>
          </Box>
        </Box>
        <ToggleButtonGroup
          value={view}
          exclusive
          onChange={(e, newView) => newView && setView(newView)}
          size="small"
        >
          <ToggleButton value="week">
            <CalendarViewWeek sx={{ mr: 1 }} /> Week
          </ToggleButton>
          <ToggleButton value="month">
            <CalendarViewMonth sx={{ mr: 1 }} /> Month
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <Paper sx={{ overflow: 'auto' }}>
        <Box sx={{ minWidth: 1000 }}>
          {/* Header */}
          <Box sx={{ display: 'flex', borderBottom: '2px solid #e0e0e0' }}>
            <Box sx={{ width: 150, p: 2, fontWeight: 600, borderRight: '1px solid #e0e0e0' }}>
              Resource
            </Box>
            {weekDates.map((date, index) => (
              <Box
                key={index}
                sx={{
                  flex: 1,
                  p: 2,
                  textAlign: 'center',
                  fontWeight: 600,
                  borderRight: index < 4 ? '1px solid #e0e0e0' : 'none',
                  backgroundColor: date.toDateString() === new Date().toDateString() ? '#e3f2fd' : 'transparent',
                }}
              >
                {formatDateHeader(date)}
              </Box>
            ))}
          </Box>

          {/* Resource Rows */}
          {resources.map((resource) => (
            <Box
              key={resource.id}
              sx={{ display: 'flex', borderBottom: '1px solid #e0e0e0', minHeight: 80 }}
            >
              <Box
                sx={{
                  width: 150,
                  p: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  borderRight: '1px solid #e0e0e0',
                  backgroundColor: '#fafafa',
                }}
              >
                <Typography variant="body2" fontWeight={500}>
                  {resource.name}
                </Typography>
                {resource.roles && resource.roles.length > 0 && (
                  <Typography variant="caption" color="textSecondary">
                    {resource.roles[0]}
                  </Typography>
                )}
              </Box>
              {weekDates.map((date, dateIndex) => {
                const dayBookings = getBookingsForResourceAndDate(resource.id, date);
                const hasConflicts = hasConflict(resource.id, date);

                return (
                  <Box
                    key={dateIndex}
                    sx={{
                      flex: 1,
                      p: 1,
                      borderRight: dateIndex < 4 ? '1px solid #e0e0e0' : 'none',
                      cursor: 'pointer',
                      position: 'relative',
                      backgroundColor: date.toDateString() === new Date().toDateString() ? '#f5f5f5' : 'white',
                      '&:hover': {
                        backgroundColor: '#f0f0f0',
                      },
                    }}
                    onClick={() => handleCellClick(resource.id, date)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, resource.id, date)}
                  >
                    {dayBookings.map((booking) => (
                      <Tooltip
                        key={booking.id}
                        title={
                          <Box>
                            <Typography variant="body2">{getProjectName(booking.projectId)}</Typography>
                            <Typography variant="caption">
                              {booking.hours}h - {booking.status}
                            </Typography>
                            {booking.notes && (
                              <Typography variant="caption" display="block">
                                {booking.notes}
                              </Typography>
                            )}
                          </Box>
                        }
                      >
                        <Box
                          draggable
                          onDragStart={(e) => handleDragStart(e, booking)}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleBookingClick(booking);
                          }}
                          sx={{
                            mb: 0.5,
                            p: 0.5,
                            borderRadius: 1,
                            backgroundColor: projectColors[booking.projectId] || '#1976d2',
                            color: 'white',
                            fontSize: '11px',
                            cursor: 'move',
                            opacity: booking.status === 'cancelled' ? 0.5 : 1,
                            border: hasConflicts ? '2px solid #f44336' : 'none',
                            '&:hover': {
                              opacity: 0.8,
                            },
                          }}
                        >
                          <Typography variant="caption" sx={{ color: 'white', fontSize: '10px' }} noWrap>
                            {getProjectName(booking.projectId).substring(0, 15)}
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'white', fontSize: '9px' }} display="block">
                            {booking.hours}h
                          </Typography>
                        </Box>
                      </Tooltip>
                    ))}
                  </Box>
                );
              })}
            </Box>
          ))}
        </Box>
      </Paper>

      {/* Legend */}
      <Box sx={{ mt: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        {projects.slice(0, 5).map((project) => (
          <Chip
            key={project.id}
            label={project.name}
            size="small"
            sx={{
              backgroundColor: projectColors[project.id],
              color: 'white',
            }}
          />
        ))}
        {projects.length > 5 && (
          <Chip label={`+${projects.length - 5} more`} size="small" variant="outlined" />
        )}
      </Box>

      {/* Booking Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editingBooking ? 'Edit Booking' : 'Add Booking'}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            margin="normal"
            label="Resource"
            name="resourceId"
            select
            value={formData.resourceId}
            onChange={handleChange}
            required
          >
            {resources.map((resource) => (
              <MenuItem key={resource.id} value={resource.id}>
                {resource.name}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            fullWidth
            margin="normal"
            label="Project"
            name="projectId"
            select
            value={formData.projectId}
            onChange={handleChange}
            required
          >
            {projects.map((project) => (
              <MenuItem key={project.id} value={project.id}>
                {project.name}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            fullWidth
            margin="normal"
            label="Start Date"
            name="startDate"
            type="date"
            value={formData.startDate}
            onChange={handleChange}
            InputLabelProps={{ shrink: true }}
            required
          />
          <TextField
            fullWidth
            margin="normal"
            label="End Date"
            name="endDate"
            type="date"
            value={formData.endDate}
            onChange={handleChange}
            InputLabelProps={{ shrink: true }}
            required
          />
          <TextField
            fullWidth
            margin="normal"
            label="Hours"
            name="hours"
            type="number"
            value={formData.hours}
            onChange={handleChange}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Status"
            name="status"
            select
            value={formData.status}
            onChange={handleChange}
          >
            <MenuItem value="confirmed">Confirmed</MenuItem>
            <MenuItem value="tentative">Tentative</MenuItem>
            <MenuItem value="cancelled">Cancelled</MenuItem>
          </TextField>
          <TextField
            fullWidth
            margin="normal"
            label="Notes"
            name="notes"
            multiline
            rows={3}
            value={formData.notes}
            onChange={handleChange}
          />
        </DialogContent>
        <DialogActions>
          {editingBooking && (
            <Button onClick={handleDelete} color="error">
              Delete
            </Button>
          )}
          <Box sx={{ flexGrow: 1 }} />
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingBooking ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
