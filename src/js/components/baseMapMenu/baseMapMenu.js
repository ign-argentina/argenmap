class MenuBaseMap {
    cotructor() {
        this.isVisible = false;
        console.log('hello im alive')
    }

    toggleOpen() {
        if (this.isVisible == false) {
            this.createMenu();
            this.showTab();

            this.isVisible = true

        } else {

        }

    }

    createMenu() {
        //1. create the main containter
        const mainContainer = new Container('whole-basemapmenu', 'menuContainer');
        mainContainer.changeStyle('overflow', 'hidden') //just a demostration
        
        //2. create diferent sections
        const header = new Container('header-basemapmenu', 'outLine');
        const tabSection = new Container('tabs-basemapmenu', 'outLine');
        const mainSection = new Container('main-basemapmenu', 'outLine');
        const footSection = new Container('foot-basemapmenu', 'outLine');
        
        mainContainer.addToElement(document.body);

        

        //3. create the elemts that not depend form the tab selected

        //3.1. create the exit button
        const exitButton = new Button(null, "exit-button", '<i class="fa fa-times"></i>', () => {
            mainContainer.remove();
            this.isVisible = false;
        })

        //3.2 create title form the menu
        const labelTitle =  new Label(null, null, "Argregar capa base");
        labelTitle.changeStyle('color', 'white')
        
        /*const element = document.createElement('input')
        element.type = "color"
        document.getElementById('whole-basemapmenu').appendChild(element);*/

        //3.3. create foot
        const consultButton = new Button(null, null, '?', () =>{
            console.log("what you wanna know?")
        })
        const readyButton = new Button(null, null, 'Listo', ()=>{
            mainContainer.remove();
            this.isVisible = false; 
        })
        
        //4. create the diferent tabs
        const libraryTab = new TabElement('Libreía', null, 'tab', () =>{
            this.createLibrary('main-basemapmenu')
        })
        const fromUrlTab = new TabElement('desde Url', null, 'tab', () =>{
            this.createFromUrl('main-basemapmenu')
        })
        const colorTab = new TabElement('color', null, 'tab', () =>{
            this.createColor('main-basemapmenu')
        })

        
        
        
        //5. Add sections to main container
       // header.addTo('whole-basemapmenu');
       header.addToObjet(mainContainer)


        tabSection.addTo('whole-basemapmenu');
        mainSection.addTo('whole-basemapmenu');
        footSection.addTo('whole-basemapmenu');
        
        //5.1 Add elements to sections
        labelTitle.addTo('header-basemapmenu');
        exitButton.addTo('header-basemapmenu');

        libraryTab.addTo('tabs-basemapmenu');
        fromUrlTab.addTo('tabs-basemapmenu');
        colorTab.addTo('tabs-basemapmenu');

        consultButton.addTo('foot-basemapmenu');
        readyButton.addTo('foot-basemapmenu');


    }

    createLibrary(mainContainerId) {
        console.log("a beautifull library in this id: " + mainContainerId);

        const imagendeprueba = new Imagen(null, batman_URL, 'batman1', null, null)
        console.log(imagendeprueba)
        imagendeprueba.addTo(mainContainerId)
    }
    createFromUrl(mainContainerId) {
        console.log("a beautifull from url section in this id: " + mainContainerId)
        const imagendeprueba = new Imagen(null, 'https://media.tenor.com/RrXsGhXSBDUAAAAC/ok-thumbs-up.gif', 'batman1', null, null)
        imagendeprueba.addTo(mainContainerId)

    }
    createColor(mainContainerId) {
        console.log("a beautifull color section in this id: " + mainContainerId)
        const imagendeprueba = new Imagen(null, 'https://media.tenor.com/-Oo9YBTLsvkAAAAd/michael-myers-halloween.gif', 'batman1', null, null)
        imagendeprueba.addTo(mainContainerId)
    }
}



document.addEventListener("DOMContentLoaded", function () {
    const menuBaseMap = new MenuBaseMap();
    menuBaseMap.createMenu();
});