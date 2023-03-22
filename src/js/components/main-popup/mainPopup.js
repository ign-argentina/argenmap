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
      contentWrapper.innerHTML = '<h4>Bienvenidos a Argenmap!<hr>';
      mainWrapper.appendChild(contentWrapper);
  
      // const test2 = document.createElement("div");
      // test2.id="contentWrapper";
      // test2.innerHTML = '<h4></h4><img src="src/styles/images/argenmap-banner.png" width="100%">';
      // contentWrapper.appendChild(test2);
  
      // const test = document.createElement("div");
      // test.id="contentWrapper";
      // test.innerHTML = `<h4></h4>Modify the prefixes of recoverSections() in functions.js.
      // Modify the prefixes of elevation-profile.js.
      // Show legends of layers of an added WMS service from the "Add Layers" button.
      // Add icon and title to report the failure of a WMS layer legend.
      // Shrink base map preview files.
      // "Abrir en..." from contextMenu should only work on mobile devices. #183
      // Geocoder text box expands out of window on mobile. #175
      // Unifying styles on the map buttons for different types of devices. #178
      // Use CSS variables for colors. #176`;
      // contentWrapper.appendChild(test);
      
      let btncloseWrapper = document.createElement("a");
      btncloseWrapper.id = "btnclose-wrapper";
      btncloseWrapper.href = "javascript:void(0)";
      btncloseWrapper.style = "float:right; color:#676767; overflow-y:auto;";
      btncloseWrapper.innerHTML ='<i class="fa fa-times"></i>';
      btncloseWrapper.onclick = () => {
        mainWrapper.remove();
        document.getElementById("main-popup").style.display = "none";
      };
      contentWrapper.append(btncloseWrapper);
  
      let checkbox = document.createElement("div");
      checkbox.id="contentWrapper";
      checkbox.classList = "checkbox";
      checkbox.innerHTML ='<label><input type="checkbox" id="popupCheckbox" name="popupCheckbox">No volver a mostrar</label>';
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
