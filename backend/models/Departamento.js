// models/Departamento.js

import { DataTypes } from 'sequelize'
import { sequelize } from "../config/database.js";

const Departamento = sequelize.define('Departamento', {

  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },

  nombre: {
    type: DataTypes.STRING(150),
    allowNull: false,
    unique: true
  }

}, {

  tableName: 'departamentos',
  timestamps: true

})

export default Departamento