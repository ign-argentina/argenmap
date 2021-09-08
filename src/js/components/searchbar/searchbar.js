const geosearchbar_top = "60px"
const geosearchbar_left = "300px"
const geosearchbar_color_focus = "#008dc9"
const geosearchbar_background_color = "rgba(255, 255, 255, 0.7)"
const url_search = app.geocoder.url_search
const url_by_id= app.geocoder.url_by_id
const limit = app.geocoder.limit
let results = null
let url_consulta = null
let id_search = null
let search_term = null
let loading_searchbar = false


class Searchbar_UI{
  constructor()
  {
    this.style_top = app.searchbar.top? app.searchbar.top :geosearchbar_top
    this.style_left = app.searchbar.left? app.searchbar.left :geosearchbar_left
    this.style_color_focus = app.searchbar.color_focus? app.searchbar.color_focus : geosearchbar_color_focus
    this.style_background_color  = app.searchbar.background_color? app.searchbar.background_color: geosearchbar_background_color
  }

  createStyle(){
    const style = document.createElement('style');
    style.id="geocoder-style"
    style.innerHTML = `
    @media (min-width: 769px) {
    #searchbar {
      left: ${this.style_left};
      top: ${this.style_top};
      background-color: ${this.style_background_color};
    }}
    #search_bar:focus {
        box-shadow: 0 0 3px ${this.style_color_focus} !important;
        -moz-box-shadow: 0 0 3px ${this.style_color_focus}!important;
        -webkit-box-shadow: 0 0 3px ${this.style_color_focus}!important;
    }
      `
    document.head.appendChild(style);
  }

  create_sarchbar(){
    this.createStyle()
    let divsearch = document.createElement("div")
    divsearch.id = "searchbar"

    let maininput = document.createElement("div")
    maininput.style.display = "flex"

    let input = document.createElement("input")
    input.placeholder = "Buscar..."
    input.id = "search_bar"
    input.autocomplete = "off"
    
    let icon = document.createElement("div")
    icon.id = "div-icon-close-searchbar"
    icon.style = "margin: 5px;text-align:center;width:32px;height:27px"
    icon.innerHTML = `<i class="fa fa-times" aria-hidden="true" style="color:grey;width:24px;height:24px"></i>`
    icon.style.width = "10%"
    maininput.append(input)
    maininput.append(icon)

    let res = document.createElement("div")
    res.id = "results_search_bar"
    res.style.maxWidth = "330px"

    divsearch.append(maininput)
    divsearch.append(res)
    
    document.body.appendChild(divsearch)
    
    let textinput = document.getElementById("search_bar")
    let results = document.getElementById("results_search_bar")
    const search_input = document.getElementById('search_bar');
    search_input.spellcheck = "false"
    const icon_searchbar = document.getElementById('div-icon-close-searchbar');

    icon_searchbar.style.display = "none"

    icon_searchbar.addEventListener('click', (e) => {
      icon_searchbar.style.display = "none"
      textinput.value = ""
      results.innerHTML = ""
      results.style.margin = "0px"
      search_input.style.width = "130px"
      mapa.removeGroup("markerSearchResult", true);
    });

    search_input.onkeyup = async (e) => {
      let q = e.target.value;
      q = q.trim();
      q = q.toLowerCase();

       if(q.length ===0){
        loading_searchbar =  false
        search_term = null
        search_input.style.width = "130px"
        icon_searchbar.style.display = "none"
        results.innerHTML = ""
        }
        else if(q.length <=2) {
          results.innerHTML = ""
          loading_searchbar =  false
          search_input.style.width = "300px"
          icon_searchbar.style.display="block"
          }
      else{
          this.loading("false")
          results.innerHTML = ""
          search_input.style.width = "300px"
          icon_searchbar.style.display="block"
          search_term = q
          if (regexValidator(search_term) && !loading_searchbar) {showGeocoderResults()}
      }
    }
    
  }

