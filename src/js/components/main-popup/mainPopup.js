mainPopup = function () {
  let isChecked = false;
  this.check = () => {
    if ("mainPopup" in localStorage) {
      isChecked = true;
    }
  }

  this._addPopupWrapper = (flag) => {
    if (flag == false) {
      isChecked = false
    }
    if (!isChecked) {
      const mainPopup = document.createElement("div");
      mainPopup.id="main-popup";
      mainPopup.classList = "justify-content-center";
      document.body.append(mainPopup);
  
      const mainWrapper = document.createElement("div");
      mainWrapper.id="mainWrapper";
      mainWrapper.style="display: flex;align-items: center;"
      mainWrapper.classList = "container-fluid col-12 col-xs-12 col-sm-6 col-md-6 col-lg-5 mt-5 text-center";
      $("#main-popup").append(mainWrapper);
      
      
      const contentWrapper = document.createElement("div");
      contentWrapper.id="contentWrapper";
      contentWrapper.classList = "popup";
      contentWrapper.style = "font-size: 18px";
      //let welcomeSign = "¡Bienvenidos a Argenmap!";
      if (app.mainPopup.welcomeSign) {
        welcomeSign = app.mainPopup.welcomeSign;
        contentWrapper.innerHTML = `${welcomeSign}<hr>`;
      }
      mainWrapper.appendChild(contentWrapper);
      //Image
      if (app.mainPopup.image) {
        const contentImg = document.createElement("div");
        contentImg.id="contentWrapperImg";
        let image = app.mainPopup.image
        contentImg.innerHTML = `<h4></h4><img src='${image}' width="100%">`;
        contentWrapper.appendChild(contentImg);
      }
      //Text
      if (app.mainPopup.text) {
        let text = app.mainPopup.text
        const contentTxt = document.createElement("div");
        contentTxt.id="contentWrapperTxt";
        contentTxt.innerHTML = `<h4></h4>${text}`;
        contentTxt.style = "font-size: 15px; text-align: justify";
        contentWrapper.appendChild(contentTxt);
      }
      //ExitBtn
      let popupExitBtn = document.createElement("a");
      popupExitBtn.id = "popupExitBtn";
      popupExitBtn.href = "javascript:void(0)";
      popupExitBtn.style = "float:right; color:#676767; overflow-y:auto;";
      popupExitBtn.innerHTML ='<i class="fa fa-times"></i>';
      popupExitBtn.onclick = () => {
        mainWrapper.remove();
        document.getElementById("main-popup").remove();
      };
      contentWrapper.insertBefore(popupExitBtn, contentWrapper.firstChild);
      //Checkbox
      let checkbox = document.createElement("div");
      checkbox.id="contentWrapper";
      checkbox.classList = "checkbox";
      checkbox.innerHTML ='<label><input type="checkbox" id="popupCheckbox" name="popupCheckbox">No volver a mostrar</label>';
      checkbox.style = "font-size: 15px";
      contentWrapper.appendChild(checkbox); 
  
      let check = document.querySelector("input[name=popupCheckbox]");
      check.addEventListener('change', function() {
        if (this.checked) {
          localStorage.setItem("mainPopup", true);
        } else {
          localStorage.removeItem("mainPopup");
        }
      });
    }
  };

  
};
