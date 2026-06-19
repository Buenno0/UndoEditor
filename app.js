const STORAGE_KEY = "undo-editor:v2";

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

let updatedAt = null;
let enteringMainItems = 0;
let enteringRedoItems = 0;
let isMovingItem = false;

function loadState() {
  const savedData = localStorage.getItem(STORAGE_KEY);

  if (!savedData) {
    return;
  }

  try {
    const parsedData = JSON.parse(savedData);
    updatedAt = parsedData.updatedAt || null;
    StackLogic.loadSnapshot(parsedData);
  } catch {
    localStorage.removeItem(STORAGE_KEY);
  }
}

function saveState() {
  updatedAt = new Date().toISOString();
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(StackLogic.createSnapshot(updatedAt))
  );
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
  const values = StackLogic.getMainItems();

  if (values.length === 0) {
    const item = document.createElement("li");
    item.className = "stack-empty";
    item.textContent =
      "A pilha está vazia. Digite uma palavra e clique em Empilhar.";
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

function renderRedoStack() {
  elements.redoStackList.innerHTML = "";
  const values = StackLogic.getRedoItems();

  if (values.length === 0) {
    const item = document.createElement("li");
    item.className = "empty-state";
    item.textContent = "Nenhum item para refazer";
    elements.redoStackList.appendChild(item);
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
    elements.redoStackList.appendChild(item);
  });

  enteringRedoItems = 0;
}

function render() {
  renderMainStack();
  elements.characterCount.textContent = `${StackLogic.getMainSize()} ${
    StackLogic.getMainSize() === 1 ? "item empilhado" : "itens empilhados"
  }`;
  elements.saveStatus.textContent = formatDate(updatedAt);
  elements.undoButton.disabled = !StackLogic.canUndo();
  elements.redoButton.disabled = !StackLogic.canRedo();
  elements.clearButton.disabled = !StackLogic.hasItems();

  renderRedoStack();
}

function insertText(event) {
  event.preventDefault();

  const pushedItems = StackLogic.pushText(elements.input.value);

  if (pushedItems === 0) {
    elements.input.focus();
    return;
  }

  enteringMainItems = pushedItems;
  saveState();
  render();
  StackEffects.playInsertSound();
  elements.input.value = "";
  elements.input.focus();
}

async function undo() {
  if (!StackLogic.canUndo() || isMovingItem) {
    return;
  }

  isMovingItem = true;
  StackEffects.playUndoSound();
  await StackEffects.animateElementExit(
    elements.stackDisplay.querySelector(".is-top")
  );

  if (StackLogic.undo() !== null) {
    enteringRedoItems = 1;
    saveState();
    render();
  }

  isMovingItem = false;
}

async function redo() {
  if (!StackLogic.canRedo() || isMovingItem) {
    return;
  }

  isMovingItem = true;
  await StackEffects.animateElementExit(elements.redoStackList.querySelector("li"));

  if (StackLogic.redo() !== null) {
    enteringMainItems = 1;
    saveState();
    render();
    StackEffects.playInsertSound();
  }

  isMovingItem = false;
}

function clearEditor() {
  if (!StackLogic.hasItems()) {
    return;
  }

  StackEffects.playClearSound();
  StackLogic.clearAll();
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
