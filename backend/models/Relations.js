// models/associations.js

import Role from './Role.js'
import User from './User.js'
import Auditoria from './Auditoria.js'

import Departamento from './Departamento.js'
import Departamental from './Departamental.js'
import Municipio from './Municipio.js'

import CentroEducativo from './CentroEducativo.js'

import Nina from './Nina.js'
import CasoEmbarazo from './CasoEmbarazo.js'
import CargaArchivo from './CargaArchivo.js'
import HistorialEducativo from './HistorialEducativo.js'

/* ======================================================
CARGA ARCHIVOS - CASOS EMBARAZO
====================================================== */

CargaArchivo.hasMany(
CasoEmbarazo,
{

foreignKey:'carga_archivo_id',

as:'casos'

})

CasoEmbarazo.belongsTo(
CargaArchivo,
{

foreignKey:'carga_archivo_id',

as:'cargaArchivo'

})



/* ======================================================
USER - CARGAS ARCHIVOS
====================================================== */

User.hasMany(
CargaArchivo,
{

foreignKey:'usuario_id',

as:'cargasArchivos'

})

CargaArchivo.belongsTo(
User,
{

foreignKey:'usuario_id',

as:'usuario'

})


/* ======================================================
ROLE - USER
====================================================== */

Role.hasMany(User,{

foreignKey:'roleId',

as:'users'

})

User.belongsTo(Role,{

foreignKey:'roleId',

as:'role'

})



/* ======================================================
USER - AUDITORIAS
====================================================== */

User.hasMany(
Auditoria,
{

foreignKey:'usuario_id',

as:'auditorias'

})

Auditoria.belongsTo(
User,
{

foreignKey:'usuario_id',

as:'usuario'

})



/* ======================================================
DEPARTAMENTO - MUNICIPIO
====================================================== */

Departamento.hasMany(Municipio,{

foreignKey:'departamento_id',

as:'municipios'

})

Municipio.belongsTo(Departamento,{

foreignKey:'departamento_id',

as:'departamento'

})



/* ======================================================
DEPARTAMENTO - DEPARTAMENTAL
====================================================== */

Departamento.hasMany(Departamental,{

foreignKey:'departamento_id',

as:'departamentales'

})

Departamental.belongsTo(Departamento,{

foreignKey:'departamento_id',

as:'departamento'

})



/* ======================================================
DEPARTAMENTAL - CASOS EMBARAZO
====================================================== */

Departamental.hasMany(CasoEmbarazo,{

foreignKey:'departamental_id',

as:'casosEmbarazo'

})

CasoEmbarazo.belongsTo(Departamental,{

foreignKey:'departamental_id',

as:'departamental'

})



/* ======================================================
MUNICIPIO - CENTROS EDUCATIVOS
====================================================== */

Municipio.hasMany(CentroEducativo,{

foreignKey:'municipio_id',

as:'centrosEducativos'

})

CentroEducativo.belongsTo(Municipio,{

foreignKey:'municipio_id',

as:'municipio'

})



/* ======================================================
MUNICIPIO - NIÑAS
====================================================== */

Municipio.hasMany(Nina,{

foreignKey:'municipio_id',

as:'ninas'

})

Nina.belongsTo(Municipio,{

foreignKey:'municipio_id',

as:'municipio'

})



/* ======================================================
DEPARTAMENTO - NIÑA (departamento de residencia, fallback sin municipio)
====================================================== */

Departamento.hasMany(Nina,{

foreignKey:'departamento_id',

as:'ninasResidencia'

})

Nina.belongsTo(Departamento,{

foreignKey:'departamento_id',

as:'departamento'

})



/* ======================================================
NIÑA - CASOS EMBARAZO
====================================================== */

Nina.hasMany(CasoEmbarazo,{

foreignKey:'nina_id',

as:'casosEmbarazo'

})

CasoEmbarazo.belongsTo(Nina,{

foreignKey:'nina_id',

as:'nina'

})



/* ======================================================
NIÑA - HISTORIAL EDUCATIVO
====================================================== */

Nina.hasMany(HistorialEducativo,{

foreignKey:'nina_id',

as:'historialEducativo'

})

HistorialEducativo.belongsTo(Nina,{

foreignKey:'nina_id',

as:'nina'

})



/* ======================================================
CENTRO EDUCATIVO - HISTORIAL EDUCATIVO
====================================================== */

CentroEducativo.hasMany(HistorialEducativo,{

foreignKey:'centro_educativo_id',

as:'historialesEducativos'

})

HistorialEducativo.belongsTo(CentroEducativo,{

foreignKey:'centro_educativo_id',

as:'centroEducativo'

})


