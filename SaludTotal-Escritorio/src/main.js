const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

// DB y controladores
const { conectar, getPool } = require('./database/db');
const { login } = require('./controllers/authController');
const { obtenerPacientes,
editarPaciente,
inactivarPaciente,
activarPaciente,
obtenerHistorialTurnos
} = require('./controllers/pacientecontroller');
const { 
  obtenerProfesionales, 
  obtenerEspecialidades, 
  obtenerRoles,
  crearProfesional
} = require('./controllers/profesionalcontroller');
const { 
  obtenerTurnos, 
  obtenerHorariosDisponibles, 
  actualizarEstadoTurno, 
  reprogramarTurno 
} = require('./controllers/adminTurnoController');
const { obtenerTurnosPorProfesional } = require('./controllers/informeTurnoController');
const contactoController = require('./controllers/contactoController');

const bcryptjs = require('bcryptjs');

// Estado global
let usuarioActual = null;
const ventanas = {};

const permisosPorRol = {
  admin: ['pacientes', 'profesionales', 'turnos', 'reportes', 'configuracion', 'informes', 'horarios', 'contacto'],
  secretaria: ['pacientes', 'turnos', 'contacto'],
  'secretaria/o': ['pacientes', 'turnos', 'contacto']
};

// Crear ventana principal
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
    configurarIPC();
  } catch (error) {
    console.error('❌ Error general en app:', error.message);
  }
});

// ==============
// IPC PRINCIPALES
// ==============
function configurarIPC() {

  // ====================
  // AUTENTICACIÓN Y MENÚ
  // ====================
  ipcMain.handle('login', async (_, credentials) => {
    const user = await login(credentials.email, credentials.password);
    if (user) {
      usuarioActual = user;
      console.log('✅ Usuario logueado:', usuarioActual);
      return { success: true, user };
    }
    return { success: false, message: 'Credenciales inválidas o rol no autorizado.' };
  });

  ipcMain.handle('getUsuario', () => usuarioActual);

  ipcMain.handle('abrirModulo', (_, modulo) => {
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

    if (ventanas[modulo]) return ventanas[modulo].focus();

    ventanas[modulo] = new BrowserWindow({
      width: 800,
      height: 600,
      title: `Módulo: ${modulo}`,
      webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
      },
    });

    ventanas[modulo].loadFile(ruta);
    ventanas[modulo].on('closed', () => ventanas[modulo] = null);
  });

  // ============
  // PACIENTES
  // ============
  ipcMain.handle('obtenerPacientes', async () => {
    try {
      return await obtenerPacientes();
    } catch (error) {
      console.error('❌ Error al obtener pacientes:', error.message);
      throw error;
    }
  });

  
  ipcMain.handle('editarPaciente', async (event, id, datos) => {
    try {
      return await editarPaciente(id, datos);
    } catch (error) {
      console.error('❌ Error al editar paciente:', error.message);
      throw error;
    }
  });

ipcMain.handle('activarPaciente', async (event, id) => {
  try {
    return await activarPaciente(id);
  } catch (error) {
    console.error('❌ Error al activar paciente:', error.message);
    throw error;
  }
});


  ipcMain.handle('inactivarPaciente', async (event, id) => {
    try {
      return await inactivarPaciente(id);
    } catch (error) {
      console.error('❌ Error al inactivar paciente:', error.message);
      throw error;
    }
  });
  
  ipcMain.handle('obtenerHistorialTurnos', async (event, pacienteId) => {
    try {
      return await obtenerHistorialTurnos(pacienteId);
    } catch (error) {
      console.error('❌ Error al obtener historial de turnos:', error.message);
      throw error;
    }
  });

 
  // =====================
  // PROFESIONALES Y ROLES
  // =====================
  ipcMain.handle('obtenerProfesionales', async () => {
    try {
      return await obtenerProfesionales();
    } catch (error) {
      console.error('❌ Error al obtener profesionales:', error.message);
      throw error;
    }
  });

  
// Agregar profesional (usando el controller actualizado)
ipcMain.handle('agregarProfesional', async (_, profesional) => {
  try {
   return await crearProfesional(profesional);
  } catch (err) {
    console.error("❌ Error al agregar profesional:", err.message);
    throw err;
  }
});

