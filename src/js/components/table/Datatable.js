class Datatable {
  constructor (data,latlng) {
  this.latlng = latlng;
  this.data = data;
  }

  getDataForTabulator(){

    let dataaux = []
      for (let i =0; i<this.data.features.length;i++ ){
        let aux = this.data.features[i].properties
        dataaux.push(aux)
      }

      let names = Object.keys(dataaux[0])
      for (let i =0; i<names.length; i++ ){
        let col = names[i]
        let nulscolum = 0

        for (let j =0; j<dataaux.length; j++ ){
            if (dataaux[j][col]== null || dataaux[j][col]== undefined){
              nulscolum+=1;
            }
          }

          if (nulscolum==dataaux.length){
            for (let j =0; j<dataaux.length; j++ ){
              delete dataaux[j][col]
            }
          }
      }

    return dataaux
  }
}