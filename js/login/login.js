const login = {
    res: {},

    _ajax: function (data, callback) { // In case there isn't jQuery, fetch may be an option
        
        let xhr = new XMLHttpRequest();

        xhr.onreadystatechange = function () {
            res = { response: xhr.response, status: xhr.status };
            if (xhr.readyState === XMLHttpRequest.DONE) {
                let status = xhr.status;
                //if (status === 0 || (status >= 200 && status < 400)) {
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

    _append: function (file, format, parent) {
        // file must match '/path/to/file.extension'
        let parentElement, url = window.location.origin + window.location.pathname + file,
            data = {
                url: url,
                method: 'GET',
                reqHeader: {
                    key: 'Accept',
                    val: `text/${format}`
                }
            };
        parent == 'body' ? parent = document.body : parent = document.getElementById(parent);
        // Would load CSS here
        let element = document.createElement("div");
        login._ajax(data, function (res) {
            element.innerHTML = res.response;
            return element;
        });
        parent.appendChild(element);
    },

    _listeners: function () {
        loginForm.submit.addEventListener('click', this.submit);
        loginForm.resetPwd.addEventListener('click', this.resetPwd);
    },

    load: function () {
        login._append("/js/login/navbtn.html", "html", "navbar");
        login._append("/js/login/form.html", "html", "body");
        const loginForm = document.getElementById('loginForm');

        try {
            login._listeners();
        } catch (error) {
            // Select the node that will be observed for mutations;
            let targetNode = document.body;
            let config = { attributes: true, childList: true, subtree: true };
            let callback = function (mutationsList, observer) {
                for (let mutation of mutationsList) {
                    if (mutation.type === 'childList' &&
                        mutation.addedNodes[0].id == "loginModal") {
                        login._listeners();
                        observer.disconnect();
                    }
                }
            };
            let observer = new MutationObserver(callback);
            // Start observing the target node for configured mutations
            observer.observe(targetNode, config);
        }
    },

    submit: function (event) {
        event.preventDefault();
        login._geoserver(loginForm.name.value, loginForm.pwd.value);
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
        if (r.name !== "" && r.pwd !== "" && r.newPwd !== "" ) {
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
    }

}