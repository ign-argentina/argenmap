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
}
