mainPopup = function () {
  let isChecked = false;
  this.check = () => {
    if ("mainPopup" in localStorage) {
      isChecked = true;
    }
  }

  this._addPopupWrapper = () => {
    if (!isChecked) {
      const mainPopup = document.createElement("div");
      mainPopup.id="main-popup";
      mainPopup.classList = "justify-content-center";
      document.body.append(mainPopup);
  
      const mainWrapper = document.createElement("div");
      mainWrapper.id="mainWrapper";
      mainWrapper.style="display: flex;align-items: center;"
      mainWrapper.classList = "container-fluid col-12 col-xs-12 col-sm-6 col-md-3 mt-5 text-center";
      $("#main-popup").append(mainWrapper);
      
      const contentWrapper = document.createElement("div");
      contentWrapper.id="contentWrapper";
      contentWrapper.classList = "popup";
      contentWrapper.innerHTML = 'Bienvenidos a Argenmap!<hr>';
      contentWrapper.style = "font-size: 18px";
      mainWrapper.appendChild(contentWrapper);
  
      if (app.mainPopup.image) {
        const contentImg = document.createElement("div");
        contentImg.id="contentWrapperImg";
        let image = app.mainPopup.image
        contentImg.innerHTML = `<h4></h4><img src='${image}' width="100%">`;
        contentWrapper.appendChild(contentImg);
      }

      if (app.mainPopup.text) {
        let text = app.mainPopup.text
        const contentTxt = document.createElement("div");
        contentTxt.id="contentWrapperTxt";
        contentTxt.innerHTML = `<h4></h4>${text}`;
        contentTxt.style = "font-size: 15px";
        contentWrapper.appendChild(contentTxt);
      }
        
      let btncloseWrapper = document.createElement("a");
      btncloseWrapper.id = "btnclose-wrapper";
      btncloseWrapper.href = "javascript:void(0)";
      btncloseWrapper.style = "float:right; color:#676767; overflow-y:auto;";
      btncloseWrapper.innerHTML ='<i class="fa fa-times"></i>';
      btncloseWrapper.onclick = () => {
        mainWrapper.remove();
        document.getElementById("main-popup").style.display = "none";
      };
      contentWrapper.insertBefore(btncloseWrapper, contentWrapper.firstChild);
  
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
