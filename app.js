const STORAGE_KEY = "undo-editor:v2";

class StackNode {
  constructor(value, next = null) {
    this.value = value;
    this.next = next;
  }
}

class Stack {
  constructor(initialValues = []) {
    this.top = null;
    this.size = 0;

    for (let index = initialValues.length - 1; index >= 0; index -= 1) {
      this.push(initialValues[index]);
    }
  }

  push(value) {
    this.top = new StackNode(value, this.top);
    this.size += 1;
  }

  pop() {
    if (this.isEmpty()) {
      return null;
    }

    const currentTop = this.top;
    this.top = currentTop.next;
    this.size -= 1;
    return currentTop.value;
  }

  peek() {
    return this.top ? this.top.value : null;
  }

  isEmpty() {
    return this.size === 0;
  }

  clear() {
    this.top = null;
    this.size = 0;
  }

  toArray() {
    const values = [];
    let current = this.top;

    while (current) {
      values.push(current.value);
      current = current.next;
    }

    return values;
  }
}

const elements = {
  form: document.querySelector("#insert-form"),
  input: document.querySelector("#text-input"),
  stackDisplay: document.querySelector("#editor-content"),
  undoButton: document.querySelector("#undo-button"),
  redoButton: document.querySelector("#redo-button"),
  clearButton: document.querySelector("#clear-button"),
  characterCount: document.querySelector("#character-count"),
  saveStatus: document.querySelector("#save-status"),
  redoStackList: document.querySelector("#redo-stack-list"),
};

const itemStack = new Stack();
const redoStack = new Stack();
let updatedAt = null;
let enteringMainItems = 0;
let enteringRedoItems = 0;
let isMovingItem = false;
let audioContext = null;

function restoreStack(stack, values) {
  stack.clear();

  values
    .slice()
    .reverse()
    .forEach((item) => stack.push(item));
}

function splitIntoItems(value) {
  return String(value ?? "").trim().split(/\s+/).filter(Boolean);
}

function wait(duration) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, duration);
  });
}

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

async function animateElementExit(element) {
  if (!element || prefersReducedMotion()) {
    return;
  }

  element.classList.add("is-leaving");
  await wait(180);
}

function getAudioContext() {
  const BrowserAudioContext = window.AudioContext || window.webkitAudioContext;

  if (!BrowserAudioContext) {
    return null;
  }

  if (!audioContext) {
    audioContext = new BrowserAudioContext();
  }

  return audioContext;
}

function playInsertSound() {
  const context = getAudioContext();

  if (!context) {
    return;
  }

  if (context.state === "suspended") {
    context.resume();
  }

  const now = context.currentTime;
  const oscillator = context.createOscillator();
  const gain = context.createGain();

  oscillator.type = "triangle";
  oscillator.frequency.setValueAtTime(360, now);
  oscillator.frequency.exponentialRampToValueAtTime(620, now + 0.08);

  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.08, now + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.14);

  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start(now);
  oscillator.stop(now + 0.16);
}

function playUndoSound() {
  const context = getAudioContext();

  if (!context) {
    return;
  }

  if (context.state === "suspended") {
    context.resume();
  }

  const now = context.currentTime;
  const oscillator = context.createOscillator();
  const gain = context.createGain();

  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(520, now);
  oscillator.frequency.exponentialRampToValueAtTime(180, now + 0.16);

  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.07, now + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);

  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start(now);
  oscillator.stop(now + 0.2);
}

function loadState() {
  const savedData = localStorage.getItem(STORAGE_KEY);

  if (!savedData) {
    return;
  }

  try {
    const parsedData = JSON.parse(savedData);
    updatedAt = parsedData.updatedAt || null;

    const savedItems = Array.isArray(parsedData.items)
      ? parsedData.items
      : typeof parsedData.content === "string"
      ? splitIntoItems(parsedData.content).reverse()
      : [];
    const savedRedoItems = Array.isArray(parsedData.redoItems)
      ? parsedData.redoItems
      : Array.isArray(parsedData.redoStack)
      ? parsedData.redoStack.flatMap((item) => splitIntoItems(item)).reverse()
      : [];

    restoreStack(itemStack, savedItems);
    restoreStack(redoStack, savedRedoItems);
  } catch {
    localStorage.removeItem(STORAGE_KEY);
  }
}

