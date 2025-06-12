const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  login: (credentials) => ipcRenderer.invoke('login', credentials),
  getUsuario: () => ipcRenderer.invoke('getUsuario'),
  abrirModulo: (modulo) => ipcRenderer.invoke('abrirModulo', modulo),
  // GESTIÓN TURNOS
obtenerTurnos: () => ipcRenderer.invoke('obtenerTurnos'),
actualizarEstadoTurno: (id, estado) => ipcRenderer.invoke('actualizarEstadoTurno', id, estado),
reprogramarTurno: (id, fecha, hora) => ipcRenderer.invoke('reprogramarTurno', id, fecha, hora),

  // Pacientes y profesionales
  obtenerPacientes: () => ipcRenderer.invoke('obtenerPacientes'),
  obtenerProfesionales: () => ipcRenderer.invoke('obtenerProfesionales'),

  // Agregado necesario
  agregarProfesional: (datos) => ipcRenderer.invoke('agregarProfesional', datos),

  // Modal (opcional si lo manejás por HTML directamente)
  abrirFormularioAgregarProfesional: () => ipcRenderer.invoke('abrirFormularioAgregarProfesional')
});

// Simulación temporal de rol
const rolUsuario = 'secretaria';
window.rolUsuario = rolUsuario;
