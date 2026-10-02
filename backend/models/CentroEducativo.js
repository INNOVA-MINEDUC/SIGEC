import { DataTypes } from 'sequelize'
import { sequelize } from "../config/database.js";

const CentroEducativo = sequelize.define('CentroEducativo',{

id:{
type:DataTypes.INTEGER,
autoIncrement:true,
primaryKey:true
},

codigo_udi:{
type:DataTypes.STRING(100),
allowNull:false,
unique:true
},

nombre:{
type:DataTypes.STRING(255),
allowNull:false
},

direccion:{
type:DataTypes.TEXT
},

municipio_id:{
type:DataTypes.INTEGER,
allowNull:false
},

// Zona de la Ciudad de Guatemala (ver helpers/zonaGuatemala.js); solo aplica si el municipio es Guatemala
zona:{
type:DataTypes.TINYINT,
allowNull:true
},

sector:{
type:DataTypes.STRING(100)
},

jornada:{
type:DataTypes.STRING(100)
},

area:{
type:DataTypes.STRING(100)
}

},{

tableName:'centros_educativos',
timestamps:true

})

export default CentroEducativo