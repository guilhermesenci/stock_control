# Guia de Deploy - Stock Control Backend

## Visão Geral

Este guia fornece instruções detalhadas para fazer o deploy do Stock Control Backend em diferentes ambientes, desde desenvolvimento até produção.

## Pré-requisitos

### Sistema Operacional
- Ubuntu 20.04+ / CentOS 8+ / RHEL 8+
- Python 3.8+
- PostgreSQL 12+ (produção) ou SQLite (desenvolvimento)

### Ferramentas Necessárias
- Git
- Python 3.8+
- pip
- virtualenv
- PostgreSQL (produção)
- Nginx (produção)
- Gunicorn (produção)

## Configuração de Ambiente

### 1. Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```bash
# Configurações Básicas
SECRET_KEY=sua_chave_secreta_super_segura_aqui
DEBUG=False
ALLOWED_HOSTS=localhost,127.0.0.1,seu-dominio.com

# Database
DATABASE_URL=postgresql://usuario:senha@localhost:5432/stock_control

# JWT
JWT_ACCESS_TOKEN_LIFETIME=60
JWT_REFRESH_TOKEN_LIFETIME=10080

# CORS
CORS_ALLOWED_ORIGINS=https://seu-frontend.com,https://www.seu-frontend.com

# Email (opcional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=seu-email@gmail.com
EMAIL_HOST_PASSWORD=sua-senha-de-app

# Logging
LOG_LEVEL=INFO
LOG_FILE=/var/log/stock_control/django.log

# Redis (opcional, para cache)
REDIS_URL=redis://localhost:6379/0
```

### 2. Configuração de Produção

Atualize `settings.py` para produção:

```python
# settings.py
import os
from pathlib import Path

# Build paths
BASE_DIR = Path(__file__).resolve().parent.parent

# Security
SECRET_KEY = os.environ.get('SECRET_KEY')
DEBUG = os.environ.get('DEBUG', 'False').lower() == 'true'
ALLOWED_HOSTS = os.environ.get('ALLOWED_HOSTS', '').split(',')

# Database
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.environ.get('DB_NAME', 'stock_control'),
        'USER': os.environ.get('DB_USER', 'postgres'),
        'PASSWORD': os.environ.get('DB_PASSWORD'),
        'HOST': os.environ.get('DB_HOST', 'localhost'),
        'PORT': os.environ.get('DB_PORT', '5432'),
    }
}

# Static files
STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')

# Media files
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# Logging
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {process:d} {thread:d} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'file': {
            'level': 'INFO',
            'class': 'logging.FileHandler',
            'filename': os.environ.get('LOG_FILE', '/var/log/stock_control/django.log'),
            'formatter': 'verbose',
        },
        'console': {
            'level': 'INFO',
            'class': 'logging.StreamHandler',
            'formatter': 'verbose',
        },
    },
    'root': {
        'handlers': ['file', 'console'],
        'level': 'INFO',
    },
}
```

## Deploy Local (Desenvolvimento)

### 1. Clone e Setup

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/stock-control-backend.git
cd stock-control-backend

# Crie ambiente virtual
python3 -m venv venv
source venv/bin/activate  # Linux/Mac
# ou
venv\Scripts\activate     # Windows

# Instale dependências
pip install -r requirements.txt
```

### 2. Configuração do Banco

```bash
# SQLite (desenvolvimento)
python manage.py migrate

# PostgreSQL (se preferir)
# Crie o banco primeiro
createdb stock_control_dev

# Configure no .env
DATABASE_URL=postgresql://usuario:senha@localhost:5432/stock_control_dev

# Execute migrações
python manage.py migrate
```

### 3. Criação de Usuário

```bash
# Crie superusuário
python manage.py createsuperuser

# Carregue dados iniciais (opcional)
python manage.py loaddata initial_data.json
```

### 4. Executar Servidor

```bash
# Desenvolvimento
python manage.py runserver

# Com configurações específicas
python manage.py runserver 0.0.0.0:8000
```

## Deploy em Produção

### 1. Servidor Ubuntu/CentOS

#### Instalação de Dependências

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install python3 python3-pip python3-venv postgresql postgresql-contrib nginx git

# CentOS/RHEL
sudo yum update
sudo yum install python3 python3-pip postgresql-server postgresql-contrib nginx git
```

#### Configuração do PostgreSQL

```bash
# Ubuntu
sudo -u postgres createuser --interactive
sudo -u postgres createdb stock_control

# CentOS
sudo postgresql-setup initdb
sudo systemctl start postgresql
sudo systemctl enable postgresql
sudo -u postgres createuser --interactive
sudo -u postgres createdb stock_control
```

### 2. Deploy da Aplicação

```bash
# Crie diretório da aplicação
sudo mkdir -p /var/www/stock-control
sudo chown $USER:$USER /var/www/stock-control

# Clone o repositório
cd /var/www/stock-control
git clone https://github.com/seu-usuario/stock-control-backend.git .

# Configure ambiente virtual
python3 -m venv venv
source venv/bin/activate

