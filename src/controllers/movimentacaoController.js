import { openDb } from "../db/initDb.js";

async function registrarEntrada(req, res) {
  try {
    const { produto_id, quantidade } = req.body;

    if (!produto_id || !quantidade || quantidade <= 0) {
      return res.status(400).json({
        erro: "ID do produto e quantidade positiva são obrigatórios.",
      });
    }

    const db = await openDb();
    const produto = await db.get(`SELECT id FROM produtos WHERE id = ?`, [
      produto_id,
    ]);

    if (!produto)
      return res.status(404).json({ erro: "Produto não encontrado." });

    await db.run(
      `UPDATE produtos SET quantidade = quantidade + ? WHERE id = ?`,
      [quantidade, produto_id],
    );
    await db.run(
      `INSERT INTO movimentacoes (produto_id, tipo, quantidade, data_hora, usuario_id) VALUES (?, 'entrada', ?, ?, ?)`,
      [produto_id, quantidade, new Date().toISOString(), req.user.id], //
    );

    res.status(201).json({ mensagem: "Entrada registrada com sucesso!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: "Erro ao registrar entrada." });
  }
}

async function registrarSaida(req, res) {
  try {
    const { produto_id, quantidade } = req.body;

    if (!produto_id || !quantidade || quantidade <= 0) {
      return res.status(400).json({
        erro: "ID do produto e quantidade positiva são obrigatórios.",
      });
    }

    const db = await openDb();
    const produto = await db.get(
      `SELECT quantidade FROM produtos WHERE id = ?`,
      [produto_id],
    );

    if (!produto)
      return res.status(404).json({ erro: "Produto não encontrado." });

    if (produto.quantidade < quantidade) {
      return res.status(400).json({
        erro: `Estoque insuficiente. Quantidade atual: ${produto.quantidade}`,
      });
    }

    await db.run(
      `UPDATE produtos SET quantidade = quantidade - ? WHERE id = ?`,
      [quantidade, produto_id],
    );
    await db.run(
      `INSERT INTO movimentacoes (produto_id, tipo, quantidade, data_hora, usuario_id) VALUES (?, 'saida', ?, ?, ?)`,
      [produto_id, quantidade, new Date().toISOString(), req.user.id], //
    );

    res.status(201).json({ mensagem: "Saída registrada com sucesso" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: "Erro ao registrar saída." });
  }
}

async function listarMovimentacoes(req, res) {
  try {
    const db = await openDb();
    const movs = await db.all(
      `SELECT * FROM movimentacoes ORDER BY data_hora DESC`,
    );
    res.json(movs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: "Erro ao listar movimentações." });
  }
}

export { registrarEntrada, registrarSaida, listarMovimentacoes };