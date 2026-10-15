// Tipos de usuario (roles) y sus permisos en la interfaz.
//
// Replica backend/helpers/permisos.js solo para mostrar u ocultar opciones:
// la protección real la aplica el backend en cada ruta. Mantener sincronizado.
export const ROLES = {
  ADMIN:            'admin',
  USUARIO:          'user',
  MODERADOR:        'moderator',
  CONSULTA:         'consulta',          // delegados departamentales: solo lectura, su departamento
  CONSULTA_GENERAL: 'consulta_general',  // autoridades: solo lectura, alcance nacional
}

export const ROLE_LABELS = {
  admin:            'Admin',
  user:             'Usuario',
  moderator:        'Moderador',
  consulta:         'Consulta',
  consulta_general: 'Consulta general',
}

// Pueden registrar casos nuevos y actualizar los existentes
export const ROLES_EDICION_CASOS = [ROLES.ADMIN, ROLES.USUARIO, ROLES.MODERADOR]

// Roles cuyo acceso a los casos se limita al departamento asignado al usuario
export const ROLES_CON_ALCANCE_DEPARTAMENTAL = [ROLES.CONSULTA]

export const puedeEditarCasos = (rol) => ROLES_EDICION_CASOS.includes(rol)
export const tieneAlcanceDepartamental = (rol) => ROLES_CON_ALCANCE_DEPARTAMENTAL.includes(rol)
