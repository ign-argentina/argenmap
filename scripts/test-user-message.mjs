import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const constantsSource = fs.readFileSync(
  "src/js/utils/constants/constants.js",
  "utf8",
);
const userMessageSource = fs.readFileSync(
  "src/js/components/user-message/user-message.js",
  "utf8",
);
const userMessageStyles = fs.readFileSync(
  "src/js/components/user-message/user-message.css",
  "utf8",
);
const pwaSource = fs.readFileSync("src/js/components/pwa/pwa.js", "utf8");

const messagePropertiesDefinition = constantsSource.match(
  /const MESSAGE_PROPERTIES = (\{[\s\S]*?\n\});/,
)?.[1];
assert.ok(messagePropertiesDefinition, "message properties are declared");

function createElement(tagName) {
  return {
    tagName: tagName.toUpperCase(),
    className: "",
    dataset: {},
    attributes: {},
    children: [],
    listeners: {},
    parentNode: null,
    style: {
      values: {},
      setProperty(property, value) {
        this.values[property] = value;
      },
    },
    setAttribute(attribute, value) {
      this.attributes[attribute] = value;
    },
    addEventListener(eventName, listener, options) {
      this.listeners[eventName] = { listener, options };
    },
    appendChild(child) {
      child.parentNode = this;
      this.children.push(child);
      return child;
    },
    remove() {
      if (this.parentNode) {
        const index = this.parentNode.children.indexOf(this);
        if (index >= 0) this.parentNode.children.splice(index, 1);
      }
      this.parentNode = null;
    },
  };
}

function findElementById(element, id) {
  if (element.id === id) return element;
  for (const child of element.children) {
    const match = findElementById(child, id);
    if (match) return match;
  }
  return null;
}

const body = createElement("body");
const timers = [];
const document = {
  body,
  createElement,
  getElementById: (id) => findElementById(body, id),
};
const context = vm.createContext({
  clearTimeout() {},
  console,
  document,
  setTimeout(callback, delay) {
    timers.push({ callback, delay });
    return timers.length;
  },
});
vm.runInContext(
  `const MESSAGE_PROPERTIES = ${messagePropertiesDefinition};\n${userMessageSource}\nglobalThis.UserMessage = UserMessage;\nglobalThis.MESSAGE_PROPERTIES = MESSAGE_PROPERTIES;`,
  context,
);

const expectedTypes = {
  information: {
    accent: "#008dc9",
    icon: "fa-circle-info",
    role: "status",
    live: "polite",
  },
  warning: {
    accent: "#f7e23a",
    icon: "fa-triangle-exclamation",
    role: "alert",
    live: "assertive",
  },
  error: {
    accent: "#ef5350",
    icon: "fa-circle-xmark",
    role: "alert",
    live: "assertive",
  },
};

for (const [type, expected] of Object.entries(expectedTypes)) {
  vm.runInContext(
    `globalThis.${type}Message = new UserMessage("Mensaje de ${type}", true, "${type}");`,
    context,
  );
  const stack = document.getElementById("user-message-stack");
  assert.ok(stack, "messages share a stack container");
  assert.equal(
    stack.children.length,
    Object.keys(expectedTypes).indexOf(type) + 1,
    "new messages preserve the active notifications",
  );

  const container = stack.children.at(-1);
  assert.equal(container.dataset.messageType, type);
  assert.equal(container.attributes.role, expected.role);
  assert.equal(container.attributes["aria-live"], expected.live);
  assert.equal(container.style.values["--message-accent"], expected.accent);
  assert.match(container.children[0].className, new RegExp(expected.icon));
  assert.equal(container.children[1].tagName, "P");
  assert.equal(container.children[2].tagName, "BUTTON");
  assert.equal(container.children[2].type, "button");
  assert.equal(
    timers.at(-1).delay,
    context.MESSAGE_PROPERTIES[type].time,
    `${type} keeps its configured duration`,
  );
}

const stack = document.getElementById("user-message-stack");
assert.deepEqual(
  stack.children.map((message) => message.dataset.messageType),
  ["information", "warning", "error"],
  "older messages remain above the newest message",
);

