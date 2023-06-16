class AboutButton {
  constructor() {
    this.isVisible = false;
    this.component = `
      <a id="iconABOUT-container" title="Acerca de nosotros">
        <i class="fa fa-regular fa-address-card"></i>
      </a>
    `;
  }

  createComponent() {
    const elem = document.createElement("div");
    elem.className = "leaflet-bar leaflet-control";
    elem.id = "AboutButton";
    elem.innerHTML = this.component;
    elem.onclick = modalAboutUs.toggleOpen.bind(modalAboutUs);
    document.querySelector(".leaflet-top.leaflet-left").append(elem);
  }
}

class modalAbout {
  constructor() {
    this.tabs = [
      {
        name: 'Readme',
        id: 'load-readme',
      },
      {
        name: 'Funciones',
        id: 'load-functions',
      },
      {
        name: 'Colaboradores',
        id: 'load-colaboradores',
      }
    ]

    this.tempColabs = [
      {
        name: '@GokuChikito',
        url: 'https://media.giphy.com/media/4GvoqJVUHL5fdgvidL/giphy.gif',
      },
      {
        name: '@GokuUlafBulma',
        url: 'https://media.giphy.com/media/9JxRQ6NOf1orK/giphy.gif',
      },
      {
        name: '@Trunks',
        url: 'https://media.giphy.com/media/XVq3bOamqeRlC/giphy.gif',
      },
      {
        name: '@Vegeta',
        url: 'https://media.giphy.com/media/8WxjVLl8tGjPq/giphy.gif',
      },
      {
        name: '@MaginVegeta',
        url: 'https://media.giphy.com/media/OwG6CJtG9CwzC/giphy.gif',
      },
      {
        name: '@Gohan',
        url: 'https://media.giphy.com/media/iZpxtdURKd5LO/giphy.gif',
      },
      {
        name: '@SS3',
        url: 'https://media.giphy.com/media/XGBAmjqA0RJyU/giphy.gif',
      },
      {
        name: '@ManosArriba',
        url: 'https://media.giphy.com/media/13SBMZWCrSjw6A/giphy.gif',
      },


    ]

  }

  createElement(element, id, className) {
    let aux = document.createElement(element);
    if (id) {
      aux.id = id;
    }
    if (className) {
      aux.className = className;
    }
    return aux;
  }



  createModalAbout() {



    // Código para abrir el aboutPopup
    const principalConteiner = document.createElement("div");
    principalConteiner.id = "whole-about"


    //header
    const aboutHeader = document.createElement("div");
    aboutHeader.className = "about-header"

    //logo
    const aboutLogo = document.createElement("img")
    aboutLogo.src = "https://raw.githubusercontent.com/ign-argentina/argenmap/master/src/styles/images/argenmap-banner.svg"
    aboutLogo.className = "about-logo"


    //exit button
    const aboutExitBtn = document.createElement("a");
    aboutExitBtn.id = "aboutExitBtn";
    aboutExitBtn.classList = "about-exit";
    aboutExitBtn.innerHTML = '<i class="fa fa-times"></i>';
    aboutExitBtn.onclick = () => {
      principalConteiner.remove();
      this.isVisible = false;
    };


    //main section
    const aboutMainSection = document.createElement("div")
    aboutMainSection.className = "about-main-section"

    //tabs bar
    const aboutTabsConteiner = document.createElement("div");
    aboutTabsConteiner.className = "about-tabs-bar"

    //tab de ptueba
    const tabPrueba = document.createElement("div");
    tabPrueba.classList.add('tab-prueba')
    tabPrueba.innerHTML = "Hello, i'm a tab"
    tabPrueba.addEventListener('click', function () {
      //ahora onClick puede hacer algo en cada tab
      modalAboutUs.showTab(3);

    })




    //tabs creation
    this.tabs.forEach((tabs, i) => {
      //por cada iteracion creo una tab
      const tab = document.createElement('div');

      if (tabs.name) {
        tab.innerHTML = tabs.name;

      } else { tab.innerHTML = "TODPN" /*Te Olvidaste De Ponerle Nombre*/ }

      tab.classList.add('tab-prueba') //!!!!temporal

      tab.addEventListener('click', function () {
        //ahora onClick puede hacer algo en cada tab
        modalAboutUs.showTab(i);

      })
      aboutTabsConteiner.appendChild(tab);
    })


    //////README//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    const divA = document.createElement('div');
    divA.id = "readme-content"
    divA.className = "content-about-tab";
    divA.classList.add('content-about-deactivate');
    const divAA = document.createElement('div');
    divAA.style.margin = "10px"
    this.loadMD("https://raw.githubusercontent.com/ign-argentina/argenmap/master/README.md", 4, 7)
      .then(selectedText => {
        divAA.innerHTML = selectedText;
      });

      divA.appendChild(divAA)


    //////FUNTIONS//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////  
    const divB = document.createElement('div');
    divB.className = "content-about-tab";
    divB.classList.add('content-about-deactivate');

    this.loadMD("https://raw.githubusercontent.com/ign-argentina/argenmap/master/src/docs/features.md", 2, 16)
      .then(selectedText => {
        const lines = selectedText.split('\n');

        lines.forEach((line, i) => {
          const divFuncion = document.createElement('div');
          divFuncion.innerHTML = line;
          divFuncion.classList.add('all-function-div')
          
          if(i==0){
            divFuncion.style.borderRadius = "8px 8px 0px 0px"
          }
          
          if (i % 2 == 0) {
            divFuncion.classList.add('even-function')
          }

          // Agrega el div al contenedor deseado
          // (puedes cambiar el contenedor según tus necesidades)
          
          divB.appendChild(divFuncion);
        });
      });


    //////COLAV//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    const divC = document.createElement('div');
    
    divC.classList.add('content-about-tab', 'divC-temp' ,'content-about-deactivate');
    
    //
    this.tempColabs.forEach((tempColabs, i) => {
      const card = document.createElement('div');

      const presentImg = document.createElement('img');
      presentImg.src = tempColabs.url;
      
      presentImg.borderRadius = "50%"

      const userName = document.createElement('div');
      userName.innerHTML = tempColabs.name;
 
      card.className="temp-card"
      presentImg.className="temp-img"
      userName.className="temp-user"
     

      card.appendChild(presentImg);
      card.appendChild(userName);

      divC.appendChild(card)

    }
    
    
    )
    



    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    const divD = document.createElement('div');
    divD.style.background = "black";
    divD.className = "content-about-tab";
    divD.classList.add('content-about-deactivate');

    const divDA = document.createElement("img");
    divDA.src = "https://media.giphy.com/media/GRSnxyhJnPsaQy9YLn/giphy.gif";
    divDA.style.maxWidth = "100%"
    divDA.style.borderRadius = "13px"
    divD.appendChild(divDA);
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    aboutTabsConteiner.appendChild(tabPrueba)

    aboutHeader.appendChild(aboutLogo);
    aboutHeader.appendChild(aboutExitBtn);

    principalConteiner.appendChild(aboutHeader)


    aboutMainSection.appendChild(aboutTabsConteiner)


    principalConteiner.appendChild(aboutMainSection)


    aboutMainSection.appendChild(divA);
    aboutMainSection.appendChild(divB);
    aboutMainSection.appendChild(divC);
    aboutMainSection.appendChild(divD);

    document.body.appendChild(principalConteiner);




  }

