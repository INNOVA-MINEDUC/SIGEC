import CasoEmbarazo from "../models/CasoEmbarazo.js";
import Nina from "../models/Nina.js";
import Municipio from "../models/Municipio.js";
import Departamento from "../models/Departamento.js";
import Pueblo from "../models/Pueblo.js";
import ComunidadLinguistica from "../models/ComunidadLinguistica.js";
import HistorialEducativo from "../models/HistorialEducativo.js";
import CentroEducativo from "../models/CentroEducativo.js";
import CargaArchivo from "../models/CargaArchivo.js";

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
      direccion_departamental_educacion,
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
              model: Pueblo,
              as: "pueblo"
            },
            {
              model: ComunidadLinguistica,
              as: "comunidadLinguistica"
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
          model: CargaArchivo,
          as: "cargaArchivo"
        }
      ],
      order: [["createdAt", "DESC"]]
    });

    const filtrados = casos.filter((caso) => {
      const nina = caso.nina;
      const municipioNina = nina?.municipio;
      const departamentoNina = municipioNina?.departamento;
      const historial = nina?.historialEducativo || [];

      if (departamento && String(departamentoNina?.id) !== String(departamento)) return false;
      if (municipio && String(municipioNina?.id) !== String(municipio)) return false;

      if (estado && String(caso.estado) !== String(estado)) return false;

      if (
        direccion_departamental_educacion &&
        String(caso.direccion_departamental_educacion).toLowerCase() !== String(direccion_departamental_educacion).toLowerCase()
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

      if (pueblo && String(nina?.pueblo?.id ?? nina?.pueblo_id) !== String(pueblo)) return false;
      if (lengua && String(nina?.comunidadLinguistica?.id ?? nina?.comunidad_linguistica_id) !== String(lengua)) return false;

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
        const existeCentro = historial.some((h) => String(h.centroEducativo?.id) === String(centro_educativo));
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