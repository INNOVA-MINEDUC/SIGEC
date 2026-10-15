import { Router } from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import { cargarUsuarioActual } from "../middleware/cargarUsuario.js";
import { requireRole } from "../middleware/requireRole.js";
import { ROLES_EDICION_CASOS } from "../helpers/permisos.js";

import {
  ObtenerCasos,
  FiltrarCasos,
  ObtenerCasosFiltrados,
  ObtenerCasoPorId,
  ActualizarCaso,
  RegistrarCaso,
  GenerarNumeroCaso
} from "../controllers/CasoController.js";

const router = Router();

// Todas las rutas de casos requieren sesión. cargarUsuarioActual toma el rol y
// el departamento vigentes desde la BD; los controladores de lectura aplican
// el alcance departamental (req.alcanceDepartamentoId) de los roles de consulta.
router.use(verifyToken, cargarUsuarioActual);

// Registrar y actualizar: solo roles con permiso de edición (no los de consulta)
const soloEdicion = requireRole(...ROLES_EDICION_CASOS);

router.get("/generar-numero", soloEdicion, GenerarNumeroCaso);
router.get("/", ObtenerCasosFiltrados);
router.get("/:id", ObtenerCasoPorId);
router.post("/", FiltrarCasos);
router.post("/registrar", soloEdicion, RegistrarCaso);
router.put("/:id", soloEdicion, ActualizarCaso);

export default router;
