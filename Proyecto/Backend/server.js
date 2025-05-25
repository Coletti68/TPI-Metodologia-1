const express = require('express');
const path = require('path');
const cors = require('cors');
const app = express();
const PORT = 3000;

const db = require('./db'); // Conexión a la base de datos

// ✅ Habilitar CORS para permitir peticiones del frontend
app.use(cors());

// ✅ Middleware para parsear JSON
app.use(express.json());

// 👉 Importar rutas API
const patientRoutes = require('./Routes/patientRoutes');
const turnoRoutes = require('./Routes/turnoRoutes');

// ✅ Servir archivos estáticos desde la carpeta Front
app.use(express.static(path.join(__dirname, '../Front')));

// 👉 Ruta por defecto para el frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../Front/Home_No_Login.html'));
});

// ✅ Rutas de la API
app.use('/api/pacientes', patientRoutes);
app.use('/api/turnos', turnoRoutes);

// ✅ Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
