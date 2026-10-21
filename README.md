# Restaurante Estações: sistema de pedidos com Micro Frontends

Sistema de pedidos dividido em **três aplicações independentes** que se integram em tempo de execução com **Webpack Module Federation**. Cada uma tem seu próprio `package.json`, sua própria porta e pode ser desenvolvida e publicada separadamente.

| Aplicação | Pasta | Porta | Papel |
|---|---|---|---|
| Container | `container/` | 3000 | Aplicação principal (host). Monta a página e carrega os dois micros |
| Micro Cardápio | `micro-cardapio/` | 3001 | Lista de pratos, cada um com o botão "Adicionar ao pedido" |
| Micro Pedido | `micro-pedido/` | 3002 | Mostra os itens adicionados, quantidades e total |

```
            Navegador (http://localhost:3000)
  ┌─────────────────────────────────────────────────────┐
  │ Container                                           │
  │  ┌───────────────────────┐   ┌───────────────────┐  │
  │  │ Micro Cardápio        │   │ Micro Pedido      │  │
  │  │ (baixado de :3001)    │   │ (baixado de :3002)│  │
  │  └──────────┬────────────┘   └─────────▲─────────┘  │
  │             │  window.dispatchEvent    │            │
  │             └──────────────────────────┘            │
  └─────────────────────────────────────────────────────┘
```

## Tecnologias

- Next.js **14.2** com **Pages Router** (compatível com o Module Federation, que só funciona com Next 12 a 15 e Pages Router)
- React 18
- `@module-federation/nextjs-mf` 8.8.76
- JavaScript puro, CSS Modules, sem bibliotecas de interface
- npm workspaces (monorepo)

## Estrutura

```
.
├── package.json              # monorepo: scripts para rodar tudo de uma vez
├── container/
│   ├── next.config.js        # declara os remotes (cardapio e pedido)
│   ├── pages/                # _app.js e index.js (monta a página)
│   ├── components/
│   │   ├── carregarMicro.js  # React.lazy + detecção de micro fora do ar
│   │   └── MicroFrontend.js  # Suspense + Error Boundary
│   └── styles/               # estilos globais e da página
├── micro-cardapio/
│   ├── next.config.js        # expõe ./Cardapio
│   ├── components/           # Cardapio.js, PratoCard.js, estilos
│   ├── data/pratos.js        # lista estática de pratos (nome, descrição, preço, foto)
│   ├── public/pratos/        # fotos dos pratos (WebP, ~600 px de largura)
│   ├── events.js             # contrato de eventos
│   └── pages/index.js        # página só para testar o micro isolado
└── micro-pedido/
    ├── next.config.js        # expõe ./Pedido
    ├── components/           # Pedido.js, estilos
    ├── events.js             # contrato de eventos (mesmos nomes do Cardápio)
    └── pages/index.js        # página só para testar o micro isolado
```

## Como rodar

Pré-requisito: Node.js 18 ou superior (testado com Node 22).

```bash
npm install        # na raiz: instala as dependências das três aplicações
npm run dev        # sobe as três ao mesmo tempo
```

Abra **http://localhost:3000**. A primeira abertura pode demorar alguns segundos, porque o Next compila cada aplicação sob demanda.

### Rodar cada micro separadamente

Cada micro funciona sozinho, o que permite testá-lo antes de integrar:

| Comando | Endereço | O que mostra |
|---|---|---|
| `npm run dev:cardapio` | http://localhost:3001 | Só o cardápio. Os botões disparam o evento, mas ninguém ouve (a página explica como espiar o evento no console) |
| `npm run dev:pedido` | http://localhost:3002 | Só o pedido, com botões que **simulam** o evento do cardápio |
| `npm run dev:container` | http://localhost:3000 | O container. Os micros aparecem como erro se não estiverem rodando |

### Modo produção (local)

```bash
npm run build
npm run start
```

### Endereços dos micros

Por padrão o container procura os micros em `localhost:3001` e `localhost:3002`. Para apontar para outros endereços (por exemplo, em um deploy), defina as variáveis antes de compilar:

```bash
URL_CARDAPIO=https://cardapio.exemplo.com URL_PEDIDO=https://pedido.exemplo.com npm run build -w container
```

## Como o Module Federation está configurado

**Os micros expõem** componentes (`next.config.js` de cada um):

```js
// micro-cardapio
new NextFederationPlugin({
  name: 'cardapio',
  filename: 'static/chunks/remoteEntry.js',
  exposes: { './Cardapio': './components/Cardapio.js' },
});

// micro-pedido
new NextFederationPlugin({
  name: 'pedido',
  filename: 'static/chunks/remoteEntry.js',
  exposes: { './Pedido': './components/Pedido.js' },
});
```

O `remoteEntry.js` é a "porta de entrada": o container baixa esse arquivo para descobrir o que o micro oferece e de onde buscar o código.

**O container consome** (`container/next.config.js`):

```js
remotes: {
  cardapio: 'cardapio@http://localhost:3001/_next/static/chunks/remoteEntry.js',
  pedido:   'pedido@http://localhost:3002/_next/static/chunks/remoteEntry.js',
}
```

