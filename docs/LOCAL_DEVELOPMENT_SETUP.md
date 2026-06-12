# Local Development Setup (Without Docker)

This guide helps you set up and run the CI Management Application locally without Docker.

## Prerequisites

✅ You already have these installed:
- Java JDK 17 or higher
- Maven 3.6+
- Node.js 18+ and npm
- PostgreSQL 12+
- Bob IDE (VS Code)

## Database Setup

### 1. Create PostgreSQL Database

Open PostgreSQL command line (psql) or pgAdmin and run:

```sql
-- Create database
CREATE DATABASE cims_db;

-- Create user (optional, or use existing postgres user)
CREATE USER cims_user WITH PASSWORD 'cims_password';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE cims_db TO cims_user;

-- Connect to the database
\c cims_db

-- Grant schema privileges
GRANT ALL ON SCHEMA public TO cims_user;
```

### 2. Configure Database Connection

Update `backend/src/main/resources/application.properties`:

```properties
# Database Configuration
spring.datasource.url=jdbc:postgresql://localhost:5432/cims_db
spring.datasource.username=cims_user
spring.datasource.password=cims_password
spring.datasource.driver-class-name=org.postgresql.Driver

# JPA/Hibernate Configuration
spring.jpa.hibernate.ddl-auto=validate
spring.jpa.show-sql=false
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect
spring.jpa.properties.hibernate.format_sql=true

# Flyway Configuration (for database migrations)
spring.flyway.enabled=true
spring.flyway.baseline-on-migrate=true
spring.flyway.locations=classpath:db/migration
```

**Note:** If using the default `postgres` user, update accordingly:
```properties
spring.datasource.username=postgres
spring.datasource.password=your_postgres_password
```

## Running the Application

### Terminal 1: Backend (Spring Boot)

```bash
# Navigate to backend directory
cd backend

# Clean and build the project
mvn clean install

# Run the Spring Boot application
mvn spring-boot:run
```

**Backend will start on:** `http://localhost:8080`

**API Documentation:** `http://localhost:8080/swagger-ui.html` (if Swagger is configured)

### Terminal 2: Frontend (React + Vite)

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies (first time only)
npm install

# Run the development server
npm run dev
```

**Frontend will start on:** `http://localhost:5173`

## Verify Setup

### 1. Check Backend Health
```bash
curl http://localhost:8080/api/health
```

### 2. Check Database Connection
```bash
# In PostgreSQL
\c cims_db
\dt
```

You should see tables created by Flyway migrations:
- users
- roles
- permissions
- categories
- ideas
- notifications
- audit_logs
- etc.

### 3. Test Login
- Open browser: `http://localhost:5173`
- Login with default admin credentials:
  - **Username:** `admin`
  - **Password:** `admin123`

## Development Workflow

### 1. Daily Development
```bash
# Terminal 1: Start backend
cd backend && mvn spring-boot:run

# Terminal 2: Start frontend
cd frontend && npm run dev
```

### 2. Making Changes

**Backend Changes:**
- Edit Java files in `backend/src/main/java/`
- Spring Boot DevTools will auto-reload (if configured)
- Or restart: `Ctrl+C` and `mvn spring-boot:run`

**Frontend Changes:**
- Edit React files in `frontend/src/`
- Vite HMR (Hot Module Replacement) will auto-reload
- Changes appear instantly in browser

**Database Changes:**
- Create new migration file in `backend/src/main/resources/db/migration/`
- Format: `V{version}__Description.sql` (e.g., `V5__Add_New_Table.sql`)
- Restart backend to apply migrations

### 3. Building for Production

**Backend:**
```bash
cd backend
mvn clean package
# Creates: target/cims-app-0.0.1-SNAPSHOT.jar
```

**Frontend:**
```bash
cd frontend
npm run build
# Creates: dist/ folder with production build
```

## Git Workflow

### 1. Initialize Git Repository (if not done)
```bash
git init
git add .
git commit -m "Initial commit"
```

### 2. Create GitHub Repository
1. Go to GitHub.com
2. Create new repository: `ci-mgmt-app`
3. Don't initialize with README (you already have one)

