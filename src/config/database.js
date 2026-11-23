require('dotenv').config();
const mysql = require('mysql2/promise');

// Configuración adaptable tanto para MySQL local (XAMPP / local) como para MySQL en la nube (Aiven, TiDB, Clever Cloud, Railway)
const isCloudDatabase = Boolean(process.env.DATABASE_URL || process.env.DB_SSL === 'true');

const poolConfig = process.env.DATABASE_URL
  ? {
      uri: process.env.DATABASE_URL,
      waitForConnections: true,
      connectionLimit: Number(process.env.DB_CONNECTION_LIMIT || 10),
      decimalNumbers: true,
      ssl: process.env.DB_SSL === 'false' ? undefined : { rejectUnauthorized: false }
    }
  : {
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT || 3306),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : '',
      database: process.env.DB_NAME || 'ewarsoft',
      waitForConnections: true,
      connectionLimit: Number(process.env.DB_CONNECTION_LIMIT || 10),
      queueLimit: 0,
      decimalNumbers: true,
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined
    };

const pool = mysql.createPool(poolConfig);

module.exports = pool;
