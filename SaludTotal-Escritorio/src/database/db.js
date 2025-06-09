const mysql = require('mysql2/promise');

let pool;

async function conectar() {
  pool = await mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '1234',
    database: 'SaludTotalBDD3',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });

  console.log('✅ Conexión a la base de datos exitosa.');
}

function getConnection() {
  if (!pool) throw new Error('⚠️ No se ha establecido la conexión a la base de datos.');
  return pool;
}

function getPool() {
  if (!pool) throw new Error('⚠️ No se ha establecido la conexión a la base de datos.');
  return pool;
}
module.exports = {
  conectar,
  getConnection,
  getPool,
};
