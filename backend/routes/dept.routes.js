import { Router } from "express";

import {
  ObtenerDepartamentos
} from "../controllers/DeptController.js";

const router = Router();

router.get("/", ObtenerDepartamentos);


export default router;