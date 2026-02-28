import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { openDb } from "../db/initDb.js";
import { SECRET } from "../middlewares/auth.js";

async function logarNoSistema(req, res) {
  try {
    const { usuario, senha } = req.body;

    if (!usuario || !senha) {
      return res
        .status(400)
        .json({ erro: "Usuário e senha são obrigatórios." });
    }

    const db = await openDb();
    const user = await db.get(`SELECT * FROM usuarios WHERE usuario = ?`, [
      usuario,
    ]);

    if (user && (await bcrypt.compare(senha, user.senha))) {
      const token = jwt.sign(
        { id: user.id, usuario: user.usuario, perfil: user.perfil },
        SECRET,
        { expiresIn: "1h" },
      );
      return res.json({ token });
    }

    return res.status(401).json({ erro: "Credenciais inválidas." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: "Erro interno ao realizar login." });
  }
};

export default logarNoSistema;