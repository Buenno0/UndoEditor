(function () {
  const itemStack = new window.Stack();
  const redoStack = new window.Stack();

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

  // A pilha principal representa os itens visíveis; o topo é o item mais recente.
  function pushText(value) {
    const items = splitIntoItems(value);

    if (items.length === 0) {
      return 0;
    }

    items.forEach((item) => itemStack.push(item));
    redoStack.clear();
    return items.length;
  }

  // Desfazer remove o topo da pilha principal e empilha esse item na pilha de refazer.
  function undo() {
    if (itemStack.isEmpty()) {
      return null;
    }

    const removedItem = itemStack.pop();
    redoStack.push(removedItem);
    return removedItem;
  }

  // Refazer remove o topo da pilha de refazer e devolve esse item para a pilha principal.
  function redo() {
    if (redoStack.isEmpty()) {
      return null;
    }

    const restoredItem = redoStack.pop();
    itemStack.push(restoredItem);
    return restoredItem;
  }

  function clearAll() {
    itemStack.clear();
    redoStack.clear();
  }

  function loadSnapshot(data) {
    const savedItems = Array.isArray(data.items)
      ? data.items
      : typeof data.content === "string"
      ? splitIntoItems(data.content).reverse()
      : [];
    const savedRedoItems = Array.isArray(data.redoItems)
      ? data.redoItems
      : Array.isArray(data.redoStack)
      ? data.redoStack.flatMap((item) => splitIntoItems(item)).reverse()
      : [];

    restoreStack(itemStack, savedItems);
    restoreStack(redoStack, savedRedoItems);
  }

  function createSnapshot(updatedAt) {
    return {
      items: itemStack.toArray(),
      redoItems: redoStack.toArray(),
      updatedAt,
    };
  }

  window.StackLogic = {
    pushText,
    undo,
    redo,
    clearAll,
    loadSnapshot,
    createSnapshot,
    getMainItems: () => itemStack.toArray(),
    getRedoItems: () => redoStack.toArray(),
    getMainSize: () => itemStack.size,
    canUndo: () => !itemStack.isEmpty(),
    canRedo: () => !redoStack.isEmpty(),
    hasItems: () => !itemStack.isEmpty() || !redoStack.isEmpty(),
  };
})();
