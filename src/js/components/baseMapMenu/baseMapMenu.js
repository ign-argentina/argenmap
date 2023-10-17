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

        mainContainer.addToElement(document.body);


        //2. create the elemts that not depend form the tab selected

        //2.1. create the exit button
        const exitButton = new Button(null, "exit-button", '<i class="fa fa-times"></i>', () => {
            mainContainer.remove();
            this.isVisible = false;
        })

        const labelTitle =  new Label(null, null, "Argregar capa base");
        labelTitle.addTo('whole-basemapmenu');

        /*const element = document.createElement('input')
        element.type = "color"
        document.getElementById('whole-basemapmenu').appendChild(element);*/


        //3. create the diferent tab sections
        this.createLibrary();
        this.createFromUrl();
        this.createColor();

        //4. Add elements to container
        exitButton.addTo('whole-basemapmenu');
    }

    createLibrary() {
        //console.log("a beautifull library")
    }
    createFromUrl() {
        //console.log("a beautifull from url section")
    }
    createColor() {
        //console.log("a beautifull color section")
    }
}



document.addEventListener("DOMContentLoaded", function () {
    const hehe = new MenuBaseMap();
    hehe.createMenu();
});