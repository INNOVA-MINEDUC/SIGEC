import { DataTypes } from 'sequelize'
import { sequelize } from "../config/database.js";

const Pueblo = sequelize.define('Pueblo',{

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

  tableName:'pueblos',
  timestamps:true

})

export default Pueblo