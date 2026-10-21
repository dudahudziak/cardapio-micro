import Head from 'next/head';
import Pedido from '../components/Pedido';
import { EVENTO_ADICIONAR_ITEM } from '../events';

/**
 * Página usada só para testar o Micro Pedido ISOLADO (http://localhost:3002).
 * Como o Cardápio não está aqui, o botão abaixo simula o evento que ele enviaria.
 */
const itensDeTeste = [
  { id: 1, nome: 'Feijoada completa', preco: 54.9 },
  { id: 8, nome: 'Pudim de leite', preco: 16.0 },
];

export default function PaginaIsolada() {
  function simularEvento(item) {
    window.dispatchEvent(new CustomEvent(EVENTO_ADICIONAR_ITEM, { detail: item }));
  }

  return (
    <>
      <Head>
        <title>Micro Pedido (modo isolado)</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <main style={{ maxWidth: '26rem', margin: '0 auto', padding: '1.5rem 1rem', fontFamily: 'system-ui, sans-serif' }}>
        <div style={{ margin: '0 0 1.5rem', padding: '0.75rem 1rem', background: '#eef3ef', borderRadius: '0.5rem', fontSize: '0.9rem' }}>
          <p style={{ margin: '0 0 0.6rem' }}>Modo isolado: simule o evento do Cardápio.</p>
          {itensDeTeste.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => simularEvento(item)}
              style={{ marginRight: '0.5rem', marginBottom: '0.4rem', padding: '0.4rem 0.7rem', cursor: 'pointer' }}
            >
              Simular: {item.nome}
            </button>
          ))}
        </div>
        <Pedido />
      </main>
    </>
  );
}
