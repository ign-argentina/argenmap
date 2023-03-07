const config_url = app.geocoder.url;
const config_search = app.geocoder.search;
const config_places = app.geocoder.url_by_id;
const config_query = app.geocoder.query;
const config_lang = app.geocoder.lang;
const config_limit = app.geocoder.limit;
const config_key = app.geocoder.key;
const sb_strings = app.searchbar.strings;
const geosearchbar_top = "60px";
const geosearchbar_left = "300px";
const geosearchbar_color_focus = "#008dc9";
const geosearchbar_background_color = "rgba(255, 255, 255, 0.7)";

let results = null;
let url_consulta = null;
let id_search = null;
let search_term = null;
let itsloading = false;
let selected_item = false;
let id_selected_item = null;

class Searchbar_UI {
  constructor() {
    this.style_top = app.searchbar.top ? app.searchbar.top : geosearchbar_top;
    this.style_left = app.searchbar.left
      ? app.searchbar.left
      : geosearchbar_left;
    this.style_color_focus = app.searchbar.color_focus
      ? app.searchbar.color_focus
      : geosearchbar_color_focus;
    this.style_background_color = app.searchbar.background_color
      ? app.searchbar.background_color
      : geosearchbar_background_color;
  }

  createStyle() {
    const style = document.createElement("style");
    style.id = "geocoder-style";
    style.innerHTML = `
    @media (min-width: 769px) {
    #searchbar {
      background-color: ${this.style_background_color};
    }}
    #search_bar:focus {
        box-shadow: 0 0 3px ${this.style_color_focus} !important;
        -moz-box-shadow: 0 0 3px ${this.style_color_focus}!important;
        -webkit-box-shadow: 0 0 3px ${this.style_color_focus}!important;
    }
      `;
    document.head.appendChild(style);
  }

  create_sarchbar() {
    this.createStyle();
    let divsearch = document.createElement("div");
    divsearch.id = "searchbar";

    let maininput = document.createElement("div");
    maininput.style.display = "flex";

    let input = document.createElement("input");
    input.placeholder = sb_strings.placeholder || "Search places...";
    input.id = "search_bar";
    input.spellcheck = false;
    input.autocomplete = "off";
    input.type = "search";

    let icon = document.createElement("div");
    icon.id = "div-icon-close-searchbar";
    icon.style = "margin: 5px;text-align:center;width:32px;height:27pxdisplay:flex;align-items:flex-end;justify-content:center;";
    icon.innerHTML = `<i class="fa fa-times" aria-hidden="true" style="color:grey;width:24px;height:24px;"></i>`;
    icon.style.width = "10%";
    maininput.append(input);
    maininput.append(icon);

    let res = document.createElement("div");
    res.id = "results_search_bar";
    res.style.maxWidth = "330px";
    res.style.position = "absolute";

    divsearch.append(maininput);
    divsearch.append(res);

    //document.body.appendChild(divsearch)
    document.getElementById("search-navbar").appendChild(divsearch);

    let textinput = document.getElementById("search_bar");
    let results = document.getElementById("results_search_bar");
    const search_input = document.getElementById("search_bar");
    const icon_searchbar = document.getElementById("div-icon-close-searchbar");

    icon_searchbar.style.display = "none";

    icon_searchbar.addEventListener("click", (e) => {
      icon_searchbar.style.display = "none";
      textinput.value = "";
      results.innerHTML = "";
      results.style.margin = "0px";
      search_input.style.width = "130px";
      mapa.removeGroup("markerSearchResult", true);
      if (innerWidth  <= 768) {
        document.getElementById("logo-navbar").style.display= ""
      }
    });

    search_input.onkeyup = async (e) => {
      let items = $(".list-group-item-gc");
      let q = e.target.value;
      q = q.trim();
      q = q.toLowerCase();

      if (e.which == 13 && selected_item) {
        let id = response_items[id_selected_item].place.id;
        id_search = id;
        searchById();
      }

      //e.which == 40 down
      if (e.which == 40 && items.length > 0) {
        selectorItems(40);
      }

      //e.which == 38 up
      if (e.which == 38 && items.length > 0) {
        selectorItems(38);
      }

      if (q.length === 0) {
        search_term = null;
        search_input.style.width = "130px";
        icon_searchbar.style.display = "none";
        results.innerHTML = "";
        selected_item = false;
        if (innerWidth  <= 768) {
          document.getElementById("logo-navbar").style.display= ""
        }
      } else if (q.length <= 2) {
        results.innerHTML = "";
        search_input.style.width = "300px";
        icon_searchbar.style.display = "flex";
        selected_item = false;
        if (innerWidth  <= 768) {
          document.getElementById("logo-navbar").style.display= "none"
        }
      } else {
        search_input.style.width = "300px";
        icon_searchbar.style.display = "flex";
        search_term = q;
        if (innerWidth  <= 768) {
          document.getElementById("logo-navbar").style.display= "none"
        }
        //e.which <= 90 && e.which >= 48 Alfanumericos
        //e.which == 13 Enter
        //e.which == 8 Backspace
        //e.which == 229 Teclado Android
        if (
          (e.which <= 90 && e.which >= 48) ||
          (e.which == 13 && !selected_item) ||
          e.which == 8 ||
          e.which == 229
        ) {
          this.loading("false");
          results.innerHTML = "";
          selected_item = false;
          //si contienen caracteres invalidos #$%#$% o es igual a url
          if (regexValidator(search_term) && !itsloading) {
            itsloading = true;
            showGeocoderResults();
          }
        }
      }
    };

    /* ACTIVACION AUTOMATICA DE RESULTADO */
    $("#search_bar").focusin(function (e) {
      let items = $(".list-group-item-gc");
      let q = e.target.value;
      q = q.trim();
      q = q.toLowerCase();
      
      if (q.length === 0) {
        search_term = null;
        search_input.style.width = "130px";
        icon_searchbar.style.display = "none";
        results.innerHTML = "";
        selected_item = false;
      } else if (q.length <= 2) {
        results.innerHTML = "";
        search_input.style.width = "300px";
        icon_searchbar.style.display = "flex";
        if (innerWidth  <= 768) {
          document.getElementById("logo-navbar").style.display= "none"
        }
        selected_item = false;
      } else {
        search_input.style.width = "300px";
        icon_searchbar.style.display = "flex";
        search_term = q;
        results.innerHTML = "";
        if (innerWidth  <= 768) {
          document.getElementById("logo-navbar").style.display= "none"
        }
        selected_item = false;
        //si contienen caracteres invalidos #$%#$% o es igual a url
        if (regexValidator(search_term) && !itsloading) {
          itsloading = true;
          showGeocoderResults();
        }
      }
    });
    /* CIERRA ACTIVACION AUTOMATICA DE RESULTADO */
  }

  create_item_notfound() {
    let container = document.getElementById("results_search_bar");
    let ul = document.createElement("ul");
    ul.className = "list-group-gc";
    ul.style.margin = "5px";

    let li = document.createElement("li");
    li.innerHTML = "No encontrado";
    li.className = "list-group-item-gc";
    li.style = "cursor: pointer;color:grey;";

    ul.append(li);
    container.innerHTML = "";
    container.append(ul);
  }

  create_character_invalid() {
    let container = document.getElementById("results_search_bar");
    let ul = document.createElement("ul");
    ul.className = "list-group-gc";
    ul.style.margin = "5px";
    ul.style.position = "absolute";
    ul.style.width = "300px";
    let li = document.createElement("li");
    li.innerHTML = "Carácter no válido";
    li.className = "list-group-item-gc";
    li.style = "cursor: pointer;color:grey;";

    ul.append(li);
    container.innerHTML = "";
    container.append(ul);
    container.style.position = "absolute";
    container.style.width = "300px";
  }

  create_items(items) {
    let container = document.getElementById("results_search_bar");
    const ul = document.createElement("ul");
    ul.className = "list-group-gc";
    ul.style.margin = "5px";
    ul.style.position = "absolute";
    ul.style.width = "300px";
    ul.id = "ul-results";
    container.innerHTML = "";
    container.style.position = "absolute";
    container.style.width = "300px";

    items.forEach((el) => {
      container.innerHTML = "";
      let li = document.createElement("li");
      li.id = el.place.id;
      li.onclick = (e) => {
        id_search = el.place.id;
        searchById();
      };
      let txtresult =
        el.place.name + ", " + el.place.depto + ", " + el.place.pcia;
      let n_txtresult = norma(txtresult);
      let index = n_txtresult.indexOf(search_term);
      let end = index + search_term.length;
      let original_txt = txtresult.slice(index, end);
      let newtxt = "<strong>" + original_txt + "</strong>";
      txtresult = txtresult.replace(original_txt, newtxt);

      li.innerHTML =
        '<i class="fa fa-map-marker" aria-hidden="true" style="color:silver;margin-right: 10px;"></i><span class="txtg-result">' +
        txtresult +
        "</span>";
      li.className = "list-group-item-gc";
      li.style = "cursor: pointer;";
      ul.append(li);
    });
    container.append(ul);
  }

  create_coord_result(data) {
    let lat = data.geom.coordinates[1];
    let lng = data.geom.coordinates[0];
    mapa.setView([lat, lng], 13);

    let geojsonMarker = {
      type: "Feature",
      properties: {},
      geometry: { type: "Point", coordinates: [lng, lat] },
    };
    mapa.addGeoJsonLayerToDrawedLayers(
      geojsonMarker,
      "markerSearchResult",
      false
    );

    let container = document.getElementById("results_search_bar");
    container.style = "margin: 5px";
    container.style.position = "absolute";
    container.style.width = "300px";
    container.innerHTML = "";
    let card = document.createElement("div");
    card.className = "card";
    let data_split = data.properties.split(",");
    let cardtext = "";
    for (let item in data_split) {
      cardtext += `<h6 class="card-text">${data_split[item]}</h6>`;
    }

    let html = `
    <li class="list-group-item-gc" style="height:auto">
    <div class="card-body">
      <br>
      <h5 class="list-group-item-heading-gc"><i class="fa fa-map-marker" aria-hidden="true" style="color:grey;margin-right: 10px;"></i>${data.geom.coordinates[1]} ,${data.geom.coordinates[0]}</h5>
      ${cardtext}
    </div>
    </li>
  `;
    card.innerHTML = html;
    container.append(card);
  }

  create_card(data) {
    let container = document.getElementById("results_search_bar");
    container.style = "margin: 5px";
    container.style.position = "absolute";
    container.style.width = "300px";
    container.innerHTML = "";
    let card = document.createElement("div");
    card.className = "card";
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
  `;
    card.innerHTML = html;
    container.append(card);
  }

  loading(value) {
    let iconclose = document.getElementById("div-icon-close-searchbar");
    if (value === "true") {
      iconclose.innerHTML =
        '<div style="width:20px;height:20px;animation:spin 1s linear infinite;"><i class="fa fa-spinner" aria-hidden="true"></i></div>';
    } else {
      iconclose.innerHTML =
        '<i class="fa fa-times" aria-hidden="true" style="color:grey;width:24px;height:24px"></i>';
    }
  }
}
let ui_elements = new Searchbar_UI();

const fetchGeocoder = async () => {
  try {
    response_items = await fetch(url_consulta).then((res) => res.json());
  } catch (err) {
    response_items = [];
    ui_elements.loading("false");
    new UserMessage(err.message, true, "error");
  }
};

const showGeocoderResults = async () => {
  try {
    mapa.removeGroup("markerSearchResult", true);
    ui_elements.loading("true");
    url_consulta = `${config_url}${config_search}?${config_query}=${search_term}&limit=${config_limit}`;
    await fetchGeocoder();

    if (response_items[0] && response_items[0].row_to_json) {
      itsloading = false;
      ui_elements.loading("false");
      ui_elements.create_coord_result(response_items[0].row_to_json);
    } else if (response_items.length === 0 || response_items === undefined) {
      itsloading = false;
      ui_elements.loading("false");
      ui_elements.create_item_notfound();
    } else {
      itsloading = false;
      ui_elements.loading("false");
      ui_elements.create_items(response_items);
    }
  } catch (err) {
    ui_elements.loading("false");
    new UserMessage(err.message, true, "error");
  }
};

const searchById = async () => {
  try {
    url_consulta =
      config_url + config_places + "?id=" + id_search + "&format=geojson";
    await fetchGeocoder();

    let lat = response_items.features[0].geometry.coordinates[1];
    let lng = response_items.features[0].geometry.coordinates[0];
    mapa.setView([lat, lng], 13);

    let geojsonMarker = {
      type: "Feature",
      properties: {},
      geometry: { type: "Point", coordinates: [lng, lat] },
    };
    mapa.addGeoJsonLayerToDrawedLayers(
      geojsonMarker,
      "markerSearchResult",
      false
    );

    let newcard = new Searchbar_UI();
    newcard.create_card(response_items.features[0]);
  } catch (err) {
    ui_elements.loading("false");
    new UserMessage(err.message, true, "error");
  }
};

let norma = (function () {
  var from = "ÃÀÁÄÂÈÉËÊÌÍÏÎÒÓÖÔÙÚÜÛãàáäâèéëêìíïîòóöôùúüûÑñÇç",
    to = "AAAAAEEEEIIIIOOOOUUUUaaaaaeeeeiiiioooouuuunncc",
    mapping = {};

  for (var i = 0, j = from.length; i < j; i++)
    mapping[from.charAt(i)] = to.charAt(i);

  return function (str) {
    var ret = [];
    for (var i = 0, j = str.length; i < j; i++) {
      var c = str.charAt(i);
      if (mapping.hasOwnProperty(str.charAt(i))) ret.push(mapping[c]);
      else ret.push(c);
    }
    return ret.join("").toLowerCase();
  };
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
};

function regexValidator(val) {
  //caracteres permitidos para coordenadas: ° ' " -
  let reg = /[!^()_+=@$#%&*:<>?/{|}]+/;
  let reg_url = /(http|https):\/\/([^\/\r\n]+)(\/[^\r\n]*)?/;
  if (val.match(reg) === null && val.match(reg_url) === null) {
    return true;
  } else {
    ui_elements.create_character_invalid();
    return false;
  }
}

function selectorItems(key) {
  let ul = document.getElementById("ul-results").getElementsByTagName("li");
  let items = $(".list-group-item-gc");
  let selected = null;
  let txt_search_bar = document.getElementById("search_bar");
  let up = false;
  let down = false;

  if (key == 38) {
    up = true;
  } else {
    down = true;
  }

  if (!selected_item && down) {
    ul[0].className = "list-group-item-gc itemgc-focus";
    let txt = items[0].getElementsByClassName("txtg-result");
    txt_search_bar.value = txt[0].innerText;
    id_selected_item = 0;
    selected_item = true;
  } else if (!selected_item && up) {
    selected_item = true;
    ul[ul.length - 1].className = "list-group-item-gc itemgc-focus";
    id_selected_item = ul.length - 1;
    let txt = items[ul.length - 1].getElementsByClassName("txtg-result");
    txt_search_bar.value = txt[0].innerText;
  } else if (selected_item && up) {
    for (var i = 0; i < ul.length; i++) {
      if (ul[i].className === "list-group-item-gc itemgc-focus") selected = i;
    }
    if (selected === 0) {
      ul[selected].className = "list-group-item-gc";
      ul[ul.length - 1].className = "list-group-item-gc itemgc-focus";
      id_selected_item = ul.length - 1;
      let txt = items[ul.length - 1].getElementsByClassName("txtg-result");
      txt_search_bar.value = txt[0].innerText;
    } else {
      ul[selected].className = "list-group-item-gc";
      ul[selected - 1].className = "list-group-item-gc itemgc-focus";
      let txt = items[selected - 1].getElementsByClassName("txtg-result");
      txt_search_bar.value = txt[0].innerText;
      id_selected_item = selected - 1;
    }
  } else if (selected_item && down) {
    for (var i = 0; i < ul.length; i++) {
      if (ul[i].className === "list-group-item-gc itemgc-focus") selected = i;
    }
    if (selected === ul.length - 1) {
      ul[selected].className = "list-group-item-gc";
      ul[0].className = "list-group-item-gc itemgc-focus";
      let txt = items[0].getElementsByClassName("txtg-result");
      txt_search_bar.value = txt[0].innerText;
      id_selected_item = 0;
    } else {
      ul[selected].className = "list-group-item-gc";
      ul[selected + 1].className = "list-group-item-gc itemgc-focus";
      let txt = items[selected + 1].getElementsByClassName("txtg-result");
      txt_search_bar.value = txt[0].innerText;
      id_selected_item = selected + 1;
    }
  }
}
