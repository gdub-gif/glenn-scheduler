import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Paper,
  List,
  ListItem,
  ListItemText,
  Chip,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import {
  getBookings,
  createBooking,
  updateBooking,
  deleteBooking,
  getResources,
  getProjects,
} from '../services/api';

export default function Scheduler() {
  const [bookings, setBookings] = useState([]);
  const [resources, setResources] = useState([]);
  const [projects, setProjects] = useState([]);
  const [open, setOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState(null);
  const [formData, setFormData] = useState({
    resourceId: '',
    projectId: '',
    startDate: '',
    endDate: '',
    hours: '',
    notes: '',
    status: 'confirmed',
  });

  useEffect(() => {
    loadData();
  }, []);

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

  const handleOpen = (booking = null) => {
    if (booking) {
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
    } else {
      setEditingBooking(null);
      setFormData({
        resourceId: '',
        projectId: '',
        startDate: '',
        endDate: '',
        hours: '',
        notes: '',
        status: 'confirmed',
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingBooking(null);
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

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this booking?')) {
      try {
        await deleteBooking(id);
        loadData();
      } catch (error) {
        console.error('Error deleting booking:', error);
      }
    }
  };

  const getResourceName = (resourceId) => {
    const resource = resources.find(r => r.id === resourceId);
    return resource ? resource.name : 'Unknown';
  };

  const getProjectName = (projectId) => {
    const project = projects.find(p => p.id === projectId);
    return project ? project.name : 'Unknown';
  };

  const getStatusColor = (status) => {
    const colors = {
      confirmed: 'success',
      tentative: 'warning',
      cancelled: 'error',
    };
    return colors[status] || 'default';
  };

  // Group bookings by date
  const groupedBookings = bookings.reduce((acc, booking) => {
    const date = new Date(booking.startDate).toLocaleDateString();
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(booking);
    return acc;
  }, {});

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h4">Scheduler</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
        >
          Add Booking
        </Button>
      </Box>

      <Paper sx={{ p: 2 }}>
        {Object.keys(groupedBookings).length === 0 ? (
          <Typography color="textSecondary">
            No bookings yet. Click "Add Booking" to create one.
          </Typography>
        ) : (
          Object.entries(groupedBookings).map(([date, dateBookings]) => (
            <Box key={date} sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                {date}
              </Typography>
              <List>
                {dateBookings.map((booking) => (
                  <ListItem
                    key={booking.id}
                    sx={{
                      border: '1px solid #e0e0e0',
                      borderRadius: 1,
                      mb: 1,
                      cursor: 'pointer',
                      '&:hover': { backgroundColor: '#f5f5f5' },
                    }}
                    onClick={() => handleOpen(booking)}
                  >
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body1">
                            {getResourceName(booking.resourceId)} - {getProjectName(booking.projectId)}
                          </Typography>
                          <Chip
                            label={booking.status}
                            color={getStatusColor(booking.status)}
                            size="small"
                          />
                        </Box>
                      }
                      secondary={
                        <>
                          {booking.hours && `${booking.hours} hours`}
                          {booking.notes && ` - ${booking.notes}`}
                        </>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          ))
        )}
      </Paper>

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
                {resource.name} ({resource.type})
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
            <Button onClick={() => handleDelete(editingBooking.id)} color="error">
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
