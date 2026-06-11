import User from "../models/User.js";
import bcrypt from "bcryptjs";
import Role from "../models/Role.js";
import { registrarAuditoria } from "../utils/auditoria.js";

export const createUser = async (req, res) => {
  try {
    const { name, email, password, roleId } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      roleId,
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
    const users = await User.findAll({
      include: [
        {
          model: Role,
          as: "role",
        },
      ],
    });

    res.json(users);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};


export const getUserById = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      include: [
        {
          model: Role,
          as: "role",
        },
      ],
    });

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
    const { name, email, password, roleId, isActive } = req.body;

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