import { DataTypes } from 'sequelize'
import { sequelize } from "../config/database.js";

const CasoEmbarazo = sequelize.define(
'CasoEmbarazo',
{

id:{
type:DataTypes.INTEGER,
autoIncrement:true,
primaryKey:true
},

numero_caso:{
type:DataTypes.STRING(100),
allowNull:false,
unique:true
},

nina_id:{
type:DataTypes.INTEGER,
allowNull:false
},

/* NUEVO */

carga_archivo_id:{
type:DataTypes.INTEGER,
allowNull:true
},

fecha_ingreso:{
type:DataTypes.DATEONLY
},

fecha_primera_consulta:{
type:DataTypes.DATEONLY
},

forma_deteccion:{
type:DataTypes.STRING(255)
},

departamental_id:{
type:DataTypes.INTEGER,
allowNull:true
},

no_notificacion:{
type:DataTypes.STRING(100),
allowNull:true
},

institucion:{
type:DataTypes.STRING(255),
allowNull:true
},


queja:{
type:DataTypes.STRING(100),
allowNull:true
},

estado:{
type:DataTypes.ENUM(
  'pendiente',
  'faltante',
  'completado'
  ),
  },
},

{

tableName:'casos_embarazo',

timestamps:true

}

)

export default CasoEmbarazo