'use strict'

/** @type {import('sequelize-cli').Seeder} */

export default {

async up(queryInterface, Sequelize) {

const now = new Date()

await queryInterface.bulkInsert(
'cargas_archivos',

[

{

id:1,

nombre_archivo:'archivo_final.xlsx',

total_registros:2876,

registros_nuevos:2700,

registros_duplicados:176,

fecha_carga:now,

usuario_id:1,

createdAt:now,

updatedAt:now

},

{

id:2,

nombre_archivo:'resultado_final.xlsx',

total_registros:161,

registros_nuevos:120,

registros_duplicados:40,

fecha_carga:now,

usuario_id:1,

createdAt:now,

updatedAt:now

}, 
])

/* =====================================================
PUEBLOS
===================================================== */

await queryInterface.bulkInsert('pueblos',[

{
id:1,
nombre:'Maya',
createdAt:now,
updatedAt:now
},

{
id:2,
nombre:'Xinka',
createdAt:now,
updatedAt:now
},

{
id:3,
nombre:'Garífuna',
createdAt:now,
updatedAt:now
}

])

/* =====================================================
COMUNIDADES LINGUISTICAS
===================================================== */

await queryInterface.bulkInsert('comunidades_linguisticas',[

{
id:1,
nombre:'Kaqchikel',
createdAt:now,
updatedAt:now
},

{
id:2,
nombre:'Kiche',
createdAt:now,
updatedAt:now
},

{
id:3,
nombre:'Español',
createdAt:now,
updatedAt:now
}

])

/* =====================================================
INSTITUCIONES
===================================================== */

await queryInterface.bulkInsert('instituciones',[

{
id:1,
nombre:'MINEDUC',
createdAt:now,
updatedAt:now
},

{
id:2,
nombre:'SOSEP',
createdAt:now,
updatedAt:now
},

{
id:3,
nombre:'PGN',
createdAt:now,
updatedAt:now
}

])

/* =====================================================
CENTROS EDUCATIVOS

IMPORTANTE:
municipio_id debe existir
===================================================== */

await queryInterface.bulkInsert('centros_educativos',[

{
id:1,
codigo_udi:'UDI001',
nombre:'Escuela Oficial Urbana',

direccion:'Zona 1',

municipio_id:1,

sector:'Oficial',

jornada:'Matutina',

area:'Urbana',

createdAt:now,
updatedAt:now
},

{
id:2,
codigo_udi:'UDI002',

nombre:'Instituto Nacional',

direccion:'Zona 2',

municipio_id:2,

sector:'Oficial',

jornada:'Vespertina',

area:'Urbana',

createdAt:now,
updatedAt:now
},

{
id:3,
codigo_udi:'UDI003',

nombre:'Colegio Esperanza',

direccion:'Centro',

municipio_id:3,

sector:'Privado',

jornada:'Matutina',

area:'Rural',

createdAt:now,
updatedAt:now
}

])

/* =====================================================
NINAS
===================================================== */

await queryInterface.bulkInsert('ninas',[

{
id:1,

cui:'1234567890101',

nombre_completo:'Ana Perez',

fecha_nacimiento:'2012-05-10',

edad:13,

direccion:'Zona 1',

municipio_id:1,

pueblo_id:1,

comunidad_linguistica_id:1,

createdAt:now,
updatedAt:now

},

{
id:2,

cui:'1234567890102',

nombre_completo:'Maria Lopez',

fecha_nacimiento:'2011-08-15',

edad:14,

direccion:'Zona 3',

municipio_id:2,

pueblo_id:1,

comunidad_linguistica_id:2,

createdAt:now,
updatedAt:now

},

{
id:3,

cui:'1234567890103',

nombre_completo:'Juana Garcia',

fecha_nacimiento:'2010-12-01',

edad:15,

direccion:'Centro',

municipio_id:3,

pueblo_id:2,

comunidad_linguistica_id:3,

createdAt:now,
updatedAt:now

}

])

/* =====================================================
CASOS EMBARAZO
===================================================== */

await queryInterface.bulkInsert('casos_embarazo',[

{

id:1,

numero_caso:'CASO001',

nina_id:1,

carga_archivo_id:1,

fecha_ingreso:'2025-01-15',

fecha_primera_consulta:'2025-01-20',

forma_deteccion:'Escuela',

direccion_departamental_educacion:'Chimaltenango',

numero_notificacion:'NOT001',

institucion_id:1,

queja: "",

estado: "pendiente",

createdAt:now,
updatedAt:now

},

{

id:2,

numero_caso:'CASO002',

nina_id:2,

carga_archivo_id:1,

fecha_ingreso:'2025-02-10',

fecha_primera_consulta:'2025-02-14',

forma_deteccion:'Municipalidad',

direccion_departamental_educacion:'Sacatepequez',

numero_notificacion:'NOT002',

institucion_id:2,

queja: "54564878",

estado: "completado",

createdAt:now,
updatedAt:now

},

{

id:3,

numero_caso:'CASO003',

nina_id:3,

carga_archivo_id:2,

fecha_ingreso:'2025-03-10',

fecha_primera_consulta:'2025-03-15',

forma_deteccion:'ONG',

direccion_departamental_educacion:'Escuintla',

numero_notificacion:'NOT003',

institucion_id:3,

queja: "",

estado: "pendiente",

createdAt:now,
updatedAt:now

}

])

/* =====================================================
HISTORIAL EDUCATIVO
===================================================== */

await queryInterface.bulkInsert('historial_educativo',[

{

id:1,

nina_id:1,

institucion_id:1,

centro_educativo_id:1,

codigo_personal:'CP001',

status_actual:'Inscrita',

grado:'6to Primaria',

nivel:'Primaria',

resultado:'Aprobado',

anio:2025,

createdAt:now,
updatedAt:now

},

{

id:2,

nina_id:2,

institucion_id:2,

centro_educativo_id:2,

codigo_personal:'CP002',

status_actual:'En proceso',

grado:'1ro Basico',

nivel:'Basico',

resultado:'Pendiente',

anio:2025,

createdAt:now,
updatedAt:now

},

{

id:3,

nina_id:3,

institucion_id:3,

centro_educativo_id:3,

codigo_personal:'CP003',

status_actual:'Graduada',

grado:'3ro Basico',

nivel:'Basico',

resultado:'Aprobado',

anio:2025,

createdAt:now,
updatedAt:now

}

])

},

async down(queryInterface, Sequelize){

await queryInterface.bulkDelete('historial_educativo',null,{})
await queryInterface.bulkDelete('casos_embarazo',null,{})
await queryInterface.bulkDelete('cargas_archivos',null,{})
await queryInterface.bulkDelete('ninas',null,{})
await queryInterface.bulkDelete('centros_educativos',null,{})
await queryInterface.bulkDelete('instituciones',null,{})
await queryInterface.bulkDelete('comunidades_linguisticas',null,{})
await queryInterface.bulkDelete('pueblos',null,{})

}

}
