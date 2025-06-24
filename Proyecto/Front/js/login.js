//login.js
document.getElementById('loginForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const dni = document.getElementById('dni').value;
  const password = document.getElementById('password').value;

  try {
    const response = await fetch('http://192.168.0.113:3000/api/pacientes/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dni, password })
    });

    const data = await response.json();

    if (response.ok) {
      localStorage.setItem('pacienteId', data.id_paciente);
      localStorage.setItem('pacienteNombre', data.nombre_completo);

      alert('✅ Inicio de sesión exitoso.');
      window.location.href = "Home_Login.html";
    } else {
      alert('❌ ' + (data.error || 'Credenciales incorrectas.'));
    }
  } catch (error) {
    alert('❌ Error de red o servidor: ' + error.message);
  }
});
