import { LeadClassificado, Metricas, ComparativoSemanal } from '@/types/lead';
import { converterParaBrasilia } from '@/lib/timezone';

/**
 * Calcula todas as métricas a partir dos leads classificados
 */
export function calcularMetricas(leads: LeadClassificado[]): Metricas {
  const totalLeads = leads.length;

  // Single pass: calcula todas as contagens de uma vez
  let consultoria = 0;
  let aceleradora = 0;
  let naoQualificado = 0;
  let consultoriaICP1 = 0;
  let consultoriaICP2 = 0;
  let consultoriaICP3 = 0;
  let aceleradoraICP1 = 0;
  let aceleradoraICP2 = 0;
  let aceleradoraICP3 = 0;

  for (const lead of leads) {
    if (lead.bu === 'Consultoria') {
      consultoria++;
      if (lead.icp === 'ICP1') consultoriaICP1++;
      else if (lead.icp === 'ICP2') consultoriaICP2++;
      else if (lead.icp === 'ICP3') consultoriaICP3++;
    } else if (lead.bu === 'Aceleradora') {
      aceleradora++;
      if (lead.icp === 'ICP1') aceleradoraICP1++;
      else if (lead.icp === 'ICP2') aceleradoraICP2++;
      else if (lead.icp === 'ICP3') aceleradoraICP3++;
    } else {
      naoQualificado++;
    }
  }

  const totalMQLs = consultoria + aceleradora;
  const taxaQualificacao = totalLeads > 0 ? Number(((totalMQLs / totalLeads) * 100).toFixed(2)) : 0;

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
    // Garantir que dataHora seja um objeto Date e converter para Brasília
    const data = lead.dataHora instanceof Date ? lead.dataHora : new Date(lead.dataHora);
    const dataBrasilia = converterParaBrasilia(data);
    const ano = dataBrasilia.getFullYear();
    const mes = String(dataBrasilia.getMonth() + 1).padStart(2, '0');
    const dia = String(dataBrasilia.getDate()).padStart(2, '0');
    const dataStr = `${ano}-${mes}-${dia}`;

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
    // Garantir que dataHora seja um objeto Date e converter para Brasília
    const data = lead.dataHora instanceof Date ? lead.dataHora : new Date(lead.dataHora);
    const dataBrasilia = converterParaBrasilia(data);
    if (dataBrasilia.getMonth() !== mes || dataBrasilia.getFullYear() !== ano) return false;

    const dia = dataBrasilia.getDate();

    if (semana === 1) return dia >= 1 && dia <= 7;
    if (semana === 2) return dia >= 8 && dia <= 14;
    if (semana === 3) return dia >= 15 && dia <= 21;
    if (semana === 4) return dia >= 22 && dia <= 28;
    if (semana === 5) return dia >= 29 && dia <= 31;

    return false;
  });
}
