import express from 'express';
import {
    getFeedbacks,
    getFeedbackByElevador,
    addFeedback,
    getMediaSatisfacao,
    getMediaSatisfacaoByElevador,
    deleteFeedback
} from '../controllers/feedback.js';

const router = express.Router();

router.get("/", getFeedbacks);
router.get("/elevador/:id", getFeedbackByElevador);
router.post("/", addFeedback);
router.get("/media", getMediaSatisfacao);
router.get("/media/:id", getMediaSatisfacaoByElevador);
router.delete("/:id", deleteFeedback);

export default router;