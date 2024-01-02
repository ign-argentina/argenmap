const login = {
  res: {},

  /**
   * Perform  request using XMLHttpRequest.
   * @param {Object} data - Request data.
   * @param {function} callback - Callback function to handle the response.
   */
  _ajax: function (data, callback) { // In case there isn't jQuery, fetch may be an option
    let xhr = new XMLHttpRequest();

    // Define the callback for handling the  response
    xhr.onreadystatechange = function () {
      res = { response: xhr.response, status: xhr.status };

      // Check if the request has been completed
      if (xhr.readyState === XMLHttpRequest.DONE) {
        let status = xhr.status;

        // Check if the status is within the success range
        if (status >= 200 && status < 400) {
          // Call the callback function with the response
          callback ? callback(res) : res;
          // console.log(res, xhr.response);
        } else {
          console.log(`Request returned error: ${xhr.response}`);
        }
      }
    };

    // Open the XMLHttpRequest with the specified method, URL, and asynchronous flag
    xhr.open(data.method, data.url, true);

    // Add authorization header for password resetting (if method is PUT)
    if (data.method === 'PUT') {
      let credentials = btoa(`${data.usr}:${data.pwd}`);
      xhr.withCredentials = true;
      xhr.setRequestHeader('Authorization', `Basic ${credentials}`);
    }

    // Set custom request headers
    xhr.setRequestHeader(data.reqHeader.key, data.reqHeader.val);

    // Send the request with the specified parameters
    xhr.send(data.params);
  },

  /**
  * Perform GeoServer login using Fetch API.
  * @param {string} name - User name.
  * @param {string} pwd - User password.
  */
  _geoserver: function (name, pwd) {
    // GeoServer servlet URL
    let url = `${window.location.origin}/geoserver/j_spring_security_check`;
    // Parameters for login
    let contentType = "application/x-www-form-urlencoded";
    //Initialize the Ajax request
    let ajax = $.ajax({
      type: "POST",
      data: {
        username: name,
        password: pwd
      },
      contentType: contentType,
      url: url,
      success: function (data, request) {
        // Check if a specific location is mentioned in the response body, if not the login process failed
        let isLogged = data.includes("../j_spring_security_logout");
        if (isLogged) {
          // Change user profile to "logged"
          app.changeProfile("logged");

          // Hide the login modal
          $('#loginModal').modal('hide');

          // Update button visibility
          let loginBtn = document.getElementById("loginBtn");
          let logoutBtn = document.getElementById("logoutBtn");

          if (loginBtn && logoutBtn) {
            loginBtn.classList.add("hidden");
            logoutBtn.classList.remove("hidden");
          }
        } else {
          new UserMessage('Falló el inicio de sesión en GeoServer. Revise los datos ingresados.', true, 'error');
        }
      },
      error: function (error) {
        new UserMessage('Error: ' + error, true, 'error');
      }
    });
  },

  /** 
   * Load and append content from a file to a specified parent element asynchronously.
   * @param {string} file - Path to the file to be loaded. File must match '/path/to/file.extension'.
   * @param {string} format - Format of the file content.
   * @param {string} parent - Selector for the parent element.
   */
  _append: async function (file, format, parent) {
    // Ensure the parent element exists in the DOM
    let parentElement = document.querySelector(parent);

    // Get the current path of the window location
    let path = window.location.pathname;

    // Create a new div element
    let element = document.createElement("div");

    try {
      // Fetch the content of the specified file asynchronously
      const elementContent = await fetch(window.location.origin + path.replace('index.html', '') + file);

      // Ensure the fetch request was successful (status code within 200-299 range)
      if (elementContent.ok) {
        // Extract text content from the response
        const textContent = await elementContent.text();

        // Set the inner HTML of the created div element to the fetched content
        element.innerHTML = textContent;

        // Append the div element to the specified parent element
        parentElement.appendChild(element);
      } else {
        // Log an error if the fetch request fails
        console.error(`Failed to fetch content from ${file}. Status: ${elementContent.status}`);
      }
    } catch (error) {
      // Log any other errors that may occur during the fetch process
      console.error(`An error occurred during the fetch process: ${error.message}`);
    }
  },

  /**
   * Attach event listeners to UI elements for handling user interactions.
   */
  _listeners: function () {
    // Add a click event listener to the logout button, invoking the 'logout' method
    document.getElementById("logoutBtn").addEventListener('click', this.logout);

    // Add a click event listener to the submit button in the login form, invoking the 'submit' method
    loginForm.submit.addEventListener('click', this.submit);

    // Add a click event listener to the reset password button in the login form, invoking the 'resetPwd' method
    loginForm.resetPwd.addEventListener('click', this.resetPwd);
  },

  /**
   * Load login components asynchronously and initialize event listeners.
   */
  load: async function () {
    // Load navigation button component asynchronously and append it to the specified element
    await login._append("src/js/components/login/navbtn.html", "html", "#geoserver-login-btn");

    // Load login form component asynchronously and append it to the body
    await login._append("src/js/components/login/form.html", "html", "body");

    // Initialize event listeners for user interactions
    login._listeners();
  },

  /**
   * Handle the form submission event.
   * @param {Event} event - The form submission event.
   */
  submit: function (event) {
    event.preventDefault();

    // Check if both username and password fields are filled
    let loginFormFilled = loginForm.name.value.length && loginForm.pwd.value.length;

    if (loginFormFilled) {
      // Call the GeoServer login method if the form is filled
      login._geoserver(loginForm.name.value, loginForm.pwd.value);
    } else {
      new UserMessage('Completar los campos de usuario y contraseña.', true, 'warning');
    }
  }
  ,

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
    nPwd.classList.add("ag-input-text");
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
      $('#loginModal').modal('hide');
    });
  }
  ,

  /**
   * Perform user logout by sending a request to the GeoServer logout endpoint.
   */
  logout: function () {
    // GeoServer logout endpoint URL
    let gsUrl = `${window.location.origin}/geoserver/j_spring_security_logout`;

    // Request data for the logout operation
    let data = {
      params: "",
      url: gsUrl,
      method: 'POST',
      reqHeader: {
        key: 'Content-type',
        val: 'application/x-www-form-urlencoded'
      }
    };

    // Perform the Ajax request to logout and handle the response
    login._ajax(data, (res) => {
      console.info(`Response status ${res.status}`);

      // Change user profile to "default" after successful logout
      app.changeProfile("default");
    });

    // Update UI: hide logout button and show login button
    document.getElementById("logoutBtn").classList.add("hidden");
    document.getElementById("loginBtn").classList.remove("hidden");
  }

}