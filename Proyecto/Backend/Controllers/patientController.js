const Patient = require('../models/patient');

const patientController = {
    // Registro de paciente
    register: async (req, res) => {
        try {
            const { nombre_completo, dni, sexo, email, password } = req.body;
            const result = await Patient.create(nombre_completo, dni, sexo, email, password);
            res.status(201).json(result);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },

    // Login de paciente
    login: async (req, res) => {
        try {
            const { dni, password } = req.body;
            const result = await Patient.login(dni, password);
            res.status(200).json(result);
        } catch (error) {
            res.status(401).json({ error: error.message });
        }
    }
};

module.exports = patientController;

