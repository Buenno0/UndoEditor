(function () {
  // Cada nó guarda um valor e uma referência para o nó abaixo dele.
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

      // Restaura a pilha preservando o primeiro item do array como topo.
      for (let index = initialValues.length - 1; index >= 0; index -= 1) {
        this.push(initialValues[index]);
      }
    }

    // Insere um novo valor no topo da pilha. Complexidade: O(1).
    push(value) {
      this.top = new StackNode(value, this.top);
      this.size += 1;
    }

    // Remove e retorna o valor do topo da pilha. Complexidade: O(1).
    pop() {
      if (this.isEmpty()) {
        return null;
      }

      const currentTop = this.top;
      this.top = currentTop.next;
      this.size -= 1;
      return currentTop.value;
    }

    // Consulta o topo sem remover o item da pilha. Complexidade: O(1).
    peek() {
      return this.top ? this.top.value : null;
    }

    // A pilha está vazia quando não existe nenhum nó armazenado.
    isEmpty() {
      return this.size === 0;
    }

    // Remove todos os nós da pilha.
    clear() {
      this.top = null;
      this.size = 0;
    }

    // Retorna os valores do topo para a base, facilitando exibição e salvamento.
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

  window.Stack = Stack;
})();
