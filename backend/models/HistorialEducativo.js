import { DataTypes } from 'sequelize'
import { sequelize } from "../config/database.js";

const HistorialEducativo = sequelize.define('HistorialEducativo',{

id:{
type:DataTypes.INTEGER,
autoIncrement:true,
primaryKey:true
},

nina_id:{
type:DataTypes.INTEGER,
allowNull:false
},

institucion_id:{
type:DataTypes.INTEGER
},

centro_educativo_id:{
type:DataTypes.INTEGER
},

codigo_personal:{
type:DataTypes.STRING(100)
},

status_actual:{
type:DataTypes.STRING(255)
},

grado:{
type:DataTypes.STRING(100)
},

nivel:{
type:DataTypes.STRING(100)
},

resultado:{
type:DataTypes.STRING(255)
},

anio:{
type:DataTypes.INTEGER
}

},{

tableName:'historial_educativo',
timestamps:true

})

export default HistorialEducativo