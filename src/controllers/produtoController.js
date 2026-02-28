import { openDb } from "../db/initDb.js";

async function cadastrarProduto(req, res) {
  try {
    const { nome, quantidade = 0, minimo } = req.body;

    if (!nome || minimo === undefined) {
      return res
        .status(400)
        .json({ erro: "Nome e quantidade mínima são obrigatórios." });
    }

    if (quantidade < 0) {
      return res
        .status(400)
        .json({ erro: "A quantidade inicial não pode ser negativa." });
    }

    const db = await openDb();
    await db.run(
      `INSERT INTO produtos (nome, quantidade, minimo) VALUES (?, ?, ?)`,
      [nome, quantidade, minimo],
    );
    res.status(201).json({ mensagem: "Produto criado com sucesso!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: "Erro ao criar produto." });
  }
}

async function listarProdutos(req, res) {
  try {
    const db = await openDb();
    const produtos = await db.all(`SELECT * FROM produtos`);
    res.json(produtos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: "Erro ao listar produtos." });
  }
}

async function buscarProdutoPorId(req, res) {
  try {
    const db = await openDb();
    const produto = await db.get(`SELECT * FROM produtos WHERE id = ?`, [
      req.params.id,
    ]);

    if (!produto)
      return res.status(404).json({ erro: "Produto não encontrado." });

    res.json(produto);
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: "Erro ao buscar produto." });
  }
}

async function atualizarProduto(req, res) {
  try {
    const { nome, minimo } = req.body;
    const db = await openDb();
    const result = await db.run(
      `UPDATE produtos SET nome = COALESCE(?, nome), minimo = COALESCE(?, minimo) WHERE id = ?`,
      [nome, minimo, req.params.id],
    );

    if (result.changes === 0)
      return res.status(404).json({ erro: "Produto não encontrado." });

    res.json({ mensagem: "Produto atualizado com sucesso!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: "Erro ao atualizar produto." });
  }
}

async function excluirProduto(req, res) {
  try {
    const db = await openDb();
    const result = await db.run(`DELETE FROM produtos WHERE id = ?`, [
      req.params.id,
    ]);

    if (result.changes === 0)
      return res.status(404).json({ erro: "Produto não encontrado." });

    res.json({ mensagem: "Produto excluído com sucesso!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: "Erro ao excluir produto." });
  }
}

export {
  cadastrarProduto,
  listarProdutos,
  buscarProdutoPorId,
  atualizarProduto,
  excluirProduto,
};