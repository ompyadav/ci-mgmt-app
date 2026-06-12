# CIMS - Setup Guide

## Prerequisites

### Required Software
- **Java Development Kit (JDK) 17 or higher**
  - Download: https://adoptium.net/
  - Verify: `java -version`

- **Maven 3.8 or higher**
  - Download: https://maven.apache.org/download.cgi
  - Verify: `mvn -version`

- **Node.js 18 or higher**
  - Download: https://nodejs.org/
  - Verify: `node -version` and `npm -version`

- **Docker Desktop**
  - Download: https://www.docker.com/products/docker-desktop
  - Verify: `docker --version` and `docker-compose --version`

- **PostgreSQL 15** (Optional - if not using Docker)
  - Download: https://www.postgresql.org/download/
  - Verify: `psql --version`

- **Git**
  - Download: https://git-scm.com/downloads
  - Verify: `git --version`

### Recommended IDE
- **IntelliJ IDEA** (Ultimate or Community Edition)
- **Visual Studio Code** with extensions:
  - Java Extension Pack
  - Spring Boot Extension Pack
  - ES7+ React/Redux/React-Native snippets
  - Prettier - Code formatter

## Project Structure

```
ci-mgmt-app/
├── backend/                    # Spring Boot Backend
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/cims/app/
│   │   │   │   ├── config/           # Configuration classes
│   │   │   │   ├── controller/       # REST Controllers
│   │   │   │   ├── dto/              # Data Transfer Objects
│   │   │   │   ├── entity/           # JPA Entities
│   │   │   │   ├── exception/        # Custom Exceptions
│   │   │   │   ├── mapper/           # DTO Mappers
│   │   │   │   ├── repository/       # JPA Repositories
│   │   │   │   ├── security/         # Security Configuration
│   │   │   │   ├── service/          # Business Logic
│   │   │   │   └── util/             # Utility Classes
│   │   │   └── resources/
│   │   │       ├── application.properties
│   │   │       └── db/migration/     # Flyway migrations
│   │   └── test/                     # Unit & Integration Tests
│   ├── pom.xml
│   └── Dockerfile
├── frontend/                   # React Frontend
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── store/
│   │   └── utils/
│   ├── package.json
│   └── Dockerfile
├── database/                   # Database scripts
│   └── init/
├── docker/                     # Docker configurations
│   ├── docker-compose.yml
│   └── nginx/
├── docs/                       # Documentation
└── .github/                    # GitHub Actions workflows
```

## Setup Instructions

### Option 1: Docker Setup (Recommended)

#### 1. Clone the Repository
```bash
git clone <repository-url>
cd ci-mgmt-app
```

#### 2. Configure Environment Variables
Create a `.env` file in the `docker` directory:
```env
# Database
DB_HOST=postgres
DB_PORT=5432
DB_NAME=cims_db
DB_USERNAME=postgres
DB_PASSWORD=your_secure_password

# JWT
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRATION=86400000

# Email (Optional)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your_email@gmail.com
MAIL_PASSWORD=your_app_password
```

#### 3. Build and Start All Services
```bash
cd docker
docker-compose up -d
```

#### 4. Verify Services
- Backend API: http://localhost:8080
- Frontend: http://localhost:3000
- API Documentation: http://localhost:8080/swagger-ui.html
- PgAdmin (dev profile): http://localhost:5050

#### 5. Check Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
```

#### 6. Stop Services
```bash
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

### Option 2: Local Development Setup

#### Backend Setup

1. **Configure Database**
   - Install PostgreSQL 15
   - Create database:
   ```sql
   CREATE DATABASE cims_db;
   CREATE USER cims_user WITH PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE cims_db TO cims_user;
   ```

2. **Update Configuration**
   Edit `backend/src/main/resources/application.properties`:
   ```properties
   spring.datasource.url=jdbc:postgresql://localhost:5432/cims_db
   spring.datasource.username=cims_user
   spring.datasource.password=your_password
   ```

3. **Build Backend**
   ```bash
   cd backend
   mvn clean install
   ```

4. **Run Backend**
   ```bash
   mvn spring-boot:run
   ```
   Or run from IDE: `CimsApplication.java`

5. **Verify Backend**
   - API: http://localhost:8080
   - Health: http://localhost:8080/actuator/health
   - Swagger: http://localhost:8080/swagger-ui.html

#### Frontend Setup

1. **Install Dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Configure Environment**
   Create `.env` file in `frontend` directory:
   ```env
   REACT_APP_API_URL=http://localhost:8080/api
   REACT_APP_ENV=development
   ```

3. **Run Frontend**
   ```bash
   npm start
   ```

4. **Verify Frontend**
   - Application: http://localhost:3000

## Default Credentials

### Admin User
- **Email**: admin@cims.com
- **Password**: Admin@123
- **Role**: System Administrator

### Database (Docker)
- **Host**: localhost
- **Port**: 5432
- **Database**: cims_db
- **Username**: postgres
- **Password**: postgres

### PgAdmin (Docker - dev profile)
- **URL**: http://localhost:5050
- **Email**: admin@cims.com
- **Password**: admin

## Testing

### Backend Tests
```bash
cd backend
mvn test
```

### Frontend Tests
```bash
cd frontend
npm test
```

### Integration Tests
```bash
cd backend
mvn verify
```

## Building for Production

### Backend
```bash
cd backend
mvn clean package -DskipTests
```
JAR file will be in `target/` directory

### Frontend
```bash
cd frontend
npm run build
```
Build files will be in `build/` directory

### Docker Images
```bash
# Build all images
docker-compose build

# Build specific service
docker-compose build backend
docker-compose build frontend
```

## Troubleshooting

### Port Already in Use
```bash
# Windows
netstat -ano | findstr :8080
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:8080 | xargs kill -9
```

### Database Connection Issues
1. Verify PostgreSQL is running
2. Check connection parameters
3. Verify firewall settings
4. Check database logs

### Docker Issues
```bash
# Remove all containers and volumes
docker-compose down -v

# Rebuild images
docker-compose build --no-cache

# View logs
docker-compose logs -f
```

### Maven Build Issues
```bash
# Clear Maven cache
mvn dependency:purge-local-repository

# Force update
mvn clean install -U
```

## Development Workflow

1. **Create Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make Changes**
   - Write code
   - Add tests
   - Update documentation

3. **Test Locally**
   ```bash
   # Backend
   mvn test
   
   # Frontend
   npm test
   ```

4. **Commit Changes**
   ```bash
   git add .
   git commit -m "feat: your feature description"
   ```

5. **Push and Create PR**
   ```bash
   git push origin feature/your-feature-name
   ```

## Additional Resources

- [Spring Boot Documentation](https://spring.io/projects/spring-boot)
- [React Documentation](https://react.dev/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Docker Documentation](https://docs.docker.com/)

## Support

For issues and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation in `docs/` directory

---
**Last Updated**: 2026-06-10
**Version**: 1.0.0