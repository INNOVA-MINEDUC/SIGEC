// controllers/CasoController.js

import { Op } from 'sequelize'
import { sequelize } from "../config/database.js";
import CasoEmbarazo from "../models/CasoEmbarazo.js";

import Nina from "../models/Nina.js";
import Municipio from "../models/Municipio.js";
import Departamento from "../models/Departamento.js";
import Departamental from "../models/Departamental.js";

import HistorialEducativo from "../models/HistorialEducativo.js";
import CentroEducativo from "../models/CentroEducativo.js";

import CargaArchivo from "../models/CargaArchivo.js";

export const GenerarNumeroCaso = async (req, res) => {
  try {
    const maxId = await CasoEmbarazo.max('id') || 0
    const siguiente = Number(maxId) + 1
    const yearSuffix = String(new Date().getFullYear()).slice(-3)
    const numero = `${String(siguiente).padStart(5, '0')}-${yearSuffix}`
    return res.json({ success: true, numero })
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error generando número de caso', error: error.message })
  }
}

export const ObtenerCasos = async (req, res) => {

  try {

    const casos = await CasoEmbarazo.findAll({

      include: [

        /* ======================================
        NIÑA
        ====================================== */

        {

          model: Nina,

          as: 'nina',

          include: [

            {

              model: Municipio,

              as: 'municipio',

              include: [

                {

                  model: Departamento,

                  as: 'departamento'

                }

              ]

            },

            /* ======================================
            HISTORIAL EDUCATIVO
            ====================================== */

            {

              model: HistorialEducativo,

              as: 'historialEducativo',

              include: [

                {

                  model: CentroEducativo,

                  as: 'centroEducativo',

                  include: [

                    {

                      model: Municipio,

                      as: 'municipio'

                    }

                  ]

                }

              ]

            }

          ]

        },

        /* ======================================
        ARCHIVO CARGADO
        ====================================== */

        {

          model: CargaArchivo,

          as: 'cargaArchivo'

        }

      ],

      order: [

        ['createdAt', 'DESC']

      ]

    })

    return res.status(200).json({

      success: true,

      total: casos.length,

      data: casos

    })

  } catch (error) {

    console.log(error)

    return res.status(500).json({

      success: false,

      message: 'Error obteniendo casos',

      error: error.message

    })

  }

}


export const FiltrarCasos = async (req,res)=>{

try{

const{

departamento_id,
estado,
sinQueja

}=req.body


/* ======================================
WHERE CASOS
====================================== */

const whereCaso={}


/* estado */

if(
estado &&
estado !== 'Todos'
){

whereCaso.estado=estado

}


/* sin queja */

if(
sinQueja===true ||
sinQueja==="true"
){

whereCaso[Op.or]=[
  { queja: null },
  { queja: '' }
]

}


/* ======================================
CONSULTA
====================================== */

const casos=await CasoEmbarazo.findAll({

where:whereCaso,

include:[

{

model:Nina,

as:'nina',

required:true,

include:[

{

model:Municipio,

as:'municipio',

required:false,

include:[

{

model:Departamento,

as:'departamento',

required:false

}

]

},


{

model:HistorialEducativo,

as:'historialEducativo',

include:[

{

model:CentroEducativo,

as:'centroEducativo',

include:[

{

model:Municipio,

as:'municipio'

}

]

}

]

}

]

},

{

model:Departamental,

as:'departamental',

required:false,

include:[{model:Departamento,as:'departamento'}]

},

{

model:CargaArchivo,

as:'cargaArchivo'

}

],

order:[

['createdAt','DESC']

]

})


const filtrados = casos.filter((caso) => {
  const nina = caso.nina
  if (departamento_id && departamento_id !== 'Todos') {
    const deptNina = nina?.municipio?.departamento?.id
    const deptCaso = caso.departamental?.departamento_id
    if (String(deptNina) !== String(departamento_id) && String(deptCaso) !== String(departamento_id)) return false
  }
  return true
})

return res.json({

success:true,

total:filtrados.length,

filters:{

departamento_id,
estado,
sinQueja

},

data:filtrados

})

}catch(error){

console.log(error)

return res.status(500).json({

success:false,

message:'Error filtrando casos',

error:error.message

})

}

}

