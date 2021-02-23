'use strict';

//DOM meta elements
const titleTag = document.getElementById('og-title');
const descritionTag = document.getElementById('og-description');
const imageTag = document.getElementById('og-image');

class MetaTagsInteraction {

    constructor() {
        titleTag.content = METATAG_TITLE;
        descritionTag.content = METATAG_DESCRIPTION;
        imageTag.content = METATAG_IMAGE_URL;
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
