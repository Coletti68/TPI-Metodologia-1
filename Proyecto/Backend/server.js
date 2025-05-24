const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;

const db = require('./db'); // Conexión a la base de datos

// 👉 Importar rutas API
const patientRoutes = require('./Routes/patientRoutes');
const turnoRoutes = require('./Routes/turnoRoutes');

// 👉 Middleware para parsear JSON
app.use(express.json());

// 👉 Servir archivos estáticos desde la carpeta Front
app.use(express.static(path.join(__dirname, '../Front')));

// 👉 Ruta por defecto para frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../Front/Home_No_Login.html'));
});

// 👉 Rutas API
app.use('/api/pacientes', patientRoutes);
app.use('/api/turnos', turnoRoutes);

// 👉 Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
