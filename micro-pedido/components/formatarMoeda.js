// Formata um número como moeda brasileira. Ex.: 54.9 -> "R$ 54,90"
const formatador = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

export function formatarMoeda(valor) {
  return formatador.format(valor);
}
