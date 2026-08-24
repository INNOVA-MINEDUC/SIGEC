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
allowNull:true,   // puede ser null cuando el archivo no trae CUI RENAP
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

// Departamento de residencia. Se conserva aunque el municipio no resuelva,
// para no perder "el departamento al que pertenece" la niña.
departamento_id:{
type:DataTypes.INTEGER,
allowNull:true
},

pueblo:{
type:DataTypes.STRING(100),
allowNull:true
},

comunidad_linguistica:{
type:DataTypes.STRING(100),
allowNull:true
}

},{

tableName:'ninas',
timestamps:true

})

export default Nina