import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

const Auditoria = sequelize.define(
  "Auditoria",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    usuario_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    accion: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },

    entidad: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },

    entidad_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "auditorias",
    timestamps: true,
    updatedAt: false,
  }
);

export default Auditoria;