  showTab(tabIndex) {

    console.log(tabIndex);

    //Guardo todas las ventanas de contendio que tengan la clase content-about-tab (provisional)
    const contentToDisplay = document.querySelectorAll('.content-about-tab');
    //las desactivo todas con la clase content-about-deactivate
    contentToDisplay.forEach(el => el.classList.add('content-about-deactivate'));
    //a la que llamé le desactivo la desactivación
    contentToDisplay[tabIndex].classList.remove('content-about-deactivate');


    //Guardo todas los elementos que tengan la clase tabs en tabsToDisplay.
    const tabsToDisplay = document.querySelectorAll('.tab-prueba');
    //Todas (la única) que estén con la clase que las muetra activadas, se desactivan.
    tabsToDisplay.forEach(el => el.classList.remove('tab-active'))
    //A la que le hice click me pasó su idex y con eso le agrego la clase que la activa.
    tabsToDisplay[tabIndex].classList.add('tab-active');





  }

  toggleOpen() {


    if (!this.isVisible) {

      console.log("han llamado a abrir");//temp

      this.createModalAbout();
      this.showTab(0);
      this.isVisible = true;
    } else {

      console.log("han llamado a cerrar");//temp
      const aboutPopup = document.getElementById("whole-about");
      if (aboutPopup) {
        aboutPopup.remove();
      }
      this.isVisible = false;
    }
  }

  loadMD(url, desde, hasta) {
    return fetch(url)
      .then(response => response.text())
      .then(markdown => {
        // Convertir el Markdown a HTML utilizando marked
        const html = marked(markdown);
        const lines = html.split('\n');
        const selectedLines = lines.slice(desde, hasta);
        const selectedText = selectedLines.join('\n');

        return selectedText;
      })
      .catch(error => {
        console.error('Error al cargar el archivo Markdown:', error);
      });
  }





}
const modalAboutUs = new modalAbout();

//NECESARIO PRE LANZAMIENTO
/*
Editar readme.md para que muestre versión actual ()
Eliminar punto en funciones ()
Tomar colaburadores desde github ()
Animación de carga en logo? ()
Darle overflow:hidden a contenedor de funciones temp->"dibB" ()
Eliminar comentarios ()
*/

//QUIERO

/*
Ordenar todo
Agregar borones a funciones que carguen gif de la función en cuestión
Sacar las tabs desde un JSON 
Estandarizar creación de contenido dentro de cada tab y lanzarlas desde un for-each

¿¿¿Proceduralidad???
*/


