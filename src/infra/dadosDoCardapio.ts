import { ItemDoCardapio, type DadosDoItem } from '../dominio/cardapio/ItemDoCardapio'
import { Dinheiro } from '../dominio/compartilhado/Dinheiro'

type Linha = Omit<DadosDoItem, 'preco' | 'disponivel'> & { preco: number; disponivel?: boolean }

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
  { id: 'bolo-de-pote', nome: 'Bolo de pote', categoria: 'doce', imagem: 'bolo-de-pote', preco: 10, minutosDePreparo: 1, disponivel: false,
    descricao: 'Camadas de bolo de chocolate e brigadeiro cremoso. Vem com colherzinha.' },
  { id: 'brownie', nome: 'Brownie', categoria: 'doce', imagem: 'brownie', preco: 8, minutosDePreparo: 1,
    descricao: 'Casquinha craquelada por cima e meio molhadinho por dentro.' },
  // ---- bebidas ----
  { id: 'red-bull', nome: 'Red Bull 250 ml', categoria: 'bebida', imagem: 'lata-energetico-slim', preco: 12, minutosDePreparo: 0.5,
    descricao: 'Energético em lata, gelado.' },
  { id: 'monster', nome: 'Monster 473 ml', categoria: 'bebida', imagem: 'lata-energetico-grande', preco: 13, minutosDePreparo: 0.5,
    descricao: 'Energético em lata grande, gelado.' },
  { id: 'coca-cola', nome: 'Coca-Cola lata', categoria: 'bebida', imagem: 'lata-refri-vermelha', preco: 6.5, minutosDePreparo: 0.5,
    descricao: 'Refrigerante de cola em lata de 350 ml, trincando.' },
  { id: 'guarana', nome: 'Guaraná lata', categoria: 'bebida', imagem: 'lata-refri-verde', preco: 6, minutosDePreparo: 0.5,
    descricao: 'Refrigerante de guaraná em lata de 350 ml.' },
  { id: 'agua', nome: 'Água mineral 500 ml', categoria: 'bebida', imagem: 'garrafa-agua', preco: 3.5, minutosDePreparo: 0.5,
    descricao: 'Água sem gás, gelada ou natural.' },
  { id: 'agua-com-gas', nome: 'Água com gás 500 ml', categoria: 'bebida', imagem: 'garrafa-agua-gas', preco: 4.5, minutosDePreparo: 0.5,
    descricao: 'Água mineral gaseificada, gelada.' },
  { id: 'suco-caixinha', nome: 'Suco de caixinha', categoria: 'bebida', imagem: 'caixinha-suco', preco: 4.5, minutosDePreparo: 0.5,
    descricao: 'Néctar de uva ou pêssego, 200 ml, com canudinho.' },
  { id: 'gatorade', nome: 'Gatorade 500 ml', categoria: 'bebida', imagem: 'garrafa-isotonico', preco: 9, minutosDePreparo: 0.5, disponivel: false,
    descricao: 'Isotônico sabor laranja ou limão.' },
]

export function criarItensIniciais(): ItemDoCardapio[] {
  return LINHAS.map(
    (linha) =>
      new ItemDoCardapio({ ...linha, preco: Dinheiro.reais(linha.preco), disponivel: linha.disponivel ?? true }),
  )
}
