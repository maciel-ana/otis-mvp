import express from 'express';
import cors from 'cors';
import elevadorRoutes from './routes/elevadores.js';
import feedbackRoutes from './routes/feedback.js';

const app = express();

app.use(express.json());
app.use(cors());

app.use("/api/elevadores", elevadorRoutes);
app.use("/api/feedback", feedbackRoutes);

app.listen(8800, () => {
    console.log("API conectada e rodando na porta 8800");
});