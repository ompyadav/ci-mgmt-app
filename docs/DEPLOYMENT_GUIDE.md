# CIMS - Production Deployment Guide

**Version**: 1.0.0  
**Date**: June 12, 2026  
**Status**: Ready for Production Deployment

---

## 📋 Pre-Deployment Checklist

### ✅ Completed Items
- [x] Backend fully implemented and tested
- [x] Frontend core features implemented
- [x] Database schema finalized
- [x] Security configuration complete
- [x] All critical bugs fixed
- [x] Docker configuration ready
- [x] Environment variables documented

### ⚠️ Known Limitations
- Analytics page is placeholder (Phase 2)
- Reports page is placeholder (Phase 2)
- Settings page is placeholder (Phase 2)
- Real-time notifications not implemented (Phase 2)

---

## 🚀 Deployment Options

### Option 1: Docker Compose (Recommended)
**Best for**: Quick deployment, development, staging

### Option 2: Manual Deployment
**Best for**: Production with existing infrastructure

### Option 3: Cloud Deployment
**Best for**: Scalable production environments

---

## 📦 Option 1: Docker Compose Deployment

### Prerequisites
- Docker 20.10+
- Docker Compose 2.0+
- 4GB RAM minimum
- 10GB disk space

### Step 1: Clone Repository
```bash
git clone <repository-url>
cd ci-mgmt-app
```

### Step 2: Configure Environment Variables

Create `.env` file in project root:

```env
# Database Configuration
POSTGRES_DB=cims_db
POSTGRES_USER=cims_user
POSTGRES_PASSWORD=your_secure_password_here
POSTGRES_HOST=postgres
POSTGRES_PORT=5432

# Backend Configuration
SPRING_PROFILES_ACTIVE=prod
JWT_SECRET=your_jwt_secret_key_min_256_bits_here
JWT_EXPIRATION=86400000
JWT_REFRESH_EXPIRATION=604800000

# Frontend Configuration
VITE_API_BASE_URL=http://localhost:8080/api

# Application Configuration
SERVER_PORT=8080
FRONTEND_PORT=3000
```

### Step 3: Build and Start Services
```bash
# Build all services
docker-compose build

# Start all services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

### Step 4: Verify Deployment
```bash
# Check backend health
curl http://localhost:8080/actuator/health

# Check frontend
curl http://localhost:3000

# Check database
docker-compose exec postgres psql -U cims_user -d cims_db -c "\dt"
```

### Step 5: Access Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080/api
- **API Docs**: http://localhost:8080/swagger-ui.html
- **Health Check**: http://localhost:8080/actuator/health

### Default Credentials
```
Email: admin@cims.com
Password: Admin@123
```

**⚠️ IMPORTANT: Change default password immediately after first login!**

---

## 🔧 Option 2: Manual Deployment

### Backend Deployment

#### Prerequisites
- Java 17 or higher
- Maven 3.8+
- PostgreSQL 15+

#### Step 1: Setup Database
```sql
-- Connect to PostgreSQL
psql -U postgres

-- Create database and user
CREATE DATABASE cims_db;
CREATE USER cims_user WITH ENCRYPTED PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE cims_db TO cims_user;
```

#### Step 2: Configure Backend
Edit `backend/src/main/resources/application.properties`:

```properties
# Database
spring.datasource.url=jdbc:postgresql://localhost:5432/cims_db
spring.datasource.username=cims_user
spring.datasource.password=your_password

# JWT
jwt.secret=your_jwt_secret_key_min_256_bits
jwt.expiration=86400000
jwt.refresh-expiration=604800000

# Server
server.port=8080
```

#### Step 3: Build Backend
```bash
cd backend
mvn clean package -DskipTests
```

#### Step 4: Run Backend
```bash
# Option A: Using Maven
mvn spring-boot:run

# Option B: Using JAR
java -jar target/ci-management-system-1.0.0.jar

