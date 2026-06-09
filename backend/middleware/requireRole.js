// Middleware de autorización por rol
// Uso: requireRole('admin')  o  requireRole('admin', 'moderator')
export const requireRole = (...roles) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ ok: false, message: 'No autenticado' })
  }
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({
      ok: false,
      message: `Acceso denegado. Se requiere rol: ${roles.join(' o ')}`
    })
  }
  next()
}
