class modalAbout {

  constructor() {
    this.tabs = [
      {
        name: 'Readme',
        id: 'load-readme',
      },
      {
        name: 'Funciones',
        id: 'load-functions',
      },
      {
        name: 'Colaboradores',
        id: 'load-colaboradores',
      }
    ]

    this.contributors = [
      {
        name: 'afcirillo96',
        profilePicture: 'https://avatars.githubusercontent.com/u/87725395?v=4',
        url: 'https://github.com/afcirillo96'
      },
      {
        name: 'Zalitoar',
        profilePicture: 'https://avatars.githubusercontent.com/u/3695043?v=4',
        url: 'https://github.com/Zalitoar'
      },

      {
        name: 'daf111',
        profilePicture: 'https://avatars.githubusercontent.com/u/3924657?v=4',
        url: 'https://github.com/daf111'
      },
      {
        name: 'damianlopez',
        profilePicture: 'https://avatars.githubusercontent.com/u/49733149?v=4',
        url: 'https://github.com/damianlopez95'
      },
      {
        name: 'andreazomoza',
        profilePicture: 'https://avatars.githubusercontent.com/u/61470409?v=4',
        url: 'https://github.com/andreazomoza'
      },
      {
        name: 'GSC996',
        profilePicture: 'https://avatars.githubusercontent.com/u/95931791?v=4',
        url: 'https://github.com/GSC996'
      },
      {
        name: 'gvarela1981',
        profilePicture: 'https://avatars.githubusercontent.com/u/9384999?v=4',
        url: 'https://github.com/gvarela1981'
      },
      {
        name: 'yamilvernet',
        profilePicture: 'https://avatars.githubusercontent.com/u/16062027?v=4',
        url: 'https://github.com/yamilvernet'
      },
      {
        name: 'lucasvallejo',
        profilePicture: 'https://avatars.githubusercontent.com/u/47434650?v=4',
        url: 'https://github.com/lucasvallejo'
      },
      {
        name: 'kant',
        profilePicture: 'https://avatars.githubusercontent.com/u/32717?v=4',
        url: 'https://github.com/kant'
      },
      {
        name: 'hcastellaro',
        profilePicture: 'https://avatars.githubusercontent.com/u/39769968?v=4',
        url: 'https://github.com/hcastellaro'
      },
      {
        name: 'InMunken',
        profilePicture: 'https://avatars.githubusercontent.com/u/69722315?v=4',
        url: 'https://github.com/InMunken'
      }
    ]
  }

  createModalAbout() {

    const principalConteiner = document.createElement("div");
    principalConteiner.id = "whole-about"

    const aboutHeader = document.createElement("div");
    aboutHeader.className = "about-header"

    const aboutLogo = document.createElement("img")
    aboutLogo.src = "src/styles/images/argenmap-banner.webp"
    aboutLogo.className = "about-logo"

    const aboutExitBtn = document.createElement("a");
    aboutExitBtn.id = "aboutExitBtn";
    aboutExitBtn.classList = "about-exit";
    aboutExitBtn.innerHTML = '<i class="fa fa-times"></i>';
    aboutExitBtn.onclick = () => {
      principalConteiner.remove();
      this.isVisible = false;
    };

    const aboutMainSection = document.createElement("div")
    aboutMainSection.className = "about-main-section"

    const aboutTabsConteiner = document.createElement("div");
    aboutTabsConteiner.className = "about-tabs-bar"

    this.tabs.forEach((tabs, i) => {
      const tab = document.createElement('div');

      if (tabs.name) {
        tab.innerHTML = tabs.name;

      } else { tab.innerHTML = "TODPN" /*Te Olvidaste De Ponerle Nombre*/ }

      tab.classList.add('tab')

      tab.addEventListener('click', function () {
        modalAboutUs.showTab(i);
      })
      aboutTabsConteiner.appendChild(tab);
    })

    const readmeConteiner = document.createElement('div');
    readmeConteiner.className = "content-about-tab";
    readmeConteiner.classList.add('content-about-deactivate');
    const innerReadmeText = document.createElement('div');
    innerReadmeText.style.margin = "10px"
    this.loadMD("https://raw.githubusercontent.com/ign-argentina/argenmap/master/README.md", 4, 7)
      .then(selectedText => {
        innerReadmeText.innerHTML = selectedText;
      });
    readmeConteiner.appendChild(innerReadmeText)

    const functionsConteiner = document.createElement('div');
    functionsConteiner.classList.add('content-about-tab', 'content-about-deactivate');
    functionsConteiner.style.overflow = "hidden";

    this.loadMD("src/docs/features.md", 2, 16)
      .then(selectedText => {
        const lines = selectedText.split('\n');

        lines.forEach((line, i) => {
          const divFuncion = document.createElement('div');
          divFuncion.innerHTML = line;
          divFuncion.classList.add('all-function-div')

          if (i % 2 == 0) {
            divFuncion.classList.add('even-function')
          }
          functionsConteiner.appendChild(divFuncion);
        });
      });

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    const contributorConteiner = document.createElement('div');
    contributorConteiner.classList.add('content-about-tab', 'contributor-conteiner', 'content-about-deactivate');

    this.contributors.forEach((contributors, i) => {
      const card = document.createElement('div');
      card.className = "contributor-card"
      card.title = "visitar GitHub"

      const presentImg = document.createElement('img');
      presentImg.src = contributors.profilePicture;

      const userName = document.createElement('div');
      userName.innerHTML = contributors.name;

      presentImg.className = "contributor-img"
      userName.className = "contributor-user"

      card.addEventListener('click', function () {
        modalAboutUs.goTo(i);
      })

      card.appendChild(presentImg);
      card.appendChild(userName);
      contributorConteiner.appendChild(card)
    })

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    aboutHeader.appendChild(aboutLogo);
    aboutHeader.appendChild(aboutExitBtn);

    principalConteiner.appendChild(aboutHeader)

    aboutMainSection.appendChild(aboutTabsConteiner)

    principalConteiner.appendChild(aboutMainSection)

    aboutMainSection.appendChild(readmeConteiner);
    aboutMainSection.appendChild(functionsConteiner);
    aboutMainSection.appendChild(contributorConteiner);

    document.body.appendChild(principalConteiner);
  }

  goTo(urlIndex) {
    window.open(this.contributors[urlIndex].url, "_blank");
  }

  showTab(tabIndex) {
    const contentToDisplay = document.querySelectorAll('.content-about-tab');
    contentToDisplay.forEach(el => el.classList.add('content-about-deactivate'));
    contentToDisplay[tabIndex].classList.remove('content-about-deactivate');

    const tabsToDisplay = document.querySelectorAll('.tab');
    tabsToDisplay.forEach(el => el.classList.remove('tab-active'));
    tabsToDisplay[tabIndex].classList.add('tab-active');
  }

  toggleOpen() {
    if (!this.isVisible) {
      this.createModalAbout();
      this.showTab(0);
      this.isVisible = true;
    } else {
      const aboutPopup = document.getElementById("whole-about");
      if (aboutPopup) {
        aboutPopup.remove();
      }
      this.isVisible = false;
    }
  }

  loadMD(url, desde, hasta) {
    return fetch(url)
      .then(response => response.text())
      .then(markdown => {
        const html = marked(markdown);
        const lines = html.split('\n');
        const selectedLines = lines.slice(desde, hasta);
        const selectedText = selectedLines.join('\n');

        return selectedText;
      })
      .catch(error => {
        console.error('Error al cargar el archivo Markdown:', error);
      });
  }

}
const modalAboutUs = new modalAbout();