E importa com `React.lazy` dentro de `Suspense` (`container/pages/index.js`):

```js
const Cardapio = carregarMicro(() => import('cardapio/Cardapio'));
const Pedido   = carregarMicro(() => import('pedido/Pedido'));
```

`carregarMicro` é um `React.lazy` com um cuidado extra (ver "Micro fora do ar"). O `MicroFrontend.js` envolve cada micro com `Suspense` (mostra "Carregando…") e com um Error Boundary.

**React e Next são compartilhados** como instância única entre as três aplicações, para os hooks funcionarem entre fronteiras.

**SSR:** o servidor renderiza só o esqueleto da página. Os micros dependem de `window` (eventos) e são montados apenas no navegador.

## Como funciona a comunicação entre os micros

Os micros **não importam código um do outro**. Eles se comunicam por **eventos globais do navegador** (`window.dispatchEvent` e `window.addEventListener`). Os dois só precisam concordar sobre o nome e o formato de cada evento, que estão em `events.js` (uma cópia em cada micro, com os mesmos valores).

| Evento | Quem envia | Quem ouve | Conteúdo (`event.detail`) |
|---|---|---|---|
| `cardapio:adicionar-item` | Cardápio | Pedido | `{ id, nome, preco }` |
| `pedido:atualizado` | Pedido | Cardápio | `{ quantidades: { [id]: n }, totalItens, total }` |
| `cardapio:montado` | Cardápio | Pedido | nenhum |

**Fluxo de um clique:**

1. O cliente clica em "Adicionar ao pedido". O Cardápio dispara `cardapio:adicionar-item` com o prato.
2. O Pedido, que está ouvindo, adiciona o item ou aumenta a quantidade.
3. A cada mudança, o Pedido dispara `pedido:atualizado` com as quantidades.
4. O Cardápio recebe o evento e mostra o selo "N no pedido" no prato correspondente.

O **Pedido é o dono do estado** do pedido. O Cardápio só guarda uma cópia das quantidades para exibir o selo. Mudanças feitas dentro do Pedido (botões + e −, remover, limpar, finalizar) também atualizam os selos, porque passam pelo mesmo evento.

**Ordem de carregamento:** os micros carregam em paralelo e um pode aparecer antes do outro. Por isso, ao montar, o Cardápio dispara `cardapio:montado` e o Pedido responde reenviando seu estado atual. Assim o Cardápio nunca fica com selos desatualizados.

## Micro fora do ar

Se um micro não carregar, só aquele trecho da tela mostra uma mensagem explicando qual micro falhou e em que endereço ele deveria estar. O restante da aplicação continua funcionando (confirmado em modo produção).

Detalhe técnico: quando um remote está offline, o `nextjs-mf` não lança erro; ele devolve um componente que renderiza `null`, deixando a área vazia sem aviso. O `carregarMicro.js` detecta esse componente reserva e lança um erro de verdade, para o Error Boundary exibir a mensagem.

## Interface responsiva

- Telas estreitas: cardápio em uma coluna e pedido abaixo.
- A partir de 40em: cartões do cardápio em duas colunas.
- A partir de 64em: cardápio à esquerda e pedido fixo (sticky) à direita.
- Botões e controles com área de toque confortável, foco visível e rótulos de acessibilidade.
- Em telas estreitas, a coluna do cardápio reserva a altura da tela enquanto o micro carrega (`.colunaCardapio` em `container/styles/Home.module.css`). Sem isso, o pedido aparecia logo abaixo do "Carregando…" e era empurrado para baixo quando o cardápio chegava (salto de layout).

## Fotos dos pratos

As fotos ficam em `micro-cardapio/public/pratos/` e cada prato aponta para a sua em `micro-cardapio/data/pratos.js` (campo `imagem`).

O cardápio é exibido na página do container (porta 3000), mas as fotos são servidas pelo Micro Cardápio (porta 3001). Por isso o `src` das imagens, em `micro-cardapio/components/PratoCard.js`, usa o endereço completo do micro (`http://localhost:3001/pratos/...`). Em um deploy, esse endereço precisa ser trocado pelo endereço real do Micro Cardápio.

Para adicionar um prato com foto:

1. Redimensione a foto para cerca de 600 px de largura e converta para WebP (por exemplo, no site squoosh.app). Cada foto deve ficar entre 30 e 80 KB.
2. Coloque o arquivo em `micro-cardapio/public/pratos/`.
3. Acrescente o prato em `micro-cardapio/data/pratos.js`, com o campo `imagem` igual ao nome do arquivo.

## Performance

Medições feitas com o Lighthouse (mobile) em **modo produção** (`npm run build` e `npm run start`), em janela anônima. O modo `dev` é mais lento e não serve para medir.

Diagnóstico inicial (fotos sem tratamento): a página pesava cerca de **4.735 KiB**, quase todo em imagens, e o Lighthouse apontava salto de layout na coluna do pedido (0,215) e a foto principal (LCP) carregando tarde.

