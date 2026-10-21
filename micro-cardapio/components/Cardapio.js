import { useEffect, useState } from 'react';
import { pratos } from '../data/pratos';
import PratoCard from './PratoCard';
import {
  EVENTO_ADICIONAR_ITEM,
  EVENTO_CARDAPIO_MONTADO,
  EVENTO_PEDIDO_ATUALIZADO,
} from '../events';
import estilos from './Cardapio.module.css';

/**
 * Componente exposto pelo Module Federation: lista de pratos.
 *
 * Comunicação:
 *  - ENVIA  "cardapio:adicionar-item" quando o cliente clica no botão;
 *  - OUVE   "pedido:atualizado" para mostrar quantos de cada prato já estão no pedido;
 *  - ENVIA  "cardapio:montado" ao carregar, para o Pedido reenviar seu estado atual
 *           (cobre o caso de o Pedido ter carregado antes do Cardápio).
 */
export default function Cardapio() {
  // { [idDoPrato]: quantidade } - espelho do que o Micro Pedido informou
  const [quantidades, setQuantidades] = useState({});

  useEffect(() => {
    const aoPedidoAtualizar = (evento) => setQuantidades(evento.detail.quantidades);

    window.addEventListener(EVENTO_PEDIDO_ATUALIZADO, aoPedidoAtualizar);
    // Pede o estado atual do pedido (se o Micro Pedido já estiver na tela)
    window.dispatchEvent(new CustomEvent(EVENTO_CARDAPIO_MONTADO));

    return () => window.removeEventListener(EVENTO_PEDIDO_ATUALIZADO, aoPedidoAtualizar);
  }, []);

  function adicionar(prato) {
    window.dispatchEvent(
      new CustomEvent(EVENTO_ADICIONAR_ITEM, {
        detail: { id: prato.id, nome: prato.nome, preco: prato.preco },
      })
    );
  }

  return (
    <section className={estilos.cardapio} aria-labelledby="titulo-cardapio">
      <h2 id="titulo-cardapio" className={estilos.titulo}>Cardápio</h2>
      <ul className={estilos.lista}>
        {pratos.map((prato, indice) => (
          <PratoCard
            key={prato.id}
            prato={prato}
            quantidade={quantidades[prato.id] || 0}
            aoAdicionar={adicionar}
            prioritaria={indice === 0}
          />
        ))}
      </ul>
    </section>
  );
}