export const RegistrarCaso = async (req, res) => {
  const t = await sequelize.transaction()
  try {
    const { numero_queja, no_caso, fecha_ingreso, departamental_id, estado, datos_nina, situacion_educativa } = req.body

    if (!no_caso) {
      await t.rollback()
      return res.status(400).json({ success: false, message: 'El número de caso es requerido' })
    }
    if (!datos_nina?.nombre_completo) {
      await t.rollback()
      return res.status(400).json({ success: false, message: 'El nombre completo de la niña es requerido' })
    }
    const ESTADOS_VALIDOS = ['pendiente', 'faltante', 'completado']
    if (!estado || !ESTADOS_VALIDOS.includes(estado)) {
      await t.rollback()
      return res.status(400).json({ success: false, message: 'El estado del caso es obligatorio (pendiente, faltante, completado)' })
    }

    // 1. Buscar o crear niña por CUI
    // findOrCreate por CUI cuando viene, o crear nuevo cuando CUI es nulo
    let nina
    if (datos_nina.cui) {
      ;[nina] = await Nina.findOrCreate({
        where: { cui: datos_nina.cui },
        defaults: {
          nombre_completo:       datos_nina.nombre_completo,
          fecha_nacimiento:      datos_nina.fecha_nacimiento || null,
          edad:                  datos_nina.edad || null,
          direccion:             datos_nina.direccion || null,
          municipio_id:          datos_nina.municipio_id || null,
          pueblo:                datos_nina.pueblo || null,
          comunidad_linguistica: datos_nina.comunidad_linguistica || null,
        },
        transaction: t
      })
    } else {
      nina = await Nina.create({
        cui:                   null,
        nombre_completo:       datos_nina.nombre_completo,
        fecha_nacimiento:      datos_nina.fecha_nacimiento || null,
        edad:                  datos_nina.edad || null,
        direccion:             datos_nina.direccion || null,
        municipio_id:          datos_nina.municipio_id || null,
        pueblo:                datos_nina.pueblo || null,
        comunidad_linguistica: datos_nina.comunidad_linguistica || null,
      }, { transaction: t })
    }

    // 2. Buscar o crear centro educativo
    let centroId = null
    const se = situacion_educativa || {}
    if (se.codigo_udi || se.nombre_centro_educativo) {
      let centro = null
      if (se.codigo_udi) {
        centro = await CentroEducativo.findOne({ where: { codigo_udi: se.codigo_udi }, transaction: t })
        if (!centro && se.municipio_id) {
          centro = await CentroEducativo.create({
            codigo_udi:   se.codigo_udi,
            nombre:       se.nombre_centro_educativo || se.codigo_udi,
            direccion:    se.direccion || null,
            municipio_id: Number(se.municipio_id),
            sector:       se.sector || null,
            jornada:      se.jornada || null,
            area:         se.area || null,
          }, { transaction: t })
        }
      } else if (se.nombre_centro_educativo && se.municipio_id) {
        const [ce] = await CentroEducativo.findOrCreate({
          where: { nombre: se.nombre_centro_educativo, municipio_id: Number(se.municipio_id) },
          defaults: {
            codigo_udi:   `AUTO-${Date.now()}`,
            nombre:       se.nombre_centro_educativo,
            direccion:    se.direccion || null,
            municipio_id: Number(se.municipio_id),
            sector:       se.sector || null,
            jornada:      se.jornada || null,
            area:         se.area || null,
          },
          transaction: t
        })
        centro = ce
      }
      if (centro) centroId = centro.id
    }

    // 3. Crear caso de embarazo
    const caso = await CasoEmbarazo.create({
      numero_caso:            no_caso,
      nina_id:                nina.id,
      fecha_ingreso:          fecha_ingreso || null,
      fecha_primera_consulta: datos_nina.fecha_primera_consulta || null,
      forma_deteccion:        datos_nina.forma_deteccion || "MSPAS",
      no_notificacion:        datos_nina.no_notificacion || null,
      institucion:            datos_nina.institucion || null,
      queja:                  numero_queja || null,
      estado:                 estado,
      departamental_id:       departamental_id || null,
    }, { transaction: t })

    // 4. Crear historial educativo
    if (se.grado || centroId) {
      await HistorialEducativo.create({
        nina_id:             nina.id,
        centro_educativo_id: centroId,
        codigo_personal:     se.codigo_personal || null,
        status_actual:       se.status_actual || null,
        grado:               se.grado || null,
        nivel:               se.nivel || null,
        resultado:           se.resultado || null,
        anio:                se.anio ? Number(se.anio) : null,
      }, { transaction: t })
    }

    await t.commit()

    return res.status(201).json({
      success: true,
      message: 'Caso registrado exitosamente',
      data: { caso_id: caso.id, nina_id: nina.id }
    })

  } catch (error) {
    await t.rollback()
    console.error(error)
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({
        success: false,
        message: 'Ya existe un caso con ese número de caso o la niña ya tiene un CUI registrado con datos distintos',
        error: error.message
      })
    }
    return res.status(500).json({
      success: false,
      message: 'Error al registrar el caso',
      error: error.message
    })
  }
}

