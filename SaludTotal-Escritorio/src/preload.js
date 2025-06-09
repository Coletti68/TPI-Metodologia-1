const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  login: (credentials) => ipcRenderer.invoke('login', credentials),
  getUsuario: () => ipcRenderer.invoke('getUsuario'),
  abrirModulo: (modulo) => ipcRenderer.invoke('abrirModulo', modulo),
  
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
