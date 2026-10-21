// Micro Pedido (remote): expõe o componente <Pedido /> para outras aplicações.
const { NextFederationPlugin } = require('@module-federation/nextjs-mf');

/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  webpack(config) {
    config.plugins.push(
      new NextFederationPlugin({
        // Nome único deste micro. O container faz: import('pedido/Pedido')
        name: 'pedido',
        filename: 'static/chunks/remoteEntry.js',
        exposes: {
          './Pedido': './components/Pedido.js',
        },
        shared: {},
      })
    );
    return config;
  },
};
