import { Router } from "express";

import {
  ObtenerCasos,
  FiltrarCasos,
  ObtenerCasosFiltrados
} from "../controllers/CasoController.js";

const router = Router();

router.get("/", ObtenerCasosFiltrados);
router.post("/", FiltrarCasos);


export default router;