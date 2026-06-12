#!/bin/bash

# CIMS Quick Deployment Script
# Version: 1.0.0
# Date: 2026-06-12

set -e

echo "=========================================="
echo "CIMS - Quick Deployment Script"
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

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_info() {
    echo -e "${NC}ℹ $1${NC}"
}

# Check prerequisites
check_prerequisites() {
    print_info "Checking prerequisites..."
    
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    print_success "Docker is installed"
    
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    print_success "Docker Compose is installed"
    
    echo ""
}

# Setup environment file
setup_environment() {
    print_info "Setting up environment configuration..."
    
    if [ ! -f .env ]; then
        if [ -f .env.production.example ]; then
            cp .env.production.example .env
            print_warning "Created .env file from template"
            print_warning "IMPORTANT: Edit .env file and update all CHANGE_THIS values!"
            echo ""
            read -p "Press Enter to continue after updating .env file..."
        else
            print_error ".env.production.example not found"
            exit 1
        fi
    else
        print_success ".env file already exists"
    fi
    
    echo ""
}

# Build services
build_services() {
    print_info "Building Docker services..."
    
    docker-compose build --no-cache
    
    if [ $? -eq 0 ]; then
        print_success "Services built successfully"
    else
        print_error "Failed to build services"
        exit 1
    fi
    
    echo ""
}

# Start services
start_services() {
    print_info "Starting services..."
    
    docker-compose up -d
    
    if [ $? -eq 0 ]; then
        print_success "Services started successfully"
    else
        print_error "Failed to start services"
        exit 1
    fi
    
    echo ""
}

# Wait for services to be ready
wait_for_services() {
    print_info "Waiting for services to be ready..."
    
    # Wait for database
    print_info "Waiting for database..."
    sleep 10
    
    # Wait for backend
    print_info "Waiting for backend..."
    max_attempts=30
    attempt=0
    
    while [ $attempt -lt $max_attempts ]; do
        if curl -s http://localhost:8080/actuator/health > /dev/null 2>&1; then
            print_success "Backend is ready"
            break
        fi
        attempt=$((attempt + 1))
        sleep 2
    done
    
    if [ $attempt -eq $max_attempts ]; then
        print_error "Backend failed to start within timeout"
        print_info "Check logs with: docker-compose logs backend"
        exit 1
    fi
    
    # Wait for frontend
    print_info "Waiting for frontend..."
    sleep 5
    
    if curl -s http://localhost:3000 > /dev/null 2>&1; then
        print_success "Frontend is ready"
    else
        print_warning "Frontend may not be ready yet"
    fi
    
    echo ""
}

# Display status
display_status() {
    echo "=========================================="
    echo "Deployment Status"
    echo "=========================================="
    docker-compose ps
    echo ""
}

# Display access information
display_access_info() {
    echo "=========================================="
    echo "🎉 CIMS Deployment Complete!"
    echo "=========================================="
    echo ""
    echo "Access URLs:"
    echo "  Frontend:    http://localhost:3000"
    echo "  Backend API: http://localhost:8080/api"
    echo "  API Docs:    http://localhost:8080/swagger-ui.html"
    echo "  Health:      http://localhost:8080/actuator/health"
    echo ""
    echo "Default Credentials:"
    echo "  Email:    admin@cims.com"
    echo "  Password: Admin@123"
    echo ""
    print_warning "IMPORTANT: Change the default password immediately!"
    echo ""
    echo "Useful Commands:"
    echo "  View logs:        docker-compose logs -f"
    echo "  Stop services:    docker-compose down"
    echo "  Restart services: docker-compose restart"
    echo "  View status:      docker-compose ps"
    echo ""
    echo "=========================================="
}

# Main deployment flow
main() {
    check_prerequisites
    setup_environment
    build_services
    start_services
    wait_for_services
    display_status
    display_access_info
}

# Run main function
main

# Made with Bob
