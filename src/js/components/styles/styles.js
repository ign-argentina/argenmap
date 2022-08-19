class StylesUI {

 createstyles(){
  const style = document.createElement('style');
  style.id="main-style-ui"
  style.innerHTML = `
    .navbar{
      background-color: ${app.theme.headerBackground};
    }
    body{
      background-color: ${app.theme.headerBackground};
    }
    .nav-tabs {
      background-color: ${app.theme.headerBackground};
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
    }
    #sidebar-container{
      background-color:${app.theme.menuBackground};
    }
    @media (max-width: 768px) {
      #top-left-logo {
        background-repeat: no-repeat;
        background-image: url("${app.logo.srcLogoMini}");
        background-size: ${app.logo.miniHeight} ${app.logo.miniWidth};
        background-position: left 1px center;
        ${app.logo.ministyle}
      }
    }
    @media (min-width: 769px) {
      #top-left-logo {
        background-repeat: no-repeat;
        background-image: url("${app.logo.src}");
        background-size: ${app.logo.height} ${app.logo.width};
        background-position: left 1px center;
        ${app.logo.style}
      }

    }
    `;

  document.head.appendChild(style);
  let linkicon =  document.createElement("link")
  linkicon.rel = "icon"
  linkicon.href = app.favicon
  document.head.appendChild(linkicon);

  let title = document.createElement("title")
  title.innerHTML = app.title
  document.head.appendChild(title);

  let topleftlogolink = document.getElementById("top-left-logo-link")
  topleftlogolink.href = app.website

  let topleftlogo = document.getElementById("top-left-logo")
  topleftlogo.alt = app.logo.title
  topleftlogo.title = app.logo.title

  if(app.referencias.show){
    let toprightlogo = document.getElementById("top-right-logo")
    toprightlogo.src = app.referencias.icon
    toprightlogo.alt = "Referencias"
    toprightlogo.title = "Referencias"
    toprightlogo.style.width = app.referencias.width
    toprightlogo.style.height = app.referencias.height
    toprightlogo.style.top = "7px"

    toprightlogo.onclick = function () {
      clickReferencias()
    };
  } 
  else {
    let toprightlogo = document.getElementById("logo-help")
    toprightlogo.style.display= "none"
  }
 }

 createdarktheme(){
  const style = document.createElement('style');
  style.id="darktheme"
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

function clickReferencias(){
    event.preventDefault();
    $.fancybox.open({
        src : 'src/styles/images/referencias.png',
        type : 'image',
        closeBtn: 'true'
    });

}