function saveState() {
  updatedAt = new Date().toISOString();

  const state = {
    items: itemStack.toArray(),
    redoItems: redoStack.toArray(),
    updatedAt,
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function formatDate(dateValue) {
  if (!dateValue) {
    return "Nenhuma alteração salva";
  }

  return `Salvo em ${new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(dateValue))}`;
}

function getPreview(value) {
  if (value.length <= 80) {
    return value || "(vazio)";
  }

  return `${value.slice(0, 77)}...`;
}

function renderMainStack() {
  elements.stackDisplay.innerHTML = "";
  const values = itemStack.toArray();

  if (values.length === 0) {
    const item = document.createElement("li");
    item.className = "stack-empty";
    item.textContent = "A pilha está vazia. Digite uma palavra e clique em Empilhar.";
    elements.stackDisplay.appendChild(item);
    return;
  }

  values.forEach((value, index) => {
    const item = document.createElement("li");
    const badge = document.createElement("span");
    const text = document.createElement("span");

    item.className = index === 0 ? "stack-layer is-top" : "stack-layer";
    if (index < enteringMainItems) {
      item.classList.add("is-entering");
      item.style.animationDelay = `${index * 35}ms`;
    }
    badge.className = "stack-layer-badge";
    text.className = "stack-layer-text";
    badge.textContent = index === 0 ? "Topo" : `Item ${index + 1}`;
    text.textContent = getPreview(value);

    item.append(badge, text);
    elements.stackDisplay.appendChild(item);
  });

  enteringMainItems = 0;
}

function renderRedoStack(listElement, stack) {
  listElement.innerHTML = "";
  const values = stack.toArray();

  if (values.length === 0) {
    const item = document.createElement("li");
    item.className = "empty-state";
    item.textContent = "Nenhum item para refazer";
    listElement.appendChild(item);
    return;
  }

  values.forEach((value, index) => {
    const item = document.createElement("li");
    const label = document.createElement("span");
    const preview = document.createElement("span");

    label.className = "stack-item-label";
    preview.className = "stack-item-preview";
    label.textContent = index === 0 ? "Topo" : `Item ${index + 1}`;
    preview.textContent = getPreview(value);

    if (index < enteringRedoItems) {
      item.classList.add("is-entering");
      item.style.animationDelay = `${index * 35}ms`;
    }

    item.append(label, preview);
    listElement.appendChild(item);
  });

  enteringRedoItems = 0;
}

function render() {
  renderMainStack();
  elements.characterCount.textContent = `${itemStack.size} ${
    itemStack.size === 1 ? "item empilhado" : "itens empilhados"
  }`;
  elements.saveStatus.textContent = formatDate(updatedAt);
  elements.undoButton.disabled = itemStack.isEmpty();
  elements.redoButton.disabled = redoStack.isEmpty();
  elements.clearButton.disabled = itemStack.isEmpty() && redoStack.isEmpty();

  renderRedoStack(elements.redoStackList, redoStack);
}

function pushItems(items) {
  if (items.length === 0) {
    return;
  }

  items.forEach((item) => itemStack.push(item));
  redoStack.clear();
  enteringMainItems = items.length;
  saveState();
  render();
  playInsertSound();
}

function insertText(event) {
  event.preventDefault();

  const itemsToInsert = splitIntoItems(elements.input.value);

  if (itemsToInsert.length === 0) {
    elements.input.focus();
    return;
  }

  pushItems(itemsToInsert);
  elements.input.value = "";
  elements.input.focus();
}

async function undo() {
  if (itemStack.isEmpty() || isMovingItem) {
    return;
  }

  isMovingItem = true;
  playUndoSound();
  await animateElementExit(elements.stackDisplay.querySelector(".is-top"));
  redoStack.push(itemStack.pop());
  enteringRedoItems = 1;
  saveState();
  render();
  isMovingItem = false;
}

async function redo() {
  if (redoStack.isEmpty() || isMovingItem) {
    return;
  }

  isMovingItem = true;
  await animateElementExit(elements.redoStackList.querySelector("li"));
  itemStack.push(redoStack.pop());
  enteringMainItems = 1;
  saveState();
  render();
  playInsertSound();
  isMovingItem = false;
}

function clearEditor() {
  itemStack.clear();
  redoStack.clear();
  updatedAt = null;
  localStorage.removeItem(STORAGE_KEY);
  render();
  elements.input.focus();
}

elements.form.addEventListener("submit", insertText);
elements.undoButton.addEventListener("click", undo);
elements.redoButton.addEventListener("click", redo);
elements.clearButton.addEventListener("click", clearEditor);

loadState();
render();
