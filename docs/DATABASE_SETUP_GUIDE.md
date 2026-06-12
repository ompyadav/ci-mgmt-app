# Database Setup Guide - PostgreSQL Not Running

## Current Issue
❌ PostgreSQL is not running or not installed
✅ Frontend is running on http://localhost:3001
❌ Backend cannot start without database

## Quick Solutions

### Solution 1: Use Free Cloud Database (Recommended - Fastest)

Since PostgreSQL is not accessible locally, the **fastest solution** is to use a free cloud database:

#### Option A: Neon.tech (Recommended)

**Why Neon?**
- ✅ Free tier with 0.5 GB storage
- ✅ No credit card required
- ✅ PostgreSQL 16
- ✅ Instant setup (2 minutes)
- ✅ Auto-scaling
- ✅ Built-in connection pooling

**Setup Steps:**

1. **Sign Up:**
   - Go to https://neon.tech
   - Click "Sign Up" (use GitHub, Google, or email)
   - No credit card required

2. **Create Project:**
   - Click "Create Project"
   - Project name: `cims-db`
   - Region: Choose closest to you (e.g., AWS Asia Pacific Mumbai)
   - PostgreSQL version: 16
   - Click "Create Project"

3. **Get Connection String:**
   - After creation, you'll see connection details
   - Copy the connection string (looks like):
   ```
   postgresql://username:password@ep-xxx-xxx.region.aws.neon.tech/neondb?sslmode=require
   ```

4. **Update Application Properties:**
   
   Open `backend/src/main/resources/application.properties` and update:

   ```properties
   # Neon Database Configuration
   spring.datasource.url=jdbc:postgresql://YOUR_NEON_HOST/neondb?sslmode=require
   spring.datasource.username=YOUR_USERNAME
   spring.datasource.password=YOUR_PASSWORD
   spring.datasource.driver-class-name=org.postgresql.Driver

   # JPA Configuration
   spring.jpa.hibernate.ddl-auto=validate
   spring.jpa.show-sql=false
   spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect

   # Flyway Configuration
   spring.flyway.enabled=true
   spring.flyway.baseline-on-migrate=true
   spring.flyway.locations=classpath:db/migration
   ```

5. **Start Backend:**
   ```bash
   cd backend
   mvn spring-boot:run
   ```

6. **Access Application:**
   - Frontend: http://localhost:3001
   - Login: admin / admin123

---

#### Option B: Supabase (PostgreSQL + Extra Features)

**Why Supabase?**
- ✅ Free tier with 500 MB storage
- ✅ PostgreSQL + Auth + Storage + Realtime
- ✅ Nice dashboard
- ✅ Auto-generated REST API

**Setup Steps:**

1. **Sign Up:**
   - Go to https://supabase.com
   - Click "Start your project"
   - Sign up with GitHub or email

2. **Create Project:**
   - Organization: Create new or use existing
   - Project name: `cims-db`
   - Database password: Create strong password (save it!)
   - Region: Choose closest to you
   - Click "Create new project" (takes 2-3 minutes)

3. **Get Connection Details:**
   - Go to Project Settings → Database
   - Find "Connection string" section
   - Copy the "URI" connection string
   - Replace `[YOUR-PASSWORD]` with your actual password

4. **Update Application Properties:**
   ```properties
   spring.datasource.url=jdbc:postgresql://db.xxx.supabase.co:5432/postgres?sslmode=require
   spring.datasource.username=postgres
   spring.datasource.password=YOUR_PASSWORD
   ```

---

#### Option C: Railway (PostgreSQL + Deployment)

**Why Railway?**
- ✅ Free $5 credit per month
- ✅ Can deploy entire app later
- ✅ Simple setup

**Setup Steps:**

1. Go to https://railway.app
2. Sign up with GitHub
3. Click "New Project" → "Provision PostgreSQL"
4. Click on PostgreSQL service → "Connect"
5. Copy connection string
6. Update application.properties

---

### Solution 2: Install PostgreSQL Locally

If you want to run PostgreSQL locally:

#### Windows Installation:

1. **Download PostgreSQL:**
   - Go to https://www.postgresql.org/download/windows/
   - Download PostgreSQL 15 or 16 installer
   - Run the installer

