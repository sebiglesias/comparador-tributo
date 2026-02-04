# 🧮 Comparador de Regímenes Tributarios Argentina 2026

Aplicación web PWA (Progressive Web App) para comparar exhaustivamente el costo real entre trabajar en **Relación de Dependencia**, **Monotributo** y **Responsable Inscripto** en Argentina, con normativa actualizada vigente para el primer semestre 2026.

## 🎯 Características

### Cálculos Completos
- **Monotributo**: Categorías A-K con cuotas actualizadas (Febrero 2026 - aumento 14.3%)
- **Relación de Dependencia**: Aportes personales (17%), Ganancias con escala progresiva actualizada (Enero-Junio 2026)
- **Responsable Inscripto**: Autónomos (Enero 2026), IVA, Ganancias, Ingresos Brutos, Impuesto al Cheque

### Funcionalidades
✅ Comparación lado a lado de los tres regímenes  
✅ Cálculo de ingreso neto real para cada caso  
✅ Deducciones personales y gastos deducibles  
✅ Visualización con gráficos (barras y tortas)  
✅ Indicador del régimen más conveniente  
✅ Alertas automáticas (límites, obligaciones, etc.)  
✅ Diseño responsive (móvil, tablet, desktop)  
✅ Modo oscuro  
✅ PWA instalable (funciona offline)  
✅ Guarda última simulación (localStorage)  

## 🚀 Tecnologías

- **HTML5** - Estructura semántica
- **CSS3** - Diseño moderno y responsive (mobile-first)
- **JavaScript Vanilla** - Sin dependencias externas
- **PWA** - Manifest + Service Worker para funcionalidad offline
- **Canvas API** - Gráficos nativos sin librerías

## 📊 Normativa Implementada

### Monotributo (Vigente desde Febrero 2026)
- Ley 27.743 (actualización monotributo)
- Categorías A-K actualizadas con aumento del 14.3% (inflación julio-diciembre 2025)
- Límites de facturación para servicios y venta de bienes:
  - **Categoría A servicios**: hasta $10.278.540/año → Cuota: $42.389/mes
  - **Categoría K servicios**: hasta $108.362.895/año → Cuota: $1.171.212,59/mes

### Relación de Dependencia (Vigente Enero-Junio 2026)
- Ley 24.241 (Sistema SIPA)
- Aportes personales: Jubilación 11%, PAMI 3%, Obra Social 3%
- Contribuciones patronales: ~23% total
- Impuesto a las Ganancias con escala progresiva Art. 94 actualizada
- **Deducciones personales anuales (Enero-Junio 2026):**
  - Ganancia no imponible: $5.036.140,63
  - Por cónyuge: $4.743.034,38
  - Por hijo: $2.391.929,54
  - Deducción especial trabajadores: $17.626.492,21
- **Mínimos no imponibles mensuales:**
  - Soltero/a: $3.000.046 bruto / $2.488.922 neto
  - Casado/a con 2 hijos: $3.952.152 bruto / $3.300.726 neto

### Responsable Inscripto (Vigente Enero 2026)
- Ley 20.628 (Ganancias)
- Ley 23.349 (IVA)
- **Autónomos categorías actualizadas (Enero 2026):**
  - Categoría I: $62.743,08/mes
  - Categoría II: $85.048/mes
  - Categoría III: $121.426/mes
  - Categoría IV: $194.281/mes
  - Categoría V: $267.137/mes
- Ingresos Brutos provincial (alícuotas estimadas)
- Impuesto al cheque (0.6% débito + 0.6% crédito)

## 🏗️ Estructura del Proyecto

```
comparador-tributo/
├── index.html           # Estructura HTML principal
├── styles.css           # Estilos y diseño responsive
├── calculator.js        # Lógica de cálculos tributarios
├── charts.js           # Visualizaciones (gráficos)
├── app.js              # Lógica de aplicación e interacciones
├── manifest.json       # Manifiesto PWA
├── sw.js              # Service Worker para offline
├── icons/             # Iconos PWA
│   ├── icon-*.png
│   └── favicon.png
└── README.md          # Este archivo
```

## 💻 Uso

### Instalación Local

1. Clonar el repositorio:
```bash
git clone https://github.com/sebiglesias/comparador-tributo.git
cd comparador-tributo
```

2. Servir los archivos con cualquier servidor HTTP:
```bash
# Con Python 3
python -m http.server 8000

# Con Node.js (http-server)
npx http-server

# Con PHP
php -S localhost:8000
```

3. Abrir en el navegador:
```
http://localhost:8000
```

### Ejecutar Tests

