#!/bin/bash

# ============================================
# Azure Container Setup Script
# ============================================

set -e

echo "🚀 Setting up Azure resources for Glenn's Resource Scheduler"

# ============================================
# Configuration
# ============================================

RESOURCE_GROUP="glenn-scheduler-containers-rg"
LOCATION="westeurope"
ACR_NAME="glennschedulerregistry"
COSMOS_ACCOUNT="glenn-scheduler-cosmos"
CONTAINER_ENV="glenn-scheduler-env"
BACKEND_APP="backend-api"
FRONTEND_APP="frontend-ui"

echo "📋 Configuration:"
echo "  Resource Group: $RESOURCE_GROUP"
echo "  Location: $LOCATION"
echo "  Container Registry: $ACR_NAME"
echo "  CosmosDB: $COSMOS_ACCOUNT"
echo ""

# ============================================
# Login
# ============================================

echo "🔐 Logging in to Azure..."
az login

# ============================================
# Resource Group
# ============================================

echo "📦 Creating Resource Group..."
az group create \
  --name $RESOURCE_GROUP \
  --location $LOCATION

# ============================================
# Container Registry
# ============================================

echo "📦 Creating Azure Container Registry..."
az acr create \
  --resource-group $RESOURCE_GROUP \
  --name $ACR_NAME \
  --sku Basic \
  --admin-enabled true

ACR_LOGIN_SERVER=$(az acr show --name $ACR_NAME --query loginServer --output tsv)
ACR_USERNAME=$(az acr credential show --name $ACR_NAME --query username --output tsv)
ACR_PASSWORD=$(az acr credential show --name $ACR_NAME --query "passwords[0].value" --output tsv)

echo "✅ Container Registry created: $ACR_LOGIN_SERVER"

# ============================================
# CosmosDB
# ============================================

echo "🗄️  Creating CosmosDB Account..."
az cosmosdb create \
  --name $COSMOS_ACCOUNT \
  --resource-group $RESOURCE_GROUP \
  --locations regionName=$LOCATION failoverPriority=0 \
  --default-consistency-level Session \
  --enable-automatic-failover false \
  --enable-free-tier true

echo "📊 Creating CosmosDB Database..."
az cosmosdb sql database create \
  --account-name $COSMOS_ACCOUNT \
  --resource-group $RESOURCE_GROUP \
  --name SchedulerDB

echo "📦 Creating CosmosDB Containers..."
for container in resources clients projects bookings settings; do
  if [ "$container" = "bookings" ]; then
    PARTITION_KEY="/resourceId"
  else
    PARTITION_KEY="/id"
  fi
  
  az cosmosdb sql container create \
    --account-name $COSMOS_ACCOUNT \
    --resource-group $RESOURCE_GROUP \
    --database-name SchedulerDB \
    --name $container \
    --partition-key-path $PARTITION_KEY \
    --throughput 400
  
  echo "  ✅ Container '$container' created"
done

COSMOS_ENDPOINT=$(az cosmosdb show \
  --name $COSMOS_ACCOUNT \
  --resource-group $RESOURCE_GROUP \
  --query documentEndpoint \
  --output tsv)

COSMOS_KEY=$(az cosmosdb keys list \
  --name $COSMOS_ACCOUNT \
  --resource-group $RESOURCE_GROUP \
  --query primaryMasterKey \
  --output tsv)

echo "✅ CosmosDB created: $COSMOS_ENDPOINT"

# ============================================
# Container Apps Environment
# ============================================

echo "🏗️  Creating Container Apps Environment..."
az containerapp env create \
  --name $CONTAINER_ENV \
  --resource-group $RESOURCE_GROUP \
  --location $LOCATION

# ============================================
# Deploy Backend Container App
# ============================================

