'use strict'

// Tipos de usuario de solo lectura:
//   - consulta          → delegados departamentales; ven solo los casos de su departamento
//   - consulta_general  → autoridades; ven los casos de todo el país
// Agrega también users.departamento_id para asignar el departamento a "consulta".
// Es aditiva: no modifica usuarios, roles ni datos existentes.
const ROLES = [
  { name: 'consulta',         description: 'Consulta: solo lectura, limitado al departamento asignado' },
  { name: 'consulta_general', description: 'Consulta general: solo lectura, alcance nacional' },
]

export default {
  async up(queryInterface, Sequelize) {
    const cols = await queryInterface.describeTable('users')
    if (!cols.departamento_id) {
      await queryInterface.addColumn('users', 'departamento_id', {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'departamentos', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      })
    }

    for (const rol of ROLES) {
      await queryInterface.sequelize.query(
        `INSERT INTO roles (name, description, createdAt, updatedAt)
         SELECT :name, :description, NOW(), NOW() FROM DUAL
         WHERE NOT EXISTS (SELECT 1 FROM roles WHERE name = :name)`,
        { replacements: rol }
      )
    }
  },

  async down(queryInterface) {
    // Los roles nuevos solo se quitan si ningún usuario los tiene asignados
    await queryInterface.sequelize.query(
      `DELETE FROM roles
        WHERE name IN ('consulta', 'consulta_general')
          AND id NOT IN (SELECT roleId FROM users)`
    )
    const cols = await queryInterface.describeTable('users')
    if (cols.departamento_id) await queryInterface.removeColumn('users', 'departamento_id')
  },
}