  create_item_notfound(){
    let container = document.getElementById("results_search_bar")
    let ul = document.createElement("ul");
    ul.className = "list-group-gc"
    ul.style.margin = "5px"

    let li = document.createElement("li")
    li.innerHTML = 'No encontrado'
    li.className = "list-group-item-gc"
    li.style="cursor: pointer;color:grey;"

    ul.append(li)
    container.innerHTML = "";  
    container.append(ul)
  }

  create_character_invalid(){
    let container = document.getElementById("results_search_bar")
    let ul = document.createElement("ul");
    ul.className = "list-group-gc"
    ul.style.margin = "5px"

    let li = document.createElement("li")
    li.innerHTML = 'Carácter no válido'
    li.className = "list-group-item-gc"
    li.style="cursor: pointer;color:grey;"

    ul.append(li)
    container.innerHTML = "";  
    container.append(ul)
  }


  create_items(items){
    let container = document.getElementById("results_search_bar")
    const ul = document.createElement("ul");
    ul.className = "list-group-gc"
    ul.style.margin = "5px"
    url_consulta = url_search+search_term
    container.innerHTML = "";  

    items.forEach((el) => {
      container.innerHTML = ""; 
      let li = document.createElement("li")
      li.onclick = (e) => {
        id_search = el.place.id
        searchById(el.place.id)
      };
      let txtresult = el.place.name+" "+el.place.depto+" "+el.place.pcia
      let n_txtresult = norma(txtresult)
      let index = n_txtresult.indexOf(search_term)
      let end = index+search_term.length
      let original_txt = txtresult.slice(index,end);
      let newtxt = '<strong>'+original_txt+'</strong>'
      txtresult = txtresult.replace(original_txt,newtxt);

      li.innerHTML = '<i class="fa fa-map-marker" aria-hidden="true" style="color:silver;margin-right: 10px;"></i>'+txtresult
      li.className = "list-group-item-gc"
      li.style="cursor: pointer;"
      ul.append(li)
    });
    container.append(ul)
  }

  create_coord_result(data){
    let lat = data.geom.coordinates[1]
    let lng = data.geom.coordinates[0]
    mapa.setView([lat, lng], 13);

    let geojsonMarker = {
        type: "Feature",
        properties: {
        },
        geometry: { type: "Point", coordinates: [lng,lat]},
    }
    mapa.addGeoJsonLayerToDrawedLayers(geojsonMarker , "markerSearchResult", false)

    let container = document.getElementById("results_search_bar")
    container.style="margin: 5px"
    container.innerHTML=""
    let card = document.createElement("div")
    card.className = "card"
    let data_split = data.properties.split(",")
    let cardtext = ""
    for(let item in data_split){
      cardtext +=`<h6 class="card-text">${data_split[item]}</h6>`
    }
    
    let html = `
    <li class="list-group-item-gc" style="height:auto">
    <div class="card-body">
      <br>
      <h5 class="list-group-item-heading-gc"><i class="fa fa-map-marker" aria-hidden="true" style="color:grey;margin-right: 10px;"></i>${data.geom.coordinates[1]} ,${data.geom.coordinates[0]}</h5>
      ${cardtext}
    </div>
    </li>
  `
    card.innerHTML = html
    container.append(card)
    
    
  }

  create_card(data){
    let container = document.getElementById("results_search_bar")
    container.style="margin: 5px"
    container.innerHTML=""
    let card = document.createElement("div")
    card.className = "card"
    let html = `
    <li class="list-group-item-gc" style="height:auto">
    <div class="card-body">
      <br>
      <h4 class="list-group-item-heading-gc"><i class="fa fa-map-marker" aria-hidden="true" style="color:grey;margin-right: 10px;"></i>${data.properties.name}</h5>
      <h6 class="card-subtitle mb-2 text-muted">${data.geometry.coordinates[1]}, ${data.geometry.coordinates[0]}</h6>
      <h6 class="card-text">Codigo BAHRA: ${data.properties.cod_bahra}</p>
      <h6 class="card-text">Dpto: ${data.properties.depto}</p>
      <h6 class="card-text">Provincia: ${data.properties.pcia}</p>
    </div>
    </li>
  `
    card.innerHTML = html
    container.append(card)
  }

