// ============================================
// Glenn's Resource Scheduler - Backend API
// CosmosDB Edition
// ============================================

const express = require('express');
const cors = require('cors');
const { CosmosClient } = require('@azure/cosmos');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

// ============================================
// Middleware Configuration
// ============================================

app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// ============================================
// CosmosDB Connection
// ============================================

const cosmosClient = new CosmosClient({
  endpoint: process.env.COSMOS_ENDPOINT,
  key: process.env.COSMOS_KEY
});

const databaseId = 'SchedulerDB';
const database = cosmosClient.database(databaseId);

// Container references
const containers = {
  resources: database.container('resources'),
  clients: database.container('clients'),
  projects: database.container('projects'),
  bookings: database.container('bookings'),
  settings: database.container('settings')
};

// Initialize database and containers
async function initializeDatabase() {
  try {
    console.log('🔄 Initializing CosmosDB...');
    
    const { database: db } = await cosmosClient.databases.createIfNotExists({
      id: databaseId
    });
    console.log(`✅ Database "${databaseId}" ready`);

    const containerConfigs = [
      { id: 'resources', partitionKey: '/id' },
      { id: 'clients', partitionKey: '/id' },
      { id: 'projects', partitionKey: '/id' },
      { id: 'bookings', partitionKey: '/resourceId' },
      { id: 'settings', partitionKey: '/id' }
    ];

    for (const config of containerConfigs) {
      await db.containers.createIfNotExists({
        id: config.id,
        partitionKey: { paths: [config.partitionKey] }
      });
      console.log(`✅ Container "${config.id}" ready`);
    }

    console.log('✅ CosmosDB initialization complete');
  } catch (err) {
    console.error('❌ CosmosDB initialization error:', err);
    throw err;
  }
}

initializeDatabase().catch(console.error);

// ============================================
// Helper Functions
// ============================================