El proyecto incluye una suite completa de tests para validar todas las fórmulas y operaciones matemáticas:

```bash
# Instalar dependencias de desarrollo
npm install

# Ejecutar tests
npm test

# Ejecutar tests con coverage
npm run test:coverage

# Modo watch (re-ejecuta al guardar cambios)
npm run test:watch
```

**Cobertura de Tests:**
- ✅ 67 tests validando todas las fórmulas tributarias
- ✅ 95.53% de cobertura de código
- ✅ Tests para Monotributo, Ganancias, Relación de Dependencia y Responsable Inscripto
- ✅ Validación de cálculos de aportes, deducciones y tasas efectivas

### Uso de la Calculadora

1. **Ingresar datos básicos:**
   - Ingreso mensual bruto deseado
   - Tipo de actividad (servicios/bienes/mixta)
   - Situación familiar

2. **Opcional - Gastos deducibles:**
   - Alquiler de vivienda
   - Medicina prepaga
   - Servicio doméstico
   - Gastos educativos

3. **Opcional - Gastos del negocio:**
   - Compras con IVA
   - Otros gastos operativos

4. **Hacer clic en "Calcular y Comparar"**

5. **Ver resultados:**
   - Comparación en tabla
   - Gráficos visuales
   - Detalles por régimen
   - Recomendación personalizada

## 🚀 Deployment en Cloudflare Pages

Esta aplicación está lista para ser desplegada en Cloudflare Pages:

### Deploy Rápido (Opción 1 - Recomendado)

1. Ve a [Cloudflare Dashboard](https://dash.cloudflare.com/) → Workers & Pages → Create application
2. Conecta tu repositorio de GitHub
3. Configuración:
   - Framework preset: **None**
   - Build command: *(dejar vacío)*
   - Build output directory: **/**
4. Click "Save and Deploy"

Tu sitio estará disponible en: `https://comparador-tributo.pages.dev`

### Deploy con Wrangler CLI (Opción 2)

```bash
# Instalar Wrangler
npm install -g wrangler

# Login a Cloudflare
wrangler login

# Deploy
wrangler pages deploy . --project-name=comparador-tributo
```

**📖 Guía completa:** Ver [CLOUDFLARE_DEPLOYMENT.md](./CLOUDFLARE_DEPLOYMENT.md) para instrucciones detalladas, configuración de dominios custom, analytics, y más.

### Características del Deploy

✅ **CDN Global** - Cloudflare CDN en 200+ ubicaciones  
✅ **SSL Automático** - HTTPS con certificado gratuito  
✅ **Preview Deployments** - Para cada Pull Request  
✅ **Zero Config** - Archivos `_headers` y `_redirects` incluidos  
✅ **100% Gratis** - Bandwidth y requests ilimitados  

## 📱 PWA - Progressive Web App

La aplicación es instalable como PWA:

- **En móvil**: Abrir en navegador → Menú → "Agregar a pantalla de inicio"
- **En desktop**: Abrir en Chrome → Ícono de instalación en la barra de direcciones
- **Funciona offline**: Una vez visitada, funciona sin conexión

## ⚠️ Disclaimer

Esta calculadora es **orientativa**. Los valores pueden cambiar según actualizaciones de ARCA/AFIP. Consultá con un contador matriculado para asesoramiento personalizado.

**Última actualización de valores**: Enero-Febrero 2026
- Monotributo: Febrero 2026 (aumento 14.3%)
- Ganancias/Deducciones: Enero-Junio 2026 (aumento 13.5%-14.3%)
- Autónomos: Enero 2026 (aumento 2.47%)

## 🔗 Referencias Oficiales

- [ARCA - Categorías Monotributo](https://www.afip.gob.ar/monotributo/categorias.asp)
- [ARCA - Autónomos](https://www.arca.gob.ar/autonomos/categorias-y-aportes/)
- [Deducciones Ganancias](https://www.arca.gob.ar/gananciasYBienes/ganancias/personas-humanas-sucesiones-indivisas/deducciones/deducciones-personales.asp)
- [Ley 27.743 Monotributo](https://www.argentina.gob.ar/normativa/nacional/ley-27743)
- [Ley 20.628 Ganancias](https://www.argentina.gob.ar/normativa/nacional/ley-20628-281)

## 📄 Licencia

MIT License - Libre uso y modificación

## 👨‍💻 Autor

Desarrollado para ayudar a profesionales y emprendedores argentinos a tomar decisiones informadas sobre su situación tributaria.

---

**¿Encontraste un error o querés sugerir una mejora?** Abrí un issue o enviá un pull request.