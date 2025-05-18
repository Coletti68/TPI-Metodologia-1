const express = require('express');
const path = require('path');

const app = express();
const PORT = 3002;
const db = require('./db'); // Asegurate de que esto esté presente


// 👉 Servir archivos estáticos desde la carpeta Front
app.use(express.static(path.join(__dirname, '../Front')));


// 👉 Ruta para abrir el archivo Home_No_Login.html por defecto
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../Front/Home_No_Login.html'));
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