2. **Installation Steps:**
   - Choose installation directory (default is fine)
   - Select components: PostgreSQL Server, pgAdmin 4, Command Line Tools
   - Data directory: Use default
   - **Set password for postgres user** (remember this!)
   - Port: 5432 (default)
   - Locale: Default
   - Complete installation

3. **Verify Installation:**
   ```cmd
   # Add PostgreSQL to PATH (if not done automatically)
   # Add: C:\Program Files\PostgreSQL\15\bin

   # Check version
   psql --version
   ```

4. **Start PostgreSQL Service:**
   ```cmd
   # Using Services
   services.msc → Find "postgresql-x64-15" → Start

   # Or using command line (as Administrator)
   net start postgresql-x64-15
   ```

5. **Create Database:**
   ```cmd
   # Connect to PostgreSQL
   psql -U postgres

   # In psql prompt:
   CREATE DATABASE cims_db;
   CREATE USER cims_user WITH PASSWORD 'cims_password';
   GRANT ALL PRIVILEGES ON DATABASE cims_db TO cims_user;
   \c cims_db
   GRANT ALL ON SCHEMA public TO cims_user;
   \q
   ```

6. **Update Application Properties:**
   ```properties
   spring.datasource.url=jdbc:postgresql://localhost:5432/cims_db
   spring.datasource.username=cims_user
   spring.datasource.password=cims_password
   ```

---

### Solution 3: Check if PostgreSQL is Already Installed

Sometimes PostgreSQL is installed but not in PATH or not running:

#### Check Installation:

```cmd
# Check if PostgreSQL is installed
dir "C:\Program Files\PostgreSQL"

# Check if service exists
sc query | findstr postgres
```

#### Start PostgreSQL Service:

```cmd
# Method 1: Services GUI
Win + R → services.msc → Find postgresql → Right-click → Start

# Method 2: Command Line (as Administrator)
net start postgresql-x64-15

# Method 3: Using pg_ctl
"C:\Program Files\PostgreSQL\15\bin\pg_ctl" -D "C:\Program Files\PostgreSQL\15\data" start
```

#### Add PostgreSQL to PATH:

1. Win + R → `sysdm.cpl` → Advanced → Environment Variables
2. Under System Variables, find "Path"
3. Click Edit → New
4. Add: `C:\Program Files\PostgreSQL\15\bin`
5. Click OK
6. Restart terminal

---

## Recommended Approach

**For immediate development without hassle:**

1. ✅ **Use Neon.tech** (2 minutes setup, no installation)
2. Update `application.properties` with Neon connection string
3. Start backend: `cd backend && mvn spring-boot:run`
4. Access app: http://localhost:3001

**For long-term local development:**

1. Install PostgreSQL locally
2. Set up database
3. Configure application.properties
4. Continue development

---

## Comparison

| Feature | Neon.tech | Supabase | Railway | Local PostgreSQL |
|---------|-----------|----------|---------|------------------|
| Setup Time | 2 min | 3 min | 2 min | 15-30 min |
| Free Tier | 0.5 GB | 500 MB | $5/month | Unlimited |
| Internet Required | Yes | Yes | Yes | No |
| Performance | Good | Good | Good | Best |
| Backup | Auto | Auto | Auto | Manual |
| Scaling | Auto | Auto | Auto | Manual |

---

## Next Steps

1. **Choose your solution** (Neon.tech recommended for quick start)
2. **Update application.properties** with database credentials
3. **Start backend**: `cd backend && mvn spring-boot:run`
4. **Access application**: http://localhost:3001
5. **Login**: admin / admin123

---

## Troubleshooting

### Backend still won't start?

Check the error message:
- "Connection refused" → Database not running or wrong host/port
- "Authentication failed" → Wrong username/password
- "Database does not exist" → Create database first
- "SSL required" → Add `?sslmode=require` to connection string

### Need help?

1. Check backend logs in `backend/logs/application.log`
2. Verify database connection string format
3. Test connection with psql or pgAdmin
4. Ensure Flyway migrations are in `backend/src/main/resources/db/migration/`

---

**Made with Bob IDE**