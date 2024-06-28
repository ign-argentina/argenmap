
let openService = false;
let serviceLayers = [];
let selectedServiceLayers = [];
let servicesLoaded = [];
let layersIndex = [];

class IconModalLoadServices {
	createComponent() {
		return modalService.OpenLoadServices();
	}
}

class ModalService {
	createElement(element, id, className) {
		let aux = document.createElement(element);
		if (id) {
			aux.id = id;
		}
		if (className) {
			aux.className = className;
		}
		return aux;
	}

	createModal() {
		let modalContainer = document.createElement("div")
		modalContainer.id = "modalLoadServices"
		modalContainer.className = "modalLoadServices"

		let mainIcons = document.createElement("div")
		mainIcons.className = "icons-modalservices"

		let f_sec = document.createElement("section")
		f_sec.style = "width:95%"

		let s_sec = document.createElement("section")
		s_sec.style = "width:5%"

		mainIcons.append(f_sec)
		mainIcons.append(s_sec)


		let tab_div = document.createElement("div")
		tab_div.className = "tabs_upload"
		tab_div.innerHTML = `
    <span style="margin:0px 10px;text-align:center;width:100%">Agregar capas a través de WMS</span>`

		let form = document.createElement("form")
		form.className = "wms-form"
		form.addEventListener('submit', handleURLInput, false);
    form.innerHTML = `
    <div class="input-group center-flex">
      <span class="input-group-addon center-flex" id="basic-addon1"><i class="fas fa-link"></i></span>
      <input value="" type='text' id='wms-input' class='form-control ag-input-text' name="input-url" placeholder="http://.../geoserver/ows?service=wms&version=1.3.0..." aria-describedby="basic-addon1">
      <button class="input-group-addon ag-btn ag-btn-primary" id="buttonConectar" onclick="handleURLInput(event)">Conectar</button>
    </div>
  `;

		let selectLayersContainer = document.createElement("div")
		selectLayersContainer.id = 'select-layers-container';

		let mainContainerFile = document.createElement("div")
		mainContainerFile.id = "file_gestor"
		mainContainerFile.style = "width:80%"

		let alert = document.createElement("div");
		alert.className = "alert alert-danger"
		alert.setAttribute('id', 'wrongURL');
		alert.innerHTML = "";

		modalContainer.append(mainIcons);
		modalContainer.append(tab_div);
		modalContainer.append(form);
		modalContainer.append(alert);
		modalContainer.append(selectLayersContainer);

		// Show previous layers and services loaded
		if (Object.keys(servicesLoaded)) {
			for (let sourceId in servicesLoaded) {
				let service = servicesLoaded[sourceId];
				let layers = service.layers;

				// Create the container and show the data
				let wmsResultContainer = document.createElement('div');
				// Show title and layers count
				let title = service.title;
				let serviceID = service.id;
				let header = document.createElement('div');
				header.classList.add("page-header");
				header.innerHTML = `
              <form class="title-service" submit="saveServiceTitle(${serviceID},event)">
			  	<div class="hide-section-button" onclick="hideSection(event,'${serviceID}')">▼</div>
                <h5 id="title-text-${serviceID}">${title}</h5>
                <input type="text" class="title-input-service" id="title-input-${serviceID}">
              </form>
              `;
				let editButton = document.createElement('button');
				editButton.classList.add('fas');
				editButton.classList.add('fa-pen-square');
				editButton.setAttribute('id', `title-edit-${serviceID}`);
				editButton.onclick = function (event) {
					editServiceTitle(serviceID, event)
				};

				let saveButton = document.createElement('button');
				saveButton.classList.add('fas');
				saveButton.classList.add('fa-save');
				saveButton.setAttribute('id', `title-save-${serviceID}`);
				saveButton.onclick = function (event) {
					saveServiceTitle(serviceID, event)
				};
				saveButton.style.display = 'none';

				header.childNodes[1].append(editButton);
				header.childNodes[1].append(saveButton);

				wmsResultContainer.append(header);

				let checkLabel = document.createElement('label');
				checkLabel.classList.add("all-layers-checkbox");
				checkLabel.classList.add(`label-${serviceID}`);
						
				let span = document.createElement('span');
				span.classList.add('tree-line');
				span.innerText = '─';
				
				let checkbox = document.createElement('input');
				checkbox.type = 'checkbox';
				checkbox.value = serviceID;

				let layerCount = 0;
				Object.keys(servicesLoaded[serviceID].layers).forEach(lyr => {
					if (selectedServiceLayers.includes(lyr)) {
						layerCount++
					}
				});

				checkbox.checked = (layerCount === Object.keys(servicesLoaded[serviceID].layers).length)
				checkbox.addEventListener('change', handleAllLayersCheck, false);
				
				let text = document.createElement('span');
				text.innerHTML = `&nbsp;Agregar todas <small>(${Object.keys(layers).length} capas)</small>`;
				
				checkLabel.append(span);
				checkLabel.append(checkbox);
				checkLabel.append(text);

				wmsResultContainer.append(checkLabel);
				
				// Show layers and checkboxes
				for (let i in layers) {
					let layer = layers[i];

					layersIndex[layer.name] = service.id;
					servicesLoaded[service.id].layers[layer.name] = layer;

					// let selected = selectedServiceLayers.some(e => e == layer.name);

					let checkLabel = document.createElement('label');
					checkLabel.classList.add(`label-${serviceID}`);
					let span = document.createElement('span');
					span.classList.add('tree-line');
					span.innerText = '──';

					let checkbox = document.createElement('input');
					checkbox.type = 'checkbox';
					checkbox.value = layer.name;
					checkbox.checked = selectedServiceLayers.some(e => e == layer.name);
					checkbox.addEventListener('change', handleLayerCheck, false);

					let title = document.createTextNode(` ${capitalize(layer.title)}`);

					checkLabel.append(span)
					checkLabel.append(checkbox)
					checkLabel.append(title)

					wmsResultContainer.append(checkLabel);
				}

				// Add the container to the modal
				selectLayersContainer.prepend(wmsResultContainer);

			}
		}


		return modalContainer;
	}