# Instale dependências
pip install -r requirements.txt
pip install gunicorn psycopg2-binary

# Configure variáveis de ambiente
cp .env.example .env
nano .env  # Edite com suas configurações
```

### 3. Configuração do Gunicorn

Crie arquivo `gunicorn.conf.py`:

```python
# gunicorn.conf.py
bind = "127.0.0.1:8000"
workers = 3
worker_class = "sync"
worker_connections = 1000
timeout = 30
keepalive = 2
max_requests = 1000
max_requests_jitter = 100
preload_app = True
user = "www-data"
group = "www-data"
```

Crie arquivo `gunicorn.service`:

```ini
# /etc/systemd/system/stock-control.service
[Unit]
Description=Stock Control Backend
After=network.target

[Service]
Type=notify
User=www-data
Group=www-data
RuntimeDirectory=stock-control
WorkingDirectory=/var/www/stock-control
Environment=PATH=/var/www/stock-control/venv/bin
ExecStart=/var/www/stock-control/venv/bin/gunicorn --config gunicorn.conf.py stock_control_backend.wsgi:application
ExecReload=/bin/kill -s HUP $MAINPID
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

### 4. Configuração do Nginx

```nginx
# /etc/nginx/sites-available/stock-control
server {
    listen 80;
    server_name seu-dominio.com www.seu-dominio.com;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name seu-dominio.com www.seu-dominio.com;

    # SSL Configuration
    ssl_certificate /path/to/your/certificate.crt;
    ssl_certificate_key /path/to/your/private.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    ssl_prefer_server_ciphers off;

    # Security Headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Static files
    location /static/ {
        alias /var/www/stock-control/staticfiles/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Media files
    location /media/ {
        alias /var/www/stock-control/media/;
        expires 1y;
        add_header Cache-Control "public";
    }

    # API
    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_redirect off;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Health check
    location /health/ {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
```

### 5. Scripts de Deploy

Crie script `deploy.sh`:

```bash
#!/bin/bash
# deploy.sh

set -e

echo "🚀 Iniciando deploy do Stock Control Backend..."

# Backup do banco
echo "📦 Fazendo backup do banco..."
pg_dump stock_control > backup_$(date +%Y%m%d_%H%M%S).sql

# Pull das mudanças
echo "📥 Atualizando código..."
git pull origin main

# Ativar ambiente virtual
source venv/bin/activate

# Instalar dependências
echo "📦 Instalando dependências..."
pip install -r requirements.txt

# Executar migrações
echo "🗄️ Executando migrações..."
python manage.py migrate

# Coletar arquivos estáticos
echo "📁 Coletando arquivos estáticos..."
python manage.py collectstatic --noinput

# Testes
echo "🧪 Executando testes..."
python manage.py test

# Recarregar serviços
echo "🔄 Recarregando serviços..."
sudo systemctl reload nginx
sudo systemctl restart stock-control

# Verificar status
echo "✅ Verificando status..."
sudo systemctl status stock-control --no-pager

echo "🎉 Deploy concluído com sucesso!"
```

### 6. Configuração de Logs

```bash
# Criar diretório de logs
sudo mkdir -p /var/log/stock-control
sudo chown www-data:www-data /var/log/stock-control

# Configurar logrotate
sudo nano /etc/logrotate.d/stock-control
```

```bash
# /etc/logrotate.d/stock-control
/var/log/stock-control/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 www-data www-data
    postrotate
        systemctl reload stock-control
    endscript
}
```

## Deploy com Docker

### 1. Dockerfile

```dockerfile
# Dockerfile
FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Set work directory
WORKDIR /app

# Install system dependencies
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        postgresql-client \
        build-essential \
        libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy project
COPY . .

# Collect static files
RUN python manage.py collectstatic --noinput

# Create non-root user
RUN adduser --disabled-password --gecos '' appuser
RUN chown -R appuser:appuser /app
USER appuser

# Expose port
EXPOSE 8000

# Run gunicorn
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "stock_control_backend.wsgi:application"]
```

### 2. Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  db:
    image: postgres:13
    volumes:
      - postgres_data:/var/lib/postgresql/data/
    environment:
      POSTGRES_DB: stock_control
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"

  web:
    build: .
    command: gunicorn stock_control_backend.wsgi:application --bind 0.0.0.0:8000
    volumes:
      - .:/app
      - static_volume:/app/staticfiles
      - media_volume:/app/media
    ports:
      - "8000:8000"
    environment:
      - DEBUG=False
      - DATABASE_URL=postgresql://postgres:postgres@db:5432/stock_control
    depends_on:
      - db

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - static_volume:/app/staticfiles
      - media_volume:/app/media
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - web

volumes:
  postgres_data:
  static_volume:
  media_volume:
```

### 3. Deploy com Docker

```bash
# Build e deploy
docker-compose up -d --build

# Executar migrações
docker-compose exec web python manage.py migrate

# Criar superusuário
docker-compose exec web python manage.py createsuperuser

