import { useEffect, useState } from 'react';
import Head from 'next/head';
import MicroFrontend from '../components/MicroFrontend';
import { carregarMicro } from '../components/carregarMicro';
import estilos from '../styles/Home.module.css';

/**
 * Os micros são importados com o nome do remote definido no next.config.js:
 *   "cardapio/Cardapio"  ->  remote "cardapio", módulo exposto "./Cardapio"
 *   "pedido/Pedido"      ->  remote "pedido",   módulo exposto "./Pedido"
 * carregarMicro usa React.lazy: o código do micro só é baixado quando o componente é renderizado.
 */
const Cardapio = carregarMicro(() => import('cardapio/Cardapio'));
const Pedido = carregarMicro(() => import('pedido/Pedido'));

export default function Home() {
  // Os micros dependem de `window` (eventos), então só são montados no navegador.
  // No servidor (SSR) a página mostra apenas o esqueleto.
  const [noNavegador, setNoNavegador] = useState(false);
  useEffect(() => setNoNavegador(true), []);

  return (
    <>
      <Head>
        <title>Restaurante Estações | Faça seu pedido</title>
        <link rel="preload" as="image" href="http://localhost:3001/pratos/feijoada.webp" fetchpriority="high" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="Sistema de pedidos montado com micro frontends." />
      </Head>

      <header className={estilos.cabecalho}>
        <div className={estilos.cabecalhoConteudo}>
          <h1 className={estilos.marca}>Restaurante Estações</h1>
          <p className={estilos.subtitulo}>Escolha seus pratos e monte o pedido.</p>
        </div>
      </header>

      <main className={estilos.principal}>
        <div className={estilos.colunaCardapio}>
          {noNavegador ? (
            <MicroFrontend nome="Micro Cardápio" endereco="http://localhost:3001">
              <Cardapio />
            </MicroFrontend>
          ) : (
            <div className={estilos.esqueleto}>Carregando Micro Cardápio…</div>
          )}
        </div>

        <div className={estilos.colunaPedido}>
          {noNavegador ? (
            <MicroFrontend nome="Micro Pedido" endereco="http://localhost:3002">
              <Pedido />
            </MicroFrontend>
          ) : (
            <div className={estilos.esqueleto}>Carregando Micro Pedido…</div>
          )}
        </div>
      </main>
    </>
  );
}
