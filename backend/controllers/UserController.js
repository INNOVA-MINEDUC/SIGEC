import User from "../models/User.js";
import bcrypt from "bcryptjs";
import Role from "../models/Role.js";

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

    let hashedPassword = user.password;

    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    await user.update({
      name,
      email,
      password: hashedPassword,
      roleId,
      isActive,
    });

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

    res.json({ id: user.id, isActive: user.isActive });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};