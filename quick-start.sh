#!/bin/bash

# CIMS Quick Start Script
# This script helps you quickly set up and run the CIMS application

set -e

echo "=========================================="
echo "CIMS - Quick Start Script"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ $1${NC}"
}

# Check if Docker is installed
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    print_success "Docker is installed"
}

# Check if Docker Compose is installed
check_docker_compose() {
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    print_success "Docker Compose is installed"
}

# Main menu
show_menu() {
    echo ""
    echo "What would you like to do?"
    echo "1) Start all services (Docker)"
    echo "2) Stop all services"
    echo "3) View logs"
    echo "4) Rebuild and restart"
    echo "5) Clean up (remove containers and volumes)"
    echo "6) Check service status"
    echo "7) Setup for local development"
    echo "8) Exit"
    echo ""
    read -p "Enter your choice [1-8]: " choice
}

# Start services
start_services() {
    print_info "Starting all services..."
    cd docker
    docker-compose up -d
    print_success "Services started successfully!"
    echo ""
    print_info "Access the application at:"
    echo "  - Frontend: http://localhost:3000"
    echo "  - Backend API: http://localhost:8080"
    echo "  - API Documentation: http://localhost:8080/swagger-ui.html"
    echo "  - PgAdmin (dev): http://localhost:5050"
    echo ""
    print_info "Default admin credentials:"
    echo "  - Email: admin@cims.com"
    echo "  - Password: Admin@123"
}

# Stop services
stop_services() {
    print_info "Stopping all services..."
    cd docker
    docker-compose down
    print_success "Services stopped successfully!"
}

# View logs
view_logs() {
    echo ""
    echo "Which service logs would you like to view?"
    echo "1) All services"
    echo "2) Backend"
    echo "3) Frontend"
    echo "4) PostgreSQL"
    echo ""
    read -p "Enter your choice [1-4]: " log_choice
    
    cd docker
    case $log_choice in
        1) docker-compose logs -f ;;
        2) docker-compose logs -f backend ;;
        3) docker-compose logs -f frontend ;;
        4) docker-compose logs -f postgres ;;
        *) print_error "Invalid choice" ;;
    esac
}

# Rebuild and restart
rebuild_services() {
    print_info "Rebuilding and restarting services..."
    cd docker
    docker-compose down
    docker-compose build --no-cache
    docker-compose up -d
    print_success "Services rebuilt and restarted successfully!"
}

# Clean up
cleanup() {
    print_info "This will remove all containers, volumes, and data. Are you sure? (yes/no)"
    read -p "> " confirm
    if [ "$confirm" = "yes" ]; then
        cd docker
        docker-compose down -v
        print_success "Cleanup completed!"
    else
        print_info "Cleanup cancelled"
    fi
}

# Check status
check_status() {
    print_info "Checking service status..."
    cd docker
    docker-compose ps
}

# Setup local development
setup_local_dev() {
    print_info "Setting up local development environment..."
    
    # Check Java
    if ! command -v java &> /dev/null; then
        print_error "Java is not installed. Please install Java 17 or higher."
    else
        print_success "Java is installed: $(java -version 2>&1 | head -n 1)"
    fi
    
    # Check Maven
    if ! command -v mvn &> /dev/null; then
        print_error "Maven is not installed. Please install Maven 3.8 or higher."
    else
        print_success "Maven is installed: $(mvn -version | head -n 1)"
    fi
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 18 or higher."
    else
        print_success "Node.js is installed: $(node -v)"
    fi
    
    # Check npm
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed."
    else
        print_success "npm is installed: $(npm -v)"
    fi
    
    echo ""
    print_info "For detailed setup instructions, see docs/SETUP_GUIDE.md"
}

# Main script
main() {
    check_docker
    check_docker_compose
    
    while true; do
        show_menu
        case $choice in
            1) start_services ;;
            2) stop_services ;;
            3) view_logs ;;
            4) rebuild_services ;;
            5) cleanup ;;
            6) check_status ;;
            7) setup_local_dev ;;
            8) 
                print_info "Goodbye!"
                exit 0
                ;;
            *) print_error "Invalid choice. Please try again." ;;
        esac
    done
}

# Run main function
main

# Made with Bob