Melhorias aplicadas:

| Melhoria | Onde | Problema atacado |
|---|---|---|
| Fotos redimensionadas (~600 px) e convertidas para WebP | `micro-cardapio/public/pratos/` | Peso da página e LCP |
| `width` e `height` em todas as fotos | `PratoCard.js` | Salto de layout ao carregar as fotos |
| `loading="lazy"` nas fotos fora da tela | `PratoCard.js` | Peso inicial |
| Primeira foto com `loading="eager"` e `fetchpriority="high"` | `Cardapio.js` e `PratoCard.js` | LCP |
| `preload` da primeira foto no `<head>` do container | `container/pages/index.js` | LCP (foto descoberta mais cedo) |
| Altura mínima reservada para a coluna do cardápio | `container/styles/Home.module.css` | Salto de layout (CLS) |

Observações:

- O atributo é escrito `fetchpriority` (tudo minúsculo) porque o React 18 não reconhece a grafia `fetchPriority`.
- O `preload` faz o container conhecer o nome de um arquivo do Micro Cardápio, um pequeno acoplamento aceito para melhorar o LCP. Se a primeira foto mudar, atualize também o `<link rel="preload">`.
- O cardápio só aparece depois que o JavaScript do micro carrega, então a foto principal nunca está no HTML inicial. É um custo da arquitetura de micro frontends.

Comparativo (preencha com os números do seu Lighthouse):

| Métrica | Antes | Depois |
|---|---|---|
| Performance | PREENCHER | PREENCHER |
| Largest Contentful Paint (LCP) | PREENCHER | PREENCHER |
| Cumulative Layout Shift (CLS) | PREENCHER | PREENCHER |
| Peso total da página | 4.735 KiB | PREENCHER |

Itens que o Lighthouse ainda aponta e que não foram tratados por terem pouco ganho: *render-blocking requests* (dois arquivos de CSS do Next, de cerca de 1 KiB cada) e *legacy JavaScript* (13 KiB, vindos do próprio Next.js).

## Observações sobre as versões

O Module Federation com Next.js é sensível a versões. Por isso o projeto fixa:

- `webpack` em **5.97.1** e `enhanced-resolve` em **5.17.1**, via `overrides` no `package.json` da raiz. Versões mais novas quebram o build (o plugin procura um arquivo interno que mudou de lugar, e o Next 14 espera uma estrutura antiga do resolvedor).
- A variável `NEXT_PRIVATE_LOCAL_WEBPACK=true`, exigida pelo plugin. Os scripts já a definem com `cross-env`, que funciona também no Windows.
- Next.js em **14.2.35**. Não use o Next 16 nem o App Router.

## Limitações conhecidas

- O pedido fica só na memória: ao recarregar a página, ele é perdido (não há persistência, como pede o enunciado).
- Um evento enviado antes de o Micro Pedido terminar de carregar é perdido. Na prática, isso exigiria clicar em um prato antes de a coluna do pedido aparecer.
- O endereço das fotos (`http://localhost:3001`) está escrito no código do `PratoCard.js`. Em um deploy, precisa ser trocado.
- Em modo `dev`, o Next pode exibir seu painel de erro sobre a página quando um micro está fora do ar. Em modo produção aparece apenas a mensagem do container.

## Solução de problemas

| Sintoma | Causa provável | O que fazer |
|---|---|---|
| `NEXT_PRIVATE_LOCAL_WEBPACK is not set` | Rodou `next` direto, sem os scripts do npm | Use `npm run dev` e afins |
| `EADDRINUSE` (porta em uso) | Outro processo usa 3000, 3001 ou 3002 | Encerre o processo ou troque a porta no `package.json` e no `next.config.js` do container |
| Aviso de micro indisponível | O micro não está rodando | Suba o micro (`npm run dev:cardapio` ou `npm run dev:pedido`) e recarregue |
| Foto do prato não aparece | Arquivo na pasta errada, nome diferente do `pratos.js` ou Micro Cardápio fora do ar | Abra `http://localhost:3001/pratos/NOME-DO-ARQUIVO.webp`. Se der 404, confira a pasta `micro-cardapio/public/pratos/` e o nome do arquivo |
| Erro ao instalar ou compilar | Versão do webpack ou de dependência | Apague `node_modules` e `package-lock.json` e rode `npm install` de novo |

## Checklist para testar manualmente

1. `npm run dev` e abrir http://localhost:3000.
2. Clicar em "Adicionar ao pedido" em um prato: ele aparece no pedido, com o total.
3. Clicar de novo no mesmo prato: a quantidade sobe e o selo "2 no pedido" aparece no cardápio.
4. Usar + e − no pedido: os selos do cardápio acompanham.
5. Remover um item, "Limpar pedido" e "Finalizar pedido".
6. Reduzir a largura da janela: o layout vira uma coluna, e as fotos dos pratos aparecem em todos os cards.
7. Encerrar o Micro Pedido (Ctrl+C no terminal dele) e recarregar: o cardápio continua funcionando.