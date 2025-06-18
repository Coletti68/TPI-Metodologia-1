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
const contactoRoutes = require('./Routes/contactoRoutes');
const historialRoutes = require('./Routes/historialRoutes');


// ✅ Servir archivos estáticos desde la carpeta Front
app.use(express.static(path.join(__dirname, '../Front')));

// 👉 Ruta por defecto para el frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../Front/html/Home_No_Login.html'));
});

// ✅ Rutas de la API
app.use('/api/pacientes', patientRoutes);
app.use('/api/turnos', turnoRoutes);
app.use('/api/contacto', contactoRoutes);
app.use('/api/historial', historialRoutes);

    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('❌ Error al conectar a la base de datos:', err.message);
    process.exit(1);
  }
}

startServer();
