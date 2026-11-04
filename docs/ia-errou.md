# Onde a IA errou (e como foi corrigido)

Registro honesto das sugestões da IA (Claude) que feriram, ou quase feriram, um princípio de
projeto do cap. 5 de *Engenharia de Software Moderna*, e de outros erros que apareceram
durante a construção da PoC.

Legenda:
- **Esboço**: ideia que a IA teve no planejamento, antes de escrever o código, e trocou antes de implementar.
- **Código**: algo que chegou a ser escrito e depois foi corrigido.

---

## 1. Mostrar o QR perguntando "qual forma de pagamento é esta?" (Aberto/Fechado), esboço

**Ideia inicial:** na tela de reserva, exibir o QR Code com algo como
`if (forma.id === 'pix-simulado') mostrarQr()`.

**Por que fere o princípio:** cada forma nova que também precisasse de uma etapa extra
(um boleto, por exemplo) obrigaria a **editar a tela**. A UI ficaria aberta a modificação,
o contrário do Aberto/Fechado, e voltaria a ter o `if` por tipo que o enunciado proíbe.

**Correção:** a forma de pagamento devolve uma `Cobranca`, e a cobrança diz se tem QR
(`cobranca.codigoQr()`). A UI pergunta pelo **dado**, não pelo **tipo**
(`src/ui/telas/Reservar.tsx`, `src/dominio/pagamento/Cobranca.ts`). Além disso, as formas
são descobertas automaticamente na pasta `dominio/pagamento/formas/`
(`src/app/formasDePagamento.ts`): para criar uma forma nova basta criar a classe.

## 2. Navegar pelo pedido até a comanda (Demeter), esboço

**Ideia inicial:** na tela do pedido, usar `pedido.comanda.formatada()` e
`pedido.cobranca.estaPaga()`.

**Por que fere o princípio:** a tela passaria a conhecer a estrutura interna do `Pedido`
(que ele tem uma comanda e uma cobrança, e a interface de cada uma). Uma mudança interna no
pedido quebraria a UI.

**Correção:** o `Pedido` não expõe `cobranca`, `item` nem `janela`. Ele oferece
`numeroDaComanda()`, `estaPago()`, `resumoDoPagamento()`, `nomeDoItem()` e
`descricaoDaJanela()`, que delegam internamente (`src/dominio/pedido/Pedido.ts`).
O custo, reconhecido no livro, é ter vários métodos "repassadores" no `Pedido`.

## 3. Construtor com efeito colateral escondido na `CozinhaSimulada`, código

**O que foi escrito:** `new CozinhaSimulada(painel)` já se inscrevia no painel dentro do
construtor. A linha `new CozinhaSimulada(...)` na composição parecia "inútil", mas ligava um
comportamento.

**Problema:** o efeito ficava escondido e não havia como desligar. Quem lê a raiz de composição
não entende o que acontece, e testar exige truques.

**Correção:** o construtor só guarda as dependências. A assinatura acontece em `ligar()`, que
devolve a função para desligar (`src/infra/CozinhaSimulada.ts`).

## 4. Estimativa calibrada de forma irreal, código (regra de negócio, não princípio)

**O que aconteceu:** os pesos iniciais (1 min por pessoa na fila, 0,5 min por reserva e uma fila
de 6 a 12 pessoas no pico) faziam quase tudo dar **"Não dá"** num intervalo de 15 min. Isso só
apareceu ao testar a tela, com um pastel saindo dos Laboratórios: 24 min estimados.

**Correção:** 0,5 min por pessoa, 0,25 min por reserva (que já vem separada) e uma fila
simulada de 3 a 9 pessoas no pico. Graças à **composição**, o ajuste mexeu só nos valores
padrão dos componentes e na fila simulada. O `EstimadorPorComposicao` e o
`ClassificadorDeChance` não mudaram.

## 5. Bugs de implementação da UI, código (não são de princípio, mas registrando)

- `useEffect(() => window.scrollTo(0, 0), ...)` devolvia um valor e o React o tratava como
  função de limpeza, deixando a tela em branco. Corrigido com corpo em bloco `{ ... }`.
- `flex: 1` aplicado a todo botão `.pilula--cheia` achatava o botão dentro da folha do Pix
  (coluna flex com `flex-basis: 0`). A regra passou a valer só dentro da `.barra-acao`.
- Renderizar `HoraDoDia` direto no JSX: o TypeScript acusou, e a correção foi usar `.toString()`.

---

## Concessões conscientes (não são erros, mas vale declarar)

- **`ItemDoCardapio.imagem()`** carrega uma chave de imagem. É uma informação de apresentação
  no domínio, tratada como um identificador opaco (como seria uma URL de foto). O domínio não
  sabe como a imagem é desenhada.
- **`LocalDoCampus`** tem a lista de locais fixa no domínio, em vez de um repositório. É
  suficiente para a PoC, mas viraria um repositório se a lista mudasse com frequência.
- **Descoberta automática das formas de pagamento** usa `import.meta.glob`, um recurso do
  Vite. Isso fica isolado na camada `app/` (raiz de composição). O domínio continua TypeScript
  puro, o que é verificado pelo teste `src/dominio/arquitetura.test.ts`.
- **Tela do pedido** escolhe o que mostrar com um mapa por situação (`reservado`,
  `aluno-a-caminho`...). Com mais estados, valeria o padrão *State* dentro do `Pedido`.
