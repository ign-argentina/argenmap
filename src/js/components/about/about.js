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
  constructor(){
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
      tabPrueba.addEventListener('click', function(){
        //ahora onClick puede hacer algo en cada tab
        modalAboutUs.showTab(3);          

      })


      

      //tabs creation
      this.tabs.forEach((tabs, i) => {
        //por cada iteracion creo una tab
        const tab = document.createElement('div');

        if(tabs.name){
          tab.innerHTML = tabs.name;

        }else{    tab.innerHTML = "TODPN" /*Te Olvidaste De Ponerle Nombre*/}

        tab.classList.add('tab-prueba') //!!!!temporal

        tab.addEventListener('click', function(){
          //ahora onClick puede hacer algo en cada tab
          modalAboutUs.showTab(i);          

        })
        aboutTabsConteiner.appendChild(tab);
      })


      //////////////////////////////////////////////////////////////
      const divA = document.createElement('div');
      divA.style.background = "red";
      divA.className = "content-about-tab";
      divA.classList.add('content-about-deactivate');
      fetch('https://raw.githubusercontent.com/ign-argentina/argenmap/master/README.md')
      .then(response => response.text())
      .then(markdown => {
        // Convertir el Markdown a HTML utilizando marked
        const html = marked(markdown);
        // Insertar el HTML en el elemento divA
        divA.innerHTML = html;
      })
      .catch(error => {
        console.error('Error al cargar el archivo Markdown:', error);
      });



      const divB = document.createElement('div');
      divB.style.background = "blue";
      
      divB.className = "content-about-tab";
      divB.classList.add('content-about-deactivate');

      const divBA = document.createElement("img");
      divBA.src = "https://media.giphy.com/media/GRSnxyhJnPsaQy9YLn/giphy.gif";
      divBA.style.maxWidth = "100%"
      divB.appendChild(divBA);
      

      
      const divC = document.createElement('div');
      divC.style.background = "yellow";
      divC.className = "content-about-tab";
      divC.classList.add('content-about-deactivate');
      
      const divD = document.createElement('div');
      divD.style.background = "black";
      divD.className = "content-about-tab";
      divD.classList.add('content-about-deactivate');
      //////////////////////////////////////////////////////////////

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


    this.loadReadme(); //not working!! 

    
  }

  showTab(tabIndex){

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
      this.isVisible = true;
    } else {

      console.log("han llamado a cerrar");//temp
      const aboutPopup = document.getElementById("whole-about");
      if (aboutPopup) {
        aboutPopup.remove();
      }
      this.isVisible = false;}}


      
 } //termina la clase



const modalAboutUs = new modalAbout();


