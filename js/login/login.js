const login = {

    _ajax: function (data, callback) { // In case there isn't jQuery, fetch may be an option
        var xhr = new XMLHttpRequest(),
            loginResponse;

        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4) {
                callback ? callback(xhr.response) : xhr.response;
            }
        }

        xhr.open(data.method, data.url, true);
        xhr.setRequestHeader(data.reqHeader.key, data.reqHeader.val);
        //xhr.onerror = console.log(`Login error: ${xhr.status} \n Response: ${xhr.responseXML}`);
        xhr.send(data.params);
    },

    _append: function (file, format, parent) {
        var parentElement, url = window.location.origin + file, // file must match '/path/to/file.extension' 
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
        var element = document.createElement("div");
        this._ajax(data, function (res) {
            element.innerHTML = res;
            return element;
        });
        parent.appendChild(element);
    },

    _listeners: function () {
        const loginForm = document.getElementById('loginForm');
        loginForm.addEventListener('submit', this.submit);
        let resetPwdBtn = document.getElementById('resetPwd');
        resetPwdBtn.addEventListener('click', this.resetPwd);
    },

    load: function () {
        document.addEventListener('DOMContentLoaded', (event) => {
            this._append("/js/login/navbtn.html", "html", "navbar");
            this._append("/js/login/form.html", "html", "body");

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
        let newPwdInput = document.getElementById('newPwd');
        newPwdInput.classList.toggle('hidden');
        let resetPwdBtn = document.getElementById('resetPwd');
        // resetPwdBtn.classList.toggle('hidden');
        login._gsResetPwd(loginForm.name.value, loginForm.pwd.value, loginForm.newPwd.value);
        // check if all values are defined
    },

    _gsResetPwd: function (name, pwd, newPwd) {
        console.log('reset');
        //var usrPwd = `<userPassword><newPassword>${pwd}</newPassword></userPassword>`,
        var params = { "newPassword": newPwd },
            gsHost = 'http://www.idecom.gob.ar',
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
        this._ajax(data);
    },
    
    _geoserver: function (name, pwd) {
        console.log('submit');
        var usrPwd = `username=${name}&password=${pwd}`,
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
        this._ajax(data);
    }

}

// login.load();
