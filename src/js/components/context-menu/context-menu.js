class ContextMenu {

    menu = null;

    constructor() {

        this.menu = document.createElement('div');
        this.menu.className = 'context-menu';
    }

    get menu() {
        return this.menu;
    }

    createOption(optionData) {
        const option = document.createElement('div');
        option.className = 'context-menu-item' + (optionData.isDisabled ? ' context-menu-item-disabled' : ' context-menu-item-active');
        option.innerHTML = `<p class="non-selectable-text context-menu-item-text">${optionData.text}</p>`;
        option.disabled = optionData.isDisabled;
        option.onclick = (e) => {
            optionData.onclick(option);
        };
        this.menu.appendChild(option);
    }

    createSelect(optionData) {
        const option = document.createElement('div');
        option.className = 'context-menu-item' + (optionData.isDisabled ? ' context-menu-item-disabled' : ' context-menu-item-active');
        option.innerHTML = '<b>Reproyectar coordenadas en</b>&nbsp;&nbsp;';
        // Create the select html element
        const selectElm = option.appendChild(document.createElement('select'));
        // add html options via given options
        optionData.options.forEach(op => {
            let optionElm = selectElm.appendChild(document.createElement('option'))
            optionElm.value = op.value;
            optionElm.innerText = op.label;
        });
        

        option.disabled = optionData.isDisabled;

        selectElm.onchange = () => {
            optionData.selected(selectElm.value)
        }
        
        this.menu.appendChild(option);
    }
}
