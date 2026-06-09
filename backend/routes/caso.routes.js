import { Router } from "express";

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

router.get("/generar-numero", GenerarNumeroCaso);
router.get("/", ObtenerCasosFiltrados);
router.get("/:id", ObtenerCasoPorId);
router.post("/", FiltrarCasos);
router.post("/registrar", RegistrarCaso);
router.put("/:id", ActualizarCaso);

export default router;
