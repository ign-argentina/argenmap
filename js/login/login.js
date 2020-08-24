const login = {

    _ajax: function (data, callback) { // In case there isn't jQuery, fetch may be an option
        let xhr = new XMLHttpRequest(),
            loginResponse;

        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4) {
                callback ? callback(xhr.response) : xhr.response;
            }
        }

        xhr.open(data.method, data.url, true);
        xhr.setRequestHeader(data.reqHeader.key, data.reqHeader.val);
        xhr.send(data.params);
        if (xhr.readyState == 4) {
            if (xhr.status == 200) {
                return xhr.status;
            } else {
                dump(xhr.status, xhr.responseText);
            }
        }
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
            element.innerHTML = res;
            return element;
        });
        parent.appendChild(element);
    },

    _listeners: function () {
        const loginForm = document.getElementById('loginForm');
        loginForm.addEventListener('submit', this.submit);
        loginForm.resetPwd.addEventListener('click', this.resetPwd);
    },

    load: function () {
        document.addEventListener('DOMContentLoaded', (event) => {
            login._append("/js/login/navbtn.html", "html", "navbar");
            login._append("/js/login/form.html", "html", "body");

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
        });
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
        };
        login._gsResetPwd(resetOptions);
    },

    _gsResetPwd: function (o) {
        let params = { "newPassword": o.newPwd },
            gsHost = o.host,
            gsUrl = gsHost + '/geoserver/rest/security/self/password',
            data = {
                params: params,
                url: gsUrl,
                method: 'PUT',
                reqHeader: {
                    key: 'Content-type',
                    val: 'application/json'
                }
            };
        login._ajax(data);
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
        login._ajax(data);
    }

}