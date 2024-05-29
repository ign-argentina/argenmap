class ConfigTool {
	constructor() { }

	createComponent() {
		const btnElement = document.createElement('button');
		btnElement.className = "fa fa-cog";  // Cambiado de class a className
		btnElement.id = 'configBtn';
		btnElement.title = 'Configuracion';

		
		btnElement.setAttribute('aria-hidden', 'true');

		btnElement.addEventListener('click', (event) => {
			const existingConfigWrapper = document.querySelector('#configWrapper');
			if (existingConfigWrapper) {
				existingConfigWrapper.remove();
			} else {
				const configuration = new configWindow();
				configuration.createComponent();
			}
		});

		if (loadConfigTool) {
			document.querySelector('#logo-help').append(btnElement);
        }    
	}
}