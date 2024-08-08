class StylesUI {
  createstyles() {
    const style = document.createElement("style");
    let minBgSize =
      app.logo.miniHeight !== ""
        ? app.logo.miniHeight + " " + app.logo.miniWidth
        : "contain !important";
    style.id = "main-style-ui";
    style.innerHTML = `
    :root {
    --primary-color: ${app.theme.headerBackground};
    --secondary-color: ${app.theme.bodyBackground};
    }
    .navbar{
      background-color: ${app.theme.headerBackground};
    }
    body{
      background-color: ${app.theme.headerBackground};
    }
    /* .nav-tabs {
      background-color: ${app.theme.headerBackground};
     } */
    .panel-body {	
    background-color: ${app.theme.menuBackground};
    }
    .panel-default > .panel-heading {
      background-color: ${app.theme.menuBackground} !important;
      ${app.theme.textMenuStyle}
    }
    .featureInfo h4{
      border-bottom:3px solid ${app.theme.menuBackground};
      margin:2em;
    }
    .featuresGroup {
      border-bottom: 2px solid ${app.theme.menuBackground};
    }
    .individualFeature {
      border-bottom: 1px dashed ${app.theme.menuBackground};
    }
    .nav-tabs > li.active > a {
      background-color: ${app.theme.activeLayer} !important;
    }
    .active {
      background-color: ${app.theme.activeLayer} !important;
    }
    .featureInfo h4 {
    border-bottom: 3px solid ${app.theme.menuBackground};
    }
    .featuresGroup {
    border-bottom: 2px solid ${app.theme.menuBackground};
    }
    .individualFeature {
    border-bottom: 1px dashed ${app.theme.menuBackground};
    }
    .active-layers-counter {
      background: ${app.theme.activeLayer} !important;
    }
    .panel-default > .panel-heading {
      color:${app.theme.textMenu};
    }
    .item-group-short-desc a {
      color:${app.theme.textLegendMenu};
      ${app.theme.textLegendMenuStyle}
    }
    .navbar-toggle .icon-bar {
      border: 1px solid ${app.theme.iconBar};
      border-radius: 5px;
    }
    #sidebar-container{
      background-color:${app.theme.menuBackground};
    }
    @media (max-width: 768px) {
      #top-left-logo {
        background-repeat: no-repeat;
        background-image: url("${app.logo.srcLogoMini}");
        background-size: ${minBgSize};
        background-position: left 1px center;
        ${app.logo.ministyle}
      }
    }
    @media (min-width: 769px) {
      #top-left-logo {
        background-repeat: no-repeat;
        background-image: url("${app.logo.src}");
        height: ${app.logo.height || "50px"};
        width: ${app.logo.width || "180px"};
        background-position: left 1px center;
        ${app.logo.style}
      }
    }
    `;

    let logoText = document.getElementById("logoText");
    if (app.logoText) {
      logoText.innerHTML = app.logoText.content;
      logoText.href = app.logoText.link ?? "";
      logoText.title = app.logoText.title ?? "";
      logoText.target = "_blank";
    }

    document.head.appendChild(style);
    let linkicon = document.createElement("link");
    linkicon.rel = "icon";
    linkicon.href = app.favicon;
    document.head.appendChild(linkicon);

    if (app.title !== "") {
      document.title = app.title;
    }

    let topleftlogolink = document.getElementById("top-left-logo-link");
    topleftlogolink.href = app.logo.link ?? "";

    let topleftlogo = document.getElementById("top-left-logo");
    topleftlogo.alt = app.logo.title;
    topleftlogo.title = app.logo.title;

    if (app.referencias.show) {
      let toprightlogo = document.getElementById("top-right-logo");
      toprightlogo.src = app.referencias.icon;
      toprightlogo.alt = "Referencias";
      toprightlogo.title = "Referencias";
      toprightlogo.style.width = app.referencias.width;
      toprightlogo.style.height = app.referencias.height;
      toprightlogo.style.top = "7px";

      let image = app.referencias.src ?? "";

      toprightlogo.onclick = function () {
        clickReferencias(image);
      };
    }
    /* else {
        let toprightlogo = document.getElementById("logo-help");
        toprightlogo.style.display = "none";
    } */
  }

  createdarktheme() {
    const style = document.createElement("style");
    style.id = "darktheme";
    style.innerHTML = `
    .navbar{
      background-color: #164A5E;
    }
    body{
      background-color: #164A5E;
    }
    .nav-tabs {
      background-color: #164A5E;
    }
    .panel-default > .panel-heading {
      background-color: #164A5E !important;
    }
    .featureInfo h4{
      border-bottom:3px solid #164A5E;
      margin:2em;
    }
    .featuresGroup {
      border-bottom: 2px solid #164A5E;
    }
    .individualFeature {
      border-bottom: 1px dashed #164A5E;
    }
    .nav-tabs > li.active > a {
      background-color: ${app.theme.activeLayer} !important;
    }
    .active {
      background-color: ${app.theme.activeLayer} !important;
    }
    .featureInfo h4 {
    border-bottom: 3px solid #164A5E;
    }
    .featuresGroup {
    border-bottom: 2px solid #164A5E;
    }
    .individualFeature {
    border-bottom: 1px dashed #164A5E;
    }
    .active-layers-counter {
      background: #164A5E !important;
    }
    .panel-default > .panel-heading {
      color:${app.theme.textMenu};
    }
    .item-group-short-desc a {
      color:${app.theme.textLegendMenu};
      ${app.theme.textLegendMenuStyle}
    }
    .navbar-toggle .icon-bar {
      border: 1px solid ${app.theme.iconBar};
    }
    #sidebar-container{
      background-color:#164A5E;
    } 
    `;
    document.head.appendChild(style);
  }
}

function clickReferencias(img) {
  event.preventDefault();
  $.fancybox.open({
    src: img,
    type: "image",
    closeBtn: "true",
  });
}
