import { openDb } from "../db/initDb.js";

async function verificarEstoque(req, res) {
  try {
    const db = await openDb();
    const produtos = await db.all(
      `SELECT * FROM produtos WHERE quantidade <= minimo`,
    );
    res.json(produtos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: "Erro ao gerar relatório de baixo estoque." });
  }
}

export default verificarEstoque;