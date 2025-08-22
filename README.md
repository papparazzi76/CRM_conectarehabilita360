# Plataforma CRM para Empresas Constructoras

Una plataforma completa de gestión de leads para empresas de construcción y rehabilitación energética, con sistema de créditos y métricas avanzadas.

## 🚀 Características Principales

### Para Empresas (Role: EMPRESA)
- **Tablón de Leads**: Visualización de oportunidades comerciales con filtros avanzados
- **Sistema de Créditos**: Compra de leads mediante consumo de créditos del wallet
- **Pipeline Comercial**: Seguimiento del estado de cada lead desde solicitud hasta contratación
- **Dashboard Analítico**: Métricas de ROI, CPL, tasas de conversión y gráficas
- **Wallet de Créditos**: Gestión de saldo, histórico de transacciones y exportación

### Para Administradores (Role: ADMIN)
- **Gestión de Usuarios**: CRUD completo de empresas registradas
- **Gestión de Leads**: Creación y administración de oportunidades
- **Sistema de Precios**: Configuración de tarifas por rangos de proyecto
- **Auditoría**: Logs completos de todas las acciones del sistema
- **Dashboard Global**: Métricas del sistema y estadísticas generales

## 🏗️ Arquitectura Técnica

### Frontend
- **React 18** con TypeScript
- **Tailwind CSS** para estilos
- **Recharts** para visualizaciones
- **React Router** para navegación
- **React Hook Form** para formularios
- **React Hot Toast** para notificaciones

### Backend & Base de Datos
- **Supabase** como Backend-as-a-Service
- **PostgreSQL** con Row Level Security (RLS)
- **Funciones SQL** para lógica de negocio compleja
- **Migraciones** versionadas para esquema de BD

### Autenticación & Seguridad
- **Supabase Auth** con JWT
- **Row Level Security** para aislamiento de datos
- **Roles y permisos** (ADMIN/EMPRESA)
- **Auditoría** de todas las operaciones críticas

## 💰 Lógica de Créditos

### Cálculo de Coste Base (por valor del proyecto)
- **1 crédito**: Proyectos < 20.000 €
- **2 créditos**: 20.000 € - 30.000 €
- **3 créditos**: 30.000 € - 50.000 €
- **4 créditos**: 50.000 € - 100.000 €
- **5 créditos**: > 100.000 €

### Cálculo de Coste Adicional (por nivel de competencia)
- **+1 crédito**: Compartido con hasta 4 empresas más
- **+2 créditos**: Compartido con hasta 3 empresas más
- **+3 créditos**: Compartido con hasta 2 empresas más
- **+4 créditos**: Compartido con 1 empresa más
- **+10 créditos**: Exclusividad total

### Ejemplos de Cálculo
```
Lead 39.000 € + compartir con 2 empresas más = 3 (base) + 3 (adicional) = 6 créditos
Lead 120.000 € + exclusividad total = 5 (base) + 10 (adicional) = 15 créditos
```

## 📊 Métricas y KPIs

### Dashboard de Empresa
- **Saldo de créditos** y valor en euros
- **Leads solicitados/contactados/presupuestados/contratados**
- **Tasa de conversión** por etapa del pipeline
- **ROI (%)**: (Ingresos - Coste) / Coste × 100
- **CPL**: Coste por lead en créditos y euros
- **Ticket medio** de proyectos contratados
- **Gráficas**: ROI vs CPL en el tiempo

### Dashboard de Administrador
- Usuarios activos y registrados
- Leads disponibles vs agotados
- Créditos en circulación
- Ingresos por recargas
- Estadísticas de consumo

## 🛠️ Instalación y Configuración

### Prerrequisitos
- Node.js 18+
- npm o yarn
- Cuenta de Supabase

### Variables de Entorno
Crear archivo `.env` con:
```bash
VITE_SUPABASE_URL=tu_supabase_url
VITE_SUPABASE_ANON_KEY=tu_supabase_anon_key
```

