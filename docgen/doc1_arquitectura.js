const { h1, h2, h3, p, bullet, code, pageBreak, table, imageParagraph, titlePage, buildDocument, writeDocx } = require("./common");

const children = [
  ...titlePage({
    code: "DOC-01",
    title: "Diagramas de Arquitectura del Sistema",
    subtitle: "SIGEC - Sistema de Información y Gestión de Casos de Embarazo en Niñas y Adolescentes",
  }),

  h1("1. Introducción"),
  p("Este documento describe la arquitectura técnica del Sistema de Información y Gestión de Casos (SIGEC), desarrollado para el Ministerio de Educación de Guatemala (MINEDUC). Su propósito es facilitar el registro, seguimiento y análisis de casos de embarazo en niñas y adolescentes vinculadas al sistema educativo, así como su trazabilidad geográfica e institucional."),
  p("El sistema está compuesto por tres componentes principales:"),
  bullet("Un Frontend SPA (Single Page Application) desarrollado en Vue 3 con Vuetify 3 y Vite."),
  bullet("Un Backend API REST desarrollado en Node.js con Express 5 y Sequelize 6 como ORM."),
  bullet("Una base de datos relacional MySQL 8."),
  p("A continuación se presentan los diagramas de arquitectura desde tres perspectivas complementarias: despliegue (infraestructura), capas lógicas (componentes de software) y mapa de módulos de la API."),

  h1("2. Arquitectura de Despliegue"),
  p("El sistema se distribuye mediante contenedores Docker independientes para el frontend y el backend, comunicándose a través de la red mediante peticiones HTTP/REST. La base de datos MySQL puede desplegarse en un contenedor adicional o en un servidor gestionado independiente."),
  ...imageParagraph("arch_deployment.png", 380, 760, "Figura 1. Arquitectura de despliegue (contenedores Docker)"),
  h3("2.1 Componentes de la arquitectura de despliegue"),
  table(
    ["Componente", "Tecnología", "Descripción"],
    [
      ["Contenedor Frontend", "Nginx + build estático de Vite (Vue 3 / Vuetify 3)", "Sirve los archivos estáticos de la SPA. Expone el puerto 8080, mapeado al puerto 80 interno del contenedor."],
      ["Contenedor Backend", "Node.js 20 + Express 5", "Expone la API REST en el puerto 3000. Incluye autenticación JWT, manejo de archivos con Multer y generación de reportes Excel con ExcelJS."],
      ["Servidor de Base de Datos", "MySQL 8 (base de datos 'sigec')", "Almacena toda la información persistente del sistema: usuarios, roles, casos, niñas, centros educativos, ubicación geográfica y auditoría."],
      ["Navegador del Usuario", "Cualquier navegador moderno", "Consume la SPA servida por Nginx y se comunica con la API mediante peticiones Axios autenticadas con JWT (Bearer Token)."],
    ],
    [28, 32, 40]
  ),
  p(""),
  p("La comunicación entre el frontend y el backend se realiza exclusivamente mediante peticiones JSON sobre HTTP(S), bajo el prefijo /api/v1/*. El backend se comunica con la base de datos mediante el ORM Sequelize, que abstrae las consultas SQL en modelos de JavaScript."),

  pageBreak(),
  h1("3. Arquitectura por Capas (Vista Lógica)"),
  p("Desde el punto de vista lógico, tanto el frontend como el backend están organizados en capas con responsabilidades bien definidas, siguiendo un patrón similar a MVC (Modelo-Vista-Controlador) en el backend y una arquitectura basada en componentes y stores reactivos en el frontend."),
  ...imageParagraph("arch_layers.png", 520, 800, "Figura 2. Arquitectura lógica por capas"),

  h3("3.1 Capas del Frontend (Vue 3 / Vuetify)"),
  table(
    ["Capa", "Responsabilidad", "Ejemplos en el proyecto"],
    [
      ["Views", "Pantallas completas de la aplicación, una por ruta", "LoginView, HomeView, DashboardView, Seguimiento, ComplainView, ChargeData, UsersView, AuditoriaView, ProfileView"],
      ["Componentes", "Elementos visuales reutilizables", "AppNavbar, AppFooter, GuateMap, BarChart, LineChart, DonaChart, PieChart"],
      ["Stores (Pinia)", "Estado global reactivo de la aplicación", "auth (sesión y usuario), casos, users, FiltroStore"],
      ["Composables", "Lógica reutilizable encapsulada en funciones", "useExport (exportación de reportes a Excel y PDF)"],
      ["Capa HTTP", "Comunicación con la API REST", "helpers/api.js (instancia de Axios con interceptor que añade el token JWT)"],
    ],
    [22, 35, 43]
  ),
  p(""),
  h3("3.2 Capas del Backend (Express 5 / Sequelize)"),
  table(
    ["Capa", "Responsabilidad", "Ejemplos en el proyecto"],
    [
      ["Routes", "Definición de endpoints y verbos HTTP", "auth.routes.js, user.routes.js, role.routes.js, caso.routes.js, dept.routes.js, upload.routes.js, auditoria.routes.js"],
      ["Middleware", "Autenticación, autorización y enriquecimiento de la petición", "verifyToken (valida JWT), requireRole (control de acceso por rol), attachUser (adjunta el usuario autenticado a req)"],
      ["Controllers", "Lógica de negocio de cada módulo", "AuthController, CasoController, UserController, RoleController, DeptController, UploadController, AuditoriaController, DashboardController"],
      ["Utils", "Funciones de apoyo reutilizables", "auditoria.js (registro de bitácora), cargaExcel.js (procesamiento de cargas masivas desde Excel)"],
      ["Modelos (Sequelize)", "Definición de entidades y relaciones con la base de datos", "User, Role, Nina, CasoEmbarazo, CentroEducativo, Departamento, Departamental, Municipio, HistorialEducativo, CargaArchivo, Auditoria, Relations.js"],
    ],
    [22, 35, 43]
  ),

  pageBreak(),
  h1("4. Mapa de Módulos de la API"),
  p("La API REST del backend se organiza bajo el prefijo /api/v1 y se divide en siete módulos principales, cada uno gestionado por un controlador específico. El siguiente diagrama muestra la relación entre cada grupo de rutas y su controlador correspondiente."),
  ...imageParagraph("arch_modules_map.png", 460, 800, "Figura 3. Mapa de módulos de la API REST (/api/v1)"),
  table(
    ["Módulo (prefijo)", "Controlador", "Funcionalidad principal"],
    [
      ["/auth", "AuthController", "Inicio de sesión, cierre de sesión, validación de token (JWT)."],
      ["/users", "UserController", "Gestión CRUD de usuarios del sistema (solo administradores)."],
      ["/roles", "RoleController", "Gestión CRUD de roles y permisos."],
      ["/caso", "CasoController", "Registro, listado, filtrado y actualización de casos de embarazo."],
      ["/dept", "DeptController", "Consulta de departamentos, municipios y departamentales."],
      ["/upload", "UploadController", "Carga de archivos Excel, carga masiva de casos e historial de cargas (solo administradores)."],
      ["/auditoria", "AuditoriaController", "Consulta y descarga de la bitácora de auditoría del sistema (solo administradores)."],
    ],
    [22, 25, 53]
  ),

  h1("5. Principios de Diseño Aplicados"),
  bullet("Separación de responsabilidades: cada capa tiene una función clara (presentación, lógica de negocio, acceso a datos)."),
  bullet("Autenticación sin estado (stateless): el backend no mantiene sesiones en memoria; cada petición se autentica mediante un token JWT firmado."),
  bullet("Control de acceso basado en roles (RBAC): los middleware verifyToken y requireRole restringen el acceso a rutas según el rol del usuario (administrador, departamental, usuario, etc.)."),
  bullet("Trazabilidad: toda acción relevante (creación/actualización de casos, inicio y cierre de sesión, cargas masivas, descargas de reportes) se registra en la tabla de Auditoría."),
  bullet("Despliegue contenedorizado: frontend y backend se ejecutan en contenedores independientes, lo que permite escalarlos y actualizarlos de forma desacoplada."),
];

writeDocx(buildDocument({ code: "DOC-01", title: "Diagramas de Arquitectura del Sistema", children }), "01_Diagramas_Arquitectura_SIGEC.docx");