let propagationStopped = false;
stack.children.at(-1).children[2].onclick({
  stopPropagation() {
    propagationStopped = true;
  },
});
assert.equal(propagationStopped, true, "the close action stops event propagation");
assert.equal(stack.children.length, 2, "the close button dismisses only its message");

vm.runInContext(
  `globalThis.actionCount = 0;
   globalThis.updateMessage = new UserMessage("Nueva versión", false, "information", {
     id: "pwa-update-notice",
     actionLabel: "Actualizar",
     closeLabel: "Cerrar",
     onAction: () => { globalThis.actionCount += 1; },
   });`,
  context,
);
const updateNotice = document.getElementById("pwa-update-notice");
assert.equal(updateNotice.children[2].className, "message-action-btn");
assert.equal(updateNotice.children[2].textContent, "Actualizar");
assert.equal(updateNotice.children[3].className, "message-close-btn");
updateNotice.children[2].listeners.click.listener();
assert.equal(context.actionCount, 1, "notification actions use the shared class");
assert.equal(
  updateNotice.children[2].listeners.click.options.once,
  true,
  "notification actions only run once",
);

const stackLengthBeforeReplacement = stack.children.length;
vm.runInContext(
  `globalThis.replacementMessage = new UserMessage("Nueva versión reemplazada", false, "information", {
     id: "pwa-update-notice",
   });`,
  context,
);
assert.equal(
  stack.children.length,
  stackLengthBeforeReplacement,
  "a notification id replaces only its previous instance",
);
assert.equal(
  document.getElementById("pwa-update-notice").children[1].textContent,
  "Nueva versión reemplazada",
);

vm.runInContext(
  `globalThis.networkMessage = new UserMessage("Sin conexión", false, "warning", {
     id: "pwa-network-notice",
     dismissible: false,
   });`,
  context,
);
assert.equal(
  document.getElementById("pwa-network-notice").children.length,
  2,
  "persistent notifications can omit the close button",
);

function getRule(source, selector) {
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
  return source.match(new RegExp(`${escapedSelector}\\s*\\{([\\s\\S]*?)\\}`))?.[1];
}

const messageRule = getRule(userMessageStyles, ".message-container");
const stackRule = getRule(userMessageStyles, ".user-message-stack");
assert.ok(messageRule, "user messages have container styles");
assert.ok(stackRule, "user messages have stack styles");

for (const declaration of [
  "right: 1rem",
  "bottom: max(1rem, env(safe-area-inset-bottom))",
  "flex-direction: column",
  "align-items: flex-end",
  "width: fit-content",
  "max-width: min(32rem, calc(100vw - 2rem))",
]) {
  assert.ok(stackRule.includes(declaration), `message stacks use ${declaration}`);
}
for (const declaration of [
  "gap: 0.75rem",
  "width: fit-content",
  "max-width: 100%",
  "padding: 0.75rem 1rem",
  "border-radius: 0.375rem",
  "background: #25313c",
  'font-family: "Encode Sans", sans-serif',
  "font-size: 0.875rem",
  "line-height: 1.4",
]) {
  assert.ok(messageRule.includes(declaration), `user messages use ${declaration}`);
}
assert.match(
  messageRule,
  /border-left: 0\.3rem solid var\(--message-accent/,
  "the message type is represented by an accent border",
);
assert.match(
  userMessageStyles,
  /\.message-type-icon[\s\S]*color: var\(--message-accent/,
  "the message type is represented by an accent icon",
);
assert.doesNotMatch(
  pwaSource,
  /pwa-notice|createNotice/,
  "PWA notifications no longer maintain a separate component",
);
assert.equal(
  pwaSource.match(/new UserMessage\(/gu)?.length,
  3,
  "every PWA notification uses UserMessage",
);

for (const timer of timers) timer.callback();
vm.runInContext(
  `UserMessage.remove("pwa-update-notice"); UserMessage.remove("pwa-network-notice");`,
  context,
);
assert.equal(body.children.length, 0, "the empty message stack is removed");

console.log("User-message behavior and visual-contract tests passed.");
