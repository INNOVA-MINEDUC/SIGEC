import { Router } from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import { requireRole } from "../middleware/requireRole.js";
import { ObtenerAuditorias, RegistrarDescarga } from "../controllers/AuditoriaController.js";

const router = Router();

router.get("/", verifyToken, requireRole("admin"), ObtenerAuditorias);
router.post("/descarga", verifyToken, RegistrarDescarga);

export default router;
