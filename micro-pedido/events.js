/**
 * Contrato de eventos entre os micros (comunicação via window.dispatchEvent).
 *
 * Os micros NÃO importam código um do outro: eles só combinam os nomes e o
 * formato dos eventos. Por isso este arquivo existe nos dois micros, com os
 * mesmos valores. Se um nome mudar, mude nos dois e no README.
 */

// Cardápio -> Pedido: o cliente clicou em "Adicionar ao pedido".
// detail: { id: number, nome: string, preco: number }
export const EVENTO_ADICIONAR_ITEM = 'cardapio:adicionar-item';

// Cardápio -> Pedido: o Cardápio terminou de montar e quer saber o estado atual.
// detail: nenhum
export const EVENTO_CARDAPIO_MONTADO = 'cardapio:montado';

// Pedido -> Cardápio: o pedido mudou (item adicionado, removido ou pedido limpo).
// detail: { quantidades: { [idDoPrato]: number }, totalItens: number, total: number }
export const EVENTO_PEDIDO_ATUALIZADO = 'pedido:atualizado';
