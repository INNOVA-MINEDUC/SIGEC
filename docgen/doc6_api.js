const { h1, h2, h3, p, bullet, code, pageBreak, table, imageParagraph, titlePage, buildDocument, writeDocx } = require("./common");

const children = [
  ...titlePage({
    code: "DOC-06",
    title: "Documentación de APIs e Integraciones",
    subtitle: "SIGEC - Sistema de Información y Gestión de Casos de Embarazo en Niñas y Adolescentes",
  }),

  h1("1. Introducción"),
  p("Este documento describe la API REST expuesta por el backend del sistema SIGEC (Node.js + Express 5 + Sequelize 6), incluyendo sus endpoints, métodos HTTP, parámetros, requisitos de autenticación/autorización y las integraciones externas relevantes (formato de archivos Excel para carga masiva, generación de reportes Excel/PDF)."),

  h1("2. Convenciones Generales"),
  h2("2.1 URL Base"),
  p("Todas las rutas de la API se exponen bajo el prefijo:"),
  code("/api/v1"),
  p("Definido en backend/app.js. La URL completa depende del entorno (ver DOC-05, variable VITE_API_URL en el frontend)."),

  h2("2.2 Autenticación"),
  p("La API utiliza autenticación basada en JSON Web Tokens (JWT), sin estado en el servidor:"),
  bullet("El cliente obtiene un token mediante POST /api/v1/auth/login."),
  bullet("El token debe enviarse en cada petición protegida mediante el encabezado: Authorization: Bearer <token>"),
  bullet("El middleware verifyToken valida la firma y expiración del token usando la clave JWT_SECRET."),
  bullet("El middleware attachUser decodifica el token y adjunta los datos del usuario a req.user para uso de los controladores."),
  bullet("El middleware requireRole(<roles>) restringe el acceso a usuarios cuyo rol esté incluido en la lista indicada; de lo contrario responde 403 Forbidden."),

  h2("2.3 Formato de Respuesta y Códigos de Estado"),
  table(
    ["Código", "Significado", "Uso típico"],
    [
      ["200 OK", "Solicitud exitosa", "Operaciones de lectura y actualización exitosas."],
      ["201 Created", "Recurso creado", "Creación de casos, usuarios, roles, etc."],
      ["400 Bad Request", "Datos inválidos", "Validación de campos fallida."],
      ["401 Unauthorized", "No autenticado", "Token ausente, inválido o expirado."],
      ["403 Forbidden", "No autorizado", "El usuario autenticado no tiene el rol requerido."],
      ["404 Not Found", "Recurso no encontrado", "Identificador inexistente (ej. caso, usuario, rol)."],
      ["500 Internal Server Error", "Error interno", "Errores no controlados del servidor."],
    ],
    [22, 30, 48]
  ),

  h2("2.4 Límite de Tasa (Rate Limiting)"),
  p("El endpoint GET /api/v1/auth/validate-token aplica un limitador de tasa (express-rate-limit) de 100 peticiones por IP cada 15 minutos, para proteger contra abuso del mecanismo de validación de sesión."),

  pageBreak(),
  h1("3. Módulo de Autenticación: /api/v1/auth"),
  p("Archivo: backend/routes/auth.routes.js · Controlador: AuthController"),
  table(
    ["Método", "Endpoint", "Auth", "Descripción"],
    [
      ["POST", "/api/v1/auth/login", "No", "Recibe { email, password }. Valida credenciales con bcrypt, genera un JWT y registra auditoría 'inicio_sesion'. Responde con el token y los datos del usuario (incluyendo su rol)."],
      ["POST", "/api/v1/auth/logout", "Sí (verifyToken)", "Registra auditoría 'cierre_sesion' para el usuario autenticado."],
      ["GET", "/api/v1/auth/validate-token", "Sí (Bearer token)", "Valida el token JWT y devuelve los datos actuales del usuario autenticado (id, nombre, email, rol). Usado por el guard de rutas del frontend. Limitado a 100 solicitudes / 15 min por IP."],
    ],
    [10, 28, 18, 44]
  ),

  h1("4. Módulo de Usuarios: /api/v1/users"),
  p("Archivo: backend/routes/user.routes.js · Controlador: UserController · Todas las rutas requieren verifyToken + requireRole('admin')."),
  table(
    ["Método", "Endpoint", "Descripción"],
    [
      ["POST", "/api/v1/users", "Crea un nuevo usuario (nombre, email, contraseña, rol). Registra auditoría 'crear_usuario'."],
      ["GET", "/api/v1/users", "Lista todos los usuarios del sistema con su rol asociado."],
      ["GET", "/api/v1/users/:id", "Obtiene los datos de un usuario específico por su identificador."],
      ["PUT", "/api/v1/users/:id", "Actualiza parcial o totalmente los datos de un usuario (nombre, email, rol, contraseña). Registra auditoría 'actualizar_usuario'."],
      ["PATCH", "/api/v1/users/:id/toggle-active", "Activa o desactiva el acceso de un usuario (isActive). Registra auditoría 'activar_usuario' o 'desactivar_usuario' según corresponda."],
    ],
    [10, 32, 58]
  ),

  h1("5. Módulo de Roles: /api/v1/roles"),
  p("Archivo: backend/routes/role.routes.js · Controlador: RoleController"),
  table(
    ["Método", "Endpoint", "Descripción"],
    [
      ["POST", "/api/v1/roles", "Crea un nuevo rol (nombre y descripción)."],
      ["GET", "/api/v1/roles", "Lista todos los roles disponibles."],
      ["GET", "/api/v1/roles/:id", "Obtiene un rol específico por su identificador."],
      ["PUT", "/api/v1/roles/:id", "Actualiza un rol existente."],
      ["DELETE", "/api/v1/roles/:id", "Elimina un rol existente."],
    ],
    [10, 32, 58]
  ),

  pageBreak(),
  h1("6. Módulo de Casos: /api/v1/caso"),
  p("Archivo: backend/routes/caso.routes.js · Controlador: CasoController · Todas las rutas pasan por el middleware attachUser (adjunta el usuario autenticado para aplicar filtros/permisos contextuales, p. ej. por departamental)."),
  table(
    ["Método", "Endpoint", "Descripción"],
    [
      ["GET", "/api/v1/caso/generar-numero", "Genera el siguiente número de caso correlativo disponible (GenerarNumeroCaso), usado al precargar el formulario de registro."],
      ["GET", "/api/v1/caso", "ObtenerCasosFiltrados: lista paginada de casos. Acepta parámetros de consulta para filtrar por departamento, municipio, departamental, estado, rango de fechas y texto de búsqueda; incluye datos relacionados de la niña, centro educativo y ubicación geográfica."],
      ["GET", "/api/v1/caso/:id", "ObtenerCasoPorId: obtiene el detalle completo de un caso específico."],
      ["POST", "/api/v1/caso", "FiltrarCasos: variante de búsqueda que recibe los criterios de filtro en el cuerpo de la solicitud (útil para filtros complejos que no caben en query string, p. ej. desde el dashboard)."],
      ["POST", "/api/v1/caso/registrar", "RegistrarCaso: crea un nuevo caso de embarazo, reutilizando o creando el registro de la niña por CUI, generando el número de caso y registrando auditoría 'crear_caso'."],
      ["PUT", "/api/v1/caso/:id", "ActualizarCaso: actualiza el estado y demás datos de seguimiento de un caso existente. Registra auditoría 'actualizar_caso'."],
    ],
    [10, 26, 64]
  ),
  h3("6.1 Parámetros de consulta comunes en GET /api/v1/caso"),
  table(
    ["Parámetro", "Descripción"],
    [
      ["page / limit", "Paginación de resultados."],
      ["departamento / municipio / departamental", "Filtran los casos según la ubicación geográfica o la dirección departamental responsable."],
      ["estado", "Filtra por estado de seguimiento del caso (ej. activo, en proceso, cerrado)."],
      ["desde / hasta", "Filtran por rango de fechas (fecha de ingreso o de primera consulta, según el contexto)."],
      ["busqueda / search", "Texto libre para buscar por nombre de la niña, número de caso, CUI, etc."],
    ],
    [25, 75]
  ),

  pageBreak(),
  h1("7. Módulo de División Geográfica: /api/v1/dept"),
  p("Archivo: backend/routes/dept.routes.js · Controlador: DeptController"),
  table(
    ["Método", "Endpoint", "Descripción"],
    [
      ["GET", "/api/v1/dept", "ObtenerDepartamentos: lista los departamentos de Guatemala."],
      ["GET", "/api/v1/dept/municipios", "ObtenerMunicipios: lista los municipios, normalmente filtrables por departamento."],
      ["GET", "/api/v1/dept/departamentales", "ObtenerDepartamentales: lista las direcciones departamentales de educación (DIDEDUC), usadas para asignar la supervisión de los casos."],
    ],
    [10, 30, 60]
  ),

  h1("8. Módulo de Carga de Archivos: /api/v1/upload"),
  p("Archivo: backend/routes/upload.routes.js · Controlador: UploadController · Utilidad: backend/utils/cargaExcel.js"),
  table(
    ["Método", "Endpoint", "Auth", "Descripción"],
    [
      ["GET", "/api/v1/upload/historial", "verifyToken + requireRole('admin')", "ObtenerHistorial: lista las cargas masivas previas registradas (CARGA_ARCHIVO), con totales de registros nuevos y duplicados."],
      ["POST", "/api/v1/upload/excel", "Sin middleware de autenticación explícito", "uploadExcel: recibe un archivo Excel (campo 'file', multipart/form-data) para validación/inspección preliminar."],
      ["POST", "/api/v1/upload/masivo", "verifyToken + requireRole('admin')", "CargaMasiva: procesa el archivo Excel (campo 'file') con formato MSPAS y registra los casos, niñas, historial educativo y referencias geográficas. Registra auditoría 'carga_masiva'."],
    ],
    [10, 22, 28, 40]
  ),
  h3("8.1 Restricciones de carga de archivos (Multer)"),
  bullet("Tipos MIME permitidos: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet (.xlsx) y application/ms-excel (.xls)."),
  bullet("Tamaño máximo de archivo: 100 MB."),
  bullet("Almacenamiento: en memoria (memoryStorage), el archivo se procesa directamente desde el buffer sin escribirse a disco."),

  h3("8.2 Formato esperado del archivo Excel (carga masiva)"),
  bullet("La fila 4 de la hoja de datos contiene los encabezados de columna (formato MSPAS)."),
  bullet("Los datos de los casos comienzan en la fila 5."),
  bullet("El procesamiento detecta y omite filas vacías y la tabla pivote que puede existir al final de la hoja."),
  bullet("Por cada fila válida, se verifica si el CUI o número de caso ya existe; si existe, se cuenta como duplicado y no se vuelve a insertar."),
  bullet("Si es un registro nuevo, se crean/actualizan: la niña (NINA), el caso (CASO_EMBARAZO), el historial educativo (HISTORIAL_EDUCATIVO) y las referencias geográficas (departamento, municipio, centro educativo)."),

  pageBreak(),
  h1("9. Módulo de Auditoría: /api/v1/auditoria"),
  p("Archivo: backend/routes/auditoria.routes.js · Controlador: AuditoriaController"),
  table(
    ["Método", "Endpoint", "Auth", "Descripción"],
    [
      ["GET", "/api/v1/auditoria", "verifyToken + requireRole('admin')", "ObtenerAuditorias: lista paginada de la bitácora del sistema, con filtros por acción (accion) y rango de fechas (desde / hasta). Incluye los datos del usuario relacionado (nombre, correo)."],
      ["POST", "/api/v1/auditoria/descarga", "verifyToken", "RegistrarDescarga: registra en la bitácora un evento de descarga de reporte ('descargar_excel' o 'descargar_pdf'), generado desde el frontend al exportar la auditoría u otros reportes."],
    ],
    [10, 28, 24, 38]
  ),
  h3("9.1 Acciones registradas en la bitácora"),
  table(
    ["Valor de 'accion'", "Descripción"],
    [
      ["inicio_sesion", "Inicio de sesión exitoso de un usuario."],
      ["cierre_sesion", "Cierre de sesión de un usuario."],
      ["crear_caso", "Creación de un nuevo caso de embarazo."],
      ["actualizar_caso", "Actualización de un caso existente."],
      ["crear_usuario", "Creación de un nuevo usuario del sistema."],
      ["actualizar_usuario", "Actualización de los datos de un usuario."],
      ["activar_usuario", "Activación del acceso de un usuario."],
      ["desactivar_usuario", "Desactivación del acceso de un usuario."],
      ["carga_masiva", "Carga masiva de casos desde un archivo Excel."],
      ["descargar_excel", "Exportación de un reporte a Excel."],
      ["descargar_pdf", "Exportación de un reporte a PDF."],
    ],
    [30, 70]
  ),

  pageBreak(),
  h1("10. Módulos Definidos pero No Montados"),
  p("El proyecto incluye dos módulos de rutas/controladores adicionales que están implementados pero actualmente no se encuentran activos en backend/app.js (las líneas de importación y montaje están comentadas). Se documentan aquí como referencia para una posible activación futura:"),
  table(
    ["Módulo", "Archivo de rutas", "Endpoints definidos", "Estado"],
    [
      ["Niñas", "backend/routes/niña.routes.js", "GET /  ·  GET /id/:id  ·  GET /cui/:cui (NiñaController: getAllNinas, getNinaById, getNinaByCui)", "No montado en app.js (línea comentada: /api/v1/ninas)"],
      ["Quejas", "backend/routes/queja.routes.js", "POST /  (QuejaController: CreateQueja)", "No montado en app.js (línea comentada: /api/v1/queja)"],
    ],
    [16, 28, 38, 18]
  ),

  h1("11. Integraciones y Generación de Reportes (Frontend)"),
  p("El frontend implementa, mediante el composable composables/useExport, la generación de reportes a partir de los datos obtenidos de la API. Estas no son integraciones con servicios externos, sino procesos de generación de documentos en el navegador del usuario:"),
  table(
    ["Integración", "Librería", "Descripción"],
    [
      ["Exportación a Excel", "exceljs (backend) / xlsx, xlsx-js-style (frontend)", "Genera archivos .xlsx con encabezado institucional MINEDUC/SIGEC para reportes de casos y para la bitácora de auditoría."],
      ["Exportación a PDF", "jspdf, jspdf-autotable", "Genera archivos .pdf con encabezado institucional MINEDUC/SIGEC para reportes de casos y para la bitácora de auditoría, incluyendo tablas formateadas (autotable)."],
      ["Mapa geográfico", "@amcharts/amcharts5, @amcharts/amcharts5-geodata", "Renderiza el componente GuateMap en el dashboard, mostrando la distribución de casos por departamento/municipio sobre el mapa de Guatemala."],
      ["Notificaciones de interfaz", "sweetalert2", "Mensajes de confirmación y alerta para operaciones del usuario (creación, edición, errores de validación, etc.)."],
    ],
    [25, 30, 45]
  ),

  h1("12. Seguridad de la API"),
  bullet("CORS: configurado en backend/app.js mediante cors(), restringido al origen definido en la variable de entorno CLIENT_URL, permitiendo los métodos GET, POST, PUT y DELETE con credenciales."),
  bullet("Contraseñas: almacenadas con hash mediante bcrypt (paquetes bcrypt / bcryptjs)."),
  bullet("Tokens JWT: firmados con la clave JWT_SECRET; deben enviarse en el encabezado Authorization en cada petición protegida."),
  bullet("Control de acceso por rol: aplicado mediante requireRole en los módulos de usuarios, roles (gestión administrativa), carga masiva y auditoría."),
  bullet("Limitación de tasa: aplicada al endpoint de validación de token para mitigar abuso (express-rate-limit)."),
  bullet("Validación de archivos: el módulo de carga de archivos valida el tipo MIME (solo Excel) y limita el tamaño máximo a 100 MB."),
];

writeDocx(buildDocument({ code: "DOC-06", title: "Documentación de APIs e Integraciones", children }), "06_Documentacion_API_SIGEC.docx");
