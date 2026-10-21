import Head from 'next/head';
import Cardapio from '../components/Cardapio';

/**
 * Página usada só para testar o Micro Cardápio ISOLADO (http://localhost:3001).
 * Em produção, quem consome o micro é o container, via Module Federation.
 */
export default function PaginaIsolada() {
  return (
    <>
      <Head>
        <title>Micro Cardápio (modo isolado)</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <main style={{ maxWidth: '60rem', margin: '0 auto', padding: '1.5rem 1rem', fontFamily: 'system-ui, sans-serif' }}>
        <p style={{ margin: '0 0 1.5rem', padding: '0.75rem 1rem', background: '#eef3ef', borderRadius: '0.5rem', fontSize: '0.9rem' }}>
          Modo isolado: os botões disparam o evento <code>cardapio:adicionar-item</code>, mas
          ninguém está ouvindo. Abra o console e digite{' '}
          <code>{"window.addEventListener('cardapio:adicionar-item', e => console.log(e.detail))"}</code>{' '}
          para ver os eventos.
        </p>
        <Cardapio />
      </main>
    </>
  );
}
