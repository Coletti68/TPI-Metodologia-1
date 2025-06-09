const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');


// Controladores
const { conectar } = require('./database/db');
const { login } = require('./controllers/authController');
const { obtenerPacientes } = require('./controllers/pacientecontroller');
const { obtenerProfesionales } = require('./controllers/profesionalcontroller');

// Estado y configuración
const ventanas = {}; // Ventanas abiertas
let usuarioActual = null;

// Permisos por rol
const permisosPorRol = {
  Admin: ['pacientes', 'profesionales', 'turnos', 'reportes', 'configuracion', 'informes', 'horarios', 'contacto'],
  Secretaria: ['pacientes', 'turnos', 'contacto'],
  'secretaria/o': ['pacientes', 'turnos', 'contacto']
};

ipcMain.handle('abrirFormularioAgregarProfesional', async () => {
  const ventanaAlta = new BrowserWindow({
    width: 600,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  });

  ventanaAlta.loadFile('src/windows/profesionales/formulario-alta.html'); // o la ruta correspondiente
});

// Crear ventana principal (login)
function createWindow() {
  const win = new BrowserWindow({
    width: 400,
    height: 400,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  win.loadFile('windows/login/login.html');
}

// Iniciar app
app.whenReady().then(async () => {
  try {
    await conectar();
    console.log('✅ Conectado a la base de datos.');
    createWindow();

    // ===============================
    // IPC HANDLERS
    // ===============================

    // Login
    ipcMain.handle('login', async (event, credentials) => {
      const user = await login(credentials.email, credentials.password);
      if (user) {
        usuarioActual = user;
        console.log('✅ Usuario logueado:', usuarioActual);
        return { success: true, user };
      } else {
        return { success: false, message: 'Credenciales inválidas o rol no autorizado.' };
      }
    });

    // Obtener usuario actual
    ipcMain.handle('getUsuario', () => usuarioActual);

    // Abrir módulo
    ipcMain.handle('abrirModulo', (event, modulo) => {
      if (!usuarioActual) return;

      const rol = usuarioActual.nombreRol;
      const permisos = permisosPorRol[rol] || [];

      if (!permisos.includes(modulo)) {
        console.log(`❌ Acceso denegado a ${modulo} para el rol ${rol}`);
        return;
      }

      const ruta = path.join(__dirname, 'windows', 'login', 'views', `${modulo}.html`);
      if (!fs.existsSync(ruta)) {
        console.log(`❌ Archivo no encontrado: ${ruta}`);
        return;
      }

      if (rol === 'Admin') {
        const nuevaVentana = new BrowserWindow({
          width: 800,
          height: 600,
          title: `Módulo: ${modulo}`,
          webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
          },
        });

        nuevaVentana.loadFile(ruta);
        return;
      }

      if (ventanas[modulo]) {
        ventanas[modulo].focus();
        return;
      }

      ventanas[modulo] = new BrowserWindow({
        width: 800,
        height: 600,
        title: `Módulo: ${modulo}`,
        webPreferences: {
          preload: path.join(__dirname, 'preload.js'),
        },
      });

      ventanas[modulo].loadFile(ruta);

      ventanas[modulo].on('closed', () => {
        ventanas[modulo] = null;
      });
    });

    // Obtener pacientes
    ipcMain.handle('obtenerPacientes', async () => {
      try {
        return await obtenerPacientes();
      } catch (error) {
        console.error('❌ Error al obtener pacientes:', error.message);
        throw error;
      }
    });

    // Obtener profesionales
    ipcMain.handle('obtenerProfesionales', async () => {
      try {
        return await obtenerProfesionales();
      } catch (error) {
        console.error('❌ Error al obtener profesionales:', error.message);
        throw error;
      }
    });

  } catch (error) {
    console.error('❌ Error general en app:', error.message);
  }
});



// Cierre en Windows/Linux
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});


//Logica Guardar profesional
const bcrypt = require('bcrypt'); // Necesitás instalar esto con npm

const { getPool } = require('./database/db'); // ✅ agregar esta línea si no la tenés ya

ipcMain.handle('agregarProfesional', async (event, profesional) => {
  try {
    const { dni, nombre_completo, sexo, email, especialidades, rol } = profesional;
    const estado = 1;

    const query = `
      INSERT INTO Profesional (dni, nombre_completo, sexo, email, especialidades, rol, estado)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const pool = getPool(); // ✅ obtenés la conexión
    await pool.execute(query, [dni, nombre_completo, sexo, email, especialidades, rol, estado]);

    return { success: true };
  } catch (err) {
    console.error("❌ Error en agregarProfesional (IPC):", err);
    throw err;
  }
});
