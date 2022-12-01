loginatic = function() {

    this.currentLogin = false;
    this.init = (conf) => {
        if (getCookie("autologin") == null) {
            setCookie("autologin", 0);
        }
        if (getCookie("autologin") == "1") {
            this._addLogoutButton();
        }
    }

    this.check = () => {
        //setCookie("autologin", 0);
        if (getCookie("autologin") == 1) {
            let lat = getCookie("lat");
            let lon = getCookie("lon");
            let zoom = getCookie("zoom");

            setTimeout(function() {
                if (mapa.setView) { mapa.setView([lat, lon], zoom); }

            }, 500);
        } else {
            document.getElementById("login-wrapper").style.display = "flex";
        }
    }

    this.process = async() => {
        let pwd = document.getElementById("input-pwd").value;

        //let result = await fetch("src/config/user.json")
        let result = await fetch( app.login.api + pwd )
        .then(function (response) {
            if (response.status !== 200) {
                console.log('Looks like there was a problem. Status Code: ' + response.status);
                return;
            }
            if (response.status == 200) {
                return response.json();
            }

        });
        let logged = false;

        if (result.clave == pwd) {
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
                // console.log("recuerdame OK");
                setCookie("lat", lat);
                setCookie("lon", lon);
                setCookie("zoom", 10);
                setCookie("autologin", 1);
            } else {
                // console.log("No entra a recuerdame");
            }
        }

        if (!logged) {
            alert("No se encontró ningun municipio para su clave, por favor intentelo nuevamente");
        }
    }

    this.logout = () => {
        this.currentLogin = false;
        setCookie("autologin", 0);
        /* 
        let lat = -40;
        let lon = -59;
        let zoom = 4; 
        mapa.setView([lat, lon], zoom);
        */
        mapa.resetView();
        location.reload();
    }

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
                        <input type="password" onkeyup="if (event.keyCode == 13) loginatic.process();" id="input-pwd" class="form-control" placeholder="Clave de Acceso" aria-describedby="basic-addon1" onfocus="if(this.value.trim()=='') this.placeholder='';" onblur="if(this.value.trim()=='') this.placeholder='Clave de Acceso';">
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
    }

    this._addLogoutButton = () => {
        $("#mapa").append(`<div class="center-flex btn-logout" id="btn-logout" title="cerrar sesión" onclick="loginatic.logout();" style="width: 30px; height: 30px; border: medium none; box-shadow: rgba(0, 0, 0, 0.65) 0px 1px 5px;"><div class="center-flex" id="icon-container"><span class="fa fa-sign-out-alt" aria-hidden="true"></span></div></div>`);
    }

}
