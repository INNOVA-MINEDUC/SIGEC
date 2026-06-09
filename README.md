# SIGEC — Sistema de Gestión de Casos

Sistema web para el registro, seguimiento y análisis de casos de embarazo en niñas en edad escolar, desarrollado para el Ministerio de Educación de Guatemala (MINEDUC).

---

## Requisitos previos

| Herramienta | Versión mínima |
|-------------|---------------|
| Node.js     | 20.19.0 o 22+ |
| MySQL       | 8.0+          |
| npm         | 10+           |

---

## Variables de entorno

### Backend — `backend/.env`

Crea el archivo `backend/.env` con las siguientes variables:

```env
# Servidor
PORT=3000
CLIENT_URL=http://localhost:5173

# Base de datos MySQL
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=sigec
DB_USER=root
DB_PASSWORD=root

# Autenticación
JWT_SECRET=cambia_esto_por_un_secreto_seguro
```

> **En producción** cambia `CLIENT_URL` a la URL real del frontend, `JWT_SECRET` por una cadena larga y aleatoria, y las credenciales de base de datos a las del servidor real.

### Frontend — `frontend/src/helpers/api.js`

El frontend no usa un `.env` propio. La URL base de la API está centralizada en un solo archivo:

```
frontend/src/helpers/api.js
```

Para producción, cambia únicamente la propiedad `baseURL` en ese archivo:

```js
const api = axios.create({
  baseURL: 'https://tu-dominio.com/api/v1',   // <-- solo esta línea
  headers: { 'Content-Type': 'application/json' },
})
```

---

## Instalación

### 1. Backend

```bash
cd backend
npm install
```

### 2. Frontend

```bash
cd frontend
npm install
```

---

## Base de datos

### Crear la base de datos

```sql
CREATE DATABASE sigec;
```

### Aplicar migraciones y seeders

```bash
cd backend

# Ejecutar migraciones
npx sequelize-cli db:migrate

# Cargar datos iniciales (departamentos, municipios, roles, usuario admin)
npx sequelize-cli db:seed:all
```

### Resetear la base de datos (desarrollo)

```bash
npm run reset
# Equivale a: undo:all + migrate + seed:all
```

---

## Comandos disponibles

### Backend

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Inicia el servidor con recarga automática (nodemon) |
| `npm start` | Inicia el servidor en producción |
| `npm run reset` | Resetea y re-siembra la base de datos |

### Frontend

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Inicia el servidor de desarrollo en `http://localhost:5173` |
| `npm run build` | Genera el build de producción en `frontend/dist/` |
| `npm run preview` | Sirve el build de producción localmente para revisarlo |

---

## Levantar el proyecto en desarrollo

Ejecutar cada comando en su propia terminal:

```bash
# Terminal 1 — Backend
cd backend
npm run dev

# Terminal 2 — Frontend
cd frontend
npm run dev
```

Acceder en el navegador a: `http://localhost:5173`

---

## Build para producción

```bash
cd frontend
npm run build
```

El resultado queda en `frontend/dist/`. Sirve esa carpeta con cualquier servidor estático (Nginx, Apache, Vercel, Netlify, etc.).

El backend se despliega con:

```bash
cd backend
npm start
```

---

## Estructura del proyecto