# Option C: As background service
nohup java -jar target/ci-management-system-1.0.0.jar > app.log 2>&1 &
```

### Frontend Deployment

#### Prerequisites
- Node.js 18+
- npm 9+

#### Step 1: Configure Frontend
Edit `frontend/.env.production`:

```env
VITE_API_BASE_URL=http://your-backend-url:8080/api
```

#### Step 2: Build Frontend
```bash
cd frontend
npm install
npm run build
```

#### Step 3: Deploy Frontend

**Option A: Using Nginx**
```bash
# Copy build files
sudo cp -r dist/* /var/www/cims/

# Nginx configuration
sudo nano /etc/nginx/sites-available/cims
```

Nginx config:
```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/cims;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/cims /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

**Option B: Using Node.js Server**
```bash
npm install -g serve
serve -s dist -l 3000
```

---

## ☁️ Option 3: Cloud Deployment

### AWS Deployment

#### Backend (Elastic Beanstalk)
```bash
# Install EB CLI
pip install awsebcli

# Initialize
cd backend
eb init -p java-17 cims-backend

# Create environment
eb create cims-prod

# Deploy
eb deploy
```

#### Frontend (S3 + CloudFront)
```bash
# Build
cd frontend
npm run build

# Upload to S3
aws s3 sync dist/ s3://cims-frontend-bucket

# Create CloudFront distribution
aws cloudfront create-distribution --origin-domain-name cims-frontend-bucket.s3.amazonaws.com
```

#### Database (RDS)
```bash
# Create RDS PostgreSQL instance
aws rds create-db-instance \
  --db-instance-identifier cims-db \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --master-username cims_user \
  --master-user-password your_password \
  --allocated-storage 20
```

### Azure Deployment

#### Backend (App Service)
```bash
# Login
az login

# Create resource group
az group create --name cims-rg --location eastus

# Create App Service plan
az appservice plan create --name cims-plan --resource-group cims-rg --sku B1 --is-linux

# Create web app
az webapp create --resource-group cims-rg --plan cims-plan --name cims-backend --runtime "JAVA:17-java17"

# Deploy
cd backend
mvn clean package
az webapp deploy --resource-group cims-rg --name cims-backend --src-path target/ci-management-system-1.0.0.jar
```

#### Frontend (Static Web Apps)
```bash
# Create static web app
az staticwebapp create \
  --name cims-frontend \
  --resource-group cims-rg \
  --source https://github.com/your-repo \
  --location eastus \
  --branch main \
  --app-location "/frontend" \
  --output-location "dist"
```

---

## 🔒 Security Configuration

### 1. Change Default Credentials
```sql
-- Connect to database
psql -U cims_user -d cims_db

-- Update admin password
UPDATE users 
SET password = '$2a$10$NEW_BCRYPT_HASH_HERE' 
WHERE email = 'admin@cims.com';
```

### 2. Configure HTTPS
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com
```

### 3. Setup Firewall
```bash
# Allow only necessary ports
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 22/tcp
sudo ufw enable
```

### 4. Environment Variables Security
- Never commit `.env` files
- Use secrets management (AWS Secrets Manager, Azure Key Vault)
- Rotate JWT secrets regularly
- Use strong database passwords

---

## 📊 Monitoring & Maintenance

### Health Checks
```bash
# Backend health
curl http://localhost:8080/actuator/health

# Database connection
curl http://localhost:8080/actuator/health/db

# Disk space
curl http://localhost:8080/actuator/health/diskSpace
```

### Logs
```bash
# Backend logs
tail -f backend/logs/application.log

# Docker logs
docker-compose logs -f backend

# System logs
journalctl -u cims-backend -f
```

### Database Backup
```bash
# Manual backup
pg_dump -U cims_user cims_db > backup_$(date +%Y%m%d).sql

# Automated backup (cron)
0 2 * * * pg_dump -U cims_user cims_db > /backups/cims_$(date +\%Y\%m\%d).sql
```

### Performance Monitoring
- Use Spring Boot Actuator metrics
- Monitor database query performance
- Track API response times
- Monitor memory and CPU usage

---

## 🔄 Update & Rollback

### Update Application
```bash
# Pull latest code
git pull origin main

# Backend update
cd backend
mvn clean package
docker-compose up -d --build backend

# Frontend update
cd frontend
npm run build
docker-compose up -d --build frontend
```

### Rollback
```bash
# Rollback to previous version
git checkout <previous-commit>
docker-compose up -d --build

# Or use Docker image tags
docker-compose down
docker-compose up -d backend:v1.0.0 frontend:v1.0.0
```

---

## 🐛 Troubleshooting

### Backend Won't Start
```bash
# Check logs
docker-compose logs backend

# Common issues:
# 1. Database not ready - wait 30 seconds
# 2. Port 8080 in use - change port
# 3. JWT secret not set - check .env
```

### Frontend Can't Connect to Backend
```bash
# Check CORS configuration
# Check API URL in .env
# Verify backend is running
curl http://localhost:8080/actuator/health
```

### Database Connection Failed
```bash
# Check PostgreSQL is running
docker-compose ps postgres

# Check credentials
docker-compose exec postgres psql -U cims_user -d cims_db

# Reset database
docker-compose down -v
docker-compose up -d
```

---

## 📞 Support & Maintenance

### Regular Maintenance Tasks
- [ ] Weekly: Review logs for errors
- [ ] Weekly: Check disk space
- [ ] Monthly: Update dependencies
- [ ] Monthly: Review security patches
- [ ] Quarterly: Database optimization
- [ ] Quarterly: Performance review

### Monitoring Checklist
- [ ] Backend health endpoint responding
- [ ] Frontend accessible
- [ ] Database connections stable
- [ ] Disk space > 20% free
- [ ] Memory usage < 80%
- [ ] No critical errors in logs

---

## 🎯 Post-Deployment Verification

### Functional Testing
1. **Authentication**
   - [ ] Login with admin credentials
   - [ ] Logout functionality
   - [ ] Token refresh works

2. **Idea Management**
   - [ ] Create new idea
   - [ ] Edit existing idea
   - [ ] Submit idea for review
   - [ ] Approve/reject idea (as manager)
   - [ ] View idea details

3. **User Management**
   - [ ] Create new user
   - [ ] Edit user profile
   - [ ] Assign roles
   - [ ] Deactivate user

4. **Dashboard**
   - [ ] Statistics display correctly
   - [ ] Charts render properly
   - [ ] Recent activities show

### Performance Testing
- [ ] Page load time < 3 seconds
- [ ] API response time < 500ms
- [ ] Database queries optimized
- [ ] No memory leaks

---

## 📚 Additional Resources

- [API Documentation](http://localhost:8080/swagger-ui.html)
- [Setup Guide](./SETUP_GUIDE.md)
- [Project Status](./PROJECT_STATUS.md)
- [User Manual](./USER_MANUAL.md) (to be created)

---

## ✅ Deployment Complete!

Your CIMS application is now deployed and ready for use!

**Access URLs:**
- Frontend: http://your-domain.com
- Backend API: http://your-domain.com/api
- API Docs: http://your-domain.com/swagger-ui.html

**Default Login:**
- Email: admin@cims.com
- Password: Admin@123 (⚠️ Change immediately!)

---

**Deployment Date**: 2026-06-12  
**Version**: 1.0.0  
**Status**: ✅ Production Ready