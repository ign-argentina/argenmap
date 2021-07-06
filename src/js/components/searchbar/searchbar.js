let results = ""
let search_term = ""
let url_search = "src/js/components/searchbar/lista.json"
//let url_search = "https://mapa.ign.gob.ar/search?"
let limit = 5

class Geocoder_config{
/*
    url = null;
    lang = null;
    limit = null;
    key = null;

 setConfig(){}*/
}
class Searchbar_UI{
  createElement(){
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
    
    let icon = document.createElement("div")
    icon.id = "div-icon-searchbar"
    icon.style = "padding-left: 10px;"
    icon.innerHTML = `<i id="spanopenfolder" class="fa fa-search" aria-hidden="true" style="color:grey;width:20px; "></i>`
    icon.style.width = "10%"

    maininput.append(input)
    maininput.append(icon)

    let res = document.createElement("div")
    res.id = "results_search_bar"

    divsearch.append(maininput)
    divsearch.append(res)
    
    let mapa = document.getElementById("mapa")
    mapa.appendChild(divsearch)

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


class Cards_UI{
}


const fetchGeocoder= async () => {

	response_items = await fetch(url_search).then(
		res => res.json()
	);
}

const showGeocoderResults = async () => {
  let container = document.getElementById("results_search_bar")

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
    ul.append(li)
  }


  container.innerHTML = "";  
  container.append(ul)
}

