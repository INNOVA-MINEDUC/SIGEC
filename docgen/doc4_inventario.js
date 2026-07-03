const { h1, h2, h3, p, bullet, code, pageBreak, table, imageParagraph, titlePage, buildDocument, writeDocx } = require("./common");

const children = [
  ...titlePage({
    code: "DOC-04",
    title: "Inventario de Módulos y Funcionalidades",
    subtitle: "SIGEC - Sistema de Información y Gestión de Casos de Embarazo en Niñas y Adolescentes",
  }),

  h1("1. Introducción"),
  p("Este documento presenta un inventario completo de los módulos funcionales del sistema SIGEC, tanto del frontend (vistas y rutas) como del backend (rutas de la API y controladores), describiendo el propósito de cada uno, los roles que pueden acceder y las funcionalidades principales que ofrecen."),

  h1("2. Roles del Sistema"),
  p("El acceso a los módulos del sistema se controla mediante un esquema de roles definidos en la entidad ROLE y asignados a cada usuario (entidad USER). Los principales roles identificados en el sistema son:"),
  table(
    ["Rol", "Descripción", "Alcance típico"],
    [
      ["admin", "Administrador del sistema", "Acceso completo: gestión de usuarios, roles, carga masiva de datos, bitácora de auditoría y todos los módulos operativos."],
      ["departamental", "Usuario de una Dirección Departamental de Educación (DIDEDUC)", "Consulta y seguimiento de los casos correspondientes a su departamental."],
      ["usuario", "Usuario operativo general", "Registro y seguimiento de casos, consulta de dashboards y reportes según permisos asignados."],
    ],
    [22, 38, 40]
  ),

  pageBreak(),
  h1("3. Módulos del Frontend (Vistas y Rutas)"),
  p("La aplicación frontend (Vue 3 + Vuetify 3 + Pinia, servida como SPA mediante Vite/Nginx) define las siguientes rutas principales en frontend/src/router.js. Todas las rutas, salvo /login, requieren autenticación (requiresAuth: true) y algunas además restringen el acceso por rol."),
  table(
    ["Ruta", "Vista", "Acceso", "Descripción funcional"],
    [
      ["/login", "LoginView", "Pública", "Formulario de inicio de sesión. Si el usuario ya tiene un token válido, redirige automáticamente a la página principal."],
      ["/", "HomeView", "Autenticado", "Página principal / landing de la aplicación para usuarios autenticados."],
      ["/dashboard", "DashboardView", "Autenticado", "Panel de indicadores con gráficos (barras, líneas, dona, pastel) y mapa de Guatemala (GuateMap) mostrando la distribución de casos."],
      ["/complains", "ComplainView", "Autenticado", "Gestión de quejas/denuncias relacionadas con los casos registrados."],
      ["/show-data", "ShowDataView", "Autenticado", "Visualización tabular de los datos/casos registrados."],
      ["/charge-data", "ChargeData", "Solo admin", "Carga masiva de archivos Excel con el formato MSPAS, incluyendo historial de cargas previas."],
      ["/seguimiento", "Seguimiento", "Autenticado", "Consulta, filtrado y actualización del estado de seguimiento de los casos registrados."],
      ["/users", "UsersView", "Solo admin", "Gestión CRUD de usuarios del sistema: creación, edición, activación/desactivación y asignación de roles."],
      ["/auditoria", "AuditoriaView", "Solo admin", "Consulta de la bitácora de auditoría con filtros por acción y rango de fechas, y exportación a Excel/PDF."],
      ["/unauthorized", "UnauthorizedView", "Autenticado", "Página mostrada cuando un usuario autenticado intenta acceder a una ruta para la que no tiene el rol requerido."],
    ],
    [14, 18, 14, 54]
  ),

  h2("3.1 Componentes y Recursos Transversales"),
  table(
    ["Componente / recurso", "Tipo", "Descripción"],
    [
      ["AppNavbar", "Componente", "Barra de navegación superior, presente en todas las vistas privadas."],
      ["AppFooter", "Componente", "Pie de página institucional."],
      ["GuateMap", "Componente", "Mapa interactivo de Guatemala usado en el dashboard para mostrar la distribución geográfica de casos."],
      ["BarChart, LineChart, DonaChart, PieChart", "Componentes", "Gráficos estadísticos reutilizables basados en librerías de charts, usados en el dashboard."],
      ["stores/auth", "Store (Pinia)", "Maneja el estado de la sesión: token JWT, datos del usuario autenticado, login/logout."],
      ["stores/casos", "Store (Pinia)", "Estado relacionado con los casos de embarazo (listas, filtros aplicados, resultados)."],
      ["stores/users", "Store (Pinia)", "Estado relacionado con la gestión de usuarios (lista, usuario en edición)."],
      ["stores/FiltroStore", "Store (Pinia)", "Estado compartido de filtros (departamento, municipio, fechas, estado) usado entre vistas de dashboard y seguimiento."],
      ["composables/useExport", "Composable", "Lógica de exportación de reportes a Excel (ExcelJS) y PDF (jsPDF), con encabezado institucional MINEDUC/SIGEC."],
      ["helpers/api.js", "Módulo HTTP", "Instancia de Axios configurada con la URL base de la API y un interceptor que adjunta el token JWT (Bearer) a cada petición."],
    ],
    [28, 18, 54]
  ),

  pageBreak(),
  h1("4. Módulos del Backend (API REST)"),
  p("El backend (Node.js + Express 5 + Sequelize 6) expone su API bajo el prefijo /api/v1. Las rutas se agrupan en siete módulos, cada uno con su propio archivo de rutas y controlador. Todas las rutas (salvo /auth/login) requieren un token JWT válido, validado por el middleware verifyToken; algunas además requieren un rol específico mediante requireRole."),

  h2("4.1 Módulo de Autenticación (/auth)"),
  p("Archivo de rutas: backend/routes/auth.routes.js · Controlador: AuthController"),
  table(
    ["Funcionalidad", "Descripción"],
    [
      ["Inicio de sesión", "Valida credenciales (email + contraseña con bcrypt), genera un JWT y registra el evento 'inicio_sesion' en la auditoría."],
      ["Cierre de sesión", "Registra el evento 'cierre_sesion' en la auditoría y permite al frontend limpiar la sesión."],
      ["Validación de token", "Endpoint usado por el guard de rutas del frontend para verificar que el token sigue siendo válido y obtener los datos actuales del usuario (incluyendo su rol)."],
    ],
    [30, 70]
  ),

  h2("4.2 Módulo de Usuarios (/users)"),
  p("Archivo de rutas: backend/routes/user.routes.js · Controlador: UserController · Acceso: solo administradores"),
  table(
    ["Funcionalidad", "Descripción"],
    [
      ["Listado de usuarios", "Obtiene todos los usuarios del sistema junto con su rol asignado."],
      ["Creación de usuario", "Crea un nuevo usuario, asignándole un rol; registra auditoría 'crear_usuario'."],
      ["Edición de usuario", "Permite actualizar parcialmente los datos de un usuario (nombre, email, rol, contraseña); registra auditoría 'actualizar_usuario'."],
      ["Activación / Desactivación", "Cambia el estado isActive de un usuario para habilitar o bloquear su acceso; registra auditoría 'activar_usuario' / 'desactivar_usuario'."],
    ],
    [30, 70]
  ),

  h2("4.3 Módulo de Roles (/roles)"),
  p("Archivo de rutas: backend/routes/role.routes.js · Controlador: RoleController · Acceso: solo administradores"),
  table(
    ["Funcionalidad", "Descripción"],
    [
      ["Listado de roles", "Obtiene el catálogo de roles disponibles, usado para los formularios de creación/edición de usuarios."],
      ["Gestión de roles", "Permite crear y/o actualizar roles y su descripción (según definición del modelo ROLE)."],
    ],
    [30, 70]
  ),

  pageBreak(),
  h2("4.4 Módulo de Casos (/caso)"),
  p("Archivo de rutas: backend/routes/caso.routes.js · Controlador: CasoController (870 líneas) · Acceso: usuarios autenticados (con filtros adicionales según rol/departamental)"),
  table(
    ["Funcionalidad", "Descripción"],
    [
      ["Registrar caso", "RegistrarCaso: crea un nuevo caso de embarazo, reutilizando o creando la entidad NINA correspondiente, generando un número de caso correlativo y registrando auditoría 'crear_caso'."],
      ["Listar / filtrar casos", "ObtenerCasosFiltrados: devuelve casos paginados aplicando filtros por departamento, municipio, departamental, estado, rango de fechas y texto de búsqueda; incluye datos relacionados de la niña y ubicación geográfica."],
      ["Actualizar caso", "ActualizarCaso: actualiza el estado u otros datos de seguimiento de un caso existente y registra auditoría 'actualizar_caso'."],
      ["Datos para dashboard", "Provee los datos agregados utilizados por los gráficos y el mapa del DashboardView (distribución por departamento, estado, forma de detección, etc.)."],
    ],
    [30, 70]
  ),

  h2("4.5 Módulo de División Geográfica (/dept)"),
  p("Archivo de rutas: backend/routes/dept.routes.js · Controlador: DeptController · Acceso: usuarios autenticados"),
  table(
    ["Funcionalidad", "Descripción"],
    [
      ["Listado de departamentos", "Devuelve el catálogo de departamentos de Guatemala (DEPARTAMENTO)."],
      ["Listado de municipios", "Devuelve los municipios, opcionalmente filtrados por departamento (MUNICIPIO)."],
      ["Listado de departamentales", "Devuelve las direcciones departamentales de educación (DEPARTAMENTAL), usadas para asignar la supervisión de los casos."],
    ],
    [30, 70]
  ),

  h2("4.6 Módulo de Carga de Archivos (/upload)"),
  p("Archivo de rutas: backend/routes/upload.routes.js · Controlador: UploadController · Utilidad: backend/utils/cargaExcel.js · Acceso: solo administradores"),
  table(
    ["Funcionalidad", "Descripción"],
    [
      ["Carga de archivo Excel", "Recibe un archivo .xlsx mediante Multer (multipart/form-data) para su procesamiento."],
      ["Carga masiva de casos", "Procesa el archivo con formato MSPAS (encabezados en la fila 4, datos desde la fila 5), detecta duplicados por CUI/número de caso, y crea/actualiza registros de NINA, CASO_EMBARAZO, HISTORIAL_EDUCATIVO y referencias geográficas; registra auditoría 'carga_masiva'."],
      ["Historial de cargas", "Lista las cargas masivas previas registradas en CARGA_ARCHIVO, con sus totales de registros nuevos y duplicados."],
    ],
    [30, 70]
  ),

  h2("4.7 Módulo de Auditoría (/auditoria)"),
  p("Archivo de rutas: backend/routes/auditoria.routes.js · Controlador: AuditoriaController · Acceso: solo administradores"),
  table(
    ["Funcionalidad", "Descripción"],
    [
      ["Bitácora de auditoría", "Lista paginada de eventos del sistema (inicio/cierre de sesión, operaciones CRUD, cargas masivas, descargas de reportes), con filtros por acción y rango de fechas."],
      ["Exportación de bitácora", "Soporta la exportación de los registros filtrados a Excel y PDF desde el frontend, con encabezado institucional MINEDUC/SIGEC; cada exportación genera su propio registro de auditoría ('descargar_excel' / 'descargar_pdf')."],
    ],
    [30, 70]
  ),

  pageBreak(),
  h1("5. Middleware Transversal"),
  table(
    ["Middleware", "Archivo", "Función"],
    [
      ["verifyToken", "backend/middleware/verifyToken.js", "Verifica la firma y vigencia del token JWT enviado en el encabezado Authorization. Si no es válido, responde 401."],
      ["attachUser", "backend/middleware/attachUser.js", "Adjunta los datos del usuario autenticado (req.user) a partir del payload del token, para su uso en los controladores."],
      ["requireRole", "backend/middleware/requireRole.js", "Verifica que el rol del usuario autenticado esté dentro de la lista de roles permitidos para la ruta; si no, responde 403."],
    ],
    [22, 35, 43]
  ),

  h1("6. Resumen General del Inventario"),
  table(
    ["Módulo", "Frontend (vista/ruta)", "Backend (prefijo API)", "Roles con acceso"],
    [
      ["Autenticación", "/login", "/api/v1/auth", "Público (login) / Todos (validate-token, logout)"],
      ["Inicio", "/", "—", "Todos los autenticados"],
      ["Dashboard", "/dashboard", "/api/v1/caso (datos agregados)", "Todos los autenticados"],
      ["Quejas/Denuncias", "/complains", "/api/v1/caso (relacionado)", "Todos los autenticados"],
      ["Visualización de datos", "/show-data", "/api/v1/caso", "Todos los autenticados"],
      ["Carga de datos", "/charge-data", "/api/v1/upload", "Solo admin"],
      ["Seguimiento de casos", "/seguimiento", "/api/v1/caso", "Todos los autenticados"],
      ["Gestión de usuarios", "/users", "/api/v1/users, /api/v1/roles", "Solo admin"],
      ["Auditoría", "/auditoria", "/api/v1/auditoria", "Solo admin"],
      ["División geográfica", "(usado como filtros en varias vistas)", "/api/v1/dept", "Todos los autenticados"],
    ],
    [22, 26, 26, 26]
  ),
];

writeDocx(buildDocument({ code: "DOC-04", title: "Inventario de Módulos y Funcionalidades", children }), "04_Inventario_Modulos_Funcionalidades_SIGEC.docx");
