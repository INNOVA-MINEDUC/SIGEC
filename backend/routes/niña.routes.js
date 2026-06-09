// routes/ninasRoutes.js

import { Router } from 'express'

import {

  getAllNinas,
  getNinaById,
  getNinaByCui,

} from '../controllers/NiñaController.js'

const router = Router()

// =====================================================
// RUTAS
// =====================================================

router.get('/', getAllNinas)

router.get('/id/:id', getNinaById)

router.get('/cui/:cui', getNinaByCui)

export default router