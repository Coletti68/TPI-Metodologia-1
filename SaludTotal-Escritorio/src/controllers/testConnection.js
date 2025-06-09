// src/controllers/testConnection.js
const db = require('../database/db');

async function testConnection() {
  try {
    const [rows] = await db.query('SELECT * FROM Rol');
    console.log('Conexión exitosa. Roles encontrados:');
    rows.forEach(row => {
      console.log(`ID: ${row.id_rol}, Rol: ${row.nombreRol}`);
    });
  } catch (error) {
    console.error('Error al conectar con la base de datos:', error.message);
  }
}

module.exports = testConnection;
