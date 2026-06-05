// models/associations.js

import Role from './Role.js'
import User from './User.js'

import Departamento from './Departamento.js'
import Municipio from './Municipio.js'

import Pueblo from './Pueblo.js'
import ComunidadLinguistica from './ComunidadLinguistica.js'

import Institucion from './Institucion.js'
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
PUEBLO - NIÑAS
====================================================== */

Pueblo.hasMany(Nina,{

foreignKey:'pueblo_id',

as:'ninas'

})

Nina.belongsTo(Pueblo,{

foreignKey:'pueblo_id',

as:'pueblo'

})



/* ======================================================
COMUNIDAD LINGUISTICA - NIÑAS
====================================================== */

ComunidadLinguistica.hasMany(Nina,{

foreignKey:'comunidad_linguistica_id',

as:'ninas'

})

Nina.belongsTo(ComunidadLinguistica,{

foreignKey:'comunidad_linguistica_id',

as:'comunidadLinguistica'

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
INSTITUCION - CASOS EMBARAZO
====================================================== */

Institucion.hasMany(CasoEmbarazo,{

foreignKey:'institucion_id',

as:'casosEmbarazo'

})

CasoEmbarazo.belongsTo(Institucion,{

foreignKey:'institucion_id',

as:'institucion'

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
INSTITUCION - HISTORIAL EDUCATIVO
====================================================== */

Institucion.hasMany(HistorialEducativo,{

foreignKey:'institucion_id',

as:'historialesEducativos'

})

HistorialEducativo.belongsTo(Institucion,{

foreignKey:'institucion_id',

as:'institucion'

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


