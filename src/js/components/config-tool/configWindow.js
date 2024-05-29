class configWindow {
	constructor() { }

	createComponent() {
		const configWrapper = document.createElement("div");
		configWrapper.id = "configWrapper";
		configWrapper.style = "top: 100px; left: 1000px; position: absolute;";
		configWrapper.innerHTML = "Configuración de Herramientas";

		let btncloseConfig = document.createElement("a");
		btncloseConfig.id = "btnClose-config";
		btncloseConfig.href = "javascript:void(0)";
		btncloseConfig.style = "float:right; color:#676767; overflow-y:auto;";
		btncloseConfig.innerHTML = '<i class="fa fa-times"></i>';
		btncloseConfig.onclick = () => {
			configWrapper.remove();
		};
		configWrapper.appendChild(btncloseConfig);

		const configWindow = document.createElement("div");
		configWindow.id = "configWindow";
		configWrapper.appendChild(configWindow);

		// Crear el formulario
		const form = document.createElement("form");
		form.id = "configForm";

		// Añadir algunos checkboxes
		for (let i = 1; i <= 10; i++) {
			const label = document.createElement("label");
			label.htmlFor = `checkbox${i}`;
			label.innerText = `Opción ${i}`;

			const checkbox = document.createElement("input");
			checkbox.type = "checkbox";
			checkbox.id = `checkbox${i}`;
			checkbox.name = `checkbox${i}`;

			form.appendChild(checkbox);
			form.appendChild(label);
			form.appendChild(document.createElement("br"));
		}

		// Añadir botón de submit
		const submitButton = document.createElement("button");
		submitButton.type = "submit";
		submitButton.innerText = "Aceptar";
		submitButton.onclick = (e) => {
			e.preventDefault();
			// Manejar la acción de enviar
			const formData = new FormData(form);
			for (let [key, value] of formData.entries()) {
				console.log(key, value);
			}
		};

		form.appendChild(submitButton);
		configWindow.appendChild(form);

		document.body.appendChild(configWrapper);

		$("#configWrapper").draggable({
			scroll: false,
			cancel: "#configWindow",
			containment: "body",
		});
	}
}
