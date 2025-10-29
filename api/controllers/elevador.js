import { db } from '../db.js';

export const getElavadores = (_, res) => {
  const q = "SELECT * FROM elevadores";

  db.query(q, (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).json("Erro interno no servidor");
    }
    return res.status(200).json(data);
  });
};

export const addElevador = (req, res) => {
  const q = "INSERT INTO elevadores (`nome_unidade`, `pais`, `cidade`, `responsavel_tecnico`, `status`, `custo_estimado`, `data_inicio`, `previsao_termino`) VALUES (?)";

  const values = [
    req.body.nome_unidade,
    req.body.pais,
    req.body.cidade,
    req.body.responsavel_tecnico,
    req.body.status,
    req.body.custo_estimado, 
    req.body.data_inicio,
    req.body.previsao_termino,
  ];

  db.query(q, [values], (err) => {
    if (err) return res.status(500).json(err);
    return res.status(201).json("Instalação criada com sucesso.");
  });
};

export const updateElevador = (req, res) => {
  const instalacaoId = req.params.id; 

  const q = "UPDATE elevadores SET `nome_unidade` = ?, `pais` = ?, `cidade` = ?, `responsavel_tecnico` = ?, `status` = ?, `custo_estimado` = ?, `data_inicio` = ?, `previsao_termino` = ? WHERE `id_elevador` = ?";

  const values = [
    req.body.nome_unidade,
    req.body.pais,
    req.body.cidade,
    req.body.responsavel_tecnico,
    req.body.status,
    req.body.custo_estimado,
    req.body.data_inicio,
    req.body.previsao_termino,
  ];

  db.query(q, [...values, instalacaoId], (err) => {
    if (err) return res.status(500).json(err);
    return res.status(200).json("Instalação atualizada com sucesso.");
  });
};

export const deleteElevador = (req, res) => {
  const instalacaoId = req.params.id;
  
  const q = "DELETE FROM elevadores WHERE `id_elevador` = ?";

  db.query(q, [instalacaoId], (err) => {
    if (err) return res.status(500).json(err);
    return res.status(200).json("Instalação deletada com sucesso.");
  });
};