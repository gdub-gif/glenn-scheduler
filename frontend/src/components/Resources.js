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
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { getResources, createResource, updateResource, deleteResource } from '../services/api';

export default function Resources() {
  const [resources, setResources] = useState([]);
  const [open, setOpen] = useState(false);
  const [editingResource, setEditingResource] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    skills: [],
    roles: [],
    availability: 'available',
    hourlyRate: '',
    availableHours: '',
  });
  const [newSkill, setNewSkill] = useState('');
  const [newRole, setNewRole] = useState('');

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
        skills: resource.skills || [],
        roles: resource.roles || [],
        availability: resource.availability,
        hourlyRate: resource.hourlyRate || '',
        availableHours: resource.availableHours || '',
      });
    } else {
      setEditingResource(null);
      setFormData({
        name: '',
        skills: [],
        roles: [],
        availability: 'available',
        hourlyRate: '',
        availableHours: '',
      });
    }
    setNewSkill('');
    setNewRole('');
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingResource(null);
    setNewSkill('');
    setNewRole('');
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData({
        ...formData,
        skills: [...formData.skills, newSkill.trim()],
      });
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter(skill => skill !== skillToRemove),
    });
  };

  const handleAddRole = () => {
    if (newRole.trim() && !formData.roles.includes(newRole.trim())) {
      setFormData({
        ...formData,
        roles: [...formData.roles, newRole.trim()],
      });
      setNewRole('');
    }
  };

  const handleRemoveRole = (roleToRemove) => {
    setFormData({
      ...formData,
      roles: formData.roles.filter(role => role !== roleToRemove),
    });
  };

  const handleSubmit = async () => {
    try {
      const data = {
        name: formData.name,
        type: 'person',
        skills: formData.skills,
        roles: formData.roles,
        availability: formData.availability,
        hourlyRate: formData.hourlyRate ? parseFloat(formData.hourlyRate) : undefined,
        availableHours: formData.availableHours ? parseFloat(formData.availableHours) : undefined,
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
              <TableCell>Skills</TableCell>
              <TableCell>Roles</TableCell>
              <TableCell>Availability</TableCell>
              <TableCell>Available Hours/Week</TableCell>
              <TableCell>Hourly Rate</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {resources.map((resource) => (
              <TableRow key={resource.id}>
                <TableCell>{resource.name}</TableCell>
                <TableCell>
                  {resource.skills && resource.skills.map((skill, index) => (
                    <Chip key={index} label={skill} size="small" sx={{ mr: 0.5, mb: 0.5 }} color="primary" />
                  ))}
                </TableCell>
                <TableCell>
                  {resource.roles && resource.roles.map((role, index) => (
                    <Chip key={index} label={role} size="small" sx={{ mr: 0.5, mb: 0.5 }} color="secondary" />
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
                  {resource.availableHours ? `${resource.availableHours}h` : '-'}
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

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>{editingResource ? 'Edit Resource' : 'Add Resource'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Available Hours per Week"
                name="availableHours"
                type="number"
                value={formData.availableHours}
                onChange={handleChange}
                helperText="e.g., 40 for full-time"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Hourly Rate (€)"
                name="hourlyRate"
                type="number"
                value={formData.hourlyRate}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
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
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Skills
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Add Skill"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()}
                  placeholder="e.g., JavaScript, React, Python"
                />
                <Button variant="outlined" onClick={handleAddSkill}>
                  Add
                </Button>
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {formData.skills.map((skill, index) => (
                  <Chip
                    key={index}
                    label={skill}
                    color="primary"
                    onDelete={() => handleRemoveSkill(skill)}
                  />
                ))}
              </Box>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Roles
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Add Role"
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddRole()}
                  placeholder="e.g., Developer, Designer, Manager"
                />
                <Button variant="outlined" onClick={handleAddRole}>
                  Add
                </Button>
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {formData.roles.map((role, index) => (
                  <Chip
                    key={index}
                    label={role}
                    color="secondary"
                    onDelete={() => handleRemoveRole(role)}
                  />
                ))}
              </Box>
            </Grid>
          </Grid>
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