### Instalación Local
```bash
# Clonar repositorio
git clone <repo-url>
cd crm-construccion

# Instalar dependencias
npm install

# Ejecutar migraciones de Supabase
# (usar la interfaz web de Supabase para aplicar archivos de /supabase/migrations/)

# Iniciar servidor de desarrollo
npm run dev
```

### Docker Compose (Opcional)
```bash
docker-compose up -d
```

## 🧪 Testing

### Ejecutar Tests
```bash
# Tests unitarios
npm test

# Tests con cobertura
npm run test:coverage

# Tests en modo watch
npm run test:watch
```

### Cobertura de Tests
Los tests cubren principalmente:
- ✅ Lógica de cálculo de créditos
- ✅ Validación de niveles de competencia
- ✅ Casos edge de pricing tiers
- ✅ Ejemplos específicos del negocio

## 📝 API Reference

### Endpoints Principales

#### Autenticación
```
POST /auth/login
POST /auth/refresh
GET /me
```

#### Leads
```
GET /api/leads?filters={...}
GET /api/leads/{id}
POST /api/leads/{id}/quote-cost
POST /api/leads/{id}/request
```

#### Wallet
```
GET /api/wallet/summary
GET /api/wallet/transactions
```

#### Pipeline
```
PATCH /api/lead-shares/{id}
```

### Funciones SQL Principales

#### `process_lead_request()`
Procesa la solicitud de un lead de forma atómica:
- Verifica saldo suficiente
- Descuenta créditos
- Crea registros de solicitud y pipeline
- Actualiza disponibilidad del lead

#### `get_user_dashboard_stats()`
Calcula todas las métricas del dashboard de empresa para un periodo dado.

#### `process_credit_recharge()`
Permite a administradores recargar créditos con auditoría completa.

## 👥 Usuarios Demo

La aplicación incluye usuarios de prueba:

### Administrador
- **Email**: admin@demo.com
- **Contraseña**: 123456
- **Acceso**: Panel completo de administración

### Empresas Demo
- **empresa1@demo.com** / 123456 (Construcciones García SL)
- **empresa2@demo.com** / 123456 (Reformas Martín SA)  
- **empresa3@demo.com** / 123456 (EcoConstruct Solutions)
- **Créditos iniciales**: 50 créditos cada una

## 🚀 Despliegue

### Producción con Supabase
1. Crear proyecto en Supabase
2. Aplicar migraciones desde `/supabase/migrations/`
3. Configurar variables de entorno
4. Build y deploy del frontend
5. Configurar dominio personalizado

### Variables de Producción
```bash
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu_clave_publica
```

## 📋 Roadmap

### Próximas Funcionalidades
- [ ] Panel de administración completo
- [ ] Gestión de paquetes de créditos
- [ ] Integración con pasarelas de pago
- [ ] Notificaciones push y email
- [ ] API REST completa documentada
- [ ] Exportación avanzada de reportes
- [ ] Sistema de notificaciones automáticas
- [ ] Integración con CRM externos
- [ ] App móvil (React Native)

### Mejoras Técnicas
- [ ] Cache con Redis
- [ ] CDN para assets estáticos  
- [ ] Monitoreo con Sentry
- [ ] CI/CD con GitHub Actions
- [ ] Tests E2E con Playwright
- [ ] Documentación OpenAPI

## 🤝 Contribución

1. Fork del proyecto
2. Crear rama feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## 📄 Licencia

Este proyecto está licenciado bajo MIT - ver [LICENSE.md](LICENSE.md)

## 📞 Soporte

Para soporte técnico o consultas comerciales:
- Email: soporte@crmconstruccion.com
- Documentación: [docs.crmconstruccion.com](https://docs.crmconstruccion.com)
- Issue Tracker: GitHub Issues

---

**Desarrollado con ❤️ para la industria de la construcción española**