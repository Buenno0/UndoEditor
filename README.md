# Editor com Desfazer

Projeto 3 da matéria de Estrutura de Dados: uma aplicação Web que demonstra o
funcionamento de pilhas com ações de desfazer e refazer.

Trabalho desenvolvido por Fernando Costa, Gabriel Leme e Mateus Bueno.

## Objetivo

Demonstrar o uso de pilhas de forma visual e direta. Cada palavra inserida vira
um item empilhado no topo da pilha principal.

## Tecnologias

- HTML5
- CSS3
- JavaScript puro
- LocalStorage para persistência no navegador

## Organização do código

- `stack.js`: implementação manual da estrutura de dados pilha, com comentários didáticos.
- `stack-logic.js`: regras de empilhar, desfazer, refazer e limpar usando as pilhas.
- `effects.js`: sons e animações da interface.
- `app.js`: integração com HTML, renderização da tela e persistência no navegador.

A lógica da matéria fica separada dos efeitos visuais e sonoros para facilitar
a explicação durante a apresentação.

## Como executar

Abra o arquivo `index.html` em qualquer navegador moderno.

Não é necessário instalar dependências, rodar servidor ou configurar banco de
dados.

## Funcionamento

Ao clicar em **Empilhar**, cada palavra digitada é adicionada no topo da pilha
principal.

Ao clicar em **Desfazer**, o item do topo é removido da pilha principal e vai
para a pilha de refazer.

Ao clicar em **Refazer**, o item do topo da pilha de refazer volta para o topo
da pilha principal.

Ao inserir uma nova palavra depois de desfazer, a pilha de refazer é limpa.

## Estrutura de Dados

A estrutura principal é uma pilha implementada manualmente com nós encadeados.
As operações principais são:

- `push`: adiciona um item no topo da pilha.
- `pop`: remove e retorna o item do topo.
- `peek`: consulta o topo sem remover.
- `isEmpty`: verifica se a pilha está vazia.
- `clear`: remove todos os itens.
- `toArray`: transforma a pilha em array para exibição e persistência.

As operações `push` e `pop` possuem complexidade `O(1)`.

## Persistência

O projeto salva automaticamente no `localStorage`:

- itens da pilha principal;
- itens da pilha de refazer;
- data da última alteração.

Ao recarregar a página, o estado salvo é restaurado.

## Testes manuais sugeridos

1. Empilhar palavras e verificar se a última aparece no topo.
2. Desfazer e confirmar que o topo sai da pilha principal.
3. Refazer e confirmar que o item volta ao topo.
4. Inserir uma nova palavra depois de desfazer e confirmar que a pilha de refazer é limpa.
5. Recarregar a página e verificar se as pilhas continuam salvas.
6. Apagar tudo e confirmar que as duas pilhas ficam vazias.

## Integrantes

- Fernando Costa
- Gabriel Leme
- Mateus Bueno
