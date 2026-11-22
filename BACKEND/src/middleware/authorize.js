const jwt = require("jsonwebtoken");
const { pool } = require("../db");

// Verificar que el usuario sea Administrador
async function requireAdmin(req, res, next) {
  const authorization = req.headers.authorization || "";

  if (!authorization.startsWith("Bearer ")) {
    return res.status(401).json({
      error: "No autenticado",
      mensaje: "Se requiere un token JWT"
    });
  }

  const token = authorization.slice(7);
  let decoded;

  try {
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET no configurado");
    }

    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    if (error.message === "JWT_SECRET no configurado") {
      return res.status(500).json({
        error: "Error de configuración del servidor"
      });
    }

    return res.status(401).json({
      error: "Token inválido o expirado"
    });
  }

  if (
    !decoded.usuarioId ||
    !decoded.empresaUsuarioId ||
    !decoded.empresaId
  ) {
    return res.status(401).json({
      error: "Token incompleto"
    });
  }

  try {
    // Consultar el rol vigente directamente en PostgreSQL
    const result = await pool.query(
      `
      SELECT r.nombre AS rol
      FROM empresa_usuarios eu
      INNER JOIN roles r ON r.id = eu.rol_id
      WHERE eu.id = $1
        AND eu.usuario_id = $2
        AND eu.empresa_id = $3
      LIMIT 1
      `,
      [
        decoded.empresaUsuarioId,
        decoded.usuarioId,
        decoded.empresaId
      ]
    );

    if (result.rows.length === 0) {
      return res.status(403).json({
        error: "Usuario sin asociación o rol vigente"
      });
    }

    const rol = result.rows[0].rol
      .trim()
      .toLowerCase();

    if (rol !== "administrador") {
      return res.status(403).json({
        error: "Acceso denegado",
        mensaje: "Se requiere el rol Administrador"
      });
    }

    req.authUser = decoded;
    next();

  } catch (error) {
    console.error("Error de autorización:", error);

    return res.status(500).json({
      error: "Error al validar permisos"
    });
  }
}

module.exports = { requireAdmin };
