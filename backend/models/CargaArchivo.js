import { DataTypes } from 'sequelize'
import { sequelize } from "../config/database.js";

const CargaArchivo = sequelize.define(
'CargaArchivo',
{

id:{
type:DataTypes.INTEGER,
autoIncrement:true,
primaryKey:true
},

nombre_archivo:{
type:DataTypes.STRING(255),
allowNull:false
},

// ruta_archivo:{
// type:DataTypes.TEXT,
// allowNull:true
// },

total_registros:{
type:DataTypes.INTEGER,
allowNull:false,
defaultValue:0
},

registros_nuevos:{
type:DataTypes.INTEGER,
allowNull:false,
defaultValue:0
},

registros_duplicados:{
type:DataTypes.INTEGER,
allowNull:false,
defaultValue:0
},

// registros_error:{
// type:DataTypes.INTEGER,
// allowNull:false,
// defaultValue:0
// },

fecha_carga:{
type:DataTypes.DATE,
allowNull:false,
defaultValue:DataTypes.NOW
},

usuario_id:{
type:DataTypes.INTEGER,
allowNull:true
},

// estado:{
// type:DataTypes.ENUM(
// 'procesando',
// 'completado',
// 'fallido'
// ),

// defaultValue:'procesando'
// }

},

{

tableName:'cargas_archivos',

timestamps:true

}

)

export default CargaArchivo