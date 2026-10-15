import User from "../models/User.js";
import bcrypt from "bcryptjs";
import Role from "../models/Role.js";
import Departamento from "../models/Departamento.js";
import { registrarAuditoria } from "../utils/auditoria.js";
import { ROLES_CON_ALCANCE_DEPARTAMENTAL } from "../helpers/permisos.js";

// Relaciones que se devuelven con cada usuario (sin el hash de la contraseña)
const USER_QUERY = {
  attributes: { exclude: ["password"] },
  include: [
    { model: Role, as: "role" },
    { model: Departamento, as: "departamento", attributes: ["id", "nombre"] },
  ],
};

// Valida el rol y el departamento que se asignan a un usuario. El departamento
// solo aplica, y es obligatorio, para los roles con alcance departamental
// ("consulta"); para los demás roles se guarda null.
async function resolverAsignacion(roleId, departamentoId) {
  const role = await Role.findByPk(roleId);
  if (!role) return { error: "Rol no válido" };
  if (!ROLES_CON_ALCANCE_DEPARTAMENTAL.includes(role.name)) return { departamento_id: null };
  if (!departamentoId) return { error: "El perfil Consulta requiere un departamento asignado" };
  const departamento = await Departamento.findByPk(departamentoId);
  if (!departamento) return { error: "Departamento no válido" };
  return { departamento_id: departamento.id };
}

export const createUser = async (req, res) => {
  try {
    const { name, email, password, roleId, departamento_id } = req.body;

    const asignacion = await resolverAsignacion(roleId, departamento_id);
    if (asignacion.error) return res.status(400).json({ message: asignacion.error });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      roleId,
      departamento_id: asignacion.departamento_id,
    });

    registrarAuditoria({
      usuario_id:  req.user?.id,
      accion:      'crear_usuario',
      entidad:     'User',
      entidad_id:  user.id,
      descripcion: `Creó al usuario ${user.name} (${user.email})`,
    })

    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};





export const getUsers = async (req, res) => {
  try {
    const users = await User.findAll(USER_QUERY);

    res.json(users);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};


export const getUserById = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, USER_QUERY);

    if (!user) {
      return res.status(404).json({
        message: "Usuario no encontrado",
      });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};


export const updateUser = async (req, res) => {
  try {
    const { name, email, password, roleId, isActive, departamento_id } = req.body;

    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({
        message: "Usuario no encontrado",
      });
    }

    const updates = {};
    if (name !== undefined)     updates.name = name;
    if (email !== undefined)    updates.email = email;
    if (roleId !== undefined)   updates.roleId = roleId;
    if (isActive !== undefined) updates.isActive = isActive;

    // Al cambiar el rol o el departamento se vuelve a validar la combinación
    if (roleId !== undefined || departamento_id !== undefined) {
      const asignacion = await resolverAsignacion(
        roleId ?? user.roleId,
        departamento_id !== undefined ? departamento_id : user.departamento_id
      );
      if (asignacion.error) return res.status(400).json({ message: asignacion.error });
      updates.departamento_id = asignacion.departamento_id;
    }

    // Solo se actualiza la contraseña si se envió una nueva; de lo contrario se conserva la actual
    if (password) {
      updates.password = await bcrypt.hash(password, 10);
    }

    await user.update(updates);

    registrarAuditoria({
      usuario_id:  req.user?.id,
      accion:      'actualizar_usuario',
      entidad:     'User',
      entidad_id:  user.id,
      descripcion: `Actualizó al usuario ${user.name} (${user.email})`,
    })

    res.json(user);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};


export const toggleActive = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Evitar que el admin se inActive a sí mismo
    if (req.user?.id === user.id) {
      return res.status(400).json({ message: "No puedes inactivar tu propia cuenta" });
    }

    await user.update({ isActive: !user.isActive });

    registrarAuditoria({
      usuario_id:  req.user?.id,
      accion:      user.isActive ? 'activar_usuario' : 'desactivar_usuario',
      entidad:     'User',
      entidad_id:  user.id,
      descripcion: `${user.isActive ? 'Activó' : 'Desactivó'} al usuario ${user.name} (${user.email})`,
    })

    res.json({ id: user.id, isActive: user.isActive });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};