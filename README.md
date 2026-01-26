# 🧮 Comparador de Regímenes Tributarios Argentina 2025-2026

Aplicación web PWA (Progressive Web App) para comparar exhaustivamente el costo real entre trabajar en **Relación de Dependencia**, **Monotributo** y **Responsable Inscripto** en Argentina, con normativa actualizada vigente 2025-2026.

## 🎯 Características

### Cálculos Completos
- **Monotributo**: Categorías A-K con cuotas actualizadas (Agosto 2025)
- **Relación de Dependencia**: Aportes personales (17%), Ganancias con escala progresiva, contribuciones patronales
- **Responsable Inscripto**: Autónomos, IVA, Ganancias, Ingresos Brutos, Impuesto al Cheque

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

### Monotributo
- Ley 27.743 (actualización monotributo)
- Categorías A-K vigentes desde Agosto 2025
- Límites de facturación para servicios y venta de bienes

### Relación de Dependencia
- Ley 24.241 (Sistema SIPA)
- Aportes personales: Jubilación 11%, PAMI 3%, Obra Social 3%
- Contribuciones patronales: ~23% total
- Impuesto a las Ganancias con escala progresiva Art. 94
- Deducciones personales (segundo semestre 2025)

### Responsable Inscripto
- Ley 20.628 (Ganancias)
- Ley 23.349 (IVA)
- Autónomos categorías I-V (Enero 2026)
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

**Última actualización de valores**: Enero 2026

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