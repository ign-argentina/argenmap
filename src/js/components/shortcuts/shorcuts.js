// moqued shortcuts json
const shortcuts = {
    shortcuts: [
      {
        keys: ["ctrl", "s"],
        action: "guardarDatos"
      },
      {
        keys: ["ctrl", "o"],
        action: "abrirArchivo"
      },
      {
        keys: ["alt", "p"],
        action: "imprimirDocumento"
      }
    ]
  };
  


function configurarShortcuts(shortcuts) {

    shortcuts.shortcuts.forEach(shortcut => {
        document.addEventListener('keydown', function(event) {
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
        case 'guardarDatos':
            guardarDatos();
            break;
        case 'abrirArchivo':
            abrirArchivo();
            break;
        case 'imprimirDocumento':
            imprimirDocumento();
            break;
        default:
            console.warn(`Acción no reconocida: ${action}`);
    }
}

// Funciones de ejemplo
function guardarDatos() {
    console.log('Datos guardados');
}

function abrirArchivo() {
    console.log('Archivo abierto');
}

function imprimirDocumento() {
    console.log('Documento impreso');
}

configurarShortcuts(shortcuts)
