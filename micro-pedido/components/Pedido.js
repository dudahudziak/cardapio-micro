import { useEffect, useState } from 'react';
import { formatarMoeda } from './formatarMoeda';
import {
  EVENTO_ADICIONAR_ITEM,
  EVENTO_CARDAPIO_MONTADO,
  EVENTO_PEDIDO_ATUALIZADO,
} from '../events';
import estilos from './Pedido.module.css';

export default function Pedido() {
  const [itens, setItens] = useState([]);
  const [confirmado, setConfirmado] = useState(false);

  const totalItens = itens.reduce((soma, item) => soma + item.quantidade, 0);
  const total = itens.reduce((soma, item) => soma + item.preco * item.quantidade, 0);

  useEffect(() => {
    function aoAdicionar(evento) {
      const { id, nome, preco } = evento.detail;
      setConfirmado(false);
      setItens((atuais) => {
        const existe = atuais.some((item) => item.id === id);
        if (existe) {
          return atuais.map((item) =>
            item.id === id ? { ...item, quantidade: item.quantidade + 1 } : item
          );
        }
        return [...atuais, { id, nome, preco, quantidade: 1 }];
      });
    }

    window.addEventListener(EVENTO_ADICIONAR_ITEM, aoAdicionar);
    return () => window.removeEventListener(EVENTO_ADICIONAR_ITEM, aoAdicionar);
  }, []);

  useEffect(() => {
    function publicarEstado() {
      const quantidades = {};
      itens.forEach((item) => {
        quantidades[item.id] = item.quantidade;
      });
      window.dispatchEvent(
        new CustomEvent(EVENTO_PEDIDO_ATUALIZADO, { detail: { quantidades, totalItens, total } })
      );
    }

    publicarEstado(); 
    window.addEventListener(EVENTO_CARDAPIO_MONTADO, publicarEstado);
    return () => window.removeEventListener(EVENTO_CARDAPIO_MONTADO, publicarEstado);
  }, [itens, totalItens, total]);

  function alterarQuantidade(id, delta) {
    setItens((atuais) =>
      atuais
        .map((item) => (item.id === id ? { ...item, quantidade: item.quantidade + delta } : item))
        .filter((item) => item.quantidade > 0)
    );
  }

  function remover(id) {
    setItens((atuais) => atuais.filter((item) => item.id !== id));
  }

  function limpar() {
    setItens([]);
  }

  function finalizar() {
    setItens([]);
    setConfirmado(true);
  }

  return (
    <section className={estilos.pedido} aria-labelledby="titulo-pedido">
      <h2 id="titulo-pedido" className={estilos.titulo}>
        Seu pedido
        {totalItens > 0 && <span className={estilos.contador}>{totalItens}</span>}
      </h2>

      {confirmado && (
        <p className={estilos.confirmacao} role="status">
          Pedido enviado para a cozinha. Bom apetite!
        </p>
      )}

      {itens.length === 0 && !confirmado && (
        <p className={estilos.vazio}>Nenhum item ainda. Escolha um prato no cardápio.</p>
      )}

      {itens.length > 0 && (
        <>
          <ul className={estilos.lista}>
            {itens.map((item) => (
              <li key={item.id} className={estilos.item}>
                <div className={estilos.itemInfo}>
                  <span className={estilos.itemNome}>{item.nome}</span>
                  <span className={estilos.itemSubtotal}>
                    {formatarMoeda(item.preco * item.quantidade)}
                  </span>
                </div>

                <div className={estilos.itemAcoes}>
                  <div className={estilos.quantidade}>
                    <button
                      type="button"
                      className={estilos.botaoQtd}
                      onClick={() => alterarQuantidade(item.id, -1)}
                      aria-label={`Diminuir quantidade de ${item.nome}`}
                    >
                      −
                    </button>
                    <span className={estilos.numero} aria-label={`Quantidade: ${item.quantidade}`}>
                      {item.quantidade}
                    </span>
                    <button
                      type="button"
                      className={estilos.botaoQtd}
                      onClick={() => alterarQuantidade(item.id, 1)}
                      aria-label={`Aumentar quantidade de ${item.nome}`}
                    >
                      +
                    </button>
                  </div>

                  <button
                    type="button"
                    className={estilos.remover}
                    onClick={() => remover(item.id)}
                    aria-label={`Remover ${item.nome} do pedido`}
                  >
                    Remover
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <div className={estilos.total} aria-live="polite">
            <span>Total</span>
            <strong>{formatarMoeda(total)}</strong>
          </div>

          <div className={estilos.acoes}>
            <button type="button" className={estilos.finalizar} onClick={finalizar}>
              Finalizar pedido
            </button>
            <button type="button" className={estilos.limpar} onClick={limpar}>
              Limpar pedido
            </button>
          </div>
        </>
      )}
    </section>
  );
}
