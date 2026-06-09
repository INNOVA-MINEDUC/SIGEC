// models/Departamental.js

import { DataTypes } from 'sequelize'
import { sequelize } from "../config/database.js";

const Departamental = sequelize.define('Departamental', {

  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },

  nombre: {
    type: DataTypes.STRING(150),
    allowNull: false,
    unique: true
  },

  departamento_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  }

}, {

  tableName: 'departamentales',
  timestamps: true

})

export default Departamental
