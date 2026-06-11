import Auditoria from "../models/Auditoria.js";

// Registra una acción en la bitácora de auditoría.
// No lanza errores: si falla, solo se registra en consola
// para no interrumpir la operación principal.
export const registrarAuditoria = async ({ usuario_id, accion, entidad, entidad_id, descripcion }) => {
  try {
    await Auditoria.create({
      usuario_id:  usuario_id || null,
      accion,
      entidad:     entidad || null,
      entidad_id:  entidad_id || null,
      descripcion: descripcion || null,
    });
  } catch (error) {
    console.error("Error registrando auditoría:", error.message);
  }
};
