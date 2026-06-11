import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
dotenv.config()

// A diferencia de verifyToken, NO rechaza la petición si no hay token
// o si es inválido. Solo adjunta req.user cuando es posible, para
// que rutas públicas/sin protección puedan registrar quién hizo la acción.
export const attachUser = (req, res, next) => {
  const header = req.headers.authorization
  if (header?.startsWith('Bearer ')) {
    try {
      req.user = jwt.verify(header.split(' ')[1], process.env.JWT_SECRET)
    } catch {
      // token inválido o expirado: continuar sin usuario
    }
  }
  next()
}
