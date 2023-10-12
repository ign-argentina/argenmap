class MenuBaseMap{
    cotructor(){
        this.isVisible = false;
        console.log('hello im alive')
    }

    toggleOpen(){ 
        if(this.isVisible == false){
            this.createMenu();
            this.showTab();

            this.isVisible = true

        }else{

        }

    }

    createMenu(){
        //1. create the main containter
        const mainContainer = new Container('whole-basemapmenu', 'menuContainer');

        document.addEventListener("DOMContentLoaded", function () {
            mainContainer.addToElement(document.body);  
          });
        


        //2. create the elemts that not depend form the tab selected

        //3. create the diferent tab sections
        this.createLibrary();
        this.createFromUrl();
        this.createColor();
    }
    
    createLibrary(){
        console.log("a beautifull library")
    }
    createFromUrl(){
        console.log("a beautifull from url section")
    }
    createColor(){
        console.log("a beautifull color section")
    }
}



const hehe = new MenuBaseMap();
hehe.createMenu();
