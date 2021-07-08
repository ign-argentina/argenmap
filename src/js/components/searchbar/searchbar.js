let geosearchbar_top = null
let geosearchbar_left = null
let geosearchbar_color_focus = null
let geosearchbar_background_color = null
let results = ""
let search_term = ""
let url_search = "src/js/components/searchbar/lista.json"

let limit = 5

geosearchbar_top =  (app.searchbar.top)? app.searchbar.top : DEFAULT_GEOSEARCHBAR_TOP
geosearchbar_left =  app.searchbar.left? app.searchbar.left : DEFAULT_GEOSEARCHBAR_LEFT
geosearchbar_color_focus =  app.searchbar.color_focus? app.searchbar.color_focus: DEFAULT_GEOSEARCHBAR_COLOR_FOCUS
geosearchbar_background_color =  app.searchbar.background_color? app.searchbar.background_color: DEFAULT_GEOSEARCHBAR_BACKGROUND_COLOR

class Geocoder_config{
/*
    url = null;
    lang = null;
    limit = null;
    key = null;

 setConfig(){}*/
}

class Searchbar_UI{
  constructor()
  {
    this.style_top = geosearchbar_top
    this.style_left = geosearchbar_left
    this.style_color_focus = geosearchbar_color_focus
    this.style_background_color  = geosearchbar_background_color 
  }

  createStyle(){
    const style = document.createElement('style');
    style.id="geocoder-style"
    style.innerHTML = `
    #searchbar {
      width: 300px;
      height: auto;
      overflow: hidden;
      float: none;
      border-radius: 8px;
      z-index: 1500;
      border: 3px;
      padding: 5px;
      background-color: ${this.style_background_color};
      left: ${this.style_left};
      top: ${this.style_top};
      position: absolute;
      margin: 5px;
      -moz-box-shadow: inset 0 0 10px #000000;
      -webkit-box-shadow: inset 0 0 10px #000000;
      box-shadow: 0 4px 10px 0 rgba(0, 0, 0, 0.2), 0 4px 20px 0 rgba(0, 0, 0, 0.19);
    }
    
    input:focus{
      border: 1px !important;
      border-radius: 8px !important;
      box-shadow: 0 0 3px ${this.style_color_focus} !important;
      -moz-box-shadow: 0 0 3px ${this.style_color_focus}!important;
      -webkit-box-shadow: 0 0 3px ${this.style_color_focus}!important;
    }
    
    .searchbar-input{
      padding-left: 10px;
      outline: none;
      border-radius: 8px
    }
    
    .searchbar-input:hover{
      border: 1px !important;
      border-radius: 8px !important;
      box-shadow: 0 0 3px ${this.style_color_focus} !important;
      -moz-box-shadow: 0 0 3px ${this.style_color_focus} !important;
      -webkit-box-shadow: 0 0 3px ${this.style_color_focus} !important;
    }
    `
    document.head.appendChild(style);
  }

  createElement(){
    this.createStyle()
    let divsearch = document.createElement("div")
    divsearch.id = "searchbar"

    let maininput = document.createElement("div")
    maininput.style.display = "flex"
    maininput.style.flexDirection = "row"
    maininput.style.border = "1px"

    let input = document.createElement("input")
    input.placeholder = "Buscar..."
    input.id = "search_bar"
    input.autocomplete = "off"
    input.className = "searchbar-input"
    input.style.width = "90%"
    input.style.border = "0px"
    input.style.margin = "5px"
    
    let icon = document.createElement("div")
    icon.id = "div-icon-searchbar"
    icon.style = "margin: 5px;"
    icon.innerHTML = `<i id="spanopenfolder" class="fa fa-search" aria-hidden="true" style="color:grey;width:20px; "></i>`
    icon.style.width = "10%"

    maininput.append(input)
    maininput.append(icon)

    let res = document.createElement("div")
    res.id = "results_search_bar"

    divsearch.append(maininput)
    divsearch.append(res)
    
    let mapa = document.getElementById("mapa")
    //mapa.appendChild()
    document.body.appendChild(divsearch)

    const search_input = document.getElementById('search_bar');
    
    search_input.addEventListener('input', (e) => {
      search_term = e.target.value;
      if(search_term.length ===0){
        let container = document.getElementById("results_search_bar")
        container.innerHTML = ""
      }
      if(search_term.length >= 3) showGeocoderResults()
    });
    
  }
}


class Card_UI{
  createElement(data){
    let container = document.getElementById("results_search_bar")
    container.style="margin: 5px"
    container.innerHTML=""
    console.log(data.properties)
    let card = document.createElement("div")
    card.className = "card"
    let html = `
    <li class="list-group-item-gc" style="height:auto">
    <div class="card-header bg-transparent border-bottom-0"><button id="close_card_gc" type="button" class="closebtn">
    <span aria-hidden="true">×</span>
  </button></div>
    <div class="card-body">
      <br>
      <h4 class="list-group-item-heading-gc"><i class="fa fa-map-marker" aria-hidden="true" style="color:grey;margin-right: 10px;"></i>${data.properties.name}</h5>
      <h6 class="card-subtitle mb-2 text-muted">Coordenadas: ${data.geometry.coordinates}</h6>
      <h6 class="card-text">Codigo BAHRA: ${data.properties.cod_bahra}</p>
      <h6 class="card-text">Dpto: ${data.properties.depto}</p>
      <h6 class="card-text">Provincia: ${data.properties.pcia}</p>
    </div>
    </li>
  `

    card.innerHTML = html
    container.append(card)

    let btn = document.getElementById("close_card_gc")
    btn.addEventListener('click', (e) => {
      container.innerHTML=""
    });
  }
}


const fetchGeocoder= async () => {
  //response_items = await fetch(url_search+search_term).then(
	  response_items = await fetch(url_search).then(
		res => res.json()
	);
}

const showGeocoderResults = async () => {
  let container = document.getElementById("results_search_bar")
  container.style.margin = "5px;"

	results.innerHTML = '';
	
  const ul = document.createElement("ul");
  ul.className = "list-group-gc"

	await fetchGeocoder();

  for (let  i = 0; i<limit; i++){

    let item = response_items.features[i]
    let li = document.createElement("li")
    let lat = item.geometry.coordinates[1]
    let lng = item.geometry.coordinates[0]
    li.onclick = (e) => {
      let newcard = new Card_UI
      newcard.createElement(item)
      mapa.flyTo([lat, lng],12);
      let geojsonMarker = {
        type: "Feature",
        properties: {
        },
        geometry: { type: "Point", coordinates: [lng,lat]},
      }
      mapa.addGeoJsonLayerToDrawedLayers(geojsonMarker , "geojsonMarker", false)
    };
    li.innerHTML = '<i class="fa fa-map-marker" aria-hidden="true" style="color:silver;margin-right: 10px;"></i>'+item.properties.name+" " + item.properties.depto +" "+  item.properties.pcia
    li.className = "list-group-item-gc"
    li.style="cursor: pointer;"
    ul.append(li)
  }

  container.innerHTML = "";  
  container.append(ul)
}

