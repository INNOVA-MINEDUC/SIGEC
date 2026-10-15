// Tipos de usuario (roles) y lo que cada uno puede hacer.
//
// Es la fuente única de las reglas de autorización del backend. El frontend
// replica estas listas en src/helpers/permisos.js solo para mostrar u ocultar
// opciones: la protección real se aplica aquí, en las rutas.
export const ROLES = {
  ADMIN:            'admin',
  USUARIO:          'user',
  MODERADOR:        'moderator',
  CONSULTA:         'consulta',          // delegados departamentales: solo lectura, limitado a su departamento
  CONSULTA_GENERAL: 'consulta_general',  // autoridades: solo lectura, alcance nacional
}

// Pueden registrar casos nuevos y actualizar los existentes
export const ROLES_EDICION_CASOS = [ROLES.ADMIN, ROLES.USUARIO, ROLES.MODERADOR]

// Roles cuyo acceso a los casos se limita al departamento asignado al usuario
export const ROLES_CON_ALCANCE_DEPARTAMENTAL = [ROLES.CONSULTA]

// Departamento de residencia de la niña de un caso (instancia de Sequelize o
// JSON con las relaciones nina → municipio). Se usa para el alcance
// departamental: el municipio manda y, si no hay, el departamento guardado.
export const departamentoResidenciaId = (caso) => {
  const nina = caso?.nina
  const id = nina?.municipio?.departamento_id ?? nina?.departamento_id ?? null
  return id === null ? null : Number(id)
}
