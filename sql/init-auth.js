const pool = require('../src/config/database');
const crypto = require('crypto');

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

async function initUsers() {
  const createSql = `
    CREATE TABLE IF NOT EXISTS users (
      id INT UNSIGNED NOT NULL AUTO_INCREMENT,
      name VARCHAR(150) NOT NULL,
      email VARCHAR(150) NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      role ENUM('ADMIN', 'VENDEDOR', 'CAJERO') NOT NULL DEFAULT 'VENDEDOR',
      active BOOLEAN NOT NULL DEFAULT TRUE,
      last_login TIMESTAMP NULL DEFAULT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      UNIQUE KEY uq_users_email (email)
    ) ENGINE=InnoDB;
  `;
  await pool.query(createSql);
  console.log('Tabla users verificada/creada exitosamente.');

  // Usuario administrador por defecto
  const [adminRows] = await pool.query('SELECT id FROM users WHERE email = ?', ['admin@lafarra.com']);
  if (adminRows.length === 0) {
    const adminHash = hashPassword('admin123');
    await pool.query(
      'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
      ['Administrador General', 'admin@lafarra.com', adminHash, 'ADMIN']
    );
    console.log('Usuario admin creado: admin@lafarra.com / admin123');
  }

  // Usuario cajero por defecto
  const [vendorRows] = await pool.query('SELECT id FROM users WHERE email = ?', ['cajero@lafarra.com']);
  if (vendorRows.length === 0) {
    const vendorHash = hashPassword('cajero123');
    await pool.query(
      'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
      ['Cajero de Turno', 'cajero@lafarra.com', vendorHash, 'CAJERO']
    );
    console.log('Usuario cajero creado: cajero@lafarra.com / cajero123');
  }

  console.log('Inicialización de autenticación completada.');
  process.exit(0);
}

initUsers().catch(err => {
  console.error('Error al inicializar tabla users:', err);
  process.exit(1);
});
