'use strict'

// Agrega ninas.departamento_id para conservar el departamento de residencia
// aun cuando el municipio no pueda resolverse (p. ej. municipio inexistente en
// el catálogo). Así la niña siempre queda asociada a "el departamento al que
// pertenece", que antes solo se derivaba vía municipio → departamento.
export default {
  async up(queryInterface, Sequelize) {
    const columnas = await queryInterface.describeTable('ninas')
    if (!columnas.departamento_id) {
      await queryInterface.addColumn('ninas', 'departamento_id', {
        type: Sequelize.INTEGER,
        allowNull: true,
      })
    }
  },

  async down(queryInterface, _Sequelize) {
    const columnas = await queryInterface.describeTable('ninas')
    if (columnas.departamento_id) {
      await queryInterface.removeColumn('ninas', 'departamento_id')
    }
  },
}
