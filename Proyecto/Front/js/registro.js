//registro.js
document.querySelector('form').addEventListener('submit', async function (e) {
  e.preventDefault();

  const nombre = document.getElementById('nombre').value;
  const dni = document.getElementById('dni').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const sexo = document.getElementById('sexo').value; // NUEVO

  const response = await fetch('http://localhost:3000/api/pacientes/register', { // RUTA CORREGIDA
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nombre_completo: nombre, dni, email, password, sexo }) // AGREGA SEXO
  });

  const data = await response.json();

  if (response.ok) {
    alert("Cuenta creada con éxito.");
    window.location.href = "Registro_Exitoso.html";
  } else {
    alert(data.error || "Error al registrar"); // usa data.error que envía backend
  }
});