### 3. Push to GitHub
```bash
# Add remote
git remote add origin https://github.com/YOUR_USERNAME/ci-mgmt-app.git

# Push code
git branch -M main
git push -u origin main
```

### 4. Daily Git Workflow
```bash
# Before starting work
git pull origin main

# After making changes
git add .
git commit -m "Description of changes"
git push origin main

# Create feature branches for major changes
git checkout -b feature/new-feature
# ... make changes ...
git add .
git commit -m "Add new feature"
git push origin feature/new-feature
# Create Pull Request on GitHub
```

## Troubleshooting

### Backend Issues

**Port 8080 already in use:**
```bash
# Windows: Find and kill process
netstat -ano | findstr :8080
taskkill /PID <PID> /F

# Or change port in application.properties
server.port=8081
```

**Database connection failed:**
- Check PostgreSQL is running: `pg_ctl status`
- Verify credentials in `application.properties`
- Check database exists: `psql -U postgres -l`

**Maven build fails:**
```bash
# Clear Maven cache
mvn clean
rm -rf ~/.m2/repository

# Rebuild
mvn clean install -U
```

### Frontend Issues

**Port 5173 already in use:**
```bash
# Kill process on Windows
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# Or change port in vite.config.ts
server: { port: 3000 }
```

**npm install fails:**
```bash
# Clear npm cache
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

**API calls fail (CORS errors):**
- Check backend is running on port 8080
- Verify proxy in `vite.config.ts`:
```typescript
server: {
  proxy: {
    '/api': 'http://localhost:8080'
  }
}
```

### Database Issues

**Flyway migration fails:**
```bash
# Reset database (CAUTION: Deletes all data)
DROP DATABASE cims_db;
CREATE DATABASE cims_db;

# Or repair Flyway
mvn flyway:repair
```

**Connection pool exhausted:**
- Restart backend application
- Check for unclosed connections in code

## Environment Variables

Create `.env.local` in frontend directory:
```env
VITE_API_URL=http://localhost:8080/api
VITE_APP_NAME=CI Management System
```

Create `.env` in backend directory (optional):
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=cims_db
DB_USER=cims_user
DB_PASSWORD=cims_password
JWT_SECRET=your-secret-key-here
```

## IDE Configuration (Bob/VS Code)

### Recommended Extensions
- Java Extension Pack
- Spring Boot Extension Pack
- ESLint
- Prettier
- GitLens
- Thunder Client (API testing)

### VS Code Settings
Create `.vscode/settings.json`:
```json
{
  "java.configuration.updateBuildConfiguration": "automatic",
  "java.compile.nullAnalysis.mode": "automatic",
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "[java]": {
    "editor.defaultFormatter": "redhat.java"
  }
}
```

## Performance Tips

1. **Backend:**
   - Use Spring Boot DevTools for hot reload
   - Increase JVM memory: `MAVEN_OPTS=-Xmx2048m`
   - Enable caching in application.properties

2. **Frontend:**
   - Vite is already fast with HMR
   - Use React DevTools for debugging
   - Lazy load routes (already implemented)

3. **Database:**
   - Create indexes for frequently queried columns
   - Use connection pooling (HikariCP - already configured)
   - Regular VACUUM and ANALYZE

## Backup and Recovery

### Database Backup
```bash
# Backup
pg_dump -U cims_user -d cims_db > backup_$(date +%Y%m%d).sql

# Restore
psql -U cims_user -d cims_db < backup_20260612.sql
```

### Code Backup
- Push to GitHub regularly
- Create tags for releases: `git tag -a v1.0.0 -m "Release 1.0.0"`
- Use branches for features

## Next Steps

1. ✅ Set up local PostgreSQL database
2. ✅ Configure application.properties
3. ✅ Run backend with `mvn spring-boot:run`
4. ✅ Run frontend with `npm run dev`
5. ✅ Test login and basic functionality
6. ✅ Push code to GitHub
7. ✅ Continue development with Bob IDE

## Support

If you encounter issues:
1. Check this guide's Troubleshooting section
2. Review application logs in `backend/logs/`
3. Check browser console for frontend errors
4. Ask Bob IDE for help with specific errors

---

**Happy Coding! 🚀**

Made with Bob IDE