import express from 'express'
import { getElavadores, addElevador, updateElevador, deleteElevador } from '../controllers/elevador.js'

const router = express.Router();

router.get("/", getElavadores);

router.post("/", addElevador);

router.put("/:id", updateElevador);

router.delete("/:id", deleteElevador)

export default router;