	OpenLoadServices() {
		openService = true;
		let component = modalService.createModal();
		return component;
	}

}

let modalService = new ModalService();

async function handleURLInput(e) {
	loadingBtn("on", "buttonConectar", "Conectar");
	e.preventDefault();
	let url = document.getElementsByName('input-url')[0].value;
	document.getElementsByName('input-url')[0].value = '';

	const serviceLayer = new ServiceLayers();

	// check if the service was added 
	let validHost = serviceLayer.validateUrl(url).host;
	let exist;

	for (let i in servicesLoaded) {
		exist = servicesLoaded[i].host === validHost;
	}
	// if the service was added show alert and break execution
	if (exist) {
		new UserMessage('El servicio ya fué agregado', true, 'warning');
		loadingBtn("off", "buttonConectar", "Conectar");
		return null
	};

	serviceLayer.loadWMS(url).then((layers)=>{
		if(document.getElementById('wrongURL')) document.getElementById('wrongURL').style.display = 'none';
		if(document.getElementById('buttonEnd')) document.getElementById('buttonEnd').style.display = 'block';
		// Add the service and layers to the array with loaded layers
		servicesLoaded[serviceLayer.getId()] = {
			title: serviceLayer.title,
			id: serviceLayer.id,
			abstract: serviceLayer.abstract,
			layers: [],
			host:serviceLayer.host,
		}
		// Create the container and show the data
		let wmsResultContainer = document.createElement('div');
		// Show title and layers count
		let title = serviceLayer.getTitle();
		let serviceID = serviceLayer.getId();
		let header = document.createElement('div');
		header.classList.add("page-header");
		header.innerHTML = `
		
		<form class="title-service" submit="saveServiceTitle(${serviceID},event)">
			<div class="hide-section-button" onclick="hideSection(event,'${serviceID}')">▼</div>
			<h5 id="title-text-${serviceID}">${title}</h5>
			<input type="text" class="title-input-service" id="title-input-${serviceID}">
		</form>
		`;
		let editButton = document.createElement('button');
		editButton.classList.add('fas');
		editButton.classList.add('fa-pen-square');
		editButton.setAttribute('id', `title-edit-${serviceID}`);
		editButton.onclick = function (event) {
			editServiceTitle(serviceID, event)
		};

		let saveButton = document.createElement('button');
		saveButton.classList.add('fas');
		saveButton.classList.add('fa-save');
		saveButton.setAttribute('id', `title-save-${serviceID}`);
		saveButton.onclick = function (event) {
			saveServiceTitle(serviceID, event)
		};
		saveButton.style.display = 'none';

		header.childNodes[1].append(editButton);
		header.childNodes[1].append(saveButton);

		wmsResultContainer.append(header);

		let checkLabel = document.createElement('label');
		checkLabel.classList.add("all-layers-checkbox");
		checkLabel.classList.add(`label-${serviceID}`);
		checkLabel.innerHTML = `
	<span class="tree-line">─</span><input type="checkbox" value="${serviceID}" onchange="handleAllLayersCheck(event)">&nbsp;Agregar todas <small>(${layers.length} capas)</small>
	`;
		wmsResultContainer.append(checkLabel);

		// Show layers and checkboxes
		layers.forEach((layer) => {
			layersIndex[layer.name] = serviceLayer.getId();
			servicesLoaded[serviceLayer.getId()].layers[layer.name] = layer;

			let checkLabel = document.createElement('label');
			checkLabel.classList.add(`label-${serviceID}`);
			checkLabel.innerHTML = `
		<span class="tree-line">──</span><input type="checkbox" value="${layer.name}" onchange="handleLayerCheck(event)">&nbsp;${capitalize(layer.title)}
		`;
			wmsResultContainer.append(checkLabel);
		})
		// Add the container to the modal
		document.getElementById('select-layers-container').prepend(wmsResultContainer);

		new UserMessage('El servicio fué agregado exitosamente', true, 'information');
		loadingBtn("off", "buttonConectar", "Conectar");

	}).catch((error)=>{
		loadingBtn("off", "buttonConectar", "Conectar");
		let customErrorMsg = "<br>No fué posible conectar con el servicio<br>";
		if(error.message.toLowerCase().includes('cors')){
			customErrorMsg += `<small style="margin-top:6px;display:block">El formato dado puede no ser el correcto o el servidor no acepta solicitudes de orígenes cruzados (<a href="https://developer.mozilla.org/es/docs/Web/HTTP/CORS" class="text-danger" target="_blank" alt="Sobre CORS" title="Sobre CORS"><strong><u>CORS</u></strong></a>)</small>`
		}
		if(error.message.toLowerCase().includes('failed to fetch')){
			customErrorMsg += `<small style="margin-top:6px;display:block">Posiblemente el protocolo de la URL no es correcto, probar cambiando "http" por "https".</small>`
		}
		document.getElementById('wrongURL').innerHTML = `<strong>${error.message}</strong>${customErrorMsg}`;
		document.getElementById('wrongURL').style.display = 'block';
		throw new Error(error);
	})
}