# Ver logs
docker-compose logs -f web
```

## Deploy na Nuvem

### 1. AWS EC2

```bash
# Conectar via SSH
ssh -i sua-chave.pem ubuntu@seu-ip

# Instalar Docker
sudo apt update
sudo apt install docker.io docker-compose
sudo usermod -aG docker ubuntu

# Clone e deploy
git clone https://github.com/seu-usuario/stock-control-backend.git
cd stock-control-backend
docker-compose up -d
```

### 2. Heroku

```bash
# Instalar Heroku CLI
# https://devcenter.heroku.com/articles/heroku-cli

# Login
heroku login

# Criar app
heroku create stock-control-backend

# Configurar variáveis
heroku config:set SECRET_KEY=sua-chave-secreta
heroku config:set DEBUG=False
heroku config:set DATABASE_URL=postgresql://...

# Deploy
git push heroku main

# Executar migrações
heroku run python manage.py migrate
```

### 3. DigitalOcean App Platform

```yaml
# .do/app.yaml
name: stock-control-backend
services:
- name: web
  source_dir: /
  github:
    repo: seu-usuario/stock-control-backend
    branch: main
  run_command: gunicorn stock_control_backend.wsgi:application --bind 0.0.0.0:8080
  environment_slug: python
  instance_count: 1
  instance_size_slug: basic-xxs
  envs:
  - key: DEBUG
    value: "False"
  - key: SECRET_KEY
    value: sua-chave-secreta
  - key: DATABASE_URL
    value: postgresql://...
databases:
- name: stock-control-db
  engine: PG
  version: "13"
```

## Monitoramento e Manutenção

### 1. Health Checks

```python
# health_check.py
from django.http import JsonResponse
from django.db import connection
from django.core.cache import cache

def health_check(request):
    """Endpoint de health check."""
    status = {
        'status': 'healthy',
        'database': 'ok',
        'cache': 'ok',
        'timestamp': timezone.now().isoformat()
    }
    
    # Verificar banco
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
    except Exception:
        status['database'] = 'error'
        status['status'] = 'unhealthy'
    
    # Verificar cache
    try:
        cache.set('health_check', 'ok', 10)
        if cache.get('health_check') != 'ok':
            status['cache'] = 'error'
    except Exception:
        status['cache'] = 'error'
    
    return JsonResponse(status)
```

### 2. Backup Automático

```bash
#!/bin/bash
# backup.sh

# Configurações
DB_NAME="stock_control"
BACKUP_DIR="/var/backups/stock-control"
DATE=$(date +%Y%m%d_%H%M%S)

# Criar diretório se não existir
mkdir -p $BACKUP_DIR

# Backup do banco
pg_dump $DB_NAME | gzip > $BACKUP_DIR/backup_$DATE.sql.gz

# Backup dos arquivos de mídia
tar -czf $BACKUP_DIR/media_$DATE.tar.gz /var/www/stock-control/media/

# Manter apenas os últimos 30 backups
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +30 -delete
find $BACKUP_DIR -name "media_*.tar.gz" -mtime +30 -delete

echo "Backup concluído: $DATE"
```

### 3. Cron Jobs

```bash
# Adicionar ao crontab
crontab -e

# Backup diário às 2h
0 2 * * * /var/www/stock-control/scripts/backup.sh

# Limpeza de logs semanal
0 3 * * 0 find /var/log/stock-control -name "*.log.*" -mtime +7 -delete
```

## Troubleshooting

### Problemas Comuns

1. **Erro de permissão**
   ```bash
   sudo chown -R www-data:www-data /var/www/stock-control
   sudo chmod -R 755 /var/www/stock-control
   ```

2. **Banco não conecta**
   ```bash
   # Verificar status do PostgreSQL
   sudo systemctl status postgresql
   
   # Verificar configuração
   sudo nano /etc/postgresql/*/main/postgresql.conf
   ```

3. **Gunicorn não inicia**
   ```bash
   # Verificar logs
   sudo journalctl -u stock-control -f
   
   # Testar configuração
   gunicorn --check-config stock_control_backend.wsgi:application
   ```

4. **Nginx 502 Bad Gateway**
   ```bash
   # Verificar se Gunicorn está rodando
   sudo netstat -tlnp | grep 8000
   
   # Verificar logs do Nginx
   sudo tail -f /var/log/nginx/error.log
   ```

### Comandos Úteis

```bash
# Verificar status dos serviços
sudo systemctl status stock-control nginx postgresql

# Ver logs em tempo real
sudo journalctl -u stock-control -f
sudo tail -f /var/log/nginx/access.log

# Testar configuração do Nginx
sudo nginx -t

# Recarregar configurações
sudo systemctl reload nginx
sudo systemctl restart stock-control

# Verificar uso de recursos
htop
df -h
free -h
```

## Conclusão

Este guia fornece uma base sólida para fazer deploy do Stock Control Backend em diferentes ambientes. Adapte as configurações conforme suas necessidades específicas e sempre teste em ambiente de staging antes de fazer deploy em produção.

