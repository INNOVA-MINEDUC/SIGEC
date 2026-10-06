'use strict'

// Unifica la escritura de ninas.comunidad_linguistica con la lista canónica del
// sistema ("K´iche´" → "K'iche'", "Akateka" → "Akateko", "Pocomchi’" → "Poqomchi'").
// Los valores que no se reconocen se dejan tal cual.
import { normalizarComunidad } from '../helpers/comunidadLinguistica.js'

export default {
  async up(queryInterface, Sequelize) {
    const filas = await queryInterface.sequelize.query(
      `SELECT DISTINCT comunidad_linguistica AS v FROM ninas WHERE comunidad_linguistica IS NOT NULL`,
      { type: Sequelize.QueryTypes.SELECT }
    )
    for (const { v } of filas) {
      const canonico = normalizarComunidad(v)
      if (canonico && canonico !== v) {
        await queryInterface.sequelize.query(
          `UPDATE ninas SET comunidad_linguistica = :canonico WHERE comunidad_linguistica = :v`,
          { replacements: { canonico, v } }
        )
      }
    }
  },

  // No reversible: solo se unificó la escritura, el dato es el mismo.
  async down() {},
}