function hideSection(e,id) {
	let labels = document.getElementsByClassName(`label-${id}`);
	let state;

	if(labels[0].style.display=='none'){
		state = 'block'
		e.target.style.transform = "rotate(0deg)"
	}else {
		state = 'none'
		e.target.style.transform = "rotate(-90deg)"
	}
	
	for (let label of labels) {
		label.style.display = state;
	}
	
}

function editServiceTitle(serviceID, event) {
	event.preventDefault();
	event.target.remove();

	let text = document.getElementById(`title-text-${serviceID}`);
	let input = document.getElementById(`title-input-${serviceID}`);
	let value = text.innerText;

	text.style.display = 'none';
	input.style.display = 'block';

	let button = document.getElementById(`title-save-${serviceID}`);
	button.style.display = 'block';
	input.value = value;

	input.focus();
}

function saveServiceTitle(serviceID, event) {
	event.preventDefault();
	event.target.style.display = 'none';

	let text = document.getElementById(`title-text-${serviceID}`);
	let input = document.getElementById(`title-input-${serviceID}`);
	let value = (input.value.length) ? input.value : servicesLoaded[serviceID].title;

	menu_ui.editGroupName(serviceID, text.innerText, value);
	servicesLoaded[serviceID].title = value;
	text.innerText = value;

	text.style.display = 'block';
	input.style.display = 'none';

	let editButton = document.createElement('button');
	editButton.classList.add('fas');
	editButton.classList.add('fa-pen-square');
	editButton.setAttribute('id', `title-edit-${serviceID}`);
	editButton.onclick = function (event) {
		editServiceTitle(serviceID, event)
	};

	document.getElementsByClassName('title-service')[0].appendChild(editButton);
}


