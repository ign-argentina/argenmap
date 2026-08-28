import {
  enableNativeInteractions,
  onDomReady,
} from "./dependencies/dependency-loader.js";

function getBootstrapTarget(trigger) {
  const selector = trigger.getAttribute("data-target") || trigger.getAttribute("href");
  if (!selector || selector === "#") return null;
  try {
    return document.querySelector(selector);
  } catch (_error) {
    return null;
  }
}

function showBootstrapModal(modal) {
  if (!modal) return;
  modal.style.display = "block";
  modal.classList.add("in");
  modal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");

  let backdrop = document.querySelector(".modal-backdrop[data-argenmap-modal]");
  if (!backdrop) {
    backdrop = document.createElement("div");
    backdrop.className = "modal-backdrop fade in";
    backdrop.dataset.argenmapModal = "true";
    document.body.appendChild(backdrop);
  }
  if (!modal.dataset.nativeBackdropDismiss) {
    modal.dataset.nativeBackdropDismiss = "true";
    modal.addEventListener("click", (event) => {
      if (event.target === modal) hideBootstrapModal(modal);
    });
  }
}

function hideBootstrapModal(modal) {
  if (!modal) return;
  modal.classList.remove("in");
  modal.style.display = "none";
  modal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
  document.querySelector(".modal-backdrop[data-argenmap-modal]")?.remove();
}

function toggleBootstrapCollapse(trigger) {
  const target = getBootstrapTarget(trigger);
  if (!target) return;
  const opening = !target.classList.contains("in");
  if (opening) {
    const parentSelector = trigger.getAttribute("data-parent");
    if (parentSelector) {
      const parent = document.querySelector(parentSelector);
      parent?.querySelectorAll(".collapse.in").forEach((openPanel) => {
        if (openPanel === target) return;
        openPanel.classList.remove("in");
        openPanel.setAttribute("aria-expanded", "false");
        parent
          .querySelectorAll(`[data-toggle="collapse"][href="#${openPanel.id}"], [data-toggle="collapse"][data-target="#${openPanel.id}"]`)
          .forEach((control) => control.setAttribute("aria-expanded", "false"));
      });
    }
    target.dispatchEvent(new CustomEvent("show.bs.collapse", { bubbles: true }));
  }
  target.classList.toggle("in", opening);
  trigger.setAttribute("aria-expanded", String(opening));
  target.setAttribute("aria-expanded", String(opening));
  target.dispatchEvent(
    new CustomEvent(opening ? "shown.bs.collapse" : "hidden.bs.collapse", {
      bubbles: true,
    }),
  );
}

function activateBootstrapTab(trigger) {
  const target = getBootstrapTarget(trigger);
  if (!target) return;

  const tabList = trigger.closest(".nav-tabs");
  tabList?.querySelectorAll("li.active").forEach((item) => item.classList.remove("active"));
  trigger.closest("li")?.classList.add("active");

  const tabContent = target.closest(".tab-content");
  tabContent?.querySelectorAll(".tab-pane.active").forEach((pane) => {
    pane.classList.remove("active", "in");
  });
  target.classList.add("active", "in");
  trigger.dispatchEvent(new CustomEvent("shown.bs.tab", { bubbles: true }));
}

function closeBootstrapDropdowns(except = null) {
  document.querySelectorAll(".btn-group.open").forEach((group) => {
    if (group === except) return;
    group.classList.remove("open");
    group.querySelector('[data-toggle="dropdown"]')?.setAttribute(
      "aria-expanded",
      "false",
    );
    group.dispatchEvent(new CustomEvent("hidden.bs.dropdown", { bubbles: true }));
  });
}

function toggleBootstrapDropdown(trigger) {
  const group = trigger.closest(".btn-group");
  if (!group) return;
  const opening = !group.classList.contains("open");
  closeBootstrapDropdowns(group);
  group.classList.toggle("open", opening);
  trigger.setAttribute("aria-expanded", String(opening));
  group.dispatchEvent(
    new CustomEvent(opening ? "shown.bs.dropdown" : "hidden.bs.dropdown", {
      bubbles: true,
    }),
  );
}

onDomReady(() => {
  document.addEventListener("click", (event) => {
    const dismiss = event.target.closest('[data-dismiss="modal"]');
    if (dismiss) {
      event.preventDefault();
      hideBootstrapModal(dismiss.closest(".modal"));
      return;
    }

    // Ignore unsupported nested data-toggle values (for example tooltip) and
    // continue up to the actionable control. Section descriptions use a
    // tooltip inside a collapse header, so selecting the nearest generic
    // data-toggle made that part of the header inert.
    const trigger = event.target.closest(
      '[data-toggle="modal"], [data-toggle="collapse"], ' +
        '[data-toggle="tab"], [data-toggle="dropdown"]',
    );
    if (!trigger) return;
    switch (trigger.getAttribute("data-toggle")) {
      case "modal":
        event.preventDefault();
        showBootstrapModal(getBootstrapTarget(trigger));
        break;
      case "collapse":
        event.preventDefault();
        toggleBootstrapCollapse(trigger);
        break;
      case "tab":
        event.preventDefault();
        activateBootstrapTab(trigger);
        break;
      case "dropdown":
        event.preventDefault();
        event.stopPropagation();
        toggleBootstrapDropdown(trigger);
        break;
      default:
        break;
    }
  });
  document.addEventListener("click", (event) => {
    if (!event.target.closest('[data-toggle="dropdown"]')) {
      closeBootstrapDropdowns();
    }
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      hideBootstrapModal(document.querySelector(".modal.in"));
      closeBootstrapDropdowns();
    }
  });
});
