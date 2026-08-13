function showMainMenu() {
  //Ocultar loading
  document.querySelectorAll(".loading").forEach((element) => {
    element.style.display = "none";
  });
  //Imprimir menú
  gestorMenu.imprimir(document.querySelector(".nav.nav-sidebar"));
  // Native title attributes provide tooltips without Bootstrap JS.
}
