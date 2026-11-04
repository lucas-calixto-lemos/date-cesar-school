import type { ItemSerializado } from '../dominio/cardapio/ItemDoCardapio'

type Linha = Omit<ItemSerializado, 'precoEmCentavos'> & { preco: number; estoque?: number }

const ESTOQUE_PADRAO = 12

const LINHAS: Linha[] = [
  // ---- salgados ----
  { id: 'coxinha', nome: 'Coxinha de frango', categoria: 'salgado', imagem: 'coxinha', preco: 8, minutosDePreparo: 1,
    descricao: 'Massa crocante por fora, frango desfiado com catupiry por dentro. Sai quentinha da estufa.' },
  { id: 'pao-de-queijo', nome: 'Pão de queijo', categoria: 'salgado', imagem: 'pao-de-queijo', preco: 5.5, minutosDePreparo: 1,
    descricao: 'Porção com 3 unidades médias, assadas na hora do intervalo.' },
  { id: 'esfirra', nome: 'Esfirra de carne', categoria: 'salgado', imagem: 'esfirra', preco: 7.5, minutosDePreparo: 1,
    descricao: 'Esfirra aberta com carne moída temperada e um toque de limão.' },
  { id: 'enroladinho', nome: 'Enroladinho de salsicha', categoria: 'salgado', imagem: 'enroladinho', preco: 7, minutosDePreparo: 1,
    descricao: 'Massa de pão macia enrolada numa salsicha inteira. Clássico de cantina.' },
  { id: 'misto-quente', nome: 'Misto quente', categoria: 'salgado', imagem: 'misto-quente', preco: 9, minutosDePreparo: 4,
    descricao: 'Pão de forma na chapa com presunto e queijo derretendo.' },
  { id: 'sanduiche-natural', nome: 'Sanduíche natural', categoria: 'salgado', imagem: 'sanduiche-natural', preco: 12, minutosDePreparo: 1,
    descricao: 'Pão integral, frango, cenoura, alface e requeijão. Leve para não dar sono na aula.' },
  { id: 'tapioca', nome: 'Tapioca de queijo coalho', categoria: 'salgado', imagem: 'tapioca', preco: 11, minutosDePreparo: 5,
    descricao: 'Feita na hora na frigideira, com queijo coalho e manteiga de garrafa.' },
  { id: 'pastel', nome: 'Pastel de queijo', categoria: 'salgado', imagem: 'pastel', preco: 9.5, minutosDePreparo: 4,
    descricao: 'Frito na hora, massa sequinha e muito queijo.' },
  { id: 'empada', nome: 'Empada de frango', categoria: 'salgado', imagem: 'empada', preco: 7.5, minutosDePreparo: 1,
    descricao: 'Massa podre amanteigada que desmancha, recheio cremoso de frango.' },
  // ---- doces ----
  { id: 'bolo-de-pote', nome: 'Bolo de pote', categoria: 'doce', imagem: 'bolo-de-pote', preco: 10, minutosDePreparo: 1, estoque: 0,
    descricao: 'Camadas de bolo de chocolate e brigadeiro cremoso. Vem com colherzinha.' },
  { id: 'brownie', nome: 'Brownie', categoria: 'doce', imagem: 'brownie', preco: 8, minutosDePreparo: 1,
    descricao: 'Casquinha craquelada por cima e meio molhadinho por dentro.' },
  // ---- bebidas ----
  { id: 'red-bull', nome: 'Red Bull 250 ml', categoria: 'bebida', imagem: 'red-bull', preco: 12, minutosDePreparo: 0.5,
    descricao: 'Energético em lata, gelado.' },
  { id: 'monster', nome: 'Monster 473 ml', categoria: 'bebida', imagem: 'monster', preco: 13, minutosDePreparo: 0.5,
    descricao: 'Energético em lata grande, gelado.' },
  { id: 'coca-cola', nome: 'Coca-Cola lata', categoria: 'bebida', imagem: 'coca-cola', preco: 6.5, minutosDePreparo: 0.5,
    descricao: 'Refrigerante de cola em lata de 350 ml, trincando.' },
  { id: 'guarana', nome: 'Guaraná lata', categoria: 'bebida', imagem: 'guarana', preco: 6, minutosDePreparo: 0.5,
    descricao: 'Refrigerante de guaraná em lata de 350 ml.' },
  { id: 'agua', nome: 'Água mineral 500 ml', categoria: 'bebida', imagem: 'agua', preco: 3.5, minutosDePreparo: 0.5,
    descricao: 'Água sem gás, gelada ou natural.' },
  { id: 'agua-com-gas', nome: 'Água com gás 500 ml', categoria: 'bebida', imagem: 'agua-com-gas', preco: 4.5, minutosDePreparo: 0.5,
    descricao: 'Água mineral gaseificada, gelada.' },
  { id: 'suco-caixinha', nome: 'Suco de caixinha', categoria: 'bebida', imagem: 'suco-caixinha', preco: 4.5, minutosDePreparo: 0.5,
    descricao: 'Néctar de uva ou pêssego, 200 ml, com canudinho.' },
  { id: 'gatorade', nome: 'Gatorade 500 ml', categoria: 'bebida', imagem: 'gatorade', preco: 9, minutosDePreparo: 0.5, estoque: 0,
    descricao: 'Isotônico sabor laranja ou limão.' },
]

/** Dados fixos do cardápio (nome, preço, foto...). A disponibilidade vem do estoque. */
export const CATALOGO: ItemSerializado[] = LINHAS.map(({ preco, estoque: _estoque, ...resto }) => ({
  ...resto,
  precoEmCentavos: Math.round(preco * 100),
}))

/** Quantidade inicial de cada item. Bolo de pote e Gatorade começam esgotados. */
export const ESTOQUE_INICIAL: Record<string, number> = Object.fromEntries(
  LINHAS.map((linha) => [linha.id, linha.estoque ?? ESTOQUE_PADRAO]),
)
