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
  Grid,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  LinearProgress,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  WorkOutline as WorkOutlineIcon,
  MonetizationOn as MonetizationOnIcon,
  Group as GroupIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';

const DEPARTMENT_CATEGORIES = {
  engineering: {
    label: 'Engineering',
    color: '#4a90e2',
    bgColor: '#e3f2fd',
  },
  product: {
    label: 'Product',
    color: '#2dce89',
    bgColor: '#e8f5e9',
  },
  design: {
    label: 'Design',
    color: '#fb6340',
    bgColor: '#fff3e0',
  },
  management: {
    label: 'Management',
    color: '#f5365c',
    bgColor: '#ffebee',
  },
  operations: {
    label: 'Operations',
    color: '#11cdef',
    bgColor: '#e0f7fa',
  },
  other: {
    label: 'Overig',
    color: '#8898aa',
    bgColor: '#f5f5f5',
  },
};

const SENIORITY_LEVELS = {
  junior: { label: 'Junior', color: '#8898aa' },
  medior: { label: 'Medior', color: '#fb6340' },
  senior: { label: 'Senior', color: '#2dce89' },
  lead: { label: 'Lead', color: '#4a90e2' },
};

export default function Roles() {
  const [roles, setRoles] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    department: 'engineering',
    level: 'medior',
    description: '',
    hourlyRate: 0,
    resourceCount: 0,
    openPositions: 0,
    utilization: 0,
  });
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadRoles();
  }, []);

  const loadRoles = () => {
    const savedRoles = localStorage.getItem('roles');
    if (savedRoles) {
      setRoles(JSON.parse(savedRoles));
    } else {
      const defaultRoles = [
        {
          id: 1,
          name: 'Frontend Developer',
          department: 'engineering',
          level: 'medior',
          description: 'React & UI component expert',
          hourlyRate: 85,
          resourceCount: 5,
          openPositions: 1,
          utilization: 82,
        },
        {
          id: 2,
          name: 'Backend Developer',
          department: 'engineering',
          level: 'senior',
          description: 'Node.js & microservices specialist',
          hourlyRate: 92,
          resourceCount: 4,
          openPositions: 0,
          utilization: 76,
        },
        {
          id: 3,
          name: 'Product Owner',
          department: 'product',
          level: 'senior',
          description: 'Roadmap ownership & stakeholder alignment',
          hourlyRate: 110,
          resourceCount: 2,
          openPositions: 1,
          utilization: 88,
        },
        {
          id: 4,
          name: 'UX Designer',
          department: 'design',
          level: 'medior',
          description: 'User research & interface design',
          hourlyRate: 78,
          resourceCount: 3,
          openPositions: 2,
          utilization: 69,
        },
        {
          id: 5,
          name: 'Delivery Manager',
          department: 'management',
          level: 'lead',
          description: 'Project delivery & team coordination',
          hourlyRate: 120,
          resourceCount: 2,
          openPositions: 1,
          utilization: 94,
        },
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
        department: role.department || 'engineering',
        level: role.level || 'medior',
        description: role.description || '',
        hourlyRate: role.hourlyRate || 0,
        resourceCount: role.resourceCount || 0,
        openPositions: role.openPositions || 0,
        utilization: role.utilization || 0,
      });
    } else {
      setEditingRole(null);
      setFormData({
        name: '',
        department: 'engineering',
        level: 'medior',
        description: '',
        hourlyRate: 0,
        resourceCount: 0,
        openPositions: 0,
        utilization: 0,
      });
    }
    setError('');
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingRole(null);
    setFormData({
      name: '',
      department: 'engineering',
      level: 'medior',
      description: '',
      hourlyRate: 0,
      resourceCount: 0,
      openPositions: 0,
      utilization: 0,
    });
    setError('');
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleFilterChange = (event) => {
    setFilter(event.target.value);
  };

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      setError('Role name is required');
      return;
    }

    if (!formData.department) {
      setError('Selecteer een afdeling');
      return;
    }

    const sanitizedData = {
      ...formData,
      hourlyRate: Math.max(0, parseFloat(formData.hourlyRate) || 0),
      resourceCount: Math.max(0, parseInt(formData.resourceCount, 10) || 0),
      openPositions: Math.max(0, parseInt(formData.openPositions, 10) || 0),
      utilization: Math.min(100, Math.max(0, parseInt(formData.utilization, 10) || 0)),
    };

    let updatedRoles;
    if (editingRole) {
      updatedRoles = roles.map(role =>
        role.id === editingRole.id
          ? { ...role, ...sanitizedData }
          : role
      );
    } else {
      const newRole = {
        id: Date.now(),
        ...sanitizedData,
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

  const filteredRoles = roles.filter((role) => {
    const matchesFilter = filter === 'all' || role.department === filter;
    const matchesSearch =
      role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (role.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const totalRoles = roles.length;
  const totalResources = roles.reduce((sum, role) => sum + (role.resourceCount || 0), 0);
  const totalOpenPositions = roles.reduce((sum, role) => sum + (role.openPositions || 0), 0);
  const averageRate = totalRoles
    ? Math.round(
        roles.reduce((sum, role) => sum + (parseFloat(role.hourlyRate) || 0), 0) /
          totalRoles
      )
    : 0;
  const averageUtilization = totalRoles
    ? Math.round(
        roles.reduce((sum, role) => sum + (parseInt(role.utilization, 10) || 0), 0) /
          totalRoles
      )
    : 0;
  const criticalRoles = roles.filter((role) => (role.openPositions || 0) > 0).length;

  const getUtilizationColor = (value) => {
    if (value >= 85) return '#2dce89';
    if (value >= 60) return '#4a90e2';
    if (value >= 40) return '#fb6340';
    return '#f5365c';
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Rollen Beheer
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Overzicht van rollen, afdelingen en capaciteit binnen het team
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          sx={{ boxShadow: 'none', borderRadius: 2 }}
        >
          Nieuwe Rol
        </Button>
      </Box>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card sx={{ borderRadius: 3, background: 'linear-gradient(135deg, #4a90e2 0%, #0072ff 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <WorkOutlineIcon sx={{ mr: 1 }} />
                <Typography variant="subtitle2">Totaal Rollen</Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>{totalRoles}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card sx={{ borderRadius: 3, background: 'linear-gradient(135deg, #2dce89 0%, #2fb344 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <GroupIcon sx={{ mr: 1 }} />
                <Typography variant="subtitle2">Beschikbare Resources</Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>{totalResources}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card sx={{ borderRadius: 3, background: 'linear-gradient(135deg, #fb6340 0%, #f56036 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <TrendingUpIcon sx={{ mr: 1 }} />
                <Typography variant="subtitle2">Gem. Benutting</Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>{averageUtilization}%</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card sx={{ borderRadius: 3, background: 'linear-gradient(135deg, #f5365c 0%, #f80759 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <MonetizationOnIcon sx={{ mr: 1 }} />
                <Typography variant="subtitle2">Gem. Uurtarief</Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>€{averageRate}</Typography>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>Open posities: {totalOpenPositions} · Kritieke rollen: {criticalRoles}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper sx={{ mb: 3, borderRadius: 3, p: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Zoek op rol of beschrijving"
              value={searchTerm}
              onChange={handleSearchChange}
              size="small"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Afdeling</InputLabel>
              <Select value={filter} label="Afdeling" onChange={handleFilterChange}>
                <MenuItem value="all">Alle afdelingen</MenuItem>
                {Object.entries(DEPARTMENT_CATEGORIES).map(([key, value]) => (
                  <MenuItem key={key} value={key}>{value.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ borderRadius: 3 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Rol</TableCell>
                <TableCell>Afdeling</TableCell>
                <TableCell>Niveau</TableCell>
                <TableCell align="right">Uurtarief</TableCell>
                <TableCell align="right">Resources</TableCell>
                <TableCell align="right">Open Posities</TableCell>
                <TableCell width="220">Benutting</TableCell>
                <TableCell align="right">Acties</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredRoles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                    <Typography color="text.secondary">Geen rollen gevonden voor de huidige selectie</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredRoles.map((role) => {
                  const department = DEPARTMENT_CATEGORIES[role.department] || DEPARTMENT_CATEGORIES.other;
                  const level = SENIORITY_LEVELS[role.level] || SENIORITY_LEVELS.medior;
                  const utilization = role.utilization || 0;

                  return (
                    <TableRow key={role.id} hover>
                      <TableCell>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                          {role.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {role.description || 'Geen beschrijving beschikbaar'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={department.label}
                          size="small"
                          sx={{
                            backgroundColor: department.bgColor,
                            color: department.color,
                            fontWeight: 600,
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={level.label}
                          size="small"
                          sx={{
                            backgroundColor: `${level.color}20`,
                            color: level.color,
                            fontWeight: 600,
                          }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Chip
                          label={`€${role.hourlyRate}/uur`}
                          size="small"
                          sx={{ backgroundColor: '#f1f5f9', fontWeight: 600 }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Chip
                          label={role.resourceCount || 0}
                          size="small"
                          sx={{ backgroundColor: '#f7fafc', fontWeight: 600 }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Chip
                          label={role.openPositions || 0}
                          size="small"
                          color={(role.openPositions || 0) > 0 ? 'warning' : 'default'}
                          sx={{ fontWeight: 600 }}
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <LinearProgress
                            variant="determinate"
                            value={utilization}
                            sx={{
                              height: 8,
                              borderRadius: 5,
                              flexGrow: 1,
                              backgroundColor: '#f1f5f9',
                              '& .MuiLinearProgress-bar': {
                                backgroundColor: getUtilizationColor(utilization),
                              },
                            }}
                          />
                          <Typography variant="body2" sx={{ fontWeight: 600, width: 40 }}>
                            {utilization}%
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Rol bewerken">
                          <IconButton size="small" onClick={() => handleOpenDialog(role)} sx={{ mr: 1 }}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Rol verwijderen">
                          <IconButton size="small" color="error" onClick={() => handleDelete(role.id)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })
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
          <Grid container spacing={2} sx={{ mt: 0 }}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Afdeling</InputLabel>
                <Select
                  value={formData.department}
                  label="Afdeling"
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                >
                  {Object.entries(DEPARTMENT_CATEGORIES).map(([key, value]) => (
                    <MenuItem key={key} value={key}>{value.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Niveau</InputLabel>
                <Select
                  value={formData.level}
                  label="Niveau"
                  onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                >
                  {Object.entries(SENIORITY_LEVELS).map(([key, value]) => (
                    <MenuItem key={key} value={key}>{value.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
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
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Resources"
                type="number"
                value={formData.resourceCount}
                onChange={(e) => setFormData({ ...formData, resourceCount: e.target.value })}
                margin="normal"
                inputProps={{ min: 0 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Open Posities"
                type="number"
                value={formData.openPositions}
                onChange={(e) => setFormData({ ...formData, openPositions: e.target.value })}
                margin="normal"
                inputProps={{ min: 0 }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Benutting (%)"
                type="number"
                value={formData.utilization}
                onChange={(e) => setFormData({ ...formData, utilization: e.target.value })}
                margin="normal"
                inputProps={{ min: 0, max: 100 }}
              />
            </Grid>
          </Grid>
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
