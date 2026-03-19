import { DadosPeriodo } from './comparativo';
import { LeadClassificado } from '@/types/lead';

// Função que filtra os leads por período e calcula as métricas
export function processarLeadsPorPeriodo(
  todosLeads: LeadClassificado[],
  inicio: Date,
  fim: Date
): DadosPeriodo {
  // Filtrar leads do período
  const leadsPeriodo = todosLeads.filter(lead => {
    const data = lead.dataHora;
    return data >= inicio && data <= fim;
  });

  // Calcular métricas em single pass
  const totalLeads = leadsPeriodo.length;

  let totalConsultoria = 0;
  let totalAceleradora = 0;
  let totalNaoQualificado = 0;
  let consultoriaICP1 = 0;
  let consultoriaICP2 = 0;
  let consultoriaICP3 = 0;
  let aceleradoraICP1 = 0;
  let aceleradoraICP2 = 0;
  let aceleradoraICP3 = 0;

  for (const lead of leadsPeriodo) {
    if (lead.bu === 'Consultoria') {
      totalConsultoria++;
      if (lead.icp === 'ICP1') consultoriaICP1++;
      else if (lead.icp === 'ICP2') consultoriaICP2++;
      else if (lead.icp === 'ICP3') consultoriaICP3++;
    } else if (lead.bu === 'Aceleradora') {
      totalAceleradora++;
      if (lead.icp === 'ICP1') aceleradoraICP1++;
      else if (lead.icp === 'ICP2') aceleradoraICP2++;
      else if (lead.icp === 'ICP3') aceleradoraICP3++;
    } else {
      totalNaoQualificado++;
    }
  }

  const totalMQLs = totalConsultoria + totalAceleradora;
  const taxaQualificacao = totalLeads > 0 ? (totalMQLs / totalLeads) * 100 : 0;

  // Agrupar por canal
  const porCanal: Record<string, number> = {};
  leadsPeriodo.forEach(lead => {
    // Considerar apenas MQLs para canais
    if (lead.bu !== 'Não Qualificado') {
      const canal = lead.canal || 'Não identificado';
      porCanal[canal] = (porCanal[canal] || 0) + 1;
    }
  });

  return {
    totalLeads,
    totalMQLs,
    totalConsultoria,
    totalAceleradora,
    totalNaoQualificado,
    taxaQualificacao,
    consultoriaICP1,
    consultoriaICP2,
    consultoriaICP3,
    aceleradoraICP1,
    aceleradoraICP2,
    aceleradoraICP3,
    porCanal,
    periodoLabel: '', // Será preenchido depois
  };
}