function handleAllLayersCheck(e) {
	if (e.target.checked) {
		for (let layer_name in servicesLoaded[e.target.value].layers) {
			let exist = selectedServiceLayers.some(l=>l==layer_name);
			if(!exist){
				document.querySelector(`input[value='${layer_name}']`).checked = true
				selectedServiceLayers.push(layer_name);

				addedLayers.push({
					id: layersIndex[layer_name],
					layer: servicesLoaded[layersIndex[layer_name]].layers[layer_name],
					name: layer_name,
					file_name: layer_name,
					isActive: false,
					type: "WMS",
					section: servicesLoaded[layersIndex[layer_name]].title
				});
				menu_ui.addLayerToGroup(servicesLoaded[layersIndex[layer_name]].title, "WMS", layer_name, layersIndex[layer_name], layer_name, servicesLoaded[layersIndex[layer_name]].layers[layer_name]);
			}
		}
	} else {
		let groupName;
		for (let layer_name in servicesLoaded[e.target.value].layers) {
			groupName = servicesLoaded[layersIndex[layer_name]].title;

			addedLayers.forEach((layer) => {
				if (layer.section === groupName) {
					let index = addedLayers.indexOf(layer);
					if (index > -1) {
						if (layer.isActive) mapa.removeLayer(overlayMaps[layer.name]);
						delete overlayMaps[layer.name];
						addedLayers.splice(index, 1);
					}
				}
			});
			updateNumberofLayers(servicesLoaded[layersIndex[layer_name]].title);
			
			menu_ui.removeLayerFromGroup(servicesLoaded[layersIndex[layer_name]].title, layer_name,layersIndex[layer_name],servicesLoaded[layersIndex[layer_name]].layers[layer_name]);

			document.querySelector(`input[value='${layer_name}']`).checked = false
			for (let i in selectedServiceLayers) {
				if (selectedServiceLayers[i] === layer_name) {
					selectedServiceLayers.splice(i, 1);
					break;
				}
			}
		}
		menu_ui.removeLayersGroup(groupName);
	}
}

function handleLayerCheck(e) {
	if (e.target.checked) {
		selectedServiceLayers.push(e.target.value);

		addedLayers.push({
			id: layersIndex[e.target.value],
			layer: servicesLoaded[layersIndex[e.target.value]].layers[e.target.value],
			name: e.target.value,
			file_name: e.target.value,
			isActive: false,
			type: "WMS",
			section: servicesLoaded[layersIndex[e.target.value]].title
		});

		menu_ui.addLayerToGroup(servicesLoaded[layersIndex[e.target.value]].title, "WMS", e.target.value, layersIndex[e.target.value], e.target.value, servicesLoaded[layersIndex[e.target.value]].layers[e.target.value]);

	} else {
		addedLayers.forEach((layer) => {
			if (layer.name == e.target.value) {
				if (layer.isActive) mapa.removeLayer(overlayMaps[layer.name]);
				delete overlayMaps[layer.name];
				let index = addedLayers.indexOf(layer);
				if (index > -1) {
					addedLayers.splice(index, 1);
				}
			}
		});
		updateNumberofLayers(servicesLoaded[layersIndex[e.target.value]].title);

		menu_ui.removeLayerFromGroup(servicesLoaded[layersIndex[e.target.value]].title, e.target.value, layersIndex[e.target.value], e.target.value, servicesLoaded[layersIndex[e.target.value]].layers[e.target.value]);
		for (let i in selectedServiceLayers) {
			if (selectedServiceLayers[i] === e.target.value) {
				selectedServiceLayers.splice(i, 1);
				break;
			}
		}
	}

}

function capitalize(word) {
	return word[0].toUpperCase() + word.slice(1).toLowerCase();
}