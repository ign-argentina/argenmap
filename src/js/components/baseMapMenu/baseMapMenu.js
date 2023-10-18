class MenuBaseMap {
  constructor() {
    this.isVisible = false;

    //Ids for this class sections:  
    this.wholeSectionID = 'whole-basemapmenu'
    this.headerSectionID = 'header-basemapmenu'
    this.tabSectionID = 'tabs-basemapmenu'
    this.mainSectionID = 'main-basemapmenu'
    this.footSectionID = 'foot-basemapmenu'

  }

  toggleOpen() {
    if (this.isVisible == false) {
      this.createMenu();
      this.showTab(0);

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
    const mainSection = new Container(this.mainSectionID, 'outLine');
    const footSection = new Container(this.footSectionID, 'outLine');

    mainContainer.addToElement(document.body);


    //3. create the elemts that not depend form the tab selected

    //3.1. create the exit button
    const exitButton = new Button(null, "exit-button", 'fa fa-times', null, () => {
      mainContainer.remove();
      this.isVisible = false;
    })

    //3.2 create title form the menu
    const labelTitle = new Label(null, null, "Argregar capa base");
    labelTitle.changeStyle('color', 'white')

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
    //exitButton.addTo(this.headerSectionID);
    document.getElementById(this.headerSectionID).appendChild(exitButton);

    libraryTab.addTo(this.tabSectionID);
    fromUrlTab.addTo(this.tabSectionID);
    colorTab.addTo(this.tabSectionID);

    //consultButton.addTo(this.footSectionID);
    document.getElementById(this.footSectionID).appendChild(consultButton);
    //readyButton.addTo(this.footSectionID);
    document.getElementById(this.footSectionID).appendChild(readyButton);

    //console.log(document.querySelectorAll('.section-container'))
  }

  showTab(indexToShow) {

    const containersInDisplay = document.querySelectorAll('.section-container')

    containersInDisplay.forEach(el => el.classList.add('content-about-deactivate'));
    containersInDisplay[indexToShow].classList.remove('content-about-deactivate');

    const tabsToDisplay = document.querySelectorAll('.tab');
    tabsToDisplay.forEach(el => el.classList.remove('tab-active'));
    tabsToDisplay[indexToShow].classList.add('tab-active');
  }

  createLibrary(mainContainerId) {
    //console.log("a beautifull library in this id: " + mainContainerId);
    const container = new Container(null, "section-container")
    // const imagendeprueba = new Imagen(null, batman_URL, 'batman1', null, null)
    // imagendeprueba.addToObjet(container)


    container.addTo(mainContainerId)
  }

  createFromUrl(mainContainerId) {

    //console.log("a beautifull from url section in this id: " + mainContainerId)
    const container = new Container(null, "section-container")
    const imagendeprueba = new Imagen(null, 'https://media.tenor.com/RrXsGhXSBDUAAAAC/ok-thumbs-up.gif', 'batman1', null, null)
    imagendeprueba.addToObjet(container)
    container.addTo(mainContainerId)

  }

  createColor(mainContainerId) {
    //console.log("a beautifull color section in this id: " + mainContainerId)
    const container = new Container(null, "section-container")
    const imagendeprueba = new Imagen(null, 'https://media.tenor.com/-Oo9YBTLsvkAAAAd/michael-myers-halloween.gif', 'batman1', null, null)
    imagendeprueba.addToObjet(container)
    container.addTo(mainContainerId)
  }
}

/* document.addEventListener("DOMContentLoaded", function () {
  const menuBaseMap = new MenuBaseMap();
  menuBaseMap.createMenu();
}); */