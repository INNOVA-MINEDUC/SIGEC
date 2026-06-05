// models/Municipio.js

import { DataTypes } from 'sequelize'
import { sequelize } from "../config/database.js";

import Departamento from './Departamento.js'

const Municipio = sequelize.define('Municipio', {

  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },

  departamento_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },

  nombre: {
    type: DataTypes.STRING(150),
    allowNull: false
  }

}, {

  tableName: 'municipios',
  timestamps: true

})


export default Municipio