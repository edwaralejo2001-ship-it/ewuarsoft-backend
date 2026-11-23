const crypto = require('crypto');
const pool = require('../config/database');
const { AppError, validateText } = require('./errors');

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password, storedHash) {
  if (!storedHash || !storedHash.includes(':')) return false;
  const [salt, key] = storedHash.split(':');
  const keyBuffer = Buffer.from(key, 'hex');
  const derivedKey = crypto.scryptSync(password, salt, 64);
  return crypto.timingSafeEqual(keyBuffer, derivedKey);
}

function generateToken(userId) {
  const payload = `${userId}:${Date.now()}:${crypto.randomBytes(16).toString('hex')}`;
  return Buffer.from(payload).toString('base64');
}

async function registerUser(input = {}) {
  const name = validateText(input.name, 'El nombre completo', 150);
  const emailRaw = input.email ? String(input.email).trim().toLowerCase() : '';
  const password = input.password ? String(input.password) : '';
  const roleInput = input.role ? String(input.role).toUpperCase().trim() : 'VENDEDOR';

  if (!emailRaw || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailRaw)) {
    throw new AppError('El correo electrónico no es válido. Formato requerido: usuario@ejemplo.com', 400);
  }

  if (!password || password.length < 6) {
    throw new AppError('La contraseña es demasiado corta. Debe tener al menos 6 caracteres.', 400);
  }

  const allowedRoles = ['ADMIN', 'VENDEDOR', 'CAJERO'];
  const role = allowedRoles.includes(roleInput) ? roleInput : 'VENDEDOR';

  // Verificar si el usuario ya existe
  const [existing] = await pool.execute('SELECT id FROM users WHERE email = ?', [emailRaw]);
  if (existing.length > 0) {
    throw new AppError('Ya existe una cuenta registrada con este correo electrónico. Inicia sesión o utiliza otro correo.', 409);
  }

  const passwordHash = hashPassword(password);
  const [result] = await pool.execute(
    'INSERT INTO users (name, email, password_hash, role, active) VALUES (?, ?, ?, ?, 1)',
    [name, emailRaw, passwordHash, role]
  );

  return {
    id: result.insertId,
    name,
    email: emailRaw,
    role,
    active: true
  };
}

async function loginUser(input = {}) {
  const emailRaw = input.email ? String(input.email).trim().toLowerCase() : '';
  const password = input.password ? String(input.password) : '';

  if (!emailRaw) {
    throw new AppError('Por favor ingresa tu correo electrónico.', 400);
  }
  if (!password) {
    throw new AppError('Por favor ingresa tu contraseña.', 400);
  }

  const [rows] = await pool.execute(
    'SELECT id, name, email, password_hash, role, active, last_login, created_at FROM users WHERE email = ?',
    [emailRaw]
  );

  // AVISO CLARO: El usuario no existe
  if (rows.length === 0) {
    throw new AppError('El usuario no existe. Verifica el correo electrónico o crea una cuenta nueva.', 404);
  }

  const user = rows[0];

  // AVISO CLARO: Usuario inactivo
  if (!user.active) {
    throw new AppError('Tu cuenta de usuario ha sido desactivada. Comunícate con el administrador.', 403);
  }

  // AVISO CLARO: Contraseña errónea
  const isMatch = verifyPassword(password, user.password_hash);
  if (!isMatch) {
    throw new AppError('Contraseña incorrecta. Por favor verifica tus credenciales e intenta de nuevo.', 401);
  }

  // Actualizar último login
  await pool.execute('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?', [user.id]);

  const token = generateToken(user.id);

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      last_login: new Date()
    },
    token
  };
}

async function listUsers() {
  const [rows] = await pool.execute(
    'SELECT id, name, email, role, active, last_login, created_at FROM users ORDER BY name'
  );
  return rows;
}

module.exports = {
  hashPassword,
  verifyPassword,
  registerUser,
  loginUser,
  listUsers
};
