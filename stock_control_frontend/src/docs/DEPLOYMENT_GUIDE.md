# Guia de Deploy - Stock Control Frontend

Este documento descreve como fazer o deploy do frontend Stock Control em diferentes ambientes e plataformas.

## 🎯 Visão Geral

O frontend Stock Control é uma Single Page Application (SPA) construída com Vue 3 e Vite, que pode ser deployada em qualquer servidor web estático ou plataforma de hospedagem.

### Arquivos de Produção

Após o build, os seguintes arquivos são gerados na pasta `dist/`:

```
dist/
├── index.html          # Página principal
├── assets/
│   ├── index-[hash].js # JavaScript bundle
│   ├── index-[hash].css # CSS bundle
│   └── [hash].png      # Imagens otimizadas
└── favicon.ico         # Favicon
```

## 🛠️ Build de Produção

### Comandos de Build

```bash
# Build completo com verificação de tipos
npm run build

# Build apenas (sem verificação de tipos)
npm run build-only

# Preview do build local
npm run preview
```

### Configurações de Build

#### Vite Configuration (`vite.config.ts`)

```typescript
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    }
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['vue', 'vue-router', 'pinia'],
          utils: ['axios', 'date-fns']
        }
      }
    }
  },
  server: {
    port: 5173,
    host: true
  }
});
```

#### Variáveis de Ambiente

Crie um arquivo `.env.production` para configurações de produção:

```bash
# .env.production
VITE_API_BASE_URL=https://api.stockcontrol.com/api/
VITE_APP_TITLE=Stock Control
VITE_APP_VERSION=1.0.0
VITE_APP_ENVIRONMENT=production
```

## 🌐 Deploy em Servidor Web

### Nginx

#### Configuração Básica

```nginx
server {
    listen 80;
    server_name stockcontrol.com www.stockcontrol.com;
    root /var/www/stockcontrol/dist;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Handle Vue Router history mode
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
}
```

#### Configuração com HTTPS

```nginx
server {
    listen 443 ssl http2;
    server_name stockcontrol.com www.stockcontrol.com;
    root /var/www/stockcontrol/dist;
    index index.html;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/stockcontrol.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/stockcontrol.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    # HSTS
    add_header Strict-Transport-Security "max-age=63072000" always;

    # Rest of configuration same as above
}
```

### Apache

#### Configuração Básica

```apache
<VirtualHost *:80>
    ServerName stockcontrol.com
    DocumentRoot /var/www/stockcontrol/dist
    
    # Enable compression
    LoadModule deflate_module modules/mod_deflate.so
    <Location />
        SetOutputFilter DEFLATE
        SetEnvIfNoCase Request_URI \
            \.(?:gif|jpe?g|png)$ no-gzip dont-vary
        SetEnvIfNoCase Request_URI \
            \.(?:exe|t?gz|zip|bz2|sit|rar)$ no-gzip dont-vary
    </Location>
    
    # Cache static assets
    <LocationMatch "\.(css|js|png|jpg|jpeg|gif|ico|svg)$">
        ExpiresActive On
        ExpiresDefault "access plus 1 year"
        Header append Cache-Control "public"
    </LocationMatch>
    
    # Handle Vue Router history mode
    <Directory /var/www/stockcontrol/dist>
        RewriteEngine On
        RewriteBase /
        RewriteRule ^index\.html$ - [L]
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule . /index.html [L]
    </Directory>
</VirtualHost>
```

## ☁️ Deploy em Plataformas Cloud

### Vercel

#### Configuração (`vercel.json`)

```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
  "env": {
    "VITE_API_BASE_URL": "https://api.stockcontrol.com/api/"
  }
}
```

#### Deploy

