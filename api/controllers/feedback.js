import { db } from '../db.js';

// Pegando feed

export const getFeedbacks = (_, res) => {
    const q = "SELECT * FROM feedback";

    db.query(q, (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).json("Erro interno no servidor");
        }
        return res.status(200).json(data);
    });
};

// Pegando feed de um elevador específico

export const getFeedbackByElevador = (req, res) => {
    const elevadorId = req.params.id;
    const q = "SELECT * FROM feedback WHERE id_elevador = ? ";

    db.query(q, [elevadorId], ( err, data ) => {
        if (err) {
            console.error(err);
            return res.status(500).json("Erro interno no servidor");
        }
        return res.status(200).json(data);
    });
};

// Adicionando feed

export const addFeedback = (req, res) => {
    const q = "INSERT INTO feedback (`id_elevador`, `nome_cliente`, `nota`, `comentario`) VALUES (?)";

    const values = [
        req.body.id_elevador,
        req.body.nome_cliente,
        req.body.nota,
        req.body.comentario,
    ];

    db.query(q, [ values ], (err) => {
        if (err) return res.status(500).json(err);
        return res.status(201).json("Feedback enviado com sucesso.");
    });
};

// Média geral de satisfação

export const getMediaSatisfacao = (_, res) => {
    const q = "SELECT ROUND(AVG(nota), 2) as media, COUNT(*) as total FROM feedback";

    db.query(q, ( err, data ) => {
        if (err) {
            console.error(err);
            return res.status(500).json("Erro interno no servidor");
        }
        return res.status(200).json(data[0]);
    });
};

// Cálculo média satisfação por elevador 

export const getMediaSatisfacaoByElevador = (req, res) => {
    const elevadorId = req.params.id;
    const q = "SELECT ROUND(AVG(nota), 2) as media, COUNT(*) as total FROM feedback WHERE id_elevador = ?";

    db.query(q, [elevadorId], (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).json("Erro interno no servidor");
        }
        return res.status(200).json(data[0]);
    });
};

// Delete

export const deleteFeedback = (req, res) => {
    const feedbackId = req.params.id;

    const q = "DELETE FROM feedback WHERE `id_cliente` = ?";

    db.query(q, [feedbackId], (err) => {
        if (err) return res.status(500).json(err);
        return res.status(200).json("Feedback deletado com sucesso");
    });
};