import { DataTypes } from 'sequelize'
import { sequelize } from "../config/database.js";

const Nina = sequelize.define('Nina',{

id:{
type:DataTypes.INTEGER,
autoIncrement:true,
primaryKey:true
},

cui:{
type:DataTypes.STRING(20),
allowNull:false,
unique:true
},

nombre_completo:{
type:DataTypes.STRING(255),
allowNull:false
},

fecha_nacimiento:{
type:DataTypes.DATEONLY
},

edad:{
type:DataTypes.INTEGER
},

direccion:{
type:DataTypes.TEXT
},

municipio_id:{
type:DataTypes.INTEGER
},

pueblo_id:{
type:DataTypes.INTEGER
},

comunidad_linguistica_id:{
type:DataTypes.INTEGER
}

},{

tableName:'ninas',
timestamps:true

})

export default Nina