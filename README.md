# Glenn's Resource Scheduler

Complete resource planning en scheduling applicatie gebouwd met React, Node.js, Docker en Azure CosmosDB.

## 🚀 Features

- ✅ **Resource Management** - Beheer consultants en medewerkers
- ✅ **Client Management** - Klant relatie management
- ✅ **Project Tracking** - Project planning en monitoring
- ✅ **Booking System** - Resource toewijzing en planning
- ✅ **Calendar Views** - Visuele planning interface
- ✅ **Skills & Roles** - Skill matching en rol beheer
- ✅ **Clusters** - Klant segmentatie

## 🏗️ Architectuur

- **Frontend**: React 18 + Tailwind CSS in Nginx container
- **Backend**: Node.js + Express + CosmosDB in container
- **Database**: Azure CosmosDB (NoSQL)
- **Hosting**: Azure Container Apps
- **CI/CD**: GitHub Actions

## 📋 Prerequisites

- Node.js 18+
- Docker Desktop
- Azure CLI
- Azure Subscription
- GitHub Account

## 🚀 Quick Start

### 1. Clone Repository

```bash
git clone https://github.com/gdub-gif/glenn-scheduler.git
cd glenn-scheduler
```

### 2. Local Development

```bash
# Zet je CosmosDB credentials in .env
cp backend/.env.example backend/.env
# Edit backend/.env met je credentials

# Start met Docker Compose
docker-compose up

# Frontend: http://localhost:3000
# Backend: http://localhost:3001
```

### 3. Azure Deployment

```bash
# Login bij Azure
az login

# Run setup script
cd scripts
chmod +x setup-azure-containers.sh
./setup-azure-containers.sh

# Volg de instructies in de output
```

## 📁 Project Structure

```
glenn-scheduler/
├── backend/              # Express API met CosmosDB
│   ├── server.js
│   ├── package.json
│   ├── Dockerfile
│   └── .env.example
├── frontend/             # React applicatie
│   ├── Dockerfile
│   ├── nginx.conf
│   └── .env.production
├── scripts/              # Deployment scripts
│   └── setup-azure-containers.sh
├── .github/
│   └── workflows/
│       └── container-deploy.yml
└── docker-compose.yml
```

## 🔧 Configuration

### Backend Environment Variables

```env
COSMOS_ENDPOINT=https://your-account.documents.azure.com:443/
COSMOS_KEY=your-primary-key
PORT=3001
NODE_ENV=production
FRONTEND_URL=https://your-frontend-url
```

### Frontend Environment Variables

```env
REACT_APP_API_URL=https://your-backend-url
```

## 🐳 Docker Commands

```bash
# Build lokaal
docker-compose build

# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## 🔄 CI/CD Pipeline

Automatische deployment bij push naar `main`:

1. Build backend Docker image
2. Push naar Azure Container Registry
3. Deploy backend Container App
4. Build frontend Docker image
5. Push naar Azure Container Registry
6. Deploy frontend Container App

### GitHub Secrets Nodig:

- `AZURE_CREDENTIALS` - Azure service principal
- `ACR_LOGIN_SERVER` - Container registry URL
- `ACR_USERNAME` - Container registry username
- `ACR_PASSWORD` - Container registry password

## 📊 API Endpoints

### Resources
- `GET /api/resources` - Alle resources
- `POST /api/resources` - Nieuwe resource
- `PUT /api/resources/:id` - Update resource
- `DELETE /api/resources/:id` - Verwijder resource

### Clients
- `GET /api/clients` - Alle klanten
- `POST /api/clients` - Nieuwe klant
- `PUT /api/clients/:id` - Update klant
- `DELETE /api/clients/:id` - Verwijder klant

### Projects
- `GET /api/projects` - Alle projecten
- `POST /api/projects` - Nieuw project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Verwijder project

### Bookings
- `GET /api/bookings` - Alle boekingen
- `POST /api/bookings` - Nieuwe boeking
- `PUT /api/bookings/:id` - Update boeking
- `DELETE /api/bookings/:id` - Verwijder boeking

### Settings
- `GET /api/settings` - Settings ophalen
- `PUT /api/settings` - Settings updaten

## 💰 Kosten

### Development
- Container Apps: €5-10/maand
- CosmosDB Free Tier: €0
- Container Registry: €4/maand
**Totaal: ~€10-15/maand**

### Production
- Container Apps: €15-30/maand
- CosmosDB: €20-30/maand
- Container Registry: €16/maand
- Application Insights: €5/maand
**Totaal: ~€56-81/maand**

## 🔒 Security

- ✅ HTTPS only
- ✅ Non-root containers
- ✅ Secrets management via Azure
- ✅ CORS configured
- ✅ Health checks enabled

## 📝 License

MIT

## 👤 Author

Glenn - [GitHub](https://github.com/gdub-gif)

## 🤝 Contributing

Pull requests are welcome!

## 📞 Support

Voor vragen of problemen, open een issue op GitHub.

---

Made with ❤️ by Glenn