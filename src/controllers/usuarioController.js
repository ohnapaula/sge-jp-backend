import bcrypt from "bcrypt";
import { openDb } from "../db/initDb.js";

async function cadastrarUsuario(req, res) {
  try {
    const { usuario, senha, perfil } = req.body;

    if (!usuario || !senha || !perfil) {
      return res
        .status(400)
        .json({ erro: "Usuário, senha e perfil são obrigatórios." });
    }

    const db = await openDb();
    const hash = await bcrypt.hash(senha, 10);

    await db.run(
      `INSERT INTO usuarios (usuario, senha, perfil) VALUES (?, ?, ?)`,
      [usuario, hash, perfil],
    );

    res.status(201).json({ mensagem: "Usuário criado com sucesso!" });
  } catch (error) {
    if (error.message.includes("UNIQUE")) {
      return res
        .status(409)
        .json({ erro: "Este nome de usuário já está em uso." });
    }
    if (error.message.includes("CHECK constraint failed")) {
      return res
        .status(400)
        .json({ erro: "Perfil inválido. Use admin, estoquista ou consulta." });
    }
    console.error(error);
    res.status(500).json({ erro: "Erro interno ao criar usuário." });
  }
}

async function listarUsuarios(req, res) {
  try {
    const db = await openDb();
    const usuarios = await db.all(`SELECT id, usuario, perfil FROM usuarios`);
    res.json(usuarios);
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: "Erro ao listar usuários." });
  }
}

async function atualizarPerfil(req, res) {
  try {
    const { perfil } = req.body;
    const { id } = req.params;

    if (!perfil) {
      return res.status(400).json({ erro: "O campo perfil é obrigatório." });
    }

    const db = await openDb();
    const result = await db.run(`UPDATE usuarios SET perfil = ? WHERE id = ?`, [
      perfil,
      id,
    ]);

    if (result.changes === 0) {
      return res.status(404).json({ erro: "Usuário não encontrado." });
    }

    res.json({ mensagem: "Perfil atualizado com sucesso" });
  } catch (error) {
    if (error.message.includes("CHECK constraint failed")) {
      return res
        .status(400)
        .json({ erro: "Perfil inválido. Use admin, estoquista ou consulta." });
    }
    console.error(error);
    res.status(500).json({ erro: "Erro ao atualizar perfil." });
  }
}

export { cadastrarUsuario, listarUsuarios, atualizarPerfil };