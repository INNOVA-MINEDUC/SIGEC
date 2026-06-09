import { Router } from "express";
import { verifyToken }  from "../middleware/verifyToken.js";
import { requireRole } from "../middleware/requireRole.js";
import {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  toggleActive,
} from "../controllers/UserController.js";

const router = Router();

// Todas las rutas de gestión de usuarios: solo admin
router.use(verifyToken, requireRole('admin'))

router.post("/",                  createUser);
router.get("/",                   getUsers);
router.get("/:id",                getUserById);
router.put("/:id",                updateUser);
router.patch("/:id/toggle-active", toggleActive);

export default router;