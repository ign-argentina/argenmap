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

  toggleOpen(openTabNumber = 0) {
    if (this.isVisible == false) {
      this.createMenu();
      this.showTab(openTabNumber);

      this.isVisible = true;
    } else {
        this.darkOverlay.remove();
        this.isVisible = false;

    }
  }

  createMenu() {
    //0. fondo oscuro
    this.darkOverlay = document.createElement('div')
    this.darkOverlay.classList.add('dark-overlay')
    this.darkOverlay.onclick = () => {
        this.toggleOpen()
    }



    //1. create the main containter
    const mainContainer = new Container(this.wholeSectionID, 'menuContainer');
    mainContainer.getElement().onclick = function(event) {
        event.stopPropagation();
      };

    //2. create diferent sections
    const header = new Container(this.headerSectionID, 'header-menubasecap');




    const tabSection = new Container(this.tabSectionID, 'tabs-section-menubasecap');

    const mainSection = new Container(this.mainSectionID, 'main-section-menubasecap');

    const footSection = new Container(this.footSectionID, 'foot-menubasecap');


    document.body.appendChild(this.darkOverlay)
    mainContainer.addTo(this.darkOverlay)


    //3. create the elemts that not depend form the tab selected

    //3.1. create the exit button
    const exitButton = new Button(null, "exit-button", 'fa fa-times', null, () => {
      this.toggleOpen()
    })

    //3.2 create title form the menu
    const labelTitle = new Label(null, 'title-menubasemap', "Agregar capa base");
    

    //3.3. create foot
    const consultButton = new Button(null, 'consult-button', null, '?', () => {
      console.log("what you wanna know?")
    })
    

    const readyButton = new Button(null, 'ready-button', null, 'Listo', () => {
      this.toggleOpen()
    })
    
    //4. create the diferent tabs
    const libraryTab = new TabElement('Biblioteca', null, 'tab', () => {
      this.showTab(0);
    })
    const fromUrlTab = new TabElement('Desde Url', null, 'tab', () => {
      this.showTab(1);
    })
    const colorTab = new TabElement('Color', null, 'tab', () => {
      this.showTab(2);
    })

    //5. Add sections to main container
    // header.addTo('whole-basemapmenu');
    header.addTo(mainContainer)

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
    
    const infoContainer =  new Container(null, "info-container")



    const label = new Label(null, 'lable-basemapmenu', 'Añaduir una capa base desde otra fuente')

    const inputCapName = new Input(null, 'inputtext-l-basemapmenu', 'text')
    const inputURL = new Input(null, 'inputtext-l-basemapmenu', 'text')
    const inputAtribution = new Input(null, 'inputtext-l-basemapmenu', 'text')
    const inputMaxZoom = new Input(null, 'inputtext-basemapmenu', 'text')
    const inputMinZoom = new Input(null, 'inputtext-basemapmenu', 'text')

    label.addTo(infoContainer);
    inputCapName.addTo(infoContainer);
    inputURL.addTo(infoContainer);
    inputAtribution.addTo(infoContainer);
    inputMaxZoom.addTo(infoContainer);
    inputMinZoom.addTo(infoContainer);



    const prevContainer = new Container(null, "prev-container")

    const imagendeprueba = new Imagen(null, 'https://media.tenor.com/v-SkaSp7VYgAAAAC/kid-goku-peace.gif', 'goku', null, null)
    imagendeprueba.changeStyle('width', '100%')
    imagendeprueba.changeStyle('objet-fit', 'cover')

    imagendeprueba.addTo(prevContainer)
    infoContainer.addTo(container)
    prevContainer.addTo(container)
    container.addTo(mainSectionId)
  }

  createColor(mainSectionId) {
    const container = new Container(null, "section-container")
    
    
    const infoContainer =  new Container(null, "info-container")



    const label = new Label(null, 'lable-basemapmenu', 'Selecciona un color como fondo')
    
    const inputCapName = new Input(null, 'inputtext-l-basemapmenu', 'text')

    const inputOverlappingURL = new Input(null, 'inputtext-l-basemapmenu', 'text')

    label.addTo(infoContainer);

    inputCapName.addTo(infoContainer);
    inputOverlappingURL.addTo(infoContainer);
    



    const prevContainer = new Container(null, "prev-container")

    const colorPicker = new ColorPicker(null, 'colorpicker-basemapmenu')

    colorPicker.addTo(prevContainer)

    infoContainer.addTo(container)
    prevContainer.addTo(container)
    container.addTo(mainSectionId)
  }
}

 document.addEventListener("DOMContentLoaded", function () {
  const menuBaseMap = new MenuBaseMap();
  menuBaseMap.toggleOpen(2);
}); 