echo "🔧 Creating Backend Container App..."
az containerapp create \
  --name $BACKEND_APP \
  --resource-group $RESOURCE_GROUP \
  --environment $CONTAINER_ENV \
  --image mcr.microsoft.com/azuredocs/containerapps-helloworld:latest \
  --target-port 3001 \
  --ingress external \
  --min-replicas 1 \
  --max-replicas 5 \
  --cpu 0.5 \
  --memory 1.0Gi \
  --env-vars \
    "COSMOS_ENDPOINT=$COSMOS_ENDPOINT" \
    "COSMOS_KEY=secretref:cosmos-key" \
    "PORT=3001" \
    "NODE_ENV=production" \
  --secrets \
    "cosmos-key=$COSMOS_KEY"

BACKEND_URL=$(az containerapp show \
  --name $BACKEND_APP \
  --resource-group $RESOURCE_GROUP \
  --query properties.configuration.ingress.fqdn \
  --output tsv)

echo "✅ Backend deployed: https://$BACKEND_URL"

# ============================================
# Deploy Frontend Container App
# ============================================

echo "🎨 Creating Frontend Container App..."
az containerapp create \
  --name $FRONTEND_APP \
  --resource-group $RESOURCE_GROUP \
  --environment $CONTAINER_ENV \
  --image mcr.microsoft.com/azuredocs/containerapps-helloworld:latest \
  --target-port 80 \
  --ingress external \
  --min-replicas 0 \
  --max-replicas 3 \
  --cpu 0.25 \
  --memory 0.5Gi \
  --env-vars \
    "REACT_APP_API_URL=https://$BACKEND_URL"

FRONTEND_URL=$(az containerapp show \
  --name $FRONTEND_APP \
  --resource-group $RESOURCE_GROUP \
  --query properties.configuration.ingress.fqdn \
  --output tsv)

echo "✅ Frontend deployed: https://$FRONTEND_URL"

# Update backend with frontend URL for CORS
az containerapp update \
  --name $BACKEND_APP \
  --resource-group $RESOURCE_GROUP \
  --set-env-vars "FRONTEND_URL=https://$FRONTEND_URL"

# ============================================
# Output Summary
# ============================================

echo ""
echo "============================================"
echo "✅ Setup Complete!"
echo "============================================"
echo ""
echo "📊 Resources Created:"
echo "  Resource Group: $RESOURCE_GROUP"
echo "  Container Registry: $ACR_LOGIN_SERVER"
echo "  CosmosDB: $COSMOS_ENDPOINT"
echo "  Backend URL: https://$BACKEND_URL"
echo "  Frontend URL: https://$FRONTEND_URL"
echo ""
echo "🔐 Credentials:"
echo "  ACR Username: $ACR_USERNAME"
echo "  ACR Password: $ACR_PASSWORD"
echo ""
echo "📝 Next Steps:"
echo "  1. Login to ACR:"
echo "     az acr login --name $ACR_NAME"
echo ""
echo "  2. Build and push backend:"
echo "     cd backend"
echo "     docker build -t $ACR_LOGIN_SERVER/backend:latest ."
echo "     docker push $ACR_LOGIN_SERVER/backend:latest"
echo ""
echo "  3. Build and push frontend:"
echo "     cd frontend"
echo "     docker build --build-arg REACT_APP_API_URL=https://$BACKEND_URL -t $ACR_LOGIN_SERVER/frontend:latest ."
echo "     docker push $ACR_LOGIN_SERVER/frontend:latest"
echo ""
echo "  4. Update Container Apps:"
echo "     az containerapp update --name $BACKEND_APP --resource-group $RESOURCE_GROUP --image $ACR_LOGIN_SERVER/backend:latest"
echo "     az containerapp update --name $FRONTEND_APP --resource-group $RESOURCE_GROUP --image $ACR_LOGIN_SERVER/frontend:latest"
echo ""
echo "============================================"

# Save config to file
cat > azure-config.json <<EOF
{
  "resourceGroup": "$RESOURCE_GROUP",
  "location": "$LOCATION",
  "acrName": "$ACR_NAME",
  "acrLoginServer": "$ACR_LOGIN_SERVER",
  "acrUsername": "$ACR_USERNAME",
  "cosmosEndpoint": "$COSMOS_ENDPOINT",
  "backendUrl": "https://$BACKEND_URL",
  "frontendUrl": "https://$FRONTEND_URL"
}
EOF

echo "💾 Configuration saved to azure-config.json"