function generateId() {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

async function queryAll(container) {
  const { resources } = await container.items.readAll().fetchAll();
  return resources;
}

// ============================================
// Health Check
// ============================================

app.get('/api/health', async (req, res) => {
  try {
    await database.read();
    res.json({
      status: 'ok',
      timestamp: new Date(),
      database: 'connected',
      cosmos: 'healthy'
    });
  } catch (err) {
    res.status(503).json({
      status: 'error',
      timestamp: new Date(),
      database: 'disconnected',
      error: err.message
    });
  }
});

// ============================================
// RESOURCES ENDPOINTS
// ============================================

app.get('/api/resources', async (req, res) => {
  try {
    const resources = await queryAll(containers.resources);
    res.json(resources);
  } catch (err) {
    console.error('Error fetching resources:', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/resources/:id', async (req, res) => {
  try {
    const { resource } = await containers.resources.item(req.params.id, req.params.id).read();
    if (!resource) {
      return res.status(404).json({ error: 'Resource not found' });
    }
    res.json(resource);
  } catch (err) {
    if (err.code === 404) {
      return res.status(404).json({ error: 'Resource not found' });
    }
    console.error('Error fetching resource:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/resources', async (req, res) => {
  try {
    const resource = {
      id: generateId(),
      ...req.body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const { resource: created } = await containers.resources.items.create(resource);
    res.status(201).json(created);
  } catch (err) {
    console.error('Error creating resource:', err);
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/resources/:id', async (req, res) => {
  try {
    const { resource: existing } = await containers.resources.item(req.params.id, req.params.id).read();
    
    const updated = {
      ...existing,
      ...req.body,
      id: req.params.id,
      updatedAt: new Date().toISOString()
    };
    
    const { resource } = await containers.resources.item(req.params.id, req.params.id).replace(updated);
    res.json(resource);
  } catch (err) {
    if (err.code === 404) {
      return res.status(404).json({ error: 'Resource not found' });
    }
    console.error('Error updating resource:', err);
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/resources/:id', async (req, res) => {
  try {
    await containers.resources.item(req.params.id, req.params.id).delete();
    res.status(204).send();
  } catch (err) {
    if (err.code === 404) {
      return res.status(404).json({ error: 'Resource not found' });
    }
    console.error('Error deleting resource:', err);
    res.status(500).json({ error: err.message });
  }
});

// ============================================
// CLIENTS ENDPOINTS
// ============================================

app.get('/api/clients', async (req, res) => {
  try {
    const clients = await queryAll(containers.clients);
    res.json(clients);
  } catch (err) {
    console.error('Error fetching clients:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/clients', async (req, res) => {
  try {
    const client = {
      id: generateId(),
      ...req.body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const { resource: created } = await containers.clients.items.create(client);
    res.status(201).json(created);
  } catch (err) {
    console.error('Error creating client:', err);
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/clients/:id', async (req, res) => {
  try {
    const { resource: existing } = await containers.clients.item(req.params.id, req.params.id).read();
    
    const updated = {
      ...existing,
      ...req.body,
      id: req.params.id,
      updatedAt: new Date().toISOString()
    };
    
    const { resource } = await containers.clients.item(req.params.id, req.params.id).replace(updated);
    res.json(resource);
  } catch (err) {
    if (err.code === 404) {
      return res.status(404).json({ error: 'Client not found' });
    }
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/clients/:id', async (req, res) => {
  try {
    await containers.clients.item(req.params.id, req.params.id).delete();
    res.status(204).send();
  } catch (err) {
    if (err.code === 404) {
      return res.status(404).json({ error: 'Client not found' });
    }
    res.status(500).json({ error: err.message });
  }
});

// ============================================
// PROJECTS ENDPOINTS
// ============================================

app.get('/api/projects', async (req, res) => {
  try {
    const projects = await queryAll(containers.projects);
    res.json(projects);
  } catch (err) {
    console.error('Error fetching projects:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/projects', async (req, res) => {
  try {
    const project = {
      id: generateId(),
      ...req.body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const { resource: created } = await containers.projects.items.create(project);
    res.status(201).json(created);
  } catch (err) {
    console.error('Error creating project:', err);
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/projects/:id', async (req, res) => {
  try {
    const { resource: existing } = await containers.projects.item(req.params.id, req.params.id).read();
    
    const updated = {
      ...existing,
      ...req.body,
      id: req.params.id,
      updatedAt: new Date().toISOString()
    };
    
    const { resource } = await containers.projects.item(req.params.id, req.params.id).replace(updated);
    res.json(resource);
  } catch (err) {
    if (err.code === 404) {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/projects/:id', async (req, res) => {
  try {
    await containers.projects.item(req.params.id, req.params.id).delete();
    res.status(204).send();
  } catch (err) {
    if (err.code === 404) {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.status(500).json({ error: err.message });
  }
});

// ============================================
// BOOKINGS ENDPOINTS
// ============================================

app.get('/api/bookings', async (req, res) => {
  try {
    const bookings = await queryAll(containers.bookings);
    res.json(bookings);
  } catch (err) {
    console.error('Error fetching bookings:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/bookings', async (req, res) => {
  try {
    const booking = {
      id: generateId(),
      ...req.body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const { resource: created } = await containers.bookings.items.create(booking);
    res.status(201).json(created);
  } catch (err) {
    console.error('Error creating booking:', err);
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/bookings/:id', async (req, res) => {
  try {
    const partitionKey = req.body.resourceId;
    const { resource: existing } = await containers.bookings.item(req.params.id, partitionKey).read();
    
    const updated = {
      ...existing,
      ...req.body,
      id: req.params.id,
      updatedAt: new Date().toISOString()
    };
    
    const { resource } = await containers.bookings.item(req.params.id, partitionKey).replace(updated);
    res.json(resource);
  } catch (err) {
    if (err.code === 404) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/bookings/:id', async (req, res) => {
  try {
    const querySpec = {
      query: 'SELECT * FROM c WHERE c.id = @id',
      parameters: [{ name: '@id', value: req.params.id }]
    };
    const { resources } = await containers.bookings.items.query(querySpec).fetchAll();
    
    if (resources.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    const booking = resources[0];
    await containers.bookings.item(booking.id, booking.resourceId).delete();
    res.status(204).send();
  } catch (err) {
    console.error('Error deleting booking:', err);
    res.status(500).json({ error: err.message });
  }
});

// ============================================
// SETTINGS ENDPOINTS
// ============================================

app.get('/api/settings', async (req, res) => {
  try {
    const settingsId = 'global-settings';
    try {
      const { resource } = await containers.settings.item(settingsId, settingsId).read();
      res.json(resource);
    } catch (err) {
      if (err.code === 404) {
        const defaultSettings = {
          id: settingsId,
          customSkills: [],
          customRoles: [],
          customDepartments: [],
          customClusters: []
        };
        res.json(defaultSettings);
      } else {
        throw err;
      }
    }
  } catch (err) {
    console.error('Error fetching settings:', err);
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/settings', async (req, res) => {
  try {
    const settingsId = 'global-settings';
    const settings = {
      id: settingsId,
      ...req.body,
      updatedAt: new Date().toISOString()
    };
    
    try {
      const { resource } = await containers.settings.item(settingsId, settingsId).replace(settings);
      res.json(resource);
    } catch (err) {
      if (err.code === 404) {
        const { resource } = await containers.settings.items.create(settings);
        res.json(resource);
      } else {
        throw err;
      }
    }
  } catch (err) {
    console.error('Error updating settings:', err);
    res.status(500).json({ error: err.message });
  }
});

// ============================================
// Error Handling
// ============================================

app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.path}`
  });
});

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'production' ? 'An error occurred' : err.message
  });
});

// ============================================
// Server Start
// ============================================

app.listen(port, () => {
  console.log('============================================');
  console.log('🚀 Glenn\'s Resource Scheduler Backend API');
  console.log(`📡 Server running on port ${port}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🗄️  Database: CosmosDB`);
  console.log('============================================');
});

process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing server');
  process.exit(0);
});
