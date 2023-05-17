const options = {
    backdropColor: "green",
    sequence: [{
        element: "#fullscreen",
        description: "fullscreen",
        placement: "right"
    }],
    onComplete: function () {
        console.log("Completed!")
        delete help
    }
};

class HelpTooltip {
    constructor() {
        this.component = `
            <a id="iconHelp-container" title="Ayuda" onclick="return handleClick(event)">
                  <i id="iconHelp" class="fa-solid fa-question" aria-hidden="true"></i>
            </a>
            `;
    }

    createComponent() {
        const elem = document.createElement("div");
        elem.className = "leaflet-bar leaflet-control";
        elem.id = "help";
        elem.innerHTML = this.component;
        //elem.onclick = handleClick();
        document.querySelector(".leaflet-top.leaflet-right").append(elem);
    }
}

function handleClick(event) {
    //event.preventDefault();
    createSequence(options1);
};

const options1 = {
    backdropColor: '#6262625d',
    sequence: [{ element: '#fullscreen', description: "<h2>Don't forget to import!</h2><div>Add these lines when using in a front end framework.</div>", placement: 'right' }, { element: '#help', description: "<h2>Color, color, everywhere! ❤️🧡💛💚💙💜💗🖤</h2><div>Option to choose the backdrop color.</div>", placement: 'left' }],
    onComplete: function () { console.log("Completed!") }
};