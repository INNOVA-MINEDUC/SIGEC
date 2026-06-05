import Role from "../models/Role.js";


export const createRole = async (req, res) => {

  try {

    const { name, description } = req.body;

    const roleExists = await Role.findOne({
      where: { name }
    });

    if (roleExists) {
      return res.status(400).json({
        message: "El rol ya existe",
      });
    }

    const role = await Role.create({
      name,
      description,
    });

    res.status(201).json(role);

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }

};



export const getRoles = async (req, res) => {

  try {

    const roles = await Role.findAll();

    res.json(roles);

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }

};



export const getRoleById = async (req, res) => {

  try {

    const role = await Role.findByPk(req.params.id);

    if (!role) {

      return res.status(404).json({
        message: "Rol no encontrado",
      });

    }

    res.json(role);

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }

};



export const updateRole = async (req, res) => {

  try {

    const { name, description } = req.body;

    const role = await Role.findByPk(req.params.id);

    if (!role) {

      return res.status(404).json({
        message: "Rol no encontrado",
      });

    }

    await role.update({
      name,
      description,
    });

    res.json(role);

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }

};



export const deleteRole = async (req, res) => {

  try {

    const role = await Role.findByPk(req.params.id);

    if (!role) {

      return res.status(404).json({
        message: "Rol no encontrado",
      });

    }

    await role.destroy();

    res.json({
      message: "Rol eliminado",
    });

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }

};