export const ObtenerCasosFiltrados = async (req, res) => {
  try {
    const {
      departamento,
      municipio,
      codigo_estudiante,
      edad_min,
      edad_max,
      grado,
      nivel,
      lengua,
      pueblo,
      centro_educativo,
      fecha_inicio,
      fecha_fin,
      estado,
      tiene_queja,
      departamental,
      status_actual,
      resultado,
      area
    } = req.query;

    const casos = await CasoEmbarazo.findAll({
      include: [
        {
          model: Nina,
          as: "nina",
          include: [
            {
              model: Municipio,
              as: "municipio",
              include: [
                {
                  model: Departamento,
                  as: "departamento"
                }
              ]
            },
            {
              model: HistorialEducativo,
              as: "historialEducativo",
              include: [
                {
                  model: CentroEducativo,
                  as: "centroEducativo",
                  include: [
                    {
                      model: Municipio,
                      as: "municipio"
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          model: Departamental,
          as: "departamental",
          include: [
            {
              model: Departamento,
              as: "departamento"
            }
          ]
        },
        {
          model: CargaArchivo,
          as: "cargaArchivo"
        }
      ],
      order: [["createdAt", "DESC"]]
    });

    // Normaliza: quita tildes + artículo inicial ("El Petén" → "peten")
    const normD = (s) =>
      String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()
      .replace(/^(el|la|los|las)\s+/, '')

    const filtrados = casos.filter((caso) => {
      const nina = caso.nina;
      const municipioNina = nina?.municipio;
      const departamentoNina = municipioNina?.departamento;
      const historial = nina?.historialEducativo || [];

      // Departamento: revisar vía nina→municipio→departamento
      //               y también vía caso→departamental→departamento (casos de carga masiva)
      if (departamento) {
        const filtro   = normD(departamento)
        const porNina  = normD(departamentoNina?.nombre)
        const porDepto = normD(caso.departamental?.departamento?.nombre)
        if (porNina !== filtro && porDepto !== filtro) return false
      }

      // Municipio: solo aplica si la niña tiene municipio registrado
      if (municipio && normD(municipioNina?.nombre) !== normD(municipio)) return false;

      if (estado && String(caso.estado) !== String(estado)) return false;

      if (
        departamental &&
        String(caso.departamental?.id ?? caso.departamental_id) !== String(departamental)
      ) return false;

      if (fecha_inicio && new Date(caso.fecha_ingreso) < new Date(fecha_inicio)) return false;
      if (fecha_fin && new Date(caso.fecha_ingreso) > new Date(fecha_fin)) return false;

      if (tiene_queja === "si" && !(caso.queja && caso.queja.trim() !== "")) return false;
      if (tiene_queja === "no" && (caso.queja && caso.queja.trim() !== "")) return false;

      if (codigo_estudiante) {
        const existeCodigo = historial.some((h) =>
          String(h.codigo_personal ?? h.codigo_estudiante ?? "") === String(codigo_estudiante)
        );
        if (!existeCodigo) return false;
      }

      if (edad_min !== undefined && edad_min !== "" && Number(nina?.edad) < Number(edad_min)) return false;
      if (edad_max !== undefined && edad_max !== "" && Number(nina?.edad) > Number(edad_max)) return false;

      if (pueblo && normD(nina?.pueblo) !== normD(pueblo)) return false;
      if (lengua && normD(nina?.comunidad_linguistica) !== normD(lengua)) return false;

      if (grado) {
        const existeGrado = historial.some((h) => String(h.grado) === String(grado));
        if (!existeGrado) return false;
      }

      if (nivel) {
        const existeNivel = historial.some((h) => String(h.nivel) === String(nivel));
        if (!existeNivel) return false;
      }

      if (status_actual) {
        const existeStatus = historial.some((h) => String(h.status_actual) === String(status_actual));
        if (!existeStatus) return false;
      }

      if (resultado) {
        const existeResultado = historial.some((h) => String(h.resultado) === String(resultado));
        if (!existeResultado) return false;
      }

      if (area) {
        const existeArea = historial.some((h) => String(h.centroEducativo?.area) === String(area));
        if (!existeArea) return false;
      }

      if (centro_educativo) {
        const normCentro = normD(centro_educativo)
        const existeCentro = historial.some((h) =>
          normD(h.centroEducativo?.nombre ?? '').includes(normCentro)
        );
        if (!existeCentro) return false;
      }

      return true;
    });

    return res.status(200).json({
      success: true,
      total: filtrados.length,
      data: filtrados
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Error obteniendo casos",
      error: error.message
    });
  }
};

export const ObtenerCasoPorId = async (req, res) => {
  try {
    const { id } = req.params
    const caso = await CasoEmbarazo.findByPk(id, {
      include: [
        {
          model: Nina,
          as: 'nina',
          include: [
            {
              model: Municipio,
              as: 'municipio',
              include: [{ model: Departamento, as: 'departamento' }]
            },
            {
              model: HistorialEducativo,
              as: 'historialEducativo',
              include: [{
                model: CentroEducativo,
                as: 'centroEducativo',
                include: [{
                  model: Municipio,
                  as: 'municipio',
                  include: [{ model: Departamento, as: 'departamento' }]
                }]
              }]
            }
          ]
        },
        {
          model: Departamental,
          as: 'departamental',
          include: [{ model: Departamento, as: 'departamento' }]
        },
        { model: CargaArchivo, as: 'cargaArchivo' }
      ]
    })
    if (!caso) return res.status(404).json({ success: false, message: 'Caso no encontrado' })
    return res.json({ success: true, data: caso })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ success: false, message: 'Error obteniendo caso', error: error.message })
  }
}

export const ActualizarCaso = async (req, res) => {
  const t = await sequelize.transaction()
  try {
    const { id } = req.params
    const { queja, estado, fecha_ingreso, departamental_id, datos_nina, situacion_educativa } = req.body

    const ESTADOS_VALIDOS = ['pendiente', 'faltante', 'completado']
    if (estado && !ESTADOS_VALIDOS.includes(estado)) {
      await t.rollback()
      return res.status(400).json({ success: false, message: 'Estado no válido: usar pendiente, faltante o completado' })
    }

    const caso = await CasoEmbarazo.findByPk(id, { transaction: t })
    if (!caso) {
      await t.rollback()
      return res.status(404).json({ success: false, message: 'Caso no encontrado' })
    }

    // 1. Actualizar caso
    const casoUpdates = {}
    if (queja !== undefined)      casoUpdates.queja           = queja || null
    if (estado)                   casoUpdates.estado          = estado
    if (fecha_ingreso)            casoUpdates.fecha_ingreso   = fecha_ingreso
    if (departamental_id)         casoUpdates.departamental_id = departamental_id
    if (datos_nina?.no_notificacion !== undefined) casoUpdates.no_notificacion = datos_nina.no_notificacion || null
    if (datos_nina?.institucion !== undefined)     casoUpdates.institucion     = datos_nina.institucion || null
    await caso.update(casoUpdates, { transaction: t })

    // 2. Actualizar niña
    if (datos_nina && caso.nina_id) {
      const ninaUpd = {}
      if (datos_nina.nombre_completo)                ninaUpd.nombre_completo       = datos_nina.nombre_completo
      if (datos_nina.fecha_nacimiento)               ninaUpd.fecha_nacimiento      = datos_nina.fecha_nacimiento
      if (datos_nina.edad !== undefined)             ninaUpd.edad                  = datos_nina.edad || null
      if (datos_nina.direccion !== undefined)        ninaUpd.direccion             = datos_nina.direccion || null
      if (datos_nina.municipio_id !== undefined)          ninaUpd.municipio_id          = datos_nina.municipio_id || null
      if (datos_nina.pueblo !== undefined)                 ninaUpd.pueblo                = datos_nina.pueblo || null
      if (datos_nina.comunidad_linguistica !== undefined)  ninaUpd.comunidad_linguistica = datos_nina.comunidad_linguistica || null
      if (Object.keys(ninaUpd).length > 0) {
        await Nina.update(ninaUpd, { where: { id: caso.nina_id }, transaction: t })
      }
    }

    // 3. Actualizar historial educativo y centro educativo
    const se = situacion_educativa || {}
    if (caso.nina_id && Object.values(se).some(v => v !== undefined && v !== null && v !== '')) {
      let centroId = null

      if (se.codigo_udi || se.nombre_centro_educativo) {
        let centro = null
        if (se.codigo_udi) {
          centro = await CentroEducativo.findOne({ where: { codigo_udi: se.codigo_udi }, transaction: t })
          if (centro) {
            await centro.update({
              nombre:       se.nombre_centro_educativo || centro.nombre,
              direccion:    se.direccion     || centro.direccion,
              sector:       se.sector        || centro.sector,
              jornada:      se.jornada       || centro.jornada,
              area:         se.area          || centro.area,
              ...(se.municipio_id ? { municipio_id: Number(se.municipio_id) } : {})
            }, { transaction: t })
          } else if (se.municipio_id) {
            centro = await CentroEducativo.create({
              codigo_udi:   se.codigo_udi,
              nombre:       se.nombre_centro_educativo || se.codigo_udi,
              direccion:    se.direccion    || null,
              municipio_id: Number(se.municipio_id),
              sector:       se.sector       || null,
              jornada:      se.jornada      || null,
              area:         se.area         || null,
            }, { transaction: t })
          }
        } else if (se.nombre_centro_educativo && se.municipio_id) {
          const [ce] = await CentroEducativo.findOrCreate({
            where: { nombre: se.nombre_centro_educativo, municipio_id: Number(se.municipio_id) },
            defaults: {
              codigo_udi:   `AUTO-${Date.now()}`,
              nombre:       se.nombre_centro_educativo,
              direccion:    se.direccion    || null,
              municipio_id: Number(se.municipio_id),
              sector:       se.sector       || null,
              jornada:      se.jornada      || null,
              area:         se.area         || null,
            },
            transaction: t
          })
          centro = ce
        }
        if (centro) centroId = centro.id
      }

      const historialExistente = await HistorialEducativo.findOne({
        where: { nina_id: caso.nina_id },
        transaction: t
      })

      const historialData = {
        nina_id:             caso.nina_id,
        centro_educativo_id: centroId || historialExistente?.centro_educativo_id || null,
        codigo_personal:     se.codigo_personal || null,
        status_actual:       se.status_actual   || null,
        grado:               se.grado           || null,
        nivel:               se.nivel           || null,
        resultado:           se.resultado       || null,
        anio:                se.anio ? Number(se.anio) : null,
      }

      if (historialExistente) {
        await historialExistente.update(historialData, { transaction: t })
      } else if (se.grado || centroId) {
        await HistorialEducativo.create(historialData, { transaction: t })
      }
    }

    await t.commit()
    return res.json({ success: true, message: 'Caso actualizado', data: { id: caso.id } })
  } catch (error) {
    await t.rollback()
    console.error(error)
    return res.status(500).json({ success: false, message: 'Error actualizando caso', error: error.message })
  }
}