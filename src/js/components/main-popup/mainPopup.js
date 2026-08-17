mainPopup = function () {
  let isChecked = false;
  const storageKey = "mainPopup";
  const configuredVersion = app.mainPopup.version;
  const popupVersion =
    configuredVersion === undefined || configuredVersion === null
      ? null
      : String(configuredVersion);

  this.check = () => {
    const dismissedVersion = localStorage.getItem(storageKey);
    // Preserve the previous boolean behaviour when no version is configured.
    isChecked = popupVersion === null
      ? dismissedVersion !== null
      : dismissedVersion === popupVersion;
  };

  this._addPopupWrapper = (flag) => {
    if (flag == false) {
      isChecked = false;
    }
    if (!isChecked) {
      const mainPopup = document.createElement("div");
      mainPopup.id = "main-popup";
      setConfiguredBackground(
        mainPopup,
        "--main-popup-overlay-background",
        app.mainPopup.overlayBackground,
      );
      document.body.append(mainPopup);

      const mainWrapper = document.createElement("div");
      mainWrapper.id = "mainWrapper";
      mainWrapper.classList = "main-popup-wrapper";
      mainPopup.appendChild(mainWrapper);

      const contentWrapper = document.createElement("div");
      contentWrapper.id = "contentWrapper";
      contentWrapper.classList = "mainPopup";
      contentWrapper.style = "font-size: 18px";
      setConfiguredBackground(
        contentWrapper,
        "--main-popup-background",
        app.mainPopup.background,
      );
      mainWrapper.appendChild(contentWrapper);

      const welcomeSign = createWelcomeSign(
        app.mainPopup.welcomeSign,
        app.mainPopup.welcomeSignStyle,
      );
      const welcomeSignBelowImage = isWelcomeSignBelowImage(
        app.mainPopup.welcomeSignStyle,
      );
      if (welcomeSign && !welcomeSignBelowImage) {
        contentWrapper.appendChild(welcomeSign);
      }

      //Image
      if (app.mainPopup.image) {
        const contentImg = document.createElement("div");
        contentImg.id = "contentWrapperImg";
        const image = document.createElement("img");
        image.src = app.mainPopup.image;
        image.alt = app.mainPopup.welcomeSign || "";
        contentImg.appendChild(image);
        contentWrapper.appendChild(contentImg);
      }
      if (welcomeSign && welcomeSignBelowImage) {
        contentWrapper.appendChild(welcomeSign);
      }
      //Text
      if (app.mainPopup.text) {
        let text = app.mainPopup.text;
        const contentTxt = document.createElement("div");
        contentTxt.id = "contentWrapperTxt";
        contentTxt.innerHTML = `<h4></h4>${text}`;
        contentTxt.style = "font-size: 15px; text-align: justify";
        contentWrapper.appendChild(contentTxt);
      }
      //ExitBtn
      let popupExitBtn = document.createElement("button");
      popupExitBtn.id = "popupExitBtn";
      popupExitBtn.classList = "exit-btn";
      popupExitBtn.innerHTML = '<i class="fa fa-times"></i>';
      popupExitBtn.onclick = () => {
        mainWrapper.remove();
        document.getElementById("main-popup").remove();
      };
      mainWrapper.appendChild(popupExitBtn);
      //Checkbox
      let checkbox = document.createElement("div");
      checkbox.id = "contentWrapperCheckbox";
      checkbox.classList = "not-again-check";
      checkbox.innerHTML =
        '<label><input type="checkbox" id="popupCheckbox" name="popupCheckbox">No volver a mostrar</label>';
      checkbox.style = "font-size: 15px";
      contentWrapper.appendChild(checkbox);

      let check = document.querySelector("input[name=popupCheckbox]");
      check.addEventListener("change", function () {
        if (this.checked) {
          localStorage.setItem(storageKey, popupVersion ?? "true");
        } else {
          localStorage.removeItem(storageKey);
        }
      });
    }
  };

  function setConfiguredBackground(element, property, background) {
    if (
      typeof background === "string" &&
      background.trim() !== "" &&
      (typeof CSS === "undefined" || CSS.supports("background", background))
    ) {
      element.style.setProperty(property, background);
    }
  }

  function createWelcomeSign(content, configuredStyle = {}) {
    if (!content) {
      return null;
    }

    const style =
      configuredStyle && typeof configuredStyle === "object"
        ? configuredStyle
        : {};
    const welcomeSign = document.createElement("div");
    welcomeSign.classList.add("main-popup-welcome-sign");
    welcomeSign.innerHTML = content;

    setConfiguredCssValue(
      welcomeSign,
      "font-size",
      normalizeCssSize(style.fontSize),
    );
    setConfiguredCssValue(welcomeSign, "color", style.color);
    setConfiguredCssValue(
      welcomeSign,
      "text-align",
      style.textAlign,
    );

    const direction = String(style.direction || "").toLowerCase();
    if (direction === "auto") {
      welcomeSign.dir = "auto";
    } else {
      setConfiguredCssValue(welcomeSign, "direction", direction);
    }

    return welcomeSign;
  }

  function isWelcomeSignBelowImage(configuredStyle = {}) {
    const position = String(configuredStyle?.position || "above").toLowerCase();
    return position === "below" || position === "bottom";
  }

  function normalizeCssSize(value) {
    return typeof value === "number" ? `${value}px` : value;
  }

  function setConfiguredCssValue(element, property, value) {
    if (
      typeof value === "string" &&
      value.trim() !== "" &&
      (typeof CSS === "undefined" || CSS.supports(property, value))
    ) {
      element.style.setProperty(property, value);
    }
  }
};
