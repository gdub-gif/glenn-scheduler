import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Chip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { getResources, createResource, updateResource, deleteResource } from '../services/api';

export default function Resources() {
  const [resources, setResources] = useState([]);
  const [open, setOpen] = useState(false);
  const [editingResource, setEditingResource] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'person',
    skills: '',
    availability: 'available',
    hourlyRate: '',
  });

  useEffect(() => {
    loadResources();
  }, []);

  const loadResources = async () => {
    try {
      const response = await getResources();
      setResources(response.data);
    } catch (error) {
      console.error('Error loading resources:', error);
    }
  };

  const handleOpen = (resource = null) => {
    if (resource) {
      setEditingResource(resource);
      setFormData({
        name: resource.name,
        type: resource.type,
        skills: resource.skills.join(', '),
        availability: resource.availability,
        hourlyRate: resource.hourlyRate || '',
      });
    } else {
      setEditingResource(null);
      setFormData({
        name: '',
        type: 'person',
        skills: '',
        availability: 'available',
        hourlyRate: '',
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingResource(null);
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
        skills: formData.skills.split(',').map(s => s.trim()).filter(s => s),
        hourlyRate: formData.hourlyRate ? parseFloat(formData.hourlyRate) : undefined,
      };

      if (editingResource) {
        await updateResource(editingResource.id, data);
      } else {
        await createResource(data);
      }

      handleClose();
      loadResources();
    } catch (error) {
      console.error('Error saving resource:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this resource?')) {
      try {
        await deleteResource(id);
        loadResources();
      } catch (error) {
        console.error('Error deleting resource:', error);
      }
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h4">Resources</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
        >
          Add Resource
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Skills</TableCell>
              <TableCell>Availability</TableCell>
              <TableCell>Hourly Rate</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {resources.map((resource) => (
              <TableRow key={resource.id}>
                <TableCell>{resource.name}</TableCell>
                <TableCell>{resource.type}</TableCell>
                <TableCell>
                  {resource.skills.map((skill, index) => (
                    <Chip key={index} label={skill} size="small" sx={{ mr: 0.5 }} />
                  ))}
                </TableCell>
                <TableCell>
                  <Chip
                    label={resource.availability}
                    color={resource.availability === 'available' ? 'success' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {resource.hourlyRate ? `€${resource.hourlyRate}` : '-'}
                </TableCell>
                <TableCell>
                  <IconButton onClick={() => handleOpen(resource)} size="small">
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(resource.id)} size="small" color="error">
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editingResource ? 'Edit Resource' : 'Add Resource'}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            margin="normal"
            label="Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Type"
            name="type"
            select
            value={formData.type}
            onChange={handleChange}
          >
            <MenuItem value="person">Person</MenuItem>
            <MenuItem value="equipment">Equipment</MenuItem>
            <MenuItem value="room">Room</MenuItem>
          </TextField>
          <TextField
            fullWidth
            margin="normal"
            label="Skills (comma separated)"
            name="skills"
            value={formData.skills}
            onChange={handleChange}
            helperText="e.g., JavaScript, React, Node.js"
          />
          <TextField
            fullWidth
            margin="normal"
            label="Availability"
            name="availability"
            select
            value={formData.availability}
            onChange={handleChange}
          >
            <MenuItem value="available">Available</MenuItem>
            <MenuItem value="busy">Busy</MenuItem>
            <MenuItem value="unavailable">Unavailable</MenuItem>
          </TextField>
          <TextField
            fullWidth
            margin="normal"
            label="Hourly Rate (€)"
            name="hourlyRate"
            type="number"
            value={formData.hourlyRate}
            onChange={handleChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingResource ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
