#!/bin/bash

# Stock Control Backend - Deploy Script
# This script automates the deployment process

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="stock_control_backend"
BACKUP_DIR="/var/backups/stock_control"
LOG_FILE="/var/log/stock_control/deploy.log"

# Functions
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a $LOG_FILE
}

success() {
    echo -e "${GREEN}✅ $1${NC}" | tee -a $LOG_FILE
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}" | tee -a $LOG_FILE
}

error() {
    echo -e "${RED}❌ $1${NC}" | tee -a $LOG_FILE
    exit 1
}

# Check if running as root
check_root() {
    if [[ $EUID -eq 0 ]]; then
        error "This script should not be run as root"
    fi
}

# Check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."
    
    # Check if git is installed
    if ! command -v git &> /dev/null; then
        error "Git is not installed"
    fi
    
    # Check if python3 is installed
    if ! command -v python3 &> /dev/null; then
        error "Python3 is not installed"
    fi
    
    # Check if pip is installed
    if ! command -v pip &> /dev/null; then
        error "Pip is not installed"
    fi
    
    success "Prerequisites check passed"
}

# Backup database
backup_database() {
    log "Creating database backup..."
    
    # Create backup directory if it doesn't exist
    mkdir -p $BACKUP_DIR
    
    # Create backup filename with timestamp
    BACKUP_FILE="$BACKUP_DIR/backup_$(date +%Y%m%d_%H%M%S).sql"
    
    # Backup database
    if command -v pg_dump &> /dev/null; then
        pg_dump $PROJECT_NAME > $BACKUP_FILE
        success "Database backup created: $BACKUP_FILE"
    else
        warning "PostgreSQL not found, skipping database backup"
    fi
}

# Update code
update_code() {
    log "Updating code from repository..."
    
    # Pull latest changes
    git pull origin main
    
    success "Code updated successfully"
}

# Install dependencies
install_dependencies() {
    log "Installing dependencies..."
    
    # Activate virtual environment if it exists
    if [ -d "venv" ]; then
        source venv/bin/activate
    fi
    
    # Install requirements
    pip install -r requirements.txt
    
    success "Dependencies installed"
}

# Run migrations
run_migrations() {
    log "Running database migrations..."
    
    # Activate virtual environment if it exists
    if [ -d "venv" ]; then
        source venv/bin/activate
    fi
    
    # Run migrations
    python manage.py migrate
    
    success "Migrations completed"
}

# Collect static files
collect_static() {
    log "Collecting static files..."
    
    # Activate virtual environment if it exists
    if [ -d "venv" ]; then
        source venv/bin/activate
    fi
    
    # Collect static files
    python manage.py collectstatic --noinput
    
    success "Static files collected"
}

# Run tests
run_tests() {
    log "Running tests..."
    
    # Activate virtual environment if it exists
    if [ -d "venv" ]; then
        source venv/bin/activate
    fi
    
    # Run tests
    python manage.py test
    
    success "Tests passed"
}

# Restart services
restart_services() {
    log "Restarting services..."
    
    # Restart Gunicorn if systemd service exists
    if systemctl is-active --quiet $PROJECT_NAME; then
        sudo systemctl restart $PROJECT_NAME
        success "Gunicorn service restarted"
    fi
    
    # Reload Nginx if it exists
    if command -v nginx &> /dev/null; then
        sudo nginx -t && sudo systemctl reload nginx
        success "Nginx reloaded"
    fi
}

# Check service status
check_status() {
    log "Checking service status..."
    
    # Check Gunicorn status
    if systemctl is-active --quiet $PROJECT_NAME; then
        success "Gunicorn service is running"
    else
        warning "Gunicorn service is not running"
    fi
    
    # Check Nginx status
    if systemctl is-active --quiet nginx; then
        success "Nginx service is running"
    else
        warning "Nginx service is not running"
    fi
}

# Cleanup old backups
cleanup_backups() {
    log "Cleaning up old backups..."
    
    # Keep only last 30 backups
    find $BACKUP_DIR -name "backup_*.sql" -mtime +30 -delete
    
    success "Old backups cleaned up"
}

# Main deployment function
deploy() {
    log "🚀 Starting deployment of $PROJECT_NAME..."
    
    # Check if we're in the right directory
    if [ ! -f "manage.py" ]; then
        error "manage.py not found. Are you in the project directory?"
    fi
    
    # Run deployment steps
    check_prerequisites
    backup_database
    update_code
    install_dependencies
    run_migrations
    collect_static
    run_tests
    restart_services
    check_status
    cleanup_backups
    
    success "🎉 Deployment completed successfully!"
}

# Show usage
usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -h, --help     Show this help message"
    echo "  -b, --backup   Only create backup"
    echo "  -t, --test     Only run tests"
    echo "  -s, --status   Only check status"
    echo ""
    echo "Examples:"
    echo "  $0              # Full deployment"
    echo "  $0 --backup     # Only backup database"
    echo "  $0 --test       # Only run tests"
    echo "  $0 --status     # Only check status"
}

# Parse command line arguments
case "${1:-}" in
    -h|--help)
        usage
        exit 0
        ;;
    -b|--backup)
        check_root
        backup_database
        exit 0
        ;;
    -t|--test)
        check_root
        run_tests
        exit 0
        ;;
    -s|--status)
        check_root
        check_status
        exit 0
        ;;
    "")
        deploy
        ;;
    *)
        error "Unknown option: $1"
        ;;
esac

