// Container (host): consome os micros Cardápio e Pedido via Module Federation.
const { NextFederationPlugin } = require('@module-federation/nextjs-mf');

// Endereços dos micros. Podem ser trocados por variáveis de ambiente (ex.: em um deploy).
const URL_CARDAPIO = process.env.URL_CARDAPIO || 'http://localhost:3001';
const URL_PEDIDO = process.env.URL_PEDIDO || 'http://localhost:3002';

/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  webpack(config, { isServer }) {
    // O Next gera dois builds (servidor e navegador); cada um tem seu remoteEntry em uma pasta.
    const pasta = isServer ? 'ssr' : 'chunks';

    config.plugins.push(
      new NextFederationPlugin({
        name: 'container',
        filename: 'static/chunks/remoteEntry.js',
        // Formato: "nomeDoRemote@urlDoRemoteEntry". O nome tem que ser igual ao `name` do micro.
        remotes: {
          cardapio: `cardapio@${URL_CARDAPIO}/_next/static/${pasta}/remoteEntry.js`,
          pedido: `pedido@${URL_PEDIDO}/_next/static/${pasta}/remoteEntry.js`,
        },
        shared: {},
      })
    );
    return config;
  },
};
