const STORAGE_KEY = "undo-editor:v1";

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
  editor: document.querySelector("#editor-content"),
  undoButton: document.querySelector("#undo-button"),
  redoButton: document.querySelector("#redo-button"),
  clearButton: document.querySelector("#clear-button"),
  characterCount: document.querySelector("#character-count"),
  saveStatus: document.querySelector("#save-status"),
  undoStackList: document.querySelector("#undo-stack-list"),
  redoStackList: document.querySelector("#redo-stack-list"),
};

const undoStack = new Stack();
const redoStack = new Stack();
let content = "";
let updatedAt = null;

function loadState() {
  const savedData = localStorage.getItem(STORAGE_KEY);

  if (!savedData) {
    return;
  }

  try {
    const parsedData = JSON.parse(savedData);
    content = typeof parsedData.content === "string" ? parsedData.content : "";
    updatedAt = parsedData.updatedAt || null;

    undoStack.clear();
    redoStack.clear();

    const savedUndoStack = Array.isArray(parsedData.undoStack)
      ? parsedData.undoStack
      : [];
    const savedRedoStack = Array.isArray(parsedData.redoStack)
      ? parsedData.redoStack
      : [];

    savedUndoStack
      .slice()
      .reverse()
      .forEach((item) => undoStack.push(item));
    savedRedoStack
      .slice()
      .reverse()
      .forEach((item) => redoStack.push(item));
  } catch {
    localStorage.removeItem(STORAGE_KEY);
  }
}

function saveState() {
  updatedAt = new Date().toISOString();

  const state = {
    content,
    undoStack: undoStack.toArray(),
    redoStack: redoStack.toArray(),
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
    return value || "(editor vazio)";
  }

  return `${value.slice(0, 77)}...`;
}

function renderStack(listElement, stack) {
  listElement.innerHTML = "";
  const values = stack.toArray();

  if (values.length === 0) {
    const item = document.createElement("li");
    item.className = "empty-state";
    item.textContent = "Pilha vazia";
    listElement.appendChild(item);
    return;
  }

  values.forEach((value, index) => {
    const item = document.createElement("li");
    item.textContent = index === 0 ? `Topo: ${getPreview(value)}` : getPreview(value);
    listElement.appendChild(item);
  });
}

function render() {
  elements.editor.value = content;
  elements.characterCount.textContent = `${content.length} ${
    content.length === 1 ? "caractere" : "caracteres"
  }`;
  elements.saveStatus.textContent = formatDate(updatedAt);
  elements.undoButton.disabled = undoStack.isEmpty();
  elements.redoButton.disabled = redoStack.isEmpty();
  elements.clearButton.disabled =
    content.length === 0 && undoStack.isEmpty() && redoStack.isEmpty();

  renderStack(elements.undoStackList, undoStack);
  renderStack(elements.redoStackList, redoStack);
}

function updateContent(nextContent) {
  if (nextContent === content) {
    return;
  }

  undoStack.push(content);
  redoStack.clear();
  content = nextContent;
  saveState();
  render();
}

function insertText(event) {
  event.preventDefault();

  const textToInsert = elements.input.value.trim();

  if (!textToInsert) {
    elements.input.focus();
    return;
  }

  const separator = content.length > 0 ? " " : "";
  updateContent(`${content}${separator}${textToInsert}`);
  elements.input.value = "";
  elements.input.focus();
}

function undo() {
  if (undoStack.isEmpty()) {
    return;
  }

  redoStack.push(content);
  content = undoStack.pop();
  saveState();
  render();
}

function redo() {
  if (redoStack.isEmpty()) {
    return;
  }

  undoStack.push(content);
  content = redoStack.pop();
  saveState();
  render();
}

function clearEditor() {
  content = "";
  undoStack.clear();
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
