import { useEffect, useState } from 'react';
import Head from 'next/head';
import MicroFrontend from '../components/MicroFrontend';
import { carregarMicro } from '../components/carregarMicro';
import estilos from '../styles/Home.module.css';


const URL_CARDAPIO = process.env.NEXT_PUBLIC_URL_CARDAPIO || 'http://localhost:3001';
const URL_PEDIDO = process.env.NEXT_PUBLIC_URL_PEDIDO || 'http://localhost:3002';

const Cardapio = carregarMicro(() => import('cardapio/Cardapio'));
const Pedido = carregarMicro(() => import('pedido/Pedido'));

export default function Home() {
  const [noNavegador, setNoNavegador] = useState(false);
  useEffect(() => setNoNavegador(true), []);

  return (
    <>
      <Head>
        <title>Restaurante Estações | Faça seu pedido</title>
        <link rel="preload" as="image" href={`${URL_CARDAPIO}/pratos/feijoada.webp`} fetchpriority="high" />        <meta name="viewport" content="width=device-width, initial-scale=1" />
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
            <MicroFrontend nome="Micro Cardápio" endereco={URL_CARDAPIO}>
              <Cardapio />
            </MicroFrontend>
          ) : (
            <div className={estilos.esqueleto}>Carregando Micro Cardápio…</div>
          )}
        </div>

        <div className={estilos.colunaPedido}>
          {noNavegador ? (
            <MicroFrontend nome="Micro Pedido" endereco={URL_PEDIDO}>
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
