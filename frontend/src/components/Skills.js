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
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  LinearProgress,
  Tooltip,
  Avatar,
  AvatarGroup,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Code as CodeIcon,
  Brush as BrushIcon,
  Storage as StorageIcon,
  Security as SecurityIcon,
  Cloud as CloudIcon,
  Psychology as PsychologyIcon,
  TrendingUp as TrendingUpIcon,
  Group as GroupIcon,
  School as SchoolIcon,
} from '@mui/icons-material';

// Skill categories met kleuren en iconen
const SKILL_CATEGORIES = {
  frontend: { 
    label: 'Frontend', 
    color: '#4a90e2', 
    bgColor: '#e3f2fd',
    icon: <BrushIcon /> 
  },
  backend: { 
    label: 'Backend', 
    color: '#2dce89', 
    bgColor: '#e8f5e9',
    icon: <StorageIcon /> 
  },
  devops: { 
    label: 'DevOps', 
    color: '#fb6340', 
    bgColor: '#fff3e0',
    icon: <CloudIcon /> 
  },
  security: { 
    label: 'Security', 
    color: '#f5365c', 
    bgColor: '#ffebee',
    icon: <SecurityIcon /> 
  },
  ai_ml: { 
    label: 'AI/ML', 
    color: '#11cdef', 
    bgColor: '#e0f7fa',
    icon: <PsychologyIcon /> 
  },
  other: { 
    label: 'Other', 
    color: '#8898aa', 
    bgColor: '#f5f5f5',
    icon: <CodeIcon /> 
  }
};

// Skill levels
const SKILL_LEVELS = {
  beginner: { label: 'Beginner', value: 1, color: '#8898aa' },
  intermediate: { label: 'Intermediate', value: 2, color: '#fb6340' },
  advanced: { label: 'Advanced', value: 3, color: '#2dce89' },
  expert: { label: 'Expert', value: 4, color: '#4a90e2' }
};

