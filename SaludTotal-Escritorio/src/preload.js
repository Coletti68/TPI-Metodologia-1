const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  login: (credentials) => ipcRenderer.invoke('login', credentials),
  getUsuario: () => ipcRenderer.invoke('getUsuario'),
  abrirModulo: (modulo) => ipcRenderer.invoke('abrirModulo', modulo),
  // GESTIÓN TURNOS
  obtenerMensajesContacto: () => ipcRenderer.invoke('obtenerMensajesContacto'),
  marcarContactoRespondido: (id) => ipcRenderer.invoke('marcarContactoRespondido', id),
  obtenerHorariosDisponibles: (profesionalId, especialidadId) => ipcRenderer.invoke('obtenerHorariosDisponibles', profesionalId, especialidadId),
  obtenerTurnos: (estado) => ipcRenderer.invoke('obtenerTurnos', estado),
  actualizarEstadoTurno: (id, estado) => ipcRenderer.invoke('actualizarEstadoTurno', id, estado),
  reprogramarTurno: (id, fecha, hora) => ipcRenderer.invoke('reprogramarTurno', id, fecha, hora),
  obtenerContactos: () => ipcRenderer.invoke('obtenerContactos'),
  responderContacto: (id, respuesta) => ipcRenderer.invoke('responderContacto', id, respuesta),

  // Pacientes y profesionales
  obtenerPacientes: () => ipcRenderer.invoke('obtenerPacientes'),
  obtenerProfesionales: () => ipcRenderer.invoke('obtenerProfesionales'),

  // Agregado necesario
  agregarProfesional: (datos) => ipcRenderer.invoke('agregarProfesional', datos),
  
  obtenerHorariosPorDia: (profesionalId, especialidadId, diaSemana) =>
  ipcRenderer.invoke('obtenerHorariosPorDia', profesionalId, especialidadId, diaSemana),

  // Modal (opcional si lo manejás por HTML directamente)
  abrirFormularioAgregarProfesional: () => ipcRenderer.invoke('abrirFormularioAgregarProfesional')
  
  
});


// Simulación temporal de rol
const rolUsuario = 'secretaria';
window.rolUsuario = rolUsuario;
