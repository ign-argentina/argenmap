let graphics3d;
class Graphics{

  constructor(data)
      {
        this.data = data
        this.avaible_headers=[]
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

        let select = this.createElement("select","filter-field-d3","filteritems")
        select.onchange = function(){
          var selectBox = document.getElementById("filter-field-d3");
          var selectedValue = selectBox.options[selectBox.selectedIndex].value;
          
          if(selectedValue!="disable-button"){
          document.getElementById("svgd3").innerHTML = ""
          newrender(selectedValue);}

        }
  
        document.getElementById("icons-d3").append(select)
        document.getElementById("icons-d3").append(btnclose)

        $( "#containergraphics" ).draggable({
          containment: "#mapa",
          scroll: false}
        );
        $( "#containergraphics" ).resizable({
          containment: "#mapa",
          minHeight: 150,
          minWidth: 250,
          handles: 'e, w',
          scroll: true,
        });
        
        
  }

  createcontainer(){
    let divlay = this.createElement("div","layout-d3","layout")
    let divi = this.createElement("div","container-d3","container")
    divi.innerHTML="<svg id='svgd3' viewBox='0 0 750 500'/>"
    divlay.append(divi)
    document.getElementById("graphicsd3").append(divlay)  
  }

  createHeaders(){
    let datos= this.data
    let headers = Object.keys(datos[0])
    let auxhead = []
    let aux = `<option value="disable-button">Selecciona una opción</option>`
    headers.forEach( function(valor) {
      if(valor!='bbox' & valor!='CUICOM'){
        aux +=`<option value="${valor}">${valor}</option>`
        auxhead.push(valor)
      } });
    document.getElementById("filter-field-d3").innerHTML = aux
    this.avaible_headers = auxhead
  }

  render(value){
    let selectiona = value
    let datad3 = []
    let araymax = []

    this.data.forEach((el,index)=> {
      let aux= {}
      aux.id = index +1 
      aux.value = el[selectiona]
      araymax.push(el[selectiona])
      datad3.push(aux)
    })

    let maxim = Math.max(...araymax);
    const svg = d3.select('#svgd3');
      
    const margin = 80;
    const width = 700 - 2 * margin;
    const height = 500 - 2 * margin;
      
    let textohorizontal = "registros"
    let maxdomain = maxim // aca va el value maximo
      
      const chart = svg.append('g')
        .attr('transform', `translate(${margin}, ${margin})`);
    
    if (isNaN(maxim)){
          svg.append('text')
          .attr('class', 'title')
          .attr('id', 'text-d3')
          .attr('x', width / 2 + margin)
          .attr('y', 40)
          .attr('text-anchor', 'middle')
          .text('Tipo de dato incorrecto')
    }
     else{
      const xScale = d3.scaleBand()
        .range([0, width])
        .domain(datad3.map((s) => s.id))
        .padding(0.3)
      
      const yScale = d3.scaleLinear()
        .range([height, 0])
        .domain([0, maxdomain]); 
      
      const makeYLines = () => d3.axisLeft()
        .scale(yScale)
      
      chart.append('g')
        .attr('transform', `translate(0, ${height})`)
        .call(d3.axisBottom(xScale));
      
      chart.append('g')
        .call(d3.axisLeft(yScale));
      
      chart.append('g')
        .attr('class', 'grid')
        .attr('id', 'grid-d3')
        .call(makeYLines()
          .tickSize(-width, 0, 0)
          .tickFormat('')
        )
      
      const barGroups = chart.selectAll()
        .data(datad3)
        .enter()
        .append('g')
      
      //  
      barGroups
        .append('rect')
        .attr('class', 'bar')
        .attr('id', 'bar-d3')
        .attr('x', (g) => xScale(g.id))
        .attr('y', (g) => yScale(g.value))
        .attr('height', (g) => height - yScale(g.value))
        .attr('width', xScale.bandwidth())
      

        barGroups 
        .append('text')
        .attr('class', 'value')
        .attr('id', 'text-d3-value')
        .attr('x', (a) => xScale(a.id) + xScale.bandwidth() / 4)
        .attr('y', (a) => yScale(a.value) + 30)
        .attr('text-anchor', 'middle')
        .text((a) => `${a.value}`)  
      
      svg.append('text')
        .attr('class', 'label')
        .attr('id', 'text-d3-label')
        .attr('x', width / 2 + margin)
        .attr('y', height + margin * 1.7)
        .attr('text-anchor', 'middle')
        .text(textohorizontal)

        svg.append('text')
        .attr('class', 'title')
        .attr('id', 'text-d3-title')
        .attr('x', width / 2 + margin)
        .attr('y', 40)
        .attr('text-anchor', 'middle')
        .text('Registros por '+selectiona)
   }
   
  }

 
  
  newrender(value){
    this.render(this.data,value)
  }

  init(){
    this.createModal()
    this.createcontainer()
    this.createHeaders()
    let value =this.avaible_headers[0]
    this.render(value)
  }
}

function created3 (data){
  document.getElementById("btngraphics").hidden= true;
  graphics3d = new Graphics (data)
  graphics3d.init()
}

function newrender(value){
  graphics3d.render(value)
}
