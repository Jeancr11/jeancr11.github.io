/**
 * Este script maneja la funcionalidad del menú de navegación en dispositivos móviles.
 * Al hacer clic en el ícono de hamburguesa, muestra u oculta el menú.
 */
document.addEventListener("DOMContentLoaded", () => {
  // Selecciona el botón del menú (hamburguesa)
  const menuToggle = document.getElementById("menu-toggle");
  
  // Selecciona la lista de enlaces del menú
  const navMenu = document.getElementById("nav-menu");

  // Verifica que ambos elementos existan antes de agregar el evento
  if (menuToggle && navMenu) {
    menuToggle.addEventListener("click", () => {
      // Agrega o quita la clase 'show' para mostrar u ocultar el menú
      // La clase 'show' se define en el CSS para cambiar el 'display' a 'flex'
      navMenu.classList.toggle("show");
    });
  }
});
