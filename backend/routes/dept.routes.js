import { Router } from "express";

import {
  ObtenerDepartamentos,
  ObtenerMunicipios,
  ObtenerDepartamentales,
} from "../controllers/DeptController.js";

const router = Router();

router.get("/", ObtenerDepartamentos);
router.get("/municipios", ObtenerMunicipios);
router.get("/departamentales", ObtenerDepartamentales);


export default router;