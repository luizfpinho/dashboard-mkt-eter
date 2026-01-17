import { LeadClassificado, Metricas, ComparativoSemanal } from '@/types/lead';

/**
 * Calcula todas as métricas a partir dos leads classificados
 */
export function calcularMetricas(leads: LeadClassificado[]): Metricas {
  const totalLeads = leads.length;

  const consultoria = leads.filter(l => l.bu === 'Consultoria').length;
  const aceleradora = leads.filter(l => l.bu === 'Aceleradora').length;
  const naoQualificado = leads.filter(l => l.bu === 'Não Qualificado').length;

  const totalMQLs = consultoria + aceleradora;
  const taxaQualificacao = totalLeads > 0 ? (totalMQLs / totalLeads) * 100 : 0;

  // Métricas por ICP - Consultoria
  const consultoriaICP1 = leads.filter(l => l.bu === 'Consultoria' && l.icp === 'ICP1').length;
  const consultoriaICP2 = leads.filter(l => l.bu === 'Consultoria' && l.icp === 'ICP2').length;
  const consultoriaICP3 = leads.filter(l => l.bu === 'Consultoria' && l.icp === 'ICP3').length;

  // Métricas por ICP - Aceleradora
  const aceleradoraICP1 = leads.filter(l => l.bu === 'Aceleradora' && l.icp === 'ICP1').length;
  const aceleradoraICP2 = leads.filter(l => l.bu === 'Aceleradora' && l.icp === 'ICP2').length;
  const aceleradoraICP3 = leads.filter(l => l.bu === 'Aceleradora' && l.icp === 'ICP3').length;

  return {
    totalLeads,
    totalMQLs,
    consultoria,
    aceleradora,
    naoQualificado,
    taxaQualificacao,
    consultoriaICP1,
    consultoriaICP2,
    consultoriaICP3,
    aceleradoraICP1,
    aceleradoraICP2,
    aceleradoraICP3
  };
}

/**
 * Calcula distribuição por canal
 */
export function calcularDistribuicaoPorCanal(leads: LeadClassificado[]): Record<string, number> {
  const distribuicao: Record<string, number> = {};

  leads.forEach(lead => {
    if (lead.bu !== 'Não Qualificado') {
      distribuicao[lead.canal] = (distribuicao[lead.canal] || 0) + 1;
    }
  });

  return distribuicao;
}

/**
 * Calcula matriz cruzada Origem × BU × ICP
 */
export function calcularMatrizCruzada(leads: LeadClassificado[]): Record<string, Record<string, number>> {
  const matriz: Record<string, Record<string, number>> = {};

  leads.forEach(lead => {
    if (lead.bu === 'Não Qualificado') return;

    const origem = lead.canal;
    const chave = `${lead.bu}-${lead.icp}`;

    if (!matriz[origem]) {
      matriz[origem] = {};
    }

    matriz[origem][chave] = (matriz[origem][chave] || 0) + 1;
  });

  return matriz;
}

/**
 * Calcula evolução temporal (agregado por dia)
 */
export function calcularEvolucaoTemporal(leads: LeadClassificado[]): {
  data: string;
  total: number;
  consultoria: number;
  aceleradora: number;
}[] {
  const evolucao: Record<string, { total: number; consultoria: number; aceleradora: number }> = {};

  leads.forEach(lead => {
    // Garantir que dataHora seja um objeto Date
    const data = lead.dataHora instanceof Date ? lead.dataHora : new Date(lead.dataHora);
    const dataStr = data.toISOString().split('T')[0];

    if (!evolucao[dataStr]) {
      evolucao[dataStr] = { total: 0, consultoria: 0, aceleradora: 0 };
    }

    if (lead.bu !== 'Não Qualificado') {
      evolucao[dataStr].total++;

      if (lead.bu === 'Consultoria') {
        evolucao[dataStr].consultoria++;
      } else if (lead.bu === 'Aceleradora') {
        evolucao[dataStr].aceleradora++;
      }
    }
  });

  return Object.entries(evolucao)
    .map(([data, valores]) => ({
      data,
      ...valores
    }))
    .sort((a, b) => a.data.localeCompare(b.data));
}

/**
 * Calcula comparativo entre duas semanas
 */
export function calcularComparativoSemanal(
  leadsAtual: LeadClassificado[],
  leadsAnterior: LeadClassificado[]
): ComparativoSemanal[] {
  const metricasAtual = calcularMetricas(leadsAtual);
  const metricasAnterior = calcularMetricas(leadsAnterior);

  const comparar = (metrica: string, atual: number, anterior: number): ComparativoSemanal => {
    const variacao = atual - anterior;
    const percentual = anterior > 0 ? (variacao / anterior) * 100 : 0;

    return {
      metrica,
      semanaAnterior: anterior,
      semanaAtual: atual,
      variacao,
      percentual
    };
  };

  return [
    comparar('Total de Leads', metricasAtual.totalLeads, metricasAnterior.totalLeads),
    comparar('Total MQLs', metricasAtual.totalMQLs, metricasAnterior.totalMQLs),
    comparar('Consultoria', metricasAtual.consultoria, metricasAnterior.consultoria),
    comparar('Aceleradora', metricasAtual.aceleradora, metricasAnterior.aceleradora),
    comparar(
      'Taxa Qualificação (%)',
      Number(metricasAtual.taxaQualificacao.toFixed(2)),
      Number(metricasAnterior.taxaQualificacao.toFixed(2))
    )
  ];
}

/**
 * Obtém leads da semana especificada
 */
export function obterLeadsDaSemana(leads: LeadClassificado[], semana: number, mes: number, ano: number): LeadClassificado[] {
  return leads.filter(lead => {
    // Garantir que dataHora seja um objeto Date
    const data = lead.dataHora instanceof Date ? lead.dataHora : new Date(lead.dataHora);
    if (data.getMonth() !== mes || data.getFullYear() !== ano) return false;

    const dia = data.getDate();

    if (semana === 1) return dia >= 1 && dia <= 7;
    if (semana === 2) return dia >= 8 && dia <= 14;
    if (semana === 3) return dia >= 15 && dia <= 21;
    if (semana === 4) return dia >= 22 && dia <= 28;
    if (semana === 5) return dia >= 29 && dia <= 31;

    return false;
  });
}