// Obtener especialidades
ipcMain.handle('obtenerEspecialidades', async () => {
  try {
    return await obtenerEspecialidades();
  } catch (err) {
    console.error('❌ Error al obtener especialidades:', err.message);
    throw err;
  }
});

// Obtener roles
ipcMain.handle('obtenerRoles', async () => {
  try {
    return await obtenerRoles();
  } catch (err) {
    console.error('❌ Error al obtener roles:', err.message);
    throw err;
  }
});


  // =========
  // TURNOS
  // =========
  ipcMain.handle('obtenerTurnos', async (_, estado) => {
    console.log('IPC obtenerTurnos llamado con estado:', estado);
    const datos = await obtenerTurnos(estado);
    console.log('Datos obtenidos:', datos.length);
    return datos;
  });

  ipcMain.handle('obtenerHorariosPorDia', async (_, profesionalId, especialidadId, diaSemana) => {
    const pool = getPool();
    const [rows] = await pool.query(`
      SELECT HoraInicio, HoraFin FROM HorarioDisponible 
      WHERE profesional_id = ? AND especialidad_id = ? AND DiaSemana = ?
    `, [profesionalId, especialidadId, diaSemana]);
    return rows;
  });

  ipcMain.handle('obtenerTurnosPorProfesional', async (_, desde, hasta, profesionalId) => {
    return await obtenerTurnosPorProfesional(desde, hasta, profesionalId);
  });

  ipcMain.handle('obtenerTurnoPorId', async (_, id) => {
    const pool = getPool();
    try {
      const [rows] = await pool.execute(`
        SELECT t.*, p.id_profesional AS profesional_id, p.id_especialidad AS especialidad_id
        FROM Turnos t
        JOIN Profesionales p ON t.id_profesional = p.id_profesional
        WHERE t.id_turno = ?
      `, [id]);

      if (rows.length === 0) {
        throw new Error(`Turno con ID ${id} no encontrado.`);
      }

      return rows[0];
    } catch (error) {
      console.error('Error al obtener turno por ID:', error);
      throw error;
    }
  });

  ipcMain.handle('actualizarEstadoTurno', async (_, idTurno, nuevoEstado) => {
    try {
      return await actualizarEstadoTurno(idTurno, nuevoEstado);
    } catch (error) {
      console.error('❌ Error al actualizar estado de turno:', error.message);
      throw error;
    }
  });

  ipcMain.handle('obtenerHorariosDisponibles', async (_, profesionalId, especialidadId) => {
    try {
      return await obtenerHorariosDisponibles(profesionalId, especialidadId);
    } catch (error) {
      console.error('Error en obtenerHorariosDisponibles:', error);
      throw error;
    }
  });

  ipcMain.handle('reprogramarTurno', async (_, idTurno, nuevaFecha, nuevaHora) => {
    try {
      return await reprogramarTurno(idTurno, nuevaFecha, nuevaHora);
    } catch (error) {
      console.error('❌ Error al reprogramar turno:', error.message);
      throw error;
    }
  });

// ==========================
// CONTACTO (Mensajes y Respuestas)
// ==========================
ipcMain.handle('obtenerMensajesContacto', async () => {
  try {
    return await contactoController.obtenerMensajesContacto();
  } catch (error) {
    console.error('Error al obtener mensajes:', error);
    throw error;
  }
});

ipcMain.handle('marcarContactoRespondido', async (_, id_contacto) => {
  try {
    await contactoController.marcarMensajeRespondido(id_contacto);
    return { ok: true };
  } catch (error) {
    console.error('Error al marcar como respondido:', error);
    throw error;
  }
});

ipcMain.handle('obtenerContactos', async () => {
  return await contactoController.obtenerTodos();
});

// ✅ Este es el que tenés que modificar
ipcMain.handle('responderContacto', async (_, id) => {
  try {
    // Solo marcar como respondido
    return await contactoController.responder(id);
  } catch (error) {
    console.error('Error al marcar contacto como respondido:', error);
    throw error;
  }
});

}

// Cierre de app
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});