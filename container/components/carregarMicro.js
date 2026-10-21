import { lazy } from 'react';

/**
 * Versão do React.lazy para micros carregados por Module Federation.
 *
 * Por quê: quando um micro está fora do ar, o @module-federation/nextjs-mf NÃO lança erro.
 * Ele devolve um componente "reserva" que renderiza null (a coluna ficaria vazia, sem aviso).
 * Esse componente reserva se diferencia por ter `getInitialProps`, que nenhum componente
 * nosso tem. Quando o detectamos, lançamos um erro para o LimiteDeErro mostrar a mensagem.
 */
export function carregarMicro(importador) {
  return lazy(async () => {
    const modulo = await importador();
    const componente = modulo && modulo.default;

    if (typeof componente !== 'function' || componente.getInitialProps) {
      throw new Error('Micro frontend indisponível');
    }
    return modulo;
  });
}
