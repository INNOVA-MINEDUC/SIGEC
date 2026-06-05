// controllers/DepartamentoController.js

import Departamento from "../models/Departamento.js"

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