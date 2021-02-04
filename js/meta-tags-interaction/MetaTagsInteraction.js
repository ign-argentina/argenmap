'use strict';

//Default values
const TITLE = 'Argenmap - Instituto Geográfico Nacional';
const DESCRIPTION = 'Visualizador de mapas web';
const IMAGE_URL = 'https://pbs.twimg.com/profile_images/1274694532421083137/TMc-ZIX4.jpg';

//DOM meta elements
const titleTag = document.getElementById('og-title');
const descritionTag = document.getElementById('og-description');
const imageTag = document.getElementById('og-image');

class MetaTagsInteraction {

    constructor() {
        titleTag.content = TITLE;
        descritionTag.content = DESCRIPTION;
        imageTag.content = IMAGE_URL;
    }

    set title(value) {
        titleTag.content = value;
    }

    set description(value) {
        descritionTag.content = value;
    }

    set image(value) {
        fetch(window.location.origin + value)
        .then(res => {
            imageTag.content = window.location.origin + value;
        })
        .catch(error => {
            console.log(error)
        })
    }
}