  loading(value){
    let iconclose = document.getElementById("div-icon-close-searchbar")
    if(value === "true"){
      loading_searchbar =  true
      iconclose.innerHTML= '<div><img style="width:24px;height:24px" src="src/styles/images/loading.svg"></div>'
    }else{
      loading_searchbar =  false
      iconclose.innerHTML='<i class="fa fa-times" aria-hidden="true" style="color:grey;width:24px;height:24px"></i>'}
  }

}
let ui_elements = new Searchbar_UI

const fetchGeocoder= async () => {
  try{
    response_items = await fetch(url_consulta).then(
    res => res.json());
  }
  catch(err) {
    response_items = []
    ui_elements.loading("false")
    new UserMessage(err.message, true, 'error')
  }
}


const showGeocoderResults = async () => {
  try{
      mapa.removeGroup("markerSearchResult", true);
      
      ui_elements.loading("true")
      url_consulta = url_search+search_term
      let word =  search_term
      await fetchGeocoder();

      if (word != search_term){
        ui_elements.loading("false")
      }
      else if(response_items[0] && response_items[0].row_to_json){
        ui_elements.loading("false")
        ui_elements.create_coord_result(response_items[0].row_to_json)
      }
      else if (response_items.length===0 || response_items === undefined){
        ui_elements.loading("false")
        ui_elements.create_item_notfound()
      }
      else{
        ui_elements.loading("false")
        ui_elements.create_items(response_items)
      }

  }
  catch(err) {
      ui_elements.loading("false")
      new UserMessage(err.message, true, 'error')
  }
}

const  searchById = async () => {
  try{
    url_consulta = url_by_id + id_search+"&format=geojson"
    await fetchGeocoder();

    let lat = response_items.features[0].geometry.coordinates[1]
    let lng = response_items.features[0].geometry.coordinates[0]
    mapa.setView([lat, lng], 13);

    let geojsonMarker = {
        type: "Feature",
        properties: {
        },
        geometry: { type: "Point", coordinates: [lng,lat]},
    }
    mapa.addGeoJsonLayerToDrawedLayers(geojsonMarker , "markerSearchResult", false)

    let newcard = new Searchbar_UI
    newcard.create_card(response_items.features[0])
  }
  catch(err) {
    ui_elements.loading("false")
    new UserMessage(err.message, true, 'error')
  }
};

let norma= (function() {
  var from = "ÃÀÁÄÂÈÉËÊÌÍÏÎÒÓÖÔÙÚÜÛãàáäâèéëêìíïîòóöôùúüûÑñÇç", 
      to   = "AAAAAEEEEIIIIOOOOUUUUaaaaaeeeeiiiioooouuuunncc",
      mapping = {};
 
  for(var i = 0, j = from.length; i < j; i++ )
      mapping[ from.charAt( i ) ] = to.charAt( i );
 
  return function( str ) {
      var ret = [];
      for( var i = 0, j = str.length; i < j; i++ ) {
          var c = str.charAt( i );
          if( mapping.hasOwnProperty( str.charAt( i ) ) )
              ret.push( mapping[ c ] );
          else
              ret.push( c );
      }      
      return ret.join( '' ).toLowerCase();
  }
 
})();


const agregarCaracter = (cadena, caracter, pasos) => {
  let cadenaConCaracteres = "";
  const longitudCadena = cadena.length;
  for (let i = 0; i < longitudCadena; i += pasos) {
      if (i + pasos < longitudCadena) {
          cadenaConCaracteres += cadena.substring(i, i + pasos) + caracter;
      } else {
          cadenaConCaracteres += cadena.substring(i, longitudCadena);
      }
  }
  return cadenaConCaracteres;
}

function regexValidator(val) {
  //caracteres permitidos para coordenadas: ° ' " -
  let reg = /[!^()_+=@$#%&*:<>?/{|}]+/
  let reg_url = /(http|https):\/\/([^\/\r\n]+)(\/[^\r\n]*)?/
          if(val.match(reg) === null && val.match(reg_url) === null){
            return true
          }else {
            ui_elements.create_character_invalid()
            return false
          }
}