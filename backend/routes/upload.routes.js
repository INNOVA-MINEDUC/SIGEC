import multer from 'multer'
import express from 'express'
import {
  uploadExcel
} from '../controllers/UploadController.js'


const storage = multer.memoryStorage()

const fileFilter = (req, file, cb) => {

  const allowedMimeTypes = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel'
  ]

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error('Solo se permiten archivos Excel'))
  }
}

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 
  }
})


const router = express.Router()

router.post(
  '/excel',
  upload.single('file'),
  uploadExcel
)

export default router

