import sqlite3 from "sqlite3";
import { open } from "sqlite";
import bcrypt from "bcrypt";

export async function openDb() {
  return open({
    filename: "./estoque-jp.db",
    driver: sqlite3.Database,
  });
}

async function setup() {
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

  const hash = await bcrypt.hash("adminjp", 10);
  await db.run(
    `INSERT OR IGNORE INTO usuarios (usuario, senha, perfil) VALUES (?, ?, ?)`,
    ["admin", hash, "admin"],
  );

  console.log("Banco de dados criado com sucesso e admin sge-jp adicionado!");
}

if (process.argv[1].endsWith("initDb.js")) {
  setup();
}