import multer from 'multer'
import express from 'express'
import { uploadExcel, CargaMasiva, ObtenerHistorial } from '../controllers/UploadController.js'
import { verifyToken }  from '../middleware/verifyToken.js'
import { requireRole } from '../middleware/requireRole.js'

const storage = multer.memoryStorage()

const fileFilter = (req, file, cb) => {
  const allowed = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
  ]
  allowed.includes(file.mimetype) ? cb(null, true) : cb(new Error('Solo se permiten archivos Excel'))
}

const upload = multer({ storage, fileFilter, limits: { fileSize: 100 * 1024 * 1024 } })

const router = express.Router()

router.get('/historial',  verifyToken, requireRole('admin'), ObtenerHistorial)
router.post('/excel',     upload.single('file'), uploadExcel)
router.post('/masivo',    verifyToken, requireRole('admin'), upload.single('file'), CargaMasiva)

export default router
