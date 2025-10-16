# ============================================
# CosmosDB Setup Script (PowerShell)
# ============================================

Write-Host "Setting up CosmosDB for Glenn's Resource Scheduler" -ForegroundColor Cyan

# ============================================
# Configuration
# ============================================

$RESOURCE_GROUP = "glenn-scheduler-containers-rg"
$LOCATION = "westeurope"
$COSMOS_ACCOUNT = "glenn-scheduler-cosmos"

Write-Host ""
Write-Host "Configuration:" -ForegroundColor Yellow
Write-Host "  Resource Group: $RESOURCE_GROUP"
Write-Host "  Location: $LOCATION"
Write-Host "  CosmosDB: $COSMOS_ACCOUNT"
Write-Host ""

# ============================================
# Check Azure CLI
# ============================================

Write-Host "Checking Azure CLI..." -ForegroundColor Cyan
try {
    $azVersion = az version --output json | ConvertFrom-Json
    Write-Host "Azure CLI found: $($azVersion.'azure-cli')" -ForegroundColor Green
} catch {
    Write-Host "Azure CLI not found. Please install it first:" -ForegroundColor Red
    Write-Host "   https://docs.microsoft.com/en-us/cli/azure/install-azure-cli-windows"
    exit 1
}

# ============================================
# Login
# ============================================

Write-Host ""
Write-Host "Logging in to Azure..." -ForegroundColor Cyan
az login

if ($LASTEXITCODE -ne 0) {
    Write-Host "Azure login failed" -ForegroundColor Red
    exit 1
}

# ============================================
# Resource Group
# ============================================

Write-Host ""
Write-Host "Creating Resource Group..." -ForegroundColor Cyan
az group create `
  --name $RESOURCE_GROUP `
  --location $LOCATION

if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to create resource group" -ForegroundColor Red
    exit 1
}

Write-Host "Resource Group created" -ForegroundColor Green

# ============================================
# CosmosDB Account
# ============================================

Write-Host ""
Write-Host "Creating CosmosDB Account (this may take 5-10 minutes)..." -ForegroundColor Cyan
az cosmosdb create `
  --name $COSMOS_ACCOUNT `
  --resource-group $RESOURCE_GROUP `
  --locations regionName=$LOCATION failoverPriority=0 `
  --default-consistency-level Session `
  --enable-automatic-failover false `
  --enable-free-tier true

if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to create CosmosDB account" -ForegroundColor Red
    exit 1
}

Write-Host "CosmosDB Account created" -ForegroundColor Green

# ============================================
# CosmosDB Database
# ============================================

Write-Host ""
Write-Host "Creating CosmosDB Database 'SchedulerDB'..." -ForegroundColor Cyan
az cosmosdb sql database create `
  --account-name $COSMOS_ACCOUNT `
  --resource-group $RESOURCE_GROUP `
  --name SchedulerDB

if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to create database" -ForegroundColor Red
    exit 1
}

Write-Host "Database created" -ForegroundColor Green

# ============================================
# CosmosDB Containers
# ============================================

Write-Host ""
Write-Host "Creating CosmosDB Containers..." -ForegroundColor Cyan

$containers = @(
    @{name="resources"; partitionKey="/id"},
    @{name="clients"; partitionKey="/id"},
    @{name="projects"; partitionKey="/id"},
    @{name="bookings"; partitionKey="/resourceId"},
    @{name="settings"; partitionKey="/id"}
)

foreach ($container in $containers) {
    Write-Host "  Creating container '$($container.name)'..." -ForegroundColor White
    
    az cosmosdb sql container create `
      --account-name $COSMOS_ACCOUNT `
      --resource-group $RESOURCE_GROUP `
      --database-name SchedulerDB `
      --name $container.name `
      --partition-key-path $container.partitionKey `
      --throughput 400
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  Container '$($container.name)' created" -ForegroundColor Green
    } else {
        Write-Host "  Failed to create container '$($container.name)'" -ForegroundColor Red
    }
}

# ============================================
# Get Credentials
# ============================================

Write-Host ""
Write-Host "Retrieving CosmosDB credentials..." -ForegroundColor Cyan

$COSMOS_ENDPOINT = az cosmosdb show `
  --name $COSMOS_ACCOUNT `
  --resource-group $RESOURCE_GROUP `
  --query documentEndpoint `
  --output tsv

if ($LASTEXITCODE -ne 0 -or [string]::IsNullOrWhiteSpace($COSMOS_ENDPOINT)) {
    Write-Host "Failed to retrieve CosmosDB endpoint" -ForegroundColor Red
    exit 1
}

$COSMOS_KEY = az cosmosdb keys list `
  --name $COSMOS_ACCOUNT `
  --resource-group $RESOURCE_GROUP `
  --query primaryMasterKey `
  --output tsv

if ($LASTEXITCODE -ne 0 -or [string]::IsNullOrWhiteSpace($COSMOS_KEY)) {
    Write-Host "Failed to retrieve CosmosDB key" -ForegroundColor Red
    exit 1
}

Write-Host "Credentials retrieved successfully" -ForegroundColor Green

# ============================================
# Save Configuration
# ============================================

Write-Host ""
Write-Host "Saving configuration..." -ForegroundColor Cyan

$config = @{
    resourceGroup = $RESOURCE_GROUP
    location = $LOCATION
    cosmosAccount = $COSMOS_ACCOUNT
    cosmosEndpoint = $COSMOS_ENDPOINT
    cosmosKey = $COSMOS_KEY
    database = "SchedulerDB"
    containers = @("resources", "clients", "projects", "bookings", "settings")
} | ConvertTo-Json -Depth 10

$configPath = Join-Path $PSScriptRoot "cosmosdb-config.json"
$config | Out-File -FilePath $configPath -Encoding UTF8

# Also create .env file for backend
$envContent = @"
COSMOS_ENDPOINT=$COSMOS_ENDPOINT
COSMOS_KEY=$COSMOS_KEY
PORT=3001
NODE_ENV=development
"@

$backendPath = Join-Path $PSScriptRoot "..\backend\.env"
$envContent | Out-File -FilePath $backendPath -Encoding UTF8

# ============================================
# Summary
# ============================================

Write-Host ""
Write-Host "============================================" -ForegroundColor Green
Write-Host "CosmosDB Setup Complete!" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
Write-Host ""
Write-Host "Resources Created:" -ForegroundColor Yellow
Write-Host "  Resource Group: $RESOURCE_GROUP"
Write-Host "  CosmosDB Account: $COSMOS_ACCOUNT"
Write-Host "  Database: SchedulerDB"
Write-Host "  Containers: resources, clients, projects, bookings, settings"
Write-Host ""
Write-Host "Connection Details:" -ForegroundColor Yellow
Write-Host "  Endpoint: $COSMOS_ENDPOINT"
if ($COSMOS_KEY -and $COSMOS_KEY.Length -gt 20) {
    Write-Host "  Key: $($COSMOS_KEY.Substring(0,20))..." -ForegroundColor DarkGray
} else {
    Write-Host "  Key: [KEY RETRIEVED]" -ForegroundColor DarkGray
}
Write-Host ""
Write-Host "Configuration saved to:" -ForegroundColor Yellow
Write-Host "  - $configPath"
Write-Host "  - $backendPath"
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "  1. Test the backend connection:"
Write-Host "     cd backend"
Write-Host "     npm install"
Write-Host "     npm start"
Write-Host ""
Write-Host "  2. View in Azure Portal:"
Write-Host "     https://portal.azure.com"
Write-Host ""
Write-Host "============================================" -ForegroundColor Green
