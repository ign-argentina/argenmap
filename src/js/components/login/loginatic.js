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

        console.log(getCookie("autologin"));

        //setCookie("autologin", 0);

        if (getCookie("autologin") == 1) {

            let lat = getCookie("lat");
            let lon = getCookie("lon");
            let zoom = getCookie("zoom");

            setTimeout(function() {
                console.log(mapa);
                if (mapa.setView) { mapa.setView([lat, lon], zoom); }

            }, 500);

        } else {

            document.getElementById("login-wrapper").style.display = "flex";

        }

    }

    this.process = () => {

        let pwd = document.getElementById("input-pwd").value;

        let request = $.ajax({
            async: false,
            url: 'src/config/users.json',
            type: 'POST',
            success: function(d) {}
        })

        let json = JSON.parse(request.responseText);

        let logged = false;

        for (let i = 0; i < json.length; i++) {

            if (json[i].clave == pwd) {

                let recuerdame = $("#inp-recuerdame").prop("checked") ? 1 : 0;

                this.currentLogin = json[i];

                let lat = json[i].lat_4326;
                let lon = json[i].lon_4326;
                let zoom = 10;

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

                break;

            }

        }

        if (!logged) {
            alert("No se encontró ningun municipio para su clave, por favor intentelo nuevamente");
        }

    }

    this.logout = () => {

        this.currentLogin = false;

        setCookie("autologin", 0);

        let lat = -40;
        let lon = -59;
        let zoom = 4;

        mapa.setView([lat, lon], zoom);

        location.reload();

    }

    this._addLogoutButton = () => {
        $("#mapa").append(`<div class="center-flex btn-logout" id="btn-logout" title="cerrar sesión" onclick="la.logout();" style="width: 30px; height: 30px; border: medium none; box-shadow: rgba(0, 0, 0, 0.65) 0px 1px 5px;"><div class="center-flex" id="icon-container"><span class="fa fa-sign-out-alt" aria-hidden="true"></span></div></div>`);
    }

}
