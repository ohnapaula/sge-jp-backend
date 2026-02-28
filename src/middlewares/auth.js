import jwt from "jsonwebtoken";

export const SECRET =
  "23c9c37624ac044bce34f2ccede43410a60bb7eed6576f9bcf474e577b557fce26971ddea2b1b828f944a5ac507bb66cf05eaef0319ef93f12cfb81ba74069a3";

export const autenticar = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ erro: "Token não fornecido." });

  const token = authHeader.split(" ")[1];
  try {
    const payload = jwt.verify(token, SECRET);
    req.user = payload;
    next();
  } catch (error) {
    res.status(401).json({ erro: "Token inválido ou expirado." });
  }
};

export const permitir = (...perfisPermitidos) => {
  return (req, res, next) => {
    if (!perfisPermitidos.includes(req.user.perfil)) {
      return res.status(403).json({ erro: "Acesso negado para o seu perfil." });
    }
    next();
  };
};
