document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('form-contacto');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Leer el id del paciente con la misma clave que usás en login.js ('pacienteId')
    const paciente_id = localStorage.getItem('pacienteId');
    console.log('Paciente ID desde localStorage:', paciente_id);

    const email = document.getElementById('email').value;
    const motivo = document.getElementById('motivo').value;
    const mensaje = document.getElementById('mensaje').value;

    if (!paciente_id) {
      alert('Error: no se pudo identificar al paciente. Inicie sesión.');
      return;
    }

    try {
      const response = await fetch('/api/contacto/enviar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ paciente_id, email, motivo, mensaje })
      });

      const data = await response.json();

      if (response.ok) {
        alert(data.message); // Mensaje de éxito
        form.reset();
      } else {
        alert('Error: ' + data.error);
      }

    } catch (error) {
      console.error('❌ Error al enviar el mensaje:', error);
      alert('Ocurrió un error al enviar el mensaje.');
    }
  });
});