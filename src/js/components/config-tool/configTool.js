class ConfigTool {
  constructor() {}

  createComponent() {
    const btnElement = document.createElement("button");
    btnElement.className = "fa fa-cog"; // Cambiado de class a className
    btnElement.id = "configBtn";
    btnElement.title = "Configuracion";

    btnElement.setAttribute("aria-hidden", "true");

    btnElement.addEventListener("click", async () => {
      const existingConfigWrapper = document.querySelector("#configWrapper");
      if (existingConfigWrapper) {
        existingConfigWrapper.remove();
      } else {
        btnElement.disabled = true;
        try {
          await appDependencies.load("configWindow");
          const configuration = new configWindow();
          configuration.createComponent();
        } catch (error) {
          new UserMessage(error.message, true, "error");
        } finally {
          btnElement.disabled = false;
        }
      }
    });

    if (loadConfigTool) {
      document.querySelector("#logo-help").append(btnElement);
    }
  }
}
