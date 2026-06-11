import { Op } from "sequelize";
import Auditoria from "../models/Auditoria.js";
import User from "../models/User.js";
import { registrarAuditoria } from "../utils/auditoria.js";

const ACCIONES_DESCARGA = {
  pdf: "descargar_pdf",
  excel: "descargar_excel",
};

// GET /api/v1/auditoria  — listado paginado, filtrable (solo admin)
export const ObtenerAuditorias = async (req, res) => {
  try {
    const { accion, usuario_id, desde, hasta, page = 1, limit = 20 } = req.query;

    const where = {};
    if (accion)     where.accion     = accion;
    if (usuario_id) where.usuario_id = usuario_id;
    if (desde || hasta) {
      where.createdAt = {};
      if (desde) where.createdAt[Op.gte] = new Date(`${desde}T00:00:00`);
      if (hasta) where.createdAt[Op.lte] = new Date(`${hasta}T23:59:59`);
    }

    const limitNum = Math.min(Number(limit) || 20, 100);
    const offset = (Math.max(Number(page) || 1, 1) - 1) * limitNum;

    const { rows, count } = await Auditoria.findAndCountAll({
      where,
      include: [{ model: User, as: "usuario", attributes: ["id", "name", "email"] }],
      order: [["createdAt", "DESC"]],
      limit: limitNum,
      offset,
    });

    res.json({
      success: true,
      data: rows,
      total: count,
      page: Number(page) || 1,
      totalPages: Math.ceil(count / limitNum),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/v1/auditoria/descarga — registra una descarga de PDF/Excel
export const RegistrarDescarga = async (req, res) => {
  try {
    const { tipo, descripcion } = req.body;
    const accion = ACCIONES_DESCARGA[tipo];

    if (!accion) {
      return res.status(400).json({ success: false, message: "Tipo de descarga no válido (use 'pdf' o 'excel')" });
    }

    await registrarAuditoria({
      usuario_id: req.user?.id,
      accion,
      entidad: "Reporte",
      descripcion: descripcion || null,
    });

    res.status(201).json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
