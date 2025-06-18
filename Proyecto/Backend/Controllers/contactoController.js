const Contacto = require('../models/contacto');

const contactoController = {
    enviarMensaje: async (req, res) => {
        try {
            const { paciente_id, email, motivo, mensaje } = req.body;

            if (!paciente_id || !email || !motivo || !mensaje) {
                return res.status(400).json({ error: 'Todos los campos son obligatorios' });
            }

            // Llamar al modelo para crear el registro
            const resultado = await Contacto.crear(paciente_id, email, motivo, mensaje);

            // Enviar respuesta exitosa
            res.status(201).json(resultado);

        } catch (error) {
            console.error('❌ Error al enviar mensaje de contacto:', error.message);
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    }
};

module.exports = contactoController;