```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Netlify

#### Configuração (`netlify.toml`)

```toml
[build]
  publish = "dist"
  command = "npm run build"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/*.js"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/*.css"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

#### Deploy

```bash
# Instalar Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy --prod --dir=dist
```

### AWS S3 + CloudFront

#### Script de Deploy (`scripts/deploy-aws.sh`)

```bash
#!/bin/bash

# Build the project
npm run build

# Upload to S3
aws s3 sync dist/ s3://stockcontrol-frontend --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id E1234567890 --paths "/*"

echo "Deploy completed!"
```

#### Configuração CloudFront

```json
{
  "Origins": [
    {
      "DomainName": "stockcontrol-frontend.s3.amazonaws.com",
      "Id": "S3-stockcontrol-frontend",
      "S3OriginConfig": {
        "OriginAccessIdentity": ""
      }
    }
  ],
  "DefaultCacheBehavior": {
    "TargetOriginId": "S3-stockcontrol-frontend",
    "ViewerProtocolPolicy": "redirect-to-https",
    "Compress": true,
    "CachePolicyId": "4135ea2d-6df8-44a3-9df3-4b5a84be39ad"
  },
  "CustomErrorResponses": [
    {
      "ErrorCode": 404,
      "ResponsePagePath": "/index.html",
      "ResponseCode": "200",
      "ErrorCachingMinTTL": 0
    }
  ]
}
```

### Docker

#### Dockerfile

```dockerfile
# Multi-stage build
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built files
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

#### nginx.conf

```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Handle Vue Router history mode
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

#### Docker Compose

```yaml
version: '3.8'

services:
  frontend:
    build: .
    ports:
      - "80:80"
    environment:
      - VITE_API_BASE_URL=http://backend:8000/api/
    depends_on:
      - backend

  backend:
    image: stockcontrol/backend:latest
    ports:
      - "8000:8000"
    environment:
      - DEBUG=False
      - ALLOWED_HOSTS=localhost,backend
```

#### Deploy com Docker

```bash
# Build da imagem
docker build -t stockcontrol/frontend:latest .

# Executar container
docker run -p 80:80 stockcontrol/frontend:latest

# Ou com docker-compose
docker-compose up -d
```

## 🔧 Configurações de Ambiente

### Variáveis de Ambiente

#### Desenvolvimento (`.env.local`)

```bash
VITE_API_BASE_URL=http://localhost:8000/api/
VITE_APP_TITLE=Stock Control (Dev)
VITE_APP_ENVIRONMENT=development
VITE_DEBUG=true
```

#### Produção (`.env.production`)

```bash
VITE_API_BASE_URL=https://api.stockcontrol.com/api/
VITE_APP_TITLE=Stock Control
VITE_APP_ENVIRONMENT=production
VITE_DEBUG=false
```

### Configuração Dinâmica

Para configurações que precisam ser alteradas sem rebuild:

```typescript
// src/config/runtime.ts
interface RuntimeConfig {
  apiBaseUrl: string;
  appTitle: string;
  version: string;
}

export async function loadRuntimeConfig(): Promise<RuntimeConfig> {
  try {
    const response = await fetch('/config.json');
    return await response.json();
  } catch {
    // Fallback para variáveis de ambiente
    return {
      apiBaseUrl: import.meta.env.VITE_API_BASE_URL,
      appTitle: import.meta.env.VITE_APP_TITLE,
      version: import.meta.env.VITE_APP_VERSION
    };
  }
}
```

#### Arquivo de Configuração (`public/config.json`)

```json
{
  "apiBaseUrl": "https://api.stockcontrol.com/api/",
  "appTitle": "Stock Control",
  "version": "1.0.0"
}
```

## 📊 Monitoramento e Analytics

### Google Analytics

```typescript
// src/utils/analytics.ts
export function initAnalytics() {
  if (import.meta.env.PROD) {
    // Google Analytics
    gtag('config', 'GA_MEASUREMENT_ID', {
      page_title: document.title,
      page_location: window.location.href
    });
  }
}

export function trackEvent(action: string, category: string, label?: string) {
  if (import.meta.env.PROD) {
    gtag('event', action, {
      event_category: category,
      event_label: label
    });
  }
}
```

### Error Tracking

```typescript
// src/utils/errorTracking.ts
export function initErrorTracking() {
  window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
    // Enviar para serviço de monitoramento
  });

  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    // Enviar para serviço de monitoramento
  });
}
```

## 🔒 Segurança

### Content Security Policy

```html
<!-- index.html -->
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'unsafe-inline' https://www.googletagmanager.com;
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  connect-src 'self' https://api.stockcontrol.com;
  font-src 'self';
">
```

### Headers de Segurança

```nginx
# Nginx
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';" always;
```

## 🚀 CI/CD Pipeline

### GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run tests
      run: npm run test:unit
    
    - name: Build
      run: npm run build
      env:
        VITE_API_BASE_URL: ${{ secrets.API_BASE_URL }}
    
    - name: Deploy to S3
      run: |
        aws s3 sync dist/ s3://${{ secrets.S3_BUCKET }} --delete
        aws cloudfront create-invalidation --distribution-id ${{ secrets.CLOUDFRONT_DISTRIBUTION_ID }} --paths "/*"
      env:
        AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
        AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
```

### GitLab CI

```yaml
# .gitlab-ci.yml
stages:
  - test
  - build
  - deploy

test:
  stage: test
  image: node:18
  script:
    - npm ci
    - npm run test:unit
    - npm run lint

build:
  stage: build
  image: node:18
  script:
    - npm ci
    - npm run build
  artifacts:
    paths:
      - dist/
    expire_in: 1 hour

deploy:
  stage: deploy
  image: alpine:latest
  script:
    - apk add --no-cache aws-cli
    - aws s3 sync dist/ s3://$S3_BUCKET --delete
    - aws cloudfront create-invalidation --distribution-id $CLOUDFRONT_DISTRIBUTION_ID --paths "/*"
  only:
    - main
```

## 📈 Performance

### Bundle Analysis

```bash
# Instalar analyzer
npm install --save-dev rollup-plugin-visualizer

# Adicionar ao vite.config.ts
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    vue(),
    visualizer({
      filename: 'dist/stats.html',
      open: true
    })
  ]
});
```

### Lighthouse CI

```yaml
# .github/workflows/lighthouse.yml
name: Lighthouse CI

on:
  push:
    branches: [main]

jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    
    - name: Build
      run: npm ci && npm run build
    
    - name: Run Lighthouse CI
      run: |
        npm install -g @lhci/cli@0.12.x
        lhci autorun
      env:
        LHCI_GITHUB_APP_TOKEN: ${{ secrets.LHCI_GITHUB_APP_TOKEN }}
```

## 🆘 Troubleshooting

### Problemas Comuns

#### 1. Erro 404 em rotas do Vue Router

**Problema**: Páginas retornam 404 ao acessar diretamente.

**Solução**: Configurar fallback para `index.html` no servidor web.

#### 2. Assets não carregam

**Problema**: CSS/JS não carregam após deploy.

**Solução**: Verificar configuração de base URL no Vite.

```typescript
// vite.config.ts
export default defineConfig({
  base: '/stock-control/', // Se deployado em subdiretório
  // ...
});
```

#### 3. CORS Errors

**Problema**: Erros de CORS com a API.

**Solução**: Configurar CORS no backend ou usar proxy no desenvolvimento.

```typescript
// vite.config.ts
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true
      }
    }
  }
});
```

### Logs e Debug

```typescript
// src/utils/logger.ts
export const logger = {
  info: (message: string, ...args: any[]) => {
    if (import.meta.env.DEV) {
      console.log(`[INFO] ${message}`, ...args);
    }
  },
  error: (message: string, ...args: any[]) => {
    console.error(`[ERROR] ${message}`, ...args);
  }
};
```

---

**Última atualização**: Dezembro 2024  
**Versão**: 1.0.0  
**Mantenedor**: Equipe de Desenvolvimento Stock Control
