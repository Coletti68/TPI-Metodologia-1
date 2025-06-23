const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Autenticación y navegación
  login: (credentials) => ipcRenderer.invoke('login', credentials),
  getUsuario: () => ipcRenderer.invoke('getUsuario'),
  abrirModulo: (modulo) => ipcRenderer.invoke('abrirModulo', modulo),

  // Contacto y turnos
  obtenerMensajesContacto: () => ipcRenderer.invoke('obtenerMensajesContacto'),
  obtenerContactos: () => ipcRenderer.invoke('obtenerContactos'),
  responderContacto: (id) => ipcRenderer.invoke('responderContacto', id),
  obtenerHorariosDisponibles: (profesionalId, especialidadId) =>
    ipcRenderer.invoke('obtenerHorariosDisponibles', profesionalId, especialidadId),
  obtenerTurnos: (estado) => ipcRenderer.invoke('obtenerTurnos', estado),
  actualizarEstadoTurno: (id, estado) => ipcRenderer.invoke('actualizarEstadoTurno', id, estado),
  reprogramarTurno: (id, fecha, hora) => ipcRenderer.invoke('reprogramarTurno', id, fecha, hora),

  // Pacientes y profesionales
  obtenerPacientes: () => ipcRenderer.invoke('obtenerPacientes'),
  editarPaciente: (id, datos) => ipcRenderer.invoke('editarPaciente', id, datos),
  inactivarPaciente: (id) => ipcRenderer.invoke('inactivarPaciente', id),
  obtenerHistorialTurnos: (id) => ipcRenderer.invoke('obtenerHistorialTurnos', id),
  obtenerProfesionales: () => ipcRenderer.invoke('obtenerProfesionales'),
  obtenerTurnosPorProfesional: (desde, hasta, profesionalId) =>
    ipcRenderer.invoke('obtenerTurnosPorProfesional', desde, hasta, profesionalId),

  // Profesionales
  agregarProfesional: (datos) => ipcRenderer.invoke('agregarProfesional', datos),
  obtenerEspecialidades: () => ipcRenderer.invoke('obtenerEspecialidades'),
  obtenerRoles: () => ipcRenderer.invoke('obtenerRoles'),
  obtenerHorariosPorDia: (profesionalId, especialidadId, diaSemana) =>
    ipcRenderer.invoke('obtenerHorariosPorDia', profesionalId, especialidadId, diaSemana),

  // Modal (opcional)
  abrirFormularioAgregarProfesional: () => ipcRenderer.invoke('abrirFormularioAgregarProfesional')
});

// Simulación temporal de rol
const rolUsuario = 'secretaria';
window.rolUsuario = rolUsuario;
