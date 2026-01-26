# Guía de Deployment en Cloudflare Pages

Esta aplicación está lista para ser desplegada en Cloudflare Pages sin necesidad de configuración adicional.

## 🚀 Deployment Automático vía Git

### Opción 1: Desde GitHub (Recomendado)

1. **Conectar Repositorio:**
   - Ve a [Cloudflare Dashboard](https://dash.cloudflare.com/)
   - Navega a "Workers & Pages" → "Create application" → "Pages"
   - Conecta tu cuenta de GitHub
   - Selecciona el repositorio `comparador-tributo`

2. **Configuración de Build:**
   ```
   Framework preset: None (Static site)
   Build command: (dejar vacío)
   Build output directory: / (raíz del proyecto)
   Root directory: /
   ```

3. **Variables de Entorno:**
   - No se requieren variables de entorno para este proyecto

4. **Deploy:**
   - Haz clic en "Save and Deploy"
   - Cloudflare automáticamente desplegará tu sitio
   - Recibirás una URL como: `https://comparador-tributo.pages.dev`

### Opción 2: Deploy Manual con Wrangler CLI

```bash
# Instalar Wrangler CLI globalmente
npm install -g wrangler

# Autenticarse con Cloudflare
wrangler login

# Deploy directo desde la línea de comandos
wrangler pages deploy . --project-name=comparador-tributo
```

## 📁 Archivos de Configuración Incluidos

### `_headers`
Define headers HTTP para seguridad y performance:
- Headers de seguridad (X-Frame-Options, CSP, etc.)
- Cache-Control optimizado por tipo de archivo
- Service Worker y PWA manifest configurados

### `_redirects`
Maneja el routing para la SPA:
- Redirecciona todas las rutas a `index.html`
- Soporta navegación client-side

### `wrangler.toml`
Configuración opcional de Cloudflare Workers/Pages:
- Metadata del proyecto
- Configuración de compatibilidad

## 🔧 Configuración Post-Deploy

### Custom Domain
1. En Cloudflare Dashboard → Pages → tu proyecto
2. Ve a "Custom domains"
3. Agrega tu dominio (ej: `comparador.tudominio.com`)
4. Cloudflare configurará automáticamente el DNS y SSL

### Build Hooks
Para deployments automáticos:
1. Settings → Builds & deployments → Build hooks
2. Crea un webhook para triggers automáticos
3. Úsalo en GitHub Actions o desde tu CI/CD

### Preview Deployments
Cloudflare Pages automáticamente crea preview deployments para:
- Cada Pull Request
- Cada commit en branches (excepto main/production)
- URL formato: `https://[hash].comparador-tributo.pages.dev`

## 🌍 Variables de Entorno por Ambiente

Si necesitas diferentes configuraciones por ambiente:

```toml
# wrangler.toml
[env.production]
name = "comparador-tributo"

[env.staging]
name = "comparador-tributo-staging"
```

## 📊 Analytics y Monitoring

Cloudflare Pages incluye gratis:
- **Web Analytics**: Métricas de tráfico sin cookies
- **Real-time logs**: Logs de requests en tiempo real
- **Performance insights**: Core Web Vitals

Actívalos en: Settings → Analytics

## 🔒 Seguridad

Headers de seguridad ya configurados en `_headers`:
- ✅ HTTPS automático con certificado SSL
- ✅ X-Frame-Options: SAMEORIGIN
- ✅ X-Content-Type-Options: nosniff
- ✅ Referrer-Policy
- ✅ Permissions-Policy

## ⚡ Performance

Optimizaciones incluidas:
- ✅ CDN global de Cloudflare (200+ ubicaciones)
- ✅ HTTP/2 y HTTP/3
- ✅ Brotli compression
- ✅ Smart caching por tipo de archivo
- ✅ Service Worker para offline

## 🔄 Rollback

Si necesitas volver a una versión anterior:
1. Dashboard → Pages → tu proyecto → Deployments
2. Encuentra el deployment anterior
3. Click en "..." → "Rollback to this deployment"

## 📱 PWA en Cloudflare Pages

La PWA funciona perfectamente en Cloudflare Pages:
- ✅ Service Worker (`sw.js`) se sirve correctamente
- ✅ Manifest (`manifest.json`) con headers apropiados
- ✅ Cacheo offline funcional
- ✅ Installable en dispositivos móviles

## 🆘 Troubleshooting

### Service Worker no se registra
- Verifica que estés usando HTTPS (automático en Cloudflare)
- Revisa los headers en `_headers`

### Archivos no se actualizan
- Limpia cache: Settings → Caching → Purge cache
- Verifica Cache-Control headers en `_headers`

### 404 en refresh
- Ya está manejado en `_redirects`
- Todas las rutas redirigen a `index.html`

## 📚 Recursos Adicionales

- [Cloudflare Pages Docs](https://developers.cloudflare.com/pages/)
- [Deploy Guide](https://developers.cloudflare.com/pages/get-started/)
- [Custom Domains](https://developers.cloudflare.com/pages/platform/custom-domains/)
- [Headers Configuration](https://developers.cloudflare.com/pages/platform/headers/)

## 💰 Costo

Cloudflare Pages es **GRATIS** para:
- ✅ Bandwidth ilimitado
- ✅ Requests ilimitados
- ✅ 500 builds/mes
- ✅ Sitios ilimitados
- ✅ Colaboradores ilimitados

No hay costos ocultos para este proyecto estático.
