//server.js
const express = require('express');
const path = require('path');
const cors = require('cors');
const app = express();
const PORT = 3000;

const db = require('./db'); // Importar utilidades de DB

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, '../Front')));
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../Front/html/Home_No_Login.html'));
});


async function startServer() {
  try {
    await db.conectar(); 

    // import Rutas
    const patientRoutes = require('./Routes/patientRoutes');
    const turnoRoutes = require('./Routes/turnoRoutes');
    const contactoRoutes = require('./Routes/contactoRoutes');
    const historialRoutes = require('./Routes/historialRoutes');

    // Usar las rutas
    app.use('/api/pacientes', patientRoutes);
    app.use('/api/turnos', turnoRoutes);
    app.use('/api/contacto', contactoRoutes);
    app.use('/api/historial', historialRoutes);

 app.listen(3000, () => {
  console.log('Servidor corriendo en http://localhost:3000');
});
  } catch (err) {
    console.error('❌ Error al conectar a la base de datos:', err.message);
    process.exit(1);
  }
}

startServer();
