import { describe, expect, it } from 'vitest'
import { umItem } from '../__testes__/fabricas'
import { LocalDoCampus } from '../campus/LocalDoCampus'
import { Comanda } from '../comanda/Comanda'
import { Dinheiro } from '../compartilhado/Dinheiro'
import { HoraDoDia } from '../compartilhado/HoraDoDia'
import { Cobranca } from '../pagamento/Cobranca'
import { Pedido } from '../pedido/Pedido'
import { JanelaDeRetirada } from '../reserva/JanelaDeRetirada'
import { RelogioFixo } from '../tempo/Relogio'
import type { AvisoDeRetirada, NotificadorCantina } from './interfaces'
import { ServicoDeRetirada } from './ServicoDeRetirada'

class NotificadorEspiao implements NotificadorCantina {
  readonly avisos: AvisoDeRetirada[] = []
  avisarAlunoACaminho(aviso: AvisoDeRetirada) {
    this.avisos.push(aviso)
  }
}

const novoPedido = () =>
  new Pedido(
    Comanda.de(19),
    umItem({ nome: 'Pastel' }),
    2,
    JanelaDeRetirada.criar(HoraDoDia.de(20, 15), 20),
    Cobranca.paga(Dinheiro.reais(19), 'Pago via Pix'),
  )

describe('ServicoDeRetirada ("estou indo buscar")', () => {
  it('dentro da janela: muda o pedido e notifica a cantina', () => {
    const notificador = new NotificadorEspiao()
    const servico = new ServicoDeRetirada(notificador, RelogioFixo.as(20, 20))
    const pedido = novoPedido()

    expect(servico.podeAvisar(pedido)).toBe(true)
    servico.estouIndoBuscar(pedido, LocalDoCampus.porId('biblioteca'))

    expect(pedido.situacaoAtual()).toBe('aluno-a-caminho')
    expect(notificador.avisos).toHaveLength(1)
    expect(notificador.avisos[0]).toMatchObject({
      descricaoDoPedido: '2× Pastel',
      localDoAluno: 'Biblioteca',
      jaPago: true,
    })
  })

  it('fora da janela: não notifica ninguém', () => {
    const notificador = new NotificadorEspiao()
    const servico = new ServicoDeRetirada(notificador, RelogioFixo.as(20, 0))
    const pedido = novoPedido()
    expect(servico.podeAvisar(pedido)).toBe(false)
    expect(() => servico.estouIndoBuscar(pedido, LocalDoCampus.porId('bloco-a'))).toThrow()
    expect(notificador.avisos).toHaveLength(0)
  })
})
