import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';

export default function Roles() {
  const [roles, setRoles] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    hourlyRate: '',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    loadRoles();
  }, []);

  const loadRoles = () => {
    const savedRoles = localStorage.getItem('roles');
    if (savedRoles) {
      setRoles(JSON.parse(savedRoles));
    } else {
      const defaultRoles = [
        { id: 1, name: 'Frontend Developer', description: 'React, Vue.js specialist', hourlyRate: 85, resourceCount: 5 },
        { id: 2, name: 'Backend Developer', description: 'Node.js, Python expert', hourlyRate: 90, resourceCount: 4 },
        { id: 3, name: 'Full Stack Developer', description: 'Full stack development', hourlyRate: 95, resourceCount: 3 },
        { id: 4, name: 'UI/UX Designer', description: 'User interface & experience design', hourlyRate: 75, resourceCount: 2 },
        { id: 5, name: 'Project Manager', description: 'Project coordination & management', hourlyRate: 100, resourceCount: 2 },
      ];
      setRoles(defaultRoles);
      localStorage.setItem('roles', JSON.stringify(defaultRoles));
    }
  };

  const handleOpenDialog = (role = null) => {
    if (role) {
      setEditingRole(role);
      setFormData({
        name: role.name,
        description: role.description || '',
        hourlyRate: role.hourlyRate || '',
      });
    } else {
      setEditingRole(null);
      setFormData({ name: '', description: '', hourlyRate: '' });
    }
    setError('');
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingRole(null);
    setFormData({ name: '', description: '', hourlyRate: '' });
    setError('');
  };

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      setError('Role name is required');
      return;
    }

    let updatedRoles;
    if (editingRole) {
      updatedRoles = roles.map(role =>
        role.id === editingRole.id
          ? { ...role, ...formData, hourlyRate: parseFloat(formData.hourlyRate) || 0 }
          : role
      );
    } else {
      const newRole = {
        id: Date.now(),
        ...formData,
        hourlyRate: parseFloat(formData.hourlyRate) || 0,
        resourceCount: 0,
      };
      updatedRoles = [...roles, newRole];
    }

    setRoles(updatedRoles);
    localStorage.setItem('roles', JSON.stringify(updatedRoles));
    handleCloseDialog();
  };

  const handleDelete = (roleId) => {
    if (window.confirm('Are you sure you want to delete this role?')) {
      const updatedRoles = roles.filter(role => role.id !== roleId);
      setRoles(updatedRoles);
      localStorage.setItem('roles', JSON.stringify(updatedRoles));
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          Rollen Beheer
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()} sx={{ boxShadow: 'none' }}>
          Nieuwe Rol
        </Button>
      </Box>

      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Rol Naam</TableCell>
                <TableCell>Beschrijving</TableCell>
                <TableCell align="right">Uurtarief</TableCell>
                <TableCell align="right">Resources</TableCell>
                <TableCell align="right">Acties</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {roles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <Typography color="textSecondary">Geen rollen gevonden</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                roles.map((role) => (
                  <TableRow key={role.id} hover>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{role.name}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="textSecondary">{role.description || '-'}</Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Chip label={`€${role.hourlyRate}/uur`} size="small" color="primary" variant="outlined" />
                    </TableCell>
                    <TableCell align="right">
                      <Chip label={role.resourceCount || 0} size="small" sx={{ backgroundColor: '#f7fafc' }} />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton size="small" onClick={() => handleOpenDialog(role)} sx={{ mr: 1 }}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" color="error" onClick={() => handleDelete(role.id)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingRole ? 'Rol Bewerken' : 'Nieuwe Rol Toevoegen'}</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <TextField
            fullWidth
            label="Rol Naam"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Beschrijving"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            margin="normal"
            multiline
            rows={3}
          />
          <TextField
            fullWidth
            label="Uurtarief (€)"
            type="number"
            value={formData.hourlyRate}
            onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value })}
            margin="normal"
            inputProps={{ min: 0, step: 5 }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseDialog}>Annuleren</Button>
          <Button variant="contained" onClick={handleSubmit} sx={{ boxShadow: 'none' }}>
            {editingRole ? 'Opslaan' : 'Toevoegen'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
