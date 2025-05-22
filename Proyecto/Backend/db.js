const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',           // Su nombre de usuario de mysql
  password: 'Facundo1',           // contraseña de MySQL 
  database: 'SaludTotalBDD' // nombre de la base de datos
});

connection.connect((err) => {
  if (err) {
    console.error('❌ Error al conectar con la base de datos:', err);
    return;
  }
  console.log('✅ Conexión exitosa con la base de datos SaludTotalBDD');
});

module.exports = connection;

