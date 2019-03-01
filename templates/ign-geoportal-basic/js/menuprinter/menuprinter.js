function showMainMenu() {
    //Ocultar loading
    $(".loading").hide();
    //Imprimir menú
    gestorMenu.imprimir($(".nav.nav-sidebar"));
    //Agregar tooltip resumen
    $("[data-toggle2='tooltip']").tooltip({
        placement: "right",
        trigger: "hover",
        container: "body"
    });
}