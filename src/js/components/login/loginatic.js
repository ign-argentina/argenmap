loginatic = function () {
  this.currentLogin = false;
  this.notLoggedTxt =
    app.login.notLogged || "Contraseña no válida, intente nuevamente";
  this.noPassword = app.login.noPassword || "Campo vacío, ingrese su contraseña";
  this.external_link = null;
  this.init = (conf) => {
    if (getCookie("autologin") == null) {
      setCookie("autologin", 0);
    }
    if (getCookie("autologin") == "1") {
      this._addLogoutButton();
    }
  };

  this.check = () => {
    //setCookie("autologin", 0);
    if (getCookie("autologin") == 1) {
      let lat = getCookie("lat");
      let lon = getCookie("lon");
      let zoom = getCookie("zoom");

      setTimeout(function () {
        if (mapa.setView) {
          mapa.setView([lat, lon], zoom);
        }
      }, 500);
    } else {
      document.getElementById("login-wrapper").style.display = "flex";
    }
  };

  this.process = async () => {
    let pwd = document.getElementById("input-pwd").value;

    if (!pwd.length) {
      alert(this.noPassword);
      // new UserMessage(this.noPassword, true, 'error');
    }

    if (pwd.length) {
      //let result = await fetch("src/config/user.json")
      let notLoggedTxt = this.notLoggedTxt;
      let result = await fetch(app.login.api + pwd).then(function (response) {
        if (response.status >= 500) {
          new UserMessage(
            "Looks like there was a problem. Status Code: " + response.status,
            true,
            "error"
          );
          return;
        }
        if (response.status !== 200) {
          alert(notLoggedTxt);
          return;
        }
        if (response.status === 200) {
          return response.json();
        }
      });
      let logged = false;

      /* if (result.clave == pwd) { */
      if (result.clave) {
        let recuerdame = $("#inp-recuerdame").prop("checked") ? 1 : 0;

        this.currentLogin = result;

        let lat = result.lat_4326;
        let lon = result.lon_4326;
        let zoom = result.zoom ?? 13;

        /* document.title += ' - ' + json[i].nombregobiernolocal;
                let logoTitle = document.getElementById('logoText');
                logoTitle.innerText += ' - ' + json[i].nombregobiernolocal; */

        mapa.setView([lat, lon], zoom);
        document.getElementById("login-wrapper").style.display = "none";
        logged = true;

        if ($("#btn-logout").length == 0) {
          this._addLogoutButton();
        }

        if (recuerdame == 1) {
          setCookie("lat", lat);
          setCookie("lon", lon);
          setCookie("zoom", 10);
          setCookie("autologin", 1);
        }
      }

      if (result.external_link) {
        result.nam = result.nam.replaceAll("_", " ");
        menu_ui.removeButton("external-link-li"); // in case if exists, remove it first
        menu_ui.addButton({ 
          id: "external-link-li", 
          link: result.external_link, 
          text: "Plataforma CONAE " + result.nam,
          title: "Abrir visor Ordenamiento Territorial " + result.nam,
          location: "top"
        });
      }

      if (!logged) {
        alert(this.notLoggedTxt);
      }
    }
  };

  this.logout = () => {
    this.currentLogin = false;
    setCookie("autologin", 0);
    
    menu_ui.removeButton("external-link-li");
    /* 
        let lat = -40;
        let lon = -59;
        let zoom = 4; 
        mapa.setView([lat, lon], zoom);
        */
    mapa.resetView();
    location.reload();
  };

  this._addLoginWrapper = () => {
    const wrapperHtml = `
            <div class="container-fluid col-12 col-xs-12 col-sm-6 col-md-3 mt-5 text-center" style="display: flex;align-items: center;">
                <div class="login">
                    <img src="src/styles/images/lupa.png" width="10%">
                    <h4>Acceso al Visor de mapas</h4>
                    <div class="input-group">
                        <span class="input-group-addon" id="basic-addon1">
                        <i class="fas fa-lock"></i>
                        </span>
                        <input type="password" onkeyup="if (event.keyCode == 13) loginatic.process();" id="input-pwd" class="form-control" placeholder="Clave de Acceso" aria-describedby="basic-addon1" onfocus="if(this.value.trim()=='') this.placeholder='';" onblur="if(this.value.trim()=='') this.placeholder='Clave de Acceso';" required>
                    </div>
                    <div class="checkbox">
                        <label><input type="checkbox" id="inp-recuerdame" name="recuerdame">Recuérdame</label>
                    </div>
                    <a href="javascript:void(0);" class="btn btn-primary outline" onclick="loginatic.process();">Ingresar</a>
    
                    <hr>
                    <a href="javascript:void(0);" onclick="document.getElementById('advice-wrapper').style.display = 'flex';" class="btn btn-primary filled">No poseo clave de acceso</a>
                </div>
            </div>

            <div id="advice-wrapper" class="justify-content-center">
                <div class="container-fluid col-12 col-xs-12 col-sm-6 col-md-6 mt-5 text-center" style="display: flex;align-items: center;">
                    <div class="white-modal" style="margin-top:150px;">
                        <a href="javascript:void(0) " class="closer " onclick="document.getElementById( 'advice-wrapper').style.display='none' ; ">
                            <i class="fa fa-times "></i>
                        </a>
                        <p style="margin-top:30px; " 2>Su municipio ya posee clave asignada, la misma ha sido enviada al mail de contacto informado<br> a la Subsecretaría de Relaciones Municipales del Ministerio del Interior<br> Por favor verifique con las autoridades de su Gobierno Local</p>
                        <p>En caso de no poder solucionarlo, envíe un mail a: <a href="mailto:datosmunicipales@mininterior.gob.ar " target="_blank ">datosmunicipales@mininterior.gob.ar</a><br> indicando nombre del Gobierno Local, provincia, su nombre y apellido,
                            cargo y teléfono de contacto oficial</p>
                    </div>
                </div>
            </div>
        `;
    $("#login-wrapper").append(wrapperHtml);
  };

  this._addLogoutButton = () => {
    const logoutButton = document.createElement("div");
    logoutButton.className = "leaflet-bar leaflet-control btn-logout";
    logoutButton.id = "btn-logout";
    logoutButton.title = "Cerrar sesión";
    logoutButton.onclick = function () {
      loginatic.logout();
    };
    logoutButton.innerHTML = `<a ><span class="fa fa-sign-out-alt" aria-hidden="true"></span></a>`;

    document.getElementById("mapa").append(logoutButton);
  };
};