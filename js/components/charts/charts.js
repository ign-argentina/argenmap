class Graphics{
 constructor(data) {
      this.data= data;
  }

  createElement(element,id,className){
    let aux= document.createElement(element)
        if(id){aux.id=id}
        if(className){aux.className=className}
    return aux
  }

  createModal(){
      let divContainer= this.createElement("div","containergraphics", "containergraphics")
      divContainer.appendChild(this.createElement("div","icons-d3"))
      divContainer.appendChild(this.createElement("div","graphicsd3","graphicsd3"))
      document.body.appendChild(divContainer)
      this.addButtons()
  }

  addButtons(){
        let btnclose = this.createElement("a","btnclosed3","icon-table")
        btnclose.innerHTML = '<span class="glyphicon glyphicon-remove" aria-hidden="true"></span>'
        btnclose.onclick = function(){
          document.body.removeChild(containergraphics)
          document.getElementById("btngraphics").hidden= false;
        };
        document.getElementById("icons-d3").append(btnclose)

        $( "#containergraphics" ).draggable({
          containment: "#mapa",
          scroll: false}
        );
        
        $( "#containergraphics" ).resizable({
          containment: "#mapa",
          minHeight: 65,
          maxHeight: 475,
          minWidth: 450,
          scroll: true,
        });

  }

  creategraphic(){
    let h2 = this.createElement("h2")
    h2.innerHTML= "tab activo es el nro "+(1+activedata)+" y su data esta en la consola "
    console.log(datatable[activedata])
    document.getElementById("graphicsd3").append(h2)
  }
}

let graphics3d = new Graphics

function created3 (){
  document.getElementById("btngraphics").hidden= true;
  graphics3d.createModal()
  graphics3d.creategraphic()

}

