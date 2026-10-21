// Micro Cardápio (remote): expõe o componente <Cardapio /> para outras aplicações.
const { NextFederationPlugin } = require('@module-federation/nextjs-mf');

/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  webpack(config) {
    config.plugins.push(
      new NextFederationPlugin({
        // Nome único deste micro. O container o usa como prefixo: import('cardapio/Cardapio')
        name: 'cardapio',
        // Arquivo "porta de entrada" que o container baixa para descobrir o que este micro expõe
        filename: 'static/chunks/remoteEntry.js',
        // Módulos que este micro disponibiliza para outros
        exposes: {
          './Cardapio': './components/Cardapio.js',
        },
        // React, React DOM e Next são compartilhados automaticamente (instância única)
        shared: {},
      })
    );
    return config;
  },
};
