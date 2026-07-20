'use strict'

/**
 * Carga inicial de casos — DESACTIVADA COMO SEEDER.
 *
 * La carga ya no se ejecuta con `db:seed:all` (es decir, `npm run reset` ya no
 * inserta los casos). Ahora se dispara bajo demanda desde el frontend, en la
 * vista "Importar Datos", con el botón "Cargar datos iniciales".
 *
 *   Endpoint : POST /api/v1/upload/inicial   (solo rol admin)
 *   Controlador: backend/controllers/UploadController.js  → CargaInicial
 *   Lógica y validaciones: backend/utils/cargaExcel.js    → procesarExcelCasos
 *
 * El motivo del cambio es que la carga deje de ser parte del ciclo de
 * migraciones/seeders del despliegue y quede bajo control explícito de un
 * administrador, que además obtiene el Excel con los registros no insertados.
 *
 * Este archivo se conserva (en vez de borrarse) porque su nombre ya está
 * registrado en la tabla `SequelizeData`; eliminarlo dejaría esa referencia
 * huérfana. Se deja como no-op intencional.
 */
export default {
  async up(_queryInterface, _Sequelize) {
    console.log(
      '[seeder] Carga inicial omitida: ahora se ejecuta desde la vista ' +
      '"Importar Datos" (POST /api/v1/upload/inicial).'
    )
  },

  async down(_queryInterface, _Sequelize) {
    // No se revierte: la carga no se realiza desde aquí.
  },
}
