'use strict'

// Los pueblos y comunidades lingüísticas ya no se gestionan como tablas de referencia FK.
// Ahora se almacenan como texto libre en la columna ninas.pueblo y ninas.comunidad_linguistica.
// Este seeder queda vacío intencionalmente; las tablas pueblos y comunidades_linguisticas
// se conservan en el esquema pero no reciben datos.

export default {
  async up(_queryInterface, _Sequelize) {},
  async down(_queryInterface, _Sequelize) {},
}
