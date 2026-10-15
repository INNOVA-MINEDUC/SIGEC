import User from '../models/User.js'
import Role from '../models/Role.js'
import { ROLES_CON_ALCANCE_DEPARTAMENTAL } from '../helpers/permisos.js'

// Se usa después de verifyToken. Relee al usuario desde la BD para que los
// permisos reflejen su rol, estado y departamento actuales y no los del token,
// que puede tener hasta un día de antigüedad.
//
// Deja en la petición:
//   req.user.role               → rol vigente del usuario
//   req.alcanceDepartamentoId   → departamento al que se limita su acceso a los
//                                 casos, o null si el rol tiene alcance nacional
export const cargarUsuarioActual = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user?.id, {
      attributes: ['id', 'email', 'isActive', 'departamento_id'],
      include: { model: Role, as: 'role', attributes: ['name'] },
    })
    if (!user) return res.status(401).json({ ok: false, message: 'Usuario no encontrado' })
    if (!user.isActive) return res.status(403).json({ ok: false, message: 'Usuario inactivo' })

    req.user = { ...req.user, role: user.role?.name ?? null, departamento_id: user.departamento_id ?? null }
    req.alcanceDepartamentoId = null

    if (ROLES_CON_ALCANCE_DEPARTAMENTAL.includes(req.user.role)) {
      // Sin departamento asignado no se concede acceso a ningún caso
      if (!user.departamento_id) {
        return res.status(403).json({
          ok: false,
          message: 'Su usuario no tiene un departamento asignado. Contacte al administrador.',
        })
      }
      req.alcanceDepartamentoId = Number(user.departamento_id)
    }

    next()
  } catch (error) {
    console.error(error)
    return res.status(500).json({ ok: false, message: 'Error verificando permisos' })
  }
}
