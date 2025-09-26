/**
 * Utilidades para mostrar toasts de notificación
 */

/**
 * Muestra un toast de notificación
 * @param {string} msg - Mensaje a mostrar
 * @param {string} color - Color del toast (blue, green, yellow, red)
 */
export const showToast = (msg, color = "blue") => {
  const toast = document.createElement("div");
  toast.innerText = msg;
  toast.className = `fixed bottom-4 right-4 bg-${color}-600 text-white px-4 py-2 rounded shadow z-50 animate-bounce`;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 4000);
};