export default function Skills() {
  const [skills, setSkills] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingSkill, setEditingSkill] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'frontend',
    level: 'intermediate',
    description: '',
    resourceCount: 0,
    projectCount: 0,
    utilization: 0,
  });
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadSkills();
  }, []);

  const loadSkills = () => {
    const savedSkills = localStorage.getItem('skills');
    if (savedSkills) {
      setSkills(JSON.parse(savedSkills));
    } else {
      const defaultSkills = [
        { 
          id: 1, 
          name: 'React', 
          category: 'frontend', 
          level: 'expert',
          description: 'Modern React with hooks and context',
          resourceCount: 8, 
          projectCount: 12, 
          utilization: 85 
        },
        { 
          id: 2, 
          name: 'Node.js', 
          category: 'backend', 
          level: 'advanced',
          description: 'Server-side JavaScript runtime',
          resourceCount: 6, 
          projectCount: 10, 
          utilization: 75 
        },
        { 
          id: 3, 
          name: 'Python', 
          category: 'backend', 
          level: 'expert',
          description: 'Python for web development and data science',
          resourceCount: 5, 
          projectCount: 8, 
          utilization: 90 
        },
        { 
          id: 4, 
          name: 'Docker', 
          category: 'devops', 
          level: 'advanced',
          description: 'Container orchestration and management',
          resourceCount: 4, 
          projectCount: 15, 
          utilization: 95 
        },
        { 
          id: 5, 
          name: 'TensorFlow', 
          category: 'ai_ml', 
          level: 'intermediate',
          description: 'Machine learning framework',
          resourceCount: 3, 
          projectCount: 4, 
          utilization: 60 
        },
        { 
          id: 6, 
          name: 'Vue.js', 
          category: 'frontend', 
          level: 'advanced',
          description: 'Progressive JavaScript framework',
          resourceCount: 4, 
          projectCount: 6, 
          utilization: 70 
        },
        { 
          id: 7, 
          name: 'Kubernetes', 
          category: 'devops', 
          level: 'intermediate',
          description: 'Container orchestration platform',
          resourceCount: 3, 
          projectCount: 5, 
          utilization: 65 
        },
        { 
          id: 8, 
          name: 'PostgreSQL', 
          category: 'backend', 
          level: 'expert',
          description: 'Advanced relational database',
          resourceCount: 7, 
          projectCount: 14, 
          utilization: 88 
        },
      ];
      setSkills(defaultSkills);
      localStorage.setItem('skills', JSON.stringify(defaultSkills));
    }
  };

  // Calculate statistics
  const getStats = () => {
    const totalSkills = skills.length;
    const totalResources = skills.reduce((sum, skill) => sum + skill.resourceCount, 0);
    const avgUtilization = skills.length > 0 
      ? Math.round(skills.reduce((sum, skill) => sum + skill.utilization, 0) / skills.length)
      : 0;
    const highDemandSkills = skills.filter(skill => skill.utilization > 80).length;

    return { totalSkills, totalResources, avgUtilization, highDemandSkills };
  };

  const handleOpenDialog = (skill = null) => {
    if (skill) {
      setEditingSkill(skill);
      setFormData({
        name: skill.name,
        category: skill.category,
        level: skill.level,
        description: skill.description || '',
        resourceCount: skill.resourceCount || 0,
        projectCount: skill.projectCount || 0,
        utilization: skill.utilization || 0,
      });
    } else {
      setEditingSkill(null);
      setFormData({
        name: '',
        category: 'frontend',
        level: 'intermediate',
        description: '',
        resourceCount: 0,
        projectCount: 0,
        utilization: 0,
      });
    }
    setError('');
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingSkill(null);
    setFormData({
      name: '',
      category: 'frontend',
      level: 'intermediate',
      description: '',
      resourceCount: 0,
      projectCount: 0,
      utilization: 0,
    });
    setError('');
  };

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      setError('Skill name is required');
      return;
    }

    let updatedSkills;
    if (editingSkill) {
      updatedSkills = skills.map(skill =>
        skill.id === editingSkill.id
          ? { ...skill, ...formData }
          : skill
      );
    } else {
      const newSkill = {
        id: Date.now(),
        ...formData,
      };
      updatedSkills = [...skills, newSkill];
    }

    setSkills(updatedSkills);
    localStorage.setItem('skills', JSON.stringify(updatedSkills));
    handleCloseDialog();
  };

  const handleDelete = (skillId) => {
    if (window.confirm('Are you sure you want to delete this skill?')) {
      const updatedSkills = skills.filter(skill => skill.id !== skillId);
      setSkills(updatedSkills);
      localStorage.setItem('skills', JSON.stringify(updatedSkills));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'resourceCount' || name === 'projectCount' || name === 'utilization' 
        ? parseInt(value) || 0 
        : value
    }));
  };

  // Filter skills
  const filteredSkills = skills.filter(skill => {
    const matchesFilter = filter === 'all' || skill.category === filter;
    const matchesSearch = skill.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          skill.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const stats = getStats();

  const getUtilizationColor = (utilization) => {
    if (utilization >= 90) return '#f5365c';
    if (utilization >= 75) return '#fb6340';
    if (utilization >= 50) return '#2dce89';
    return '#8898aa';
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 700 }}>
        Skills Management
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white'
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <SchoolIcon sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {stats.totalSkills}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Total Skills
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            color: 'white'
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <GroupIcon sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {stats.totalResources}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Total Resources
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            color: 'white'
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TrendingUpIcon sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {stats.avgUtilization}%
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Avg. Utilization
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
            color: 'white'
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CodeIcon sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {stats.highDemandSkills}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                High Demand Skills
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters and Search */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search skills..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              size="small"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Filter by Category</InputLabel>
              <Select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                label="Filter by Category"
              >
                <MenuItem value="all">All Categories</MenuItem>
                {Object.entries(SKILL_CATEGORIES).map(([key, category]) => (
                  <MenuItem key={key} value={key}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {category.icon}
                      {category.label}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
              fullWidth
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                '&:hover': {
                  background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                }
              }}
            >
              Add New Skill
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Skills Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Skill Name</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Level</TableCell>
              <TableCell align="center">Resources</TableCell>
              <TableCell align="center">Projects</TableCell>
              <TableCell>Utilization</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredSkills.map((skill) => (
              <TableRow key={skill.id} hover>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      {skill.name}
                    </Typography>
                  </Box>
                  {skill.description && (
                    <Typography variant="body2" color="text.secondary">
                      {skill.description}
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  <Chip
                    icon={SKILL_CATEGORIES[skill.category]?.icon}
                    label={SKILL_CATEGORIES[skill.category]?.label}
                    size="small"
                    sx={{
                      backgroundColor: SKILL_CATEGORIES[skill.category]?.bgColor,
                      color: SKILL_CATEGORIES[skill.category]?.color,
                      fontWeight: 600,
                      '& .MuiChip-icon': {
                        color: SKILL_CATEGORIES[skill.category]?.color,
                      }
                    }}
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={SKILL_LEVELS[skill.level]?.label}
                    size="small"
                    sx={{
                      backgroundColor: `${SKILL_LEVELS[skill.level]?.color}20`,
                      color: SKILL_LEVELS[skill.level]?.color,
                      fontWeight: 600,
                    }}
                  />
                </TableCell>
                <TableCell align="center">
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                    <AvatarGroup max={3} sx={{ '& .MuiAvatar-root': { width: 24, height: 24 } }}>
                      {[...Array(Math.min(skill.resourceCount, 3))].map((_, i) => (
                        <Avatar key={i} sx={{ bgcolor: '#4a90e2', fontSize: 12 }}>
                          {i + 1}
                        </Avatar>
                      ))}
                    </AvatarGroup>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {skill.resourceCount}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell align="center">
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {skill.projectCount}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ flex: 1 }}>
                      <LinearProgress
                        variant="determinate"
                        value={skill.utilization}
                        sx={{
                          height: 8,
                          borderRadius: 4,
                          backgroundColor: '#e0e0e0',
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: getUtilizationColor(skill.utilization),
                            borderRadius: 4,
                          }
                        }}
                      />
                    </Box>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontWeight: 600,
                        color: getUtilizationColor(skill.utilization),
                        minWidth: '40px'
                      }}
                    >
                      {skill.utilization}%
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell align="center">
                  <Tooltip title="Edit">
                    <IconButton
                      size="small"
                      onClick={() => handleOpenDialog(skill)}
                      sx={{ color: '#4a90e2' }}
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(skill.id)}
                      sx={{ color: '#f5365c' }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
            {filteredSkills.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Typography color="text.secondary" sx={{ py: 3 }}>
                    No skills found. Add your first skill to get started!
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 600 }}>
          {editingSkill ? 'Edit Skill' : 'Add New Skill'}
        </DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                autoFocus
                name="name"
                label="Skill Name"
                fullWidth
                variant="outlined"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  label="Category"
                >
                  {Object.entries(SKILL_CATEGORIES).map(([key, category]) => (
                    <MenuItem key={key} value={key}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {category.icon}
                        {category.label}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Level</InputLabel>
                <Select
                  name="level"
                  value={formData.level}
                  onChange={handleChange}
                  label="Level"
                >
                  {Object.entries(SKILL_LEVELS).map(([key, level]) => (
                    <MenuItem key={key} value={key}>
                      {level.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                name="utilization"
                label="Utilization (%)"
                type="number"
                fullWidth
                variant="outlined"
                value={formData.utilization}
                onChange={handleChange}
                inputProps={{ min: 0, max: 100 }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="description"
                label="Description"
                fullWidth
                variant="outlined"
                value={formData.description}
                onChange={handleChange}
                multiline
                rows={2}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                name="resourceCount"
                label="Number of Resources"
                type="number"
                fullWidth
                variant="outlined"
                value={formData.resourceCount}
                onChange={handleChange}
                inputProps={{ min: 0 }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                name="projectCount"
                label="Number of Projects"
                type="number"
                fullWidth
                variant="outlined"
                value={formData.projectCount}
                onChange={handleChange}
                inputProps={{ min: 0 }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained"
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
            }}
          >
            {editingSkill ? 'Update' : 'Add'} Skill
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
