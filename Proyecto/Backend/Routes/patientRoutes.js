const express= require('express');
const router = express.Router();
const patientController = require('../controllers/patientController'); 

//registro de paciente
router.post('/register',patientController.register);

//Login de paciente
router.post('/login',patientController.login);

module.exports = router;