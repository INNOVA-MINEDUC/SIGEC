import { Router } from "express";

import {
  CreateQueja
} from "../controllers/QuejaController.js";

const router = Router();

router.post("/", CreateQueja);


export default router;