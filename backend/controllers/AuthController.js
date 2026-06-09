import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import User from "../models/User.js"
import Role from "../models/Role.js"
import dotenv from 'dotenv'
dotenv.config()

const SECRET = process.env.JWT_SECRET || 'secret'



export const AuthLogin = async (req, res) => {
  try {
    const { email, password } = req.body

    // 1. Buscar usuario
    const user = await User.findOne({
      where: { email },
      include: {
        model: Role,
        as: 'role'
      }
    })

    if (!user) {
      return res.status(404).json({ message: 'Credenciales incorrectas' })
    }

    if (!user.isActive) {
      return res.status(403).json({ 
        message: 'Usuario inactivo. Contacte al administrador.' 
      })
    }

    // 3. Comparar contraseña
    const validPassword = await bcrypt.compare(password, user.password)

    if (!validPassword) {
      return res.status(401).json({ message: 'Credenciales incorrectas' })
    }


    console.log({
        id: user.id,
        email: user.email,
        role: user.role?.name 
      })

    // 4. Crear token
    const roleName = user.role?.name ?? null
    const token = jwt.sign(
      { id: user.id, email: user.email, role: roleName },
      SECRET,
      { expiresIn: '1d' }
    )

    // 5. Respuesta
    return res.json({
      message: 'Login exitoso',
      token,
      user: {
        id:    user.id,
        name:  user.name,
        email: user.email,
        role:  roleName,
      }
    })

  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Error en el servidor' })
  }
}

// Valida el token y devuelve datos frescos del usuario desde la BD
export const isAuthenticated = async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) return res.status(401).json({ error: 'No token' })

  try {
    const decoded = jwt.verify(token, SECRET)

    // Re-leer usuario desde BD para obtener el rol actual (no el del JWT que puede ser viejo)
    const user = await User.findByPk(decoded.id, {
      include: { model: Role, as: 'role', attributes: ['name'] }
    })
    if (!user) return res.status(401).json({ error: 'Usuario no encontrado' })
    if (!user.isActive) return res.status(403).json({ error: 'Usuario inactivo' })

    return res.json({
      id:    user.id,
      name:  user.name,
      email: user.email,
      role:  user.role?.name ?? null,
    })
  } catch {
    return res.status(401).json({ error: 'Token inválido' })
  }
}
