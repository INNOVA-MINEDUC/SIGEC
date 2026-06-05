import { DataTypes } from 'sequelize'
import { sequelize } from "../config/database.js";

const Institucion = sequelize.define('Institucion',{

id:{
type:DataTypes.INTEGER,
autoIncrement:true,
primaryKey:true
},

nombre:{
type:DataTypes.STRING(255),
allowNull:false,
unique:true
}

},{

tableName:'instituciones',
timestamps:true

})

export default Institucion