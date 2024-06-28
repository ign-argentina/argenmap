class configWindow {
	constructor() { }

	createComponent() {
		const configWrapper = document.createElement("div");
		configWrapper.id = "configWrapper";
		configWrapper.style = "top: 100px; left: 1000px; position: absolute;";
		configWrapper.innerHTML = app.configToolMain.name;

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

		const tools = app.tools;
		for (const key in tools) {
			if (tools.hasOwnProperty(key) && tools[key].hasOwnProperty("isActive") && tools[key].isActive == true) {
				const label = document.createElement("label");
				label.htmlFor = key;
				label.innerText = tools[key].name;

				const checkbox = document.createElement("input");
				checkbox.type = "checkbox";
				checkbox.id = key;
				checkbox.name = tools[key].name;
				checkbox.checked = tools[key].isActive;

				form.appendChild(checkbox);
				form.appendChild(label);
				form.appendChild(document.createElement("br"));
			}
		}

		// Añadir botón de submit
		const submitButton = document.createElement("button");
		submitButton.type = "submit";
		submitButton.innerText = "Aceptar";
		submitButton.onclick = (e) => {
			e.preventDefault();
			const checkboxes = form.querySelectorAll("input[type='checkbox']");
			checkboxes.forEach((checkbox) => {
			  app.tools[checkbox.id].isActive = checkbox.checked;
			});
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
