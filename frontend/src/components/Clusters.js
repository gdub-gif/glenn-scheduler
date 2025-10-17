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
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  AccountTree as ClustersIcon,
} from '@mui/icons-material';

export default function Clusters() {
  const [clusters, setClusters] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingCluster, setEditingCluster] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    loadClusters();
  }, []);

  const loadClusters = () => {
    const savedClusters = localStorage.getItem('clusters');
    if (savedClusters) {
      setClusters(JSON.parse(savedClusters));
    } else {
      const defaultClusters = [
        { id: 1, name: 'Development Team', description: 'Software development cluster', location: 'Amsterdam', resourceCount: 12, projectCount: 5 },
        { id: 2, name: 'Design Team', description: 'UI/UX and graphic design', location: 'Rotterdam', resourceCount: 6, projectCount: 8 },
        { id: 3, name: 'Infrastructure', description: 'DevOps and infrastructure team', location: 'Utrecht', resourceCount: 4, projectCount: 3 },
        { id: 4, name: 'Data Analytics', description: 'Data science and analytics', location: 'Den Haag', resourceCount: 5, projectCount: 4 },
      ];
      setClusters(defaultClusters);
      localStorage.setItem('clusters', JSON.stringify(defaultClusters));
    }
  };

  const handleOpenDialog = (cluster = null) => {
    if (cluster) {
      setEditingCluster(cluster);
      setFormData({
        name: cluster.name,
        description: cluster.description || '',
        location: cluster.location || '',
      });
    } else {
      setEditingCluster(null);
      setFormData({ name: '', description: '', location: '' });
    }
    setError('');
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingCluster(null);
    setFormData({ name: '', description: '', location: '' });
    setError('');
  };

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      setError('Cluster naam is verplicht');
      return;
    }

    let updatedClusters;
    if (editingCluster) {
      updatedClusters = clusters.map(cluster =>
        cluster.id === editingCluster.id ? { ...cluster, ...formData } : cluster
      );
    } else {
      const newCluster = {
        id: Date.now(),
        ...formData,
        resourceCount: 0,
        projectCount: 0,
      };
      updatedClusters = [...clusters, newCluster];
    }

    setClusters(updatedClusters);
    localStorage.setItem('clusters', JSON.stringify(updatedClusters));
    handleCloseDialog();
  };

  const handleDelete = (clusterId) => {
    if (window.confirm('Weet je zeker dat je dit cluster wilt verwijderen?')) {
      const updatedClusters = clusters.filter(cluster => cluster.id !== clusterId);
      setClusters(updatedClusters);
      localStorage.setItem('clusters', JSON.stringify(updatedClusters));
    }
  };

  const totalClusters = clusters.length;
  const totalResources = clusters.reduce((sum, c) => sum + (c.resourceCount || 0), 0);
  const totalProjects = clusters.reduce((sum, c) => sum + (c.projectCount || 0), 0);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          Clusters Beheer
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          sx={{ boxShadow: 'none' }}
        >
          Nieuw Cluster
        </Button>
      </Box>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    Totaal Clusters
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {totalClusters}
                  </Typography>
                </Box>
                <Box sx={{ width: 56, height: 56, borderRadius: '12px', backgroundColor: '#e3f2fd', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4a90e2' }}>
                  <ClustersIcon sx={{ fontSize: 32 }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Totaal Resources
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {totalResources}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Totaal Projecten
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {totalProjects}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Cluster Naam</TableCell>
                <TableCell>Beschrijving</TableCell>
                <TableCell>Locatie</TableCell>
                <TableCell align="right">Resources</TableCell>
                <TableCell align="right">Projecten</TableCell>
                <TableCell align="right">Acties</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {clusters.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography color="textSecondary">Geen clusters gevonden</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                clusters.map((cluster) => (
                  <TableRow key={cluster.id} hover>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {cluster.name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="textSecondary">
                        {cluster.description || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={cluster.location || 'Onbekend'} size="small" sx={{ backgroundColor: '#f7fafc', fontWeight: 500 }} />
                    </TableCell>
                    <TableCell align="right">
                      <Chip label={cluster.resourceCount || 0} size="small" color="primary" variant="outlined" />
                    </TableCell>
                    <TableCell align="right">
                      <Chip label={cluster.projectCount || 0} size="small" color="secondary" variant="outlined" />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton size="small" onClick={() => handleOpenDialog(cluster)} sx={{ mr: 1 }}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" color="error" onClick={() => handleDelete(cluster.id)}>
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
        <DialogTitle>
          {editingCluster ? 'Cluster Bewerken' : 'Nieuw Cluster Toevoegen'}
        </DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <TextField
            fullWidth
            label="Cluster Naam"
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
            label="Locatie"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            margin="normal"
            placeholder="bijv. Amsterdam, Rotterdam"
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseDialog}>Annuleren</Button>
          <Button variant="contained" onClick={handleSubmit} sx={{ boxShadow: 'none' }}>
            {editingCluster ? 'Opslaan' : 'Toevoegen'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
