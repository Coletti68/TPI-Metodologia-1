const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

// Importamos la conexión a la BD y controladores
const { conectar, getPool } = require('./database/db');
const { login } = require('./controllers/authController');
const { obtenerPacientes } = require('./controllers/pacientecontroller');
const { obtenerProfesionales } = require('./controllers/profesionalcontroller');
const bcryptjs = require('bcryptjs');

// Estado global de la app
let usuarioActual = null;
const ventanas = {};

// Permisos por rol
const permisosPorRol = {
  admin: ['pacientes', 'profesionales', 'turnos', 'reportes', 'configuracion', 'informes', 'horarios', 'contacto'],
  secretaria: ['pacientes', 'turnos', 'contacto'],
  'secretaria/o': ['pacientes', 'turnos', 'contacto']
};

// Crea la ventana principal de login
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

// Iniciamos la app
app.whenReady().then(async () => {
  try {
    await conectar();
    console.log('✅ Conectado a la base de datos.');
    createWindow();
    configurarIPC();  // 👈 Manejamos todos los eventos IPC desde acá

  } catch (error) {
    console.error('❌ Error general en app:', error.message);
  }
});

// ==============================
// CONFIGURAMOS LOS IPC CENTRADOS
// ==============================
function configurarIPC() {

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

  // Abrir módulos
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
    ventanas[modulo].on('closed', () => { ventanas[modulo] = null });
  });

  // Pacientes
  ipcMain.handle('obtenerPacientes', async () => {
    try {
      return await obtenerPacientes();
    } catch (error) {
      console.error('❌ Error al obtener pacientes:', error.message);
      throw error;
    }
  });

  // Profesionales
  ipcMain.handle('obtenerProfesionales', async () => {
    try {
      return await obtenerProfesionales();
    } catch (error) {
      console.error('❌ Error al obtener profesionales:', error.message);
      throw error;
    }
  });

  // Agregar profesional (ejemplo de guardado directo)
  ipcMain.handle('agregarProfesional', async (event, profesional) => {
    try {
      const { dni, nombre_completo, sexo, email, especialidades, rol } = profesional;
      const estado = 1;

      const query = `
        INSERT INTO Profesional (dni, nombre_completo, sexo, email, especialidades, rol, estado)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;

      const pool = getPool();
      await pool.execute(query, [dni, nombre_completo, sexo, email, especialidades, rol, estado]);

      return { success: true };
    } catch (err) {
      console.error("❌ Error en agregarProfesional (IPC):", err);
      throw err;
    }
  });

  // 🟢 Aquí en el futuro podrás ir agregando la lógica de TURNOS, igual que pacientes/profesionales.
  const { 
  obtenerTurnos,
  actualizarEstadoTurno,
  reprogramarTurno 
 } = require('./controllers/adminTurnoController');

 // Obtener turnos
 ipcMain.handle('obtenerTurnos', async () => {
  try {
    return await obtenerTurnos();
  } catch (error) {
    console.error('❌ Error al obtener turnos:', error.message);
    throw error;
  }
 });

 // Cambiar estado de turno
 ipcMain.handle('actualizarEstadoTurno', async (event, idTurno, nuevoEstado) => {
  try {
    return await actualizarEstadoTurno(idTurno, nuevoEstado);
  } catch (error) {
    console.error('❌ Error al actualizar estado de turno:', error.message);
    throw error;
  }
 });

 // Reprogramar turno
 ipcMain.handle('reprogramarTurno', async (event, idTurno, nuevaFecha, nuevaHora) => {
   try {
     return await reprogramarTurno(idTurno, nuevaFecha, nuevaHora);
   } catch (error) {
     console.error('❌ Error al reprogramar turno:', error.message);
     throw error;
   }
 });
 }

 // Cierre completo
 app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
 });
