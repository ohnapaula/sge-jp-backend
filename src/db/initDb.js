import sqlite3 from "sqlite3";
import { open } from "sqlite";
import bcrypt from "bcrypt";

export async function openDb() {
  return open({
    filename: "./estoque-jp.db", //
    driver: sqlite3.Database,
  });
}

async function setup() {
  try {
    const db = await openDb();

    await db.exec(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        usuario TEXT UNIQUE NOT NULL,
        senha TEXT NOT NULL,
        perfil TEXT CHECK(perfil IN ('admin', 'estoquista', 'consulta')) NOT NULL
      );

      CREATE TABLE IF NOT EXISTS produtos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        quantidade INTEGER DEFAULT 0 CHECK(quantidade >= 0),
        minimo INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS movimentacoes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        produto_id INTEGER,
        tipo TEXT CHECK(tipo IN ('entrada', 'saida')) NOT NULL,
        quantidade INTEGER NOT NULL,
        data_hora TEXT NOT NULL,
        usuario_id INTEGER,
        FOREIGN KEY(produto_id) REFERENCES produtos(id),
        FOREIGN KEY(usuario_id) REFERENCES usuarios(id)
      );
    `);

    const hashAdmin = await bcrypt.hash("adminjp", 10);
    const hashEstoque = await bcrypt.hash("estoquejp", 10);
    const hashConsulta = await bcrypt.hash("consultajp", 10);

    await db.run(
      `INSERT OR IGNORE INTO usuarios (usuario, senha, perfil) VALUES (?, ?, ?)`,
      ["admin", hashAdmin, "admin"],
    );
    await db.run(
      `INSERT OR IGNORE INTO usuarios (usuario, senha, perfil) VALUES (?, ?, ?)`,
      ["edson_estoquista", hashEstoque, "estoquista"],
    );
    await db.run(
      `INSERT OR IGNORE INTO usuarios (usuario, senha, perfil) VALUES (?, ?, ?)`,
      ["daniela_vendedora", hashConsulta, "consulta"],
    );

    const checkProdutos = await db.get(
      "SELECT COUNT(*) as count FROM produtos",
    );

    if (checkProdutos.count === 0) {
      const produtos = [
        { nome: "Notebook Dell Inspiron", quant: 50, min: 10 },
        { nome: "Mouse Sem Fio Logitech", quant: 150, min: 20 },
        { nome: "Teclado Mecânico Redragon", quant: 5, min: 15 }, // Estoque baixo
        { nome: 'Monitor LG 24"', quant: 30, min: 10 },
        { nome: "Cabo HDMI 2m", quant: 200, min: 50 },
        { nome: "SSD Kingston 500GB", quant: 80, min: 20 },
        { nome: "HD Externo Seagate 1TB", quant: 40, min: 15 },
        { nome: "Memória RAM Corsair 8GB", quant: 120, min: 30 },
        { nome: "Placa Mãe Asus TUF", quant: 25, min: 10 },
        { nome: "Processador AMD Ryzen 5", quant: 35, min: 10 },
        { nome: "Placa de Vídeo RTX 3060", quant: 15, min: 5 },
        { nome: "Fonte Corsair 650W", quant: 45, min: 15 },
        { nome: "Gabinete Gamer NZXT", quant: 20, min: 10 },
        { nome: "Headset HyperX Cloud", quant: 60, min: 20 },
        { nome: "Webcam Logitech C920", quant: 8, min: 10 }, // Estoque baixo
        { nome: "Microfone Fifine", quant: 25, min: 10 },
        { nome: "Cooler Master Hyper 212", quant: 50, min: 15 },
        { nome: "Pen Drive SanDisk 64GB", quant: 300, min: 50 },
        { nome: "Roteador TP-Link Gigabit", quant: 40, min: 10 },
        { nome: "Switch Intelbras 8 Portas", quant: 2, min: 5 }, // Estoque baixo
      ];

      for (const p of produtos) {
        await db.run(
          `INSERT INTO produtos (nome, quantidade, minimo) VALUES (?, ?, ?)`,
          [p.nome, p.quant, p.min],
        );
      }

      const agora = new Date().toISOString();
      const movimentacoes = [
        { prod: 1, tipo: "entrada", quant: 50, user: 1 }, // Admin deu entrada no Notebook
        { prod: 2, tipo: "entrada", quant: 150, user: 2 }, // Estoquista deu entrada no Mouse
        { prod: 4, tipo: "entrada", quant: 30, user: 2 }, // Estoquista deu entrada no Monitor
        { prod: 1, tipo: "saida", quant: 5, user: 2 }, // Estoquista tirou 5 Notebooks
        { prod: 2, tipo: "saida", quant: 10, user: 2 }, // Estoquista tirou 10 Mouses
      ];

      for (const m of movimentacoes) {
        await db.run(
          `INSERT INTO movimentacoes (produto_id, tipo, quantidade, data_hora, usuario_id) VALUES (?, ?, ?, ?, ?)`,
          [m.prod, m.tipo, m.quant, agora, m.user],
        );
      }

      console.log("Banco populado: 3 Usuários, 20 Produtos e 5 Movimentações!");
    } else {
      console.log(
        "O banco já possui dados. Nenhuma inserção duplicada foi feita.",
      );
    }
  } catch (error) {
    console.error("Erro ao inicializar o banco de dados:", error);
  }
}

if (process.argv[1].endsWith("initDb.js")) {
  setup();
}