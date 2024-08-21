// moqued shortcuts json

const shortcuts = {
    shortcuts: [
        {
            keys: ["ctrl", "s"],
            action: "addLayer"
        },
        {
            keys: ["ctrl", "o"],
            action: "goToDefaultZoom"
        },
        {
            keys: ["alt", "l"],
            action: "toggleLayersMenu"
        }
    ]
};



function configurarShortcuts(shortcuts) {

    shortcuts.shortcuts.forEach(shortcut => {
        document.addEventListener('keydown', function (event) {
            const keysPressed = [
                event.ctrlKey ? 'ctrl' : null,
                event.altKey ? 'alt' : null,
                event.shiftKey ? 'shift' : null,
                event.key.toLowerCase()
            ].filter(Boolean); // Filtra los valores null

            if (keysPressed.sort().join('+') === shortcut.keys.sort().join('+')) {
                event.preventDefault();
                console.log('Se ejecuta la accion', shortcut);
                ejecutarAccion(shortcut.action);
            }
        });
    });
}

function ejecutarAccion(action) {
    switch (action) {
        case 'addLayer':
            addLayer();
            break;
        case 'goToDefaultZoom':
            goToDefaultZoom();
            break;
        case 'toggleAbout':
            toggleAbout();
            break;
        case 'toggleBaseLayersMenu':
            toggleBaseLayersMenu();
            break;
        case 'toggleHelp':
            toggleHelp();
            break;
        case 'toggleLayersMenu':
            toggleLayersMenu();
            break;
        default:
            console.warn(`Acción no reconocida: ${action}`);
    }
}

// Funciones de ejemplo
function addLayer() {
    console.log('Se agrega un nuevo capa');
}
function goToDefaultZoom() {
    console.log('Se va a la zoom predeterminada');
}
function toggleAbout() {
    console.log('Se abre la información del programa');
}
function toggleBaseLayersMenu() {
    console.log('Se abre el menú de capas base');
}
function toggleHelp() {
    console.log('Se abre la ayuda');
}
function toggleLayersMenu() {
    console.log('Se abre el menú de capas');

    
    var buttons = document.querySelectorAll(".menu-section-btn");
        
    var targetSection = document.getElementById("sidebar");
  
        if (targetSection.style.display === "block") {
          targetSection.style.display = "none";
        } else {
          // Oculta todas las secciones antes de mostrar la deseada
          
          buttons.forEach(function (otherButton) {
            var otherTargetId = otherButton.getAttribute("data-target");
            var otherTargetSection = document.getElementById(otherTargetId);
  
            if (otherTargetSection !== targetSection) {
              otherTargetSection.style.display = "none";
            }
          });
  
          targetSection.style.display = "block";
        }
        

}

configurarShortcuts(shortcuts);