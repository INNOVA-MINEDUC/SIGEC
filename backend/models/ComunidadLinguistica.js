import { DataTypes } from 'sequelize'
import { sequelize } from "../config/database.js";

const ComunidadLinguistica = sequelize.define('ComunidadLinguistica',{

  id:{
    type:DataTypes.INTEGER,
    autoIncrement:true,
    primaryKey:true
  },

  nombre:{
    type:DataTypes.STRING(150),
    allowNull:false,
    unique:true
  }

},{

tableName:'comunidades_linguisticas',
timestamps:true

})

export default ComunidadLinguistica