const express= require('express');
const router = express.Router();
const patientController = require('../Controllers/patientController'); 
console.log(patientController);

//registro de paciente
router.post('/register',patientController.register);

//Login de paciente
router.post('/login',patientController.login);

router.get('/test-connection', (req, res) => {
  const db = require('../db'); // importá la conexión si no está

  db.query('SELECT 1 + 1 AS resultado', (err, results) => {
    if (err) {
      console.error('Error en la consulta de prueba:', err);
      return res.status(500).json({ error: 'Error en la base de datos' });
    }
    res.json({ mensaje: 'Conexión OK', resultado: results[0].resultado });
  });
});

module.exports = router;