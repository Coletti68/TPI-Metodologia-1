const express = require('express');
const path = require('path');

const app = express();
const PORT = 3002;

// Servir archivos estáticos (HTML, CSS, imágenes, etc.)
app.use(express.static(path.join(__dirname, '../Front')));

// Ruta principal opcional
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../Front/Home_No_Login.html'));
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