```
projecto_niñas/
├── backend/
│   ├── config/
│   │   ├── config.json        # Configuración de Sequelize por entorno
│   │   └── database.js        # Conexión a MySQL vía Sequelize
│   ├── controllers/
│   │   ├── AuthController.js
│   │   ├── CasoController.js
│   │   ├── DeptController.js
│   │   ├── NiñaController.js
│   │   ├── QuejaController.js
│   │   ├── RoleController.js
│   │   ├── UploadController.js
│   │   └── UserController.js
│   ├── middleware/
│   │   ├── verifyToken.js     # Valida JWT en cada request
│   │   └── requireRole.js     # Control de acceso por rol
│   ├── migrations/            # Historial de cambios del esquema
│   ├── models/
│   │   ├── Relations.js       # Asociaciones entre modelos
│   │   ├── CasoEmbarazo.js
│   │   ├── CentroEducativo.js
│   │   ├── Departamental.js
│   │   ├── Departamento.js
│   │   ├── HistorialEducativo.js
│   │   ├── Municipio.js
│   │   ├── Nina.js
│   │   ├── Role.js
│   │   ├── User.js
│   │   └── ...
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── caso.routes.js
│   │   ├── dept.routes.js
│   │   ├── role.routes.js
│   │   ├── upload.routes.js
│   │   └── user.routes.js
│   ├── seeders/               # Datos iniciales
│   ├── app.js                 # Configuración Express + CORS + rutas
│   └── server.js              # Punto de entrada, conecta DB y levanta el servidor
│
└── frontend/
    └── src/
        ├── helpers/
        │   └── api.js         # Cliente HTTP centralizado (Axios + JWT interceptor)
        ├── stores/            # Estado global con Pinia
        │   ├── auth.js        # Sesión y token del usuario
        │   ├── casos.js       # Casos registrados y filtros
        │   ├── users.js       # Gestión de usuarios
        │   └── FiltroStore.js # Filtros compartidos entre vistas
        ├── views/
        │   ├── LoginView.vue
        │   ├── HomeView.vue
        │   ├── DashboardView.vue  # Panel con gráficas, mapas y filtros avanzados
        │   ├── Seguimiento.vue    # Tabla de búsqueda y seguimiento de casos
        │   ├── ComplainView.vue   # Registro y edición de quejas
        │   ├── ChargeData.vue     # Carga masiva de Excel (admin)
        │   ├── UsersView.vue      # Gestión de usuarios (admin)
        │   └── UnauthorizedView.vue
        ├── components/
        │   ├── AppNavbar.vue
        │   ├── AppFooter.vue
        │   ├── GuateMap.vue       # Mapa interactivo de Guatemala (AmCharts)
        │   ├── BarChart.vue
        │   ├── LineChart.vue
        │   ├── DonaChart.vue
        │   └── ...
        ├── composables/
        │   └── useExport.js       # Exportar a Excel y PDF
        ├── router.js              # Rutas Vue + guards de autenticación
        └── main.js
```

---

## Endpoints de la API

Base: `http://localhost:3000/api/v1`

### Autenticación

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/auth/login` | Iniciar sesión, devuelve JWT |
| GET | `/auth/validate-token` | Valida el token activo |

### Casos

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/caso` | Token | Lista casos con filtros por query params |
| GET | `/caso/:id` | Token | Obtiene un caso por ID |
| GET | `/caso/generar-numero` | Token | Genera número único de caso |
| POST | `/caso` | Token | Filtrado avanzado de casos (body JSON) |
| POST | `/caso/registrar` | Token | Registra un nuevo caso |
| PUT | `/caso/:id` | Token | Actualiza un caso existente |

### Departamentos / Geografía

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/dept` | Lista todos los departamentos |
| GET | `/dept/municipios?departamento_id=X` | Municipios de un departamento |
| GET | `/dept/departamentales` | Direcciones departamentales (DIDEDUC) |

### Usuarios

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/users` | Token + admin | Lista usuarios |
| GET | `/users/:id` | Token + admin | Obtiene usuario por ID |
| POST | `/users` | Token + admin | Crea usuario |
| PUT | `/users/:id` | Token + admin | Actualiza usuario |
| PATCH | `/users/:id/toggle-active` | Token + admin | Activa o desactiva usuario |

### Roles

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/roles` | Lista roles |
| POST | `/roles` | Crea rol |
| PUT | `/roles/:id` | Actualiza rol |
| DELETE | `/roles/:id` | Elimina rol |

### Carga masiva

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/upload/excel` | — | Carga individual de Excel |
| POST | `/upload/masivo` | Token + admin | Carga masiva de registros |
| GET | `/upload/historial` | Token + admin | Historial de cargas |

---

## Roles del sistema

| Rol | Acceso |
|-----|--------|
| `admin` | Acceso completo: usuarios, carga masiva, historial |
| (otros) | Dashboard, seguimiento, registro de casos |

---

## Stack tecnológico

### Backend
- **Express 5** — Framework HTTP
- **Sequelize 6** — ORM para MySQL
- **JWT** — Autenticación sin estado
- **bcryptjs** — Hash de contraseñas
- **Multer** — Subida de archivos
- **ExcelJS** — Procesamiento de archivos Excel
- **express-rate-limit** — Protección contra fuerza bruta

### Frontend
- **Vue 3** — Framework reactivo
- **Vuetify 3** — Componentes Material Design
- **Pinia** — Estado global con persistencia
- **Vue Router 4** — Navegación con guards de autenticación
- **AmCharts 5** — Gráficas y mapa interactivo de Guatemala
- **Axios** — Cliente HTTP (centralizado en `helpers/api.js`)
- **jsPDF + AutoTable** — Exportación a PDF
- **XLSX** — Exportación a Excel
- **Vite** — Empaquetador y servidor de desarrollo
