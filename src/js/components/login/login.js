const login = {
    res: {},

    _ajax: function (data, callback) { // In case there isn't jQuery, fetch may be an option

        let xhr = new XMLHttpRequest();

        xhr.onreadystatechange = function () {
            res = { response: xhr.response, status: xhr.status };
            if (xhr.readyState === XMLHttpRequest.DONE) {
                let status = xhr.status;
                if (status >= 200 && status < 400) {
                    callback ? callback(res) : res;
                } else {
                    console.log(`Ajax request returned error: ${xhr.response}`);
                }
            }
        }

        xhr.open(data.method, data.url, true);
        if (data.method == 'PUT') { // Adds authorization header for password resetting
            let credentials = btoa(data.usr + ":" + data.pwd);
            xhr.withCredentials = true;
            xhr.setRequestHeader('Authorization', `Basic ${credentials}`);
        }
        xhr.setRequestHeader(data.reqHeader.key, data.reqHeader.val);
        xhr.send(data.params);

    },

    _append: async function (file, format, parent) {
        // file must match '/path/to/file.extension'
        let parentElement = null;
        let path = window.location.pathname;

        parentElement = parent == 'body' ? document.body : document.getElementById(parent);

        let element = document.createElement("div");
    
        const elementContent = await fetch(window.location.origin + path.replace('index.html', '') + file)
        .then(res => {
            return res.text();
        });

        element.innerHTML = elementContent;
        parentElement.appendChild(element);
    },

    _listeners: function () {
        document.getElementById("logoutBtn").addEventListener('click', this.logout); // convert UI to object
        loginForm.submit.addEventListener('click', this.submit);
        loginForm.resetPwd.addEventListener('click', this.resetPwd);
    },

    load: async function () {
        await login._append("src/js/components/login/navbtn.html", "html", "navbar");
        await login._append("src/js/components/login/form.html", "html", "body");
        login._listeners();
    },

    submit: function (event) {
        event.preventDefault();
        login._geoserver(loginForm.name.value, loginForm.pwd.value);
        document.getElementById("loginBtn").classList.add("hidden");
        document.getElementById("logoutBtn").classList.remove("hidden");
    },

    resetPwd: function (event) {
        event.preventDefault();
        let nPwd = document.createElement("input");
        nPwd.id = "newPwd";
        nPwd.classList.add("form-control");
        nPwd.type = "password";
        nPwd.placeholder = "Nueva contraseña";
        nPwd.required = "true";

        if (!loginForm.newPwd) {
            loginForm.insertBefore(nPwd, loginForm.submit);
        }

        if (login.server == undefined) {
            login.server = window.location.origin;
        }

        let resetOptions = {
            name: loginForm.name.value,
            pwd: loginForm.pwd.value,
            host: login.server,
            newPwd: loginForm.newPwd.value
        }, r = resetOptions;
        if (r.name !== "" && r.pwd !== "" && r.newPwd !== "") {
            login._gsResetPwd(resetOptions);
        }
    },

    _gsResetPwd: function (o) {
        let params = `{ "newPassword": "${o.newPwd}" }`,
            gsHost = o.host,
            gsUrl = gsHost + '/geoserver/rest/security/self/password',
            _usr = o.name,
            _pwd = o.pwd,
            data = {
                params: params,
                url: gsUrl,
                method: 'PUT',
                usr: _usr,
                pwd: _pwd,
                reqHeader: {
                    key: 'Content-type',
                    val: 'application/json'
                }
            };
        login._ajax(data, (res) => {
            console.info(`Server response: ${res.response}, Status: ${res.status}`);
            $('#loginModal').modal('hide');
        });
    },

    _geoserver: function (name, pwd) {
        let usrPwd = `username=${name}&password=${pwd}`,
            gsUrl = `${window.location.origin}/geoserver/j_spring_security_check`,
            data = {
                params: usrPwd,
                url: gsUrl,
                method: 'POST',
                reqHeader: {
                    key: 'Content-type',
                    val: 'application/x-www-form-urlencoded'
                }
            };
        login._ajax(data, (res) => {
            console.info(`Response status ${res.status}`);
            app.changeProfile("logged"); // Logged should be a state, not a profile
            $('#loginModal').modal('hide');
        });
    },

    logout: function () {
        gsUrl = `${window.location.origin}/geoserver/j_spring_security_logout`,
            data = {
                params: "",
                url: gsUrl,
                method: 'POST',
                reqHeader: {
                    key: 'Content-type',
                    val: 'application/x-www-form-urlencoded'
                }
            };
        login._ajax(data, (res) => {
            console.info(`Response status ${res.status}`);
            app.changeProfile("default");
        });

        document.getElementById("logoutBtn").classList.add("hidden");
        document.getElementById("loginBtn").classList.remove("hidden");
    }

}