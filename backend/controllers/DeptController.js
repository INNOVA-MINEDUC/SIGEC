// controllers/DepartamentoController.js

import Departamento from "../models/Departamento.js"
import Departamental from "../models/Departamental.js"
import Municipio from "../models/Municipio.js"

export const ObtenerDepartamentos = async (req, res) => {

  try {

    const departamentos = await Departamento.findAll({

      order: [

        ['nombre', 'ASC']

      ]

    })

    return res.status(200).json({

      success: true,

      total: departamentos.length,

      data: departamentos

    })

  } catch (error) {

    console.log(error)

    return res.status(500).json({

      success: false,

      message: 'Error obteniendo departamentos',

      error: error.message

    })

  }

}


/* ======================================================
MUNICIPIOS
====================================================== */

export const ObtenerMunicipios = async (req, res) => {

  try {

    const { departamento_id } = req.query

    const where = departamento_id ? { departamento_id } : {}

    const municipios = await Municipio.findAll({

      where,

      include: [

        {

          model: Departamento,

          as: 'departamento'

        }

      ],

      order: [

        ['nombre', 'ASC']

      ]

    })

    return res.status(200).json({

      success: true,

      total: municipios.length,

      data: municipios

    })

  } catch (error) {

    console.log(error)

    return res.status(500).json({

      success: false,

      message: 'Error obteniendo municipios',

      error: error.message

    })

  }

}


/* ======================================================
DEPARTAMENTALES (DIDEDUC)
====================================================== */

export const ObtenerDepartamentales = async (req, res) => {

  try {

    const departamentales = await Departamental.findAll({

      include: [

        {

          model: Departamento,

          as: 'departamento'

        }

      ],

      order: [

        ['nombre', 'ASC']

      ]

    })

    return res.status(200).json({

      success: true,

      total: departamentales.length,

      data: departamentales

    })

  } catch (error) {

    console.log(error)

    return res.status(500).json({

      success: false,

      message: 'Error obteniendo departamentales',

      error: error.message

    })

  }

}


