# Editor com Desfazer

Projeto 3 da disciplina de Estrutura de Dados: um editor Web simples com
funcionalidades de desfazer e refazer usando pilhas implementadas manualmente.

## Objetivo

Demonstrar o uso de duas pilhas em uma aplicação Web:

- `undoStack`: guarda os estados anteriores do editor.
- `redoStack`: guarda os estados que podem ser refeitos.

## Tecnologias

- HTML5
- CSS3
- JavaScript puro
- LocalStorage para persistência no navegador

## Como executar

Abra o arquivo `index.html` em qualquer navegador moderno.

Não é necessário instalar dependências, rodar servidor ou configurar banco de
dados.

## Funcionamento

Ao inserir um novo texto, o conteúdo atual do editor é salvo na pilha de
desfazer. Depois disso, o novo texto é exibido no editor e a pilha de refazer é
limpa.

Ao clicar em **Desfazer**, o estado atual vai para a pilha de refazer e o topo
da pilha de desfazer volta para o editor.

Ao clicar em **Refazer**, o estado atual vai para a pilha de desfazer e o topo
da pilha de refazer volta para o editor.

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

- conteúdo atual do editor;
- pilha de desfazer;
- pilha de refazer;
- data da última alteração.

Ao recarregar a página, o estado salvo é restaurado.

## Testes manuais sugeridos

1. Inserir texto e verificar se aparece no editor.
2. Inserir vários textos e desfazer em ordem inversa.
3. Refazer após desfazer.
4. Inserir novo texto depois de desfazer e confirmar que o refazer é limpo.
5. Recarregar a página e verificar se conteúdo e histórico continuam salvos.
6. Limpar o editor e confirmar que conteúdo e pilhas ficam vazios.

## Integrantes

Preencher com os nomes dos integrantes do grupo.
