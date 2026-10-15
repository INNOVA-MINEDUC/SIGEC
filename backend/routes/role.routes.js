import { Router } from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import { requireRole } from "../middleware/requireRole.js";

import {
  createRole,
  getRoles,
  getRoleById,
  updateRole,
  deleteRole,
} from "../controllers/RoleController.js";

const router = Router();

// Catálogo de roles: solo lo consulta y administra el administrador
// (lo usa la pantalla de gestión de usuarios para asignar perfiles).
router.use(verifyToken, requireRole('admin'))

router.post("/", createRole);

router.get("/", getRoles);

router.get("/:id", getRoleById);

router.put("/:id", updateRole);

router.delete("/:id", deleteRole);

export default router;
