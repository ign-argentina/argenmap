class MenuBaseMap {
  constructor() {
    this.isVisible = false;

    //Ids for this class sections:  
    this.wholeSectionID  = 'whole-basemapmenu'
    this.headerSectionID = 'header-basemapmenu'
    this.tabSectionID    = 'tabs-basemapmenu'
    this.mainSectionID   = 'main-basemapmenu'
    this.footSectionID   = 'foot-basemapmenu'

  }

  toggleOpen() {
    if (this.isVisible == false) {
      this.createMenu();
      this.showTab(1);

      this.isVisible = true;
    } else {

    }
  }

  createMenu() {
    //1. create the main containter
    const mainContainer = new Container(this.wholeSectionID, 'menuContainer');
    mainContainer.changeStyle('overflow', 'hidden') //just a demostration

    //2. create diferent sections
    const header = new Container(this.headerSectionID, 'outLine');
    const tabSection = new Container(this.tabSectionID, 'outLine');
    const mainSection = new Container(this.mainSectionID, 'base-map-menu-main-section');

    const footSection = new Container(this.footSectionID, 'outLine');

    mainContainer.addToElement(document.body);


    //3. create the elemts that not depend form the tab selected

    //3.1. create the exit button
    const exitButton = new Button(null, "exit-button", 'fa fa-times', null, () => {
      mainContainer.remove();
      this.isVisible = false;
    })

    //3.2 create title form the menu
    const labelTitle = new Label(null, null, "Agregar capa base");
    labelTitle.changeStyle('color', 'black')

    //3.3. create foot
    const consultButton = new Button(null, null, null, '?', () => {
      console.log("what you wanna know?")
    })
    const readyButton = new Button(null, null, null, 'Listo', () => {
      mainContainer.remove();
      this.isVisible = false;
    })
    //4. create the diferent tabs
    const libraryTab = new TabElement('Libreía', null, 'tab', () => {
      this.showTab(0);
    })
    const fromUrlTab = new TabElement('desde Url', null, 'tab', () => {
      this.showTab(1);
    })
    const colorTab = new TabElement('color', null, 'tab', () => {
      this.showTab(2);
    })

    //5. Add sections to main container
    // header.addTo('whole-basemapmenu');
    header.addToObjet(mainContainer)

    tabSection.addTo(this.wholeSectionID);
    mainSection.addTo(this.wholeSectionID);
    footSection.addTo(this.wholeSectionID);

    this.createLibrary(this.mainSectionID)
    this.createFromUrl(this.mainSectionID)
    this.createColor(this.mainSectionID)
    //5.1 Add elements to sections
    labelTitle.addTo(this.headerSectionID);
    exitButton.addTo(this.headerSectionID);

    libraryTab.addTo(this.tabSectionID);
    fromUrlTab.addTo(this.tabSectionID);
    colorTab.addTo(this.tabSectionID);

    consultButton.addTo(this.footSectionID);
    readyButton.addTo(this.footSectionID);

    //console.log(document.querySelectorAll('.section-container'))
  }

  showTab(indexToShow) {

    const containersInDisplay = document.querySelectorAll('.section-container')

    containersInDisplay.forEach(el => el.classList.add('hidden'));
    containersInDisplay[indexToShow].classList.remove('hidden');

    const tabsToDisplay = document.querySelectorAll('.tab');
    tabsToDisplay.forEach(el => el.classList.remove('tab-active'));
    tabsToDisplay[indexToShow].classList.add('tab-active');
  }

  createLibrary(mainSectionId) {
    const container = new Container(null, "section-container")
    container.addTo(mainSectionId)
  }

  createFromUrl(mainSectionId) {
    const container = new Container(null, "section-container")
    container.addClass('outLinetres');
    container.changeStyle('width', '100%')
    container.changeStyle('height', '100%')
    // container.changeStyle('display', 'flex')
    
    const infoContainer =  new Container(null, "outLine")
    infoContainer.changeStyle('width', '55%')
    infoContainer.changeStyle('height', '100%')
    infoContainer.changeStyle('display', 'flex')
    infoContainer.changeStyle('flex-direction', 'column')



    const label = new Label(null, null, 'Añaduir una capa base desde otra fuente')
    const inputCapName = new Input(null, null, 'text')

    const inputURL = new Input(null, null, 'text')
    const inputAtribution = new Input(null, null, 'text')
    const inputMaxZoom = new Input(null, null, 'text')
    const inputMinZoom = new Input(null, null, 'text')

    label.addToObjet(infoContainer);
    inputCapName.addToObjet(infoContainer);
    inputURL.addToObjet(infoContainer);
    inputAtribution.addToObjet(infoContainer);
    inputMaxZoom.addToObjet(infoContainer);
    inputMinZoom.addToObjet(infoContainer);



    const prevContainer = new Container(null, "outLine")
    prevContainer.changeStyle('width', '45%')
    prevContainer.changeStyle('height', '100%')
    prevContainer.changeStyle('display', 'flex')
    prevContainer.changeStyle('flex-direction', 'column')
    prevContainer.changeStyle('justify-content', 'center')

    const imagendeprueba = new Imagen(null, 'https://media.tenor.com/v-SkaSp7VYgAAAAC/kid-goku-peace.gif', 'gokuperonista', null, null)
    imagendeprueba.changeStyle('width', '100%')
    imagendeprueba.changeStyle('objet-fit', 'cover')

    imagendeprueba.addToObjet(prevContainer)
    infoContainer.addToObjet(container)
    prevContainer.addToObjet(container)
    container.addTo(mainSectionId)
  }

  createColor(mainSectionId) {
    //console.log("a beautifull color section in this id: " + mainSectionId)
    const container = new Container(null, "section-container")
    const imagendeprueba = new Imagen(null, 'https://media.tenor.com/-Oo9YBTLsvkAAAAd/michael-myers-halloween.gif', 'batman1', null, null)
    imagendeprueba.addToObjet(container)
    container.addTo(mainSectionId)
  }
}

 document.addEventListener("DOMContentLoaded", function () {
  const menuBaseMap = new MenuBaseMap();
  menuBaseMap.toggleOpen();
}); 