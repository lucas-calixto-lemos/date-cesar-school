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
(`src/apps/aluno/telas/Reservar.tsx`, `src/core/dominio/pagamento/Cobranca.ts`). Além disso, as formas
são descobertas automaticamente na pasta `dominio/pagamento/formas/`
(`src/core/composicao/formasDePagamento.ts`): para criar uma forma nova basta criar a classe.

## 2. Navegar pelo pedido até a comanda (Demeter), esboço

**Ideia inicial:** na tela do pedido, usar `pedido.comanda.formatada()` e
`pedido.cobranca.estaPaga()`.

**Por que fere o princípio:** a tela passaria a conhecer a estrutura interna do `Pedido`
(que ele tem uma comanda e uma cobrança, e a interface de cada uma). Uma mudança interna no
pedido quebraria a UI.

**Correção:** o `Pedido` não expõe `cobranca`, `item` nem `janela`. Ele oferece
`numeroDaComanda()`, `estaPago()`, `resumoDoPagamento()`, `nomeDoItem()` e
`descricaoDaJanela()`, que delegam internamente (`src/core/dominio/pedido/Pedido.ts`).
O custo, reconhecido no livro, é ter vários métodos "repassadores" no `Pedido`.

## 3. Construtor com efeito colateral escondido na `CozinhaSimulada`, código

**O que foi escrito:** `new CozinhaSimulada(painel)` já se inscrevia no painel dentro do
construtor. A linha `new CozinhaSimulada(...)` na composição parecia "inútil", mas ligava um
comportamento.

**Problema:** o efeito ficava escondido e não havia como desligar. Quem lê a raiz de composição
não entende o que acontece, e testar exige truques.

**Correção:** o construtor só guarda as dependências. A assinatura acontece em `ligar()`, que
devolve a função para desligar. (Mais tarde, com o app da cantina de verdade, a "tia robô" foi removida: quem marca o pedido agora é a tela da cantina.)

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

# Etapa 2: app da cantina e sincronização

## 6. Pedido mutável compartilhado por referência (Liskov e Inversão de Dependências), código

**O que existia:** na primeira versão, a UI do aluno guardava o *objeto* `Pedido`, e a
"cozinha" em memória alterava esse mesmo objeto. O `ServicoDeRetirada` mudava o pedido
(`avisarQueEstaIndo`) e **não salvava** nada, porque "todo mundo já tinha a referência".

**Por que fere os princípios:** isso só funciona porque tudo está na mesma memória. Ao trocar o
armazenamento por um que atravessa abas (BroadcastChannel), não existe referência compartilhada:
o comportamento mudaria. A implementação em memória "funcionaria por acaso", e a outra não
seria um substituto válido, o que fere Liskov. As telas também dependiam, sem dizer, de um
detalhe da implementação, o que fere a Inversão de Dependências.

**Correção:**
- o estado compartilhado passou a ser **serializável** (`EstadoDaCantina`);
- o `Pedido` ganhou `paraDados()` e `Pedido.restaurar()`;
- o repositório devolve sempre uma cópia nova;
- quem altera um pedido chama `salvar` explicitamente;
- o app guarda só o **número** da comanda e relê o pedido a cada mudança.

O mesmo teste de integração (`src/core/composicao/integracao.test.ts`) roda com as duas
implementações para provar a substituição.

## 7. Componente compartilhado importando o contexto de um app, código

**O que aconteceu:** ao mover o `PainelDeDebug` para `src/design/` (componentes compartilhados),
ele continuou importando `useApp` do **app do aluno**.

**Por que é um problema:** o "compartilhado" ficaria acoplado a um app, e a cantina não poderia
usá-lo sem puxar o aluno junto. Isso fere a separação pedida e a Inversão de Dependências.

**Correção:** o componente recebe `controleDeRelogio` e `agora` por props. Um teste de arquitetura
(`src/arquitetura.test.ts`) agora falha se `src/design/` importar algo de `src/apps/`, ou se um
app importar o outro. Conferi forçando uma violação de propósito: o teste acusou o arquivo e o
import exatos.

## 8. Tema e modo escuro presos ao documento inteiro, código

**O que existia:** os tokens de cor ficavam em `:root`, e o modo escuro era ligado em
`<html data-theme>`.

**Problema:** com os dois apps na mesma página (/demo), não daria para ter o aluno vermelho (ou
escuro) e a cantina café ao mesmo tempo. O componente dependia de um estado global, em vez de
receber o tema de quem o usa.

**Correção:** os tokens passaram a valer por app (`.tema-aluno`, `.tema-cantina`,
`[data-modo='escuro']`). Também foram criados tokens **semânticos** (`--primaria`, `--destaque`).
Considerei redefinir `--vermelho` como marrom na cantina e descartei a ideia: um nome que mente
sobre o próprio valor esconde a intenção.

## 9. Relógio do debug por aba, esboço

**Ideia inicial:** manter o `RelogioAjustavel` local de cada app.

**Problema:** com /aluno e /cantina em abas diferentes, simular 20:15 no aluno não mudaria a
hora da cantina, e o timer de chegada (que compara "agora" com o instante do play) daria valores
absurdos.

**Correção:** o deslocamento do relógio simulado virou parte do estado compartilhado
(`RelogioCompartilhado`). O domínio continua recebendo só um `Relogio`.

## 10. Bugs desta etapa, código

- **Ordem do CSS:** o `estilos.css` compartilhado era importado depois do CSS da cantina e
  sobrescrevia as abas (4 colunas em vez de 2). Corrigido importando a base primeiro no
  `main.tsx`.
- No roteiro de teste do navegador, simulei 20:15 para uma janela que terminava às 20:15, e o
  play não apareceu. O erro era do roteiro, não do app; ajustado para 20:00.

---

## Concessões conscientes (não são erros, mas vale declarar)

- **`ItemDoCardapio.imagem()`** carrega uma chave de imagem. É uma informação de apresentação
  no domínio, tratada como um identificador opaco (como seria uma URL de foto). O domínio não
  sabe como a imagem é desenhada.
- **Descoberta automática das formas de pagamento** usa `import.meta.glob`, um recurso do
  Vite. Isso fica isolado em `src/core/composicao/` (raiz de composição). O domínio continua TypeScript
  puro, o que é verificado pelos testes `src/core/dominio/arquitetura.test.ts` e `src/arquitetura.test.ts`.
- **Tela do pedido** escolhe o que mostrar com um mapa por situação (`reservado`,
  `a-caminho`, `entregue`, `cancelado`). Com mais estados, valeria o padrão *State* dentro do `Pedido`.
- **Sincronização "última escrita vence"** no BroadcastChannel: se duas abas alterarem no mesmo
  instante, uma das alterações se perde. Também não há transação: uma reserva grava comanda,
  estoque e pedido em três alterações. Para a PoC basta; um backend real resolveria as duas
  coisas no servidor, e seria só mais uma implementação de `ArmazemDaCantina`.
- **`src/core/infra` fica dentro do núcleo compartilhado.** O pedido era "núcleo só de domínio".
  Interpretei assim: o núcleo não tem nada de interface (React, componentes). Ele guarda o domínio
  puro (`core/dominio`) e os adaptadores sem UI que os dois apps precisam (`core/infra`,
  `core/composicao`). Os componentes visuais compartilhados ficam em `src/design/`, e nenhum app
  importa do outro (verificado por teste).
