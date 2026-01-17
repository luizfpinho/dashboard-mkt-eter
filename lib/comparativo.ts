export interface DadosPeriodo {
  totalLeads: number;
  totalMQLs: number;
  totalConsultoria: number;
  totalAceleradora: number;
  totalNaoQualificado: number;
  taxaQualificacao: number;
  consultoriaICP1: number;
  consultoriaICP2: number;
  consultoriaICP3: number;
  aceleradoraICP1: number;
  aceleradoraICP2: number;
  aceleradoraICP3: number;
  porCanal: Record<string, number>;
  periodoLabel: string;
}

export interface Variacao {
  absoluta: number;
  percentual: number;
  tendencia: 'up' | 'down' | 'stable';
}

export interface DadosComparativos {
  atual: DadosPeriodo;
  anterior: DadosPeriodo;
  variacoes: {
    totalLeads: Variacao;
    totalMQLs: Variacao;
    totalConsultoria: Variacao;
    totalAceleradora: Variacao;
    taxaQualificacao: Variacao;
  };
}

export function calcularVariacao(atual: number, anterior: number): Variacao {
  const absoluta = atual - anterior;
  const percentual = anterior === 0 ? (atual > 0 ? 100 : 0) : ((atual - anterior) / anterior) * 100;
  const tendencia = absoluta > 0 ? 'up' : absoluta < 0 ? 'down' : 'stable';

  return { absoluta, percentual, tendencia };
}

export function calcularComparativo(atual: DadosPeriodo, anterior: DadosPeriodo): DadosComparativos {
  return {
    atual,
    anterior,
    variacoes: {
      totalLeads: calcularVariacao(atual.totalLeads, anterior.totalLeads),
      totalMQLs: calcularVariacao(atual.totalMQLs, anterior.totalMQLs),
      totalConsultoria: calcularVariacao(atual.totalConsultoria, anterior.totalConsultoria),
      totalAceleradora: calcularVariacao(atual.totalAceleradora, anterior.totalAceleradora),
      taxaQualificacao: calcularVariacao(atual.taxaQualificacao, anterior.taxaQualificacao),
    },
  };
}

// Função para formatar variação para exibição
export function formatarVariacao(variacao: Variacao): string {
  const sinal = variacao.absoluta >= 0 ? '+' : '';
  const emoji = variacao.tendencia === 'up' ? '📈' : variacao.tendencia === 'down' ? '📉' : '➡️';
  return `${emoji} ${sinal}${variacao.absoluta} (${sinal}${variacao.percentual.toFixed(1)}%)`;
}
