import Caso from "../models/Caso.js"
import Nina from "../models/Niña.js"
import HistorialEducativo from "../models/HistorialEducativo.js"
import CentroEducativo from "../models/CentroEducativo.js"

export const getAllNinas = async (req, res) => {

  try {

   const ninas = await Nina.findAll({

  include: [

    {
      model: Caso,
      as: 'caso',
    },


    {
      model: HistorialEducativo,
      as: 'historiales',

      include: [

        {
          model: CentroEducativo,
          as: 'centroEducativo',
        },

      ]

    }

  ],

  order: [['id', 'DESC']]

})

    return res.status(200).json({

      ok: true,

      total: ninas.length,

      data: ninas,

    })

  } catch (error) {

    console.error(error)

    return res.status(500).json({

      ok: false,

      message: 'Error obteniendo las niñas',

      error: error.message,

    })

  }

}

// =====================================================
// OBTENER UNA NIÑA POR ID
// =====================================================

export const getNinaById = async (req, res) => {

  try {

    const { id } = req.params

    const nina = await Nina.findByPk(id, {

      include: [

        {
          model: Caso,
        },

        {
          model: HistorialEducativo,

          include: [

            {
              model: CentroEducativo,
            },

          ]

        }

      ]

    })

    if (!nina) {

      return res.status(404).json({

        ok: false,

        message: 'Niña no encontrada',

      })

    }

    return res.status(200).json({

      ok: true,

      data: nina,

    })

  } catch (error) {

    console.error(error)

    return res.status(500).json({

      ok: false,

      message: 'Error obteniendo la niña',

      error: error.message,

    })

  }

}

// =====================================================
// BUSCAR POR CUI
// =====================================================

export const getNinaByCui = async (req, res) => {

  try {

    const { cui } = req.params

    const nina = await Nina.findOne({

      where: {
        cui,
      },

      include: [

        {
          model: Caso,
        },

        {
          model: HistorialEducativo,

          include: [

            {
              model: CentroEducativo,
            },

          ]

        }

      ]

    })

    if (!nina) {

      return res.status(404).json({

        ok: false,

        message: 'Niña no encontrada',

      })

    }

    return res.status(200).json({

      ok: true,

      data: nina,

    })

  } catch (error) {

    console.error(error)

    return res.status(500).json({

      ok: false,

      message: 'Error buscando niña',

      error: error.message,

    })

  }

}