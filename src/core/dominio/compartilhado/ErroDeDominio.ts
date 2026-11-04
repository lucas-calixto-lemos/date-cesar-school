/**
 * Erro base de todas as regras de negócio violadas.
 * A UI só precisa saber exibir `message`; não precisa conhecer cada regra.
 */
export class ErroDeDominio extends Error {
  constructor(mensagem: string) {
    super(mensagem)
    this.name = new.target.name
  }
}
