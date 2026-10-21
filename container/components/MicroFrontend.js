import { Component, Suspense } from 'react';
import estilos from '../styles/Home.module.css';

/**
 * Error Boundary: se um micro estiver fora do ar (ou falhar ao carregar),
 * só aquele pedaço da tela mostra o erro. O resto da aplicação continua funcionando.
 */
class LimiteDeErro extends Component {
  state = { erro: null };

  static getDerivedStateFromError(erro) {
    return { erro };
  }

  render() {
    if (this.state.erro) {
      return (
        <div className={estilos.erro} role="alert">
          <strong>Não foi possível carregar o {this.props.nome}.</strong>
          <p>
            Verifique se ele está rodando em <code>{this.props.endereco}</code> e recarregue a página.
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}

/**
 * Envolve um micro carregado com React.lazy:
 *  - Suspense mostra o "carregando" enquanto o código do micro é baixado;
 *  - LimiteDeErro mostra uma mensagem se o download falhar.
 */
export default function MicroFrontend({ nome, endereco, children }) {
  return (
    <LimiteDeErro nome={nome} endereco={endereco}>
      <Suspense fallback={<div className={estilos.esqueleto}>Carregando {nome}…</div>}>
        {children}
      </Suspense>
    </LimiteDeErro>
  );
}
