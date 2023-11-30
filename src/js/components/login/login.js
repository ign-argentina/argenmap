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
          // console.log(res, xhr.response);
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

  _geoserver: function (name, pwd) {
    // url del servlet del geoserver
    var url = `${window.location.origin}/geoserver/j_spring_security_check`;
    // parametros para el login
    var contentType = "application/x-www-form-urlencoded";
    //se inicializa la petición ajax
    var ajax = $.ajax({
      type: "POST",
      data: {
        username: name,
        password: pwd
      },
      contentType: contentType,
      url: url,
      success: function (data, request) {
        let isLogged = data.includes("../j_spring_security_logout"); // check if a specific location is mentioned in the response body, if not the login process failed
        if (isLogged) {
          app.changeProfile("logged");
          $('#loginModal').modal('hide');
          document.getElementById("loginBtn").classList.add("hidden");
          document.getElementById("logoutBtn").classList.remove("hidden");
        } else {
          alert("GeoServer login failed");
        }
      },
      error: function (error) {
        alert("Error: " + error);
      }
    });
  },

  _append: async function (file, format, parent) {
    // file must match '/path/to/file.extension'
    let parentElement = document.querySelector(parent);
    let path = window.location.pathname;
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
    await login._append("src/js/components/login/navbtn.html", "html", "#geoserver-login-btn");
    await login._append("src/js/components/login/form.html", "html", "body");
    login._listeners();
  },

  submit: function (event) {
    event.preventDefault();
    let loginFormFilled = loginForm.name.value.length && loginForm.pwd.value.length;
    if (loginFormFilled) {
      login._geoserver(loginForm.name.value, loginForm.pwd.value);
    } else {
      alert("Fill user and password fields for login.");
    }
  },

  /**
   * Handle password reset.
   * @param {Event} event - The event object.
   */
  resetPwd: function (event) {
    event.preventDefault();

    // Create a new password input field
    let nPwd = document.createElement("input");
    nPwd.id = "newPwd";
    nPwd.classList.add("form-control");
    nPwd.type = "password";
    nPwd.placeholder = "Nueva contraseña";
    nPwd.required = true;

    // Change the text of the resetPwd button to "Confirm change"
    let confirmBtn = document.getElementById("resetPwd");
    confirmBtn.innerHTML = "Confirmar cambio";

    // Insert the new password input before the submit button in the form
    if (!loginForm.newPwd) {
      loginForm.insertBefore(nPwd, loginForm.submit);
    }

    // Set the server to the current origin if not defined
    if (login.server === undefined) {
      login.server = window.location.origin;
    }

    // Prepare reset options
    let resetOptions = {
      name: loginForm.name.value,
      pwd: loginForm.pwd.value,
      host: login.server,
      newPwd: loginForm.newPwd.value
    };

    // Check if necessary values are not empty
    if (resetOptions.name !== "" && resetOptions.pwd !== "" && resetOptions.newPwd !== "") {
      // Call the GeoServer password reset function
      login._gsResetPwd(resetOptions);
    }
  },

  /**
   * Reset the password using GeoServer REST API.
   * @param {Object} options - Password reset options.
   * @param {string} options.name - User name.
   * @param {string} options.pwd - Current password.
   * @param {string} options.host - GeoServer host.
   * @param {string} options.newPwd - New password.
   */
  _gsResetPwd: function (options) {
    // Prepare JSON payload for the new password
    let params = `{ "newPassword": "${options.newPwd}" }`;

    // Construct GeoServer REST API URL for changing the password
    let gsUrl = options.host + '/geoserver/rest/security/self/password';

    // Extract user credentials
    let _usr = options.name,
      _pwd = options.pwd;

    // Prepare data for the AJAX request
    let data = {
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

    // Make a request to change the password
    login._ajax(data, (res) => {
      // Log server response and status
      console.info(`Server response: ${res.response}, Status: ${res.status}`);
      // Hide the login modal
      let loginModal = document.getElementById('loginModal');
      if (loginModal) {
        loginModal.classList.remove('fade');
        loginModal.style.display = 'none';
      }
    });
  }
  ,

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