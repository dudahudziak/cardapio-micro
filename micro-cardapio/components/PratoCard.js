import { formatarMoeda } from './formatarMoeda';
import estilos from './Cardapio.module.css';

/**
 * Card de um prato: nome, descrição, preço e botão de adicionar.
 * `quantidade` vem do Micro Pedido (via evento) e só serve para mostrar o selo.
 */
export default function PratoCard({ prato, quantidade, aoAdicionar, prioritaria }) {
  return (
    <li className={estilos.card}>
      <img
        className={estilos.imagem}
        src={`http://localhost:3001/pratos/${prato.imagem}`}
        alt={prato.nome}
        width="600"
        height="400"
        loading={prioritaria ? 'eager' : 'lazy'}
        fetchpriority={prioritaria ? 'high' : undefined}
        decoding="async"
      />
      <div className={estilos.cardTopo}>
        <h3 className={estilos.nome}>{prato.nome}</h3>
        {quantidade > 0 && (
          <span className={estilos.selo} aria-label={`${quantidade} no pedido`}>
            {quantidade} no pedido
          </span>
        )}
      </div>

      <p className={estilos.descricao}>{prato.descricao}</p>

      <div className={estilos.cardRodape}>
        <span className={estilos.preco}>{formatarMoeda(prato.preco)}</span>
        <button
          type="button"
          className={estilos.botao}
          onClick={() => aoAdicionar(prato)}
          aria-label={`Adicionar ${prato.nome} ao pedido`}
        >
          Adicionar ao pedido
        </button>
      </div>
    </li>
  );
}
