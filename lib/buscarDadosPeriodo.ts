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

  // Calcular métricas
  const totalLeads = leadsPeriodo.length;

  // Separar por Business Unit
  const leadsConsultoria = leadsPeriodo.filter(l => l.bu === 'Consultoria');
  const leadsAceleradora = leadsPeriodo.filter(l => l.bu === 'Aceleradora');
  const leadsNaoQualificado = leadsPeriodo.filter(l => l.bu === 'Não Qualificado');

  // Calcular ICPs de Consultoria
  const consultoriaICP1 = leadsConsultoria.filter(l => l.icp === 'ICP1').length;
  const consultoriaICP2 = leadsConsultoria.filter(l => l.icp === 'ICP2').length;
  const consultoriaICP3 = leadsConsultoria.filter(l => l.icp === 'ICP3').length;

  // Calcular ICPs de Aceleradora
  const aceleradoraICP1 = leadsAceleradora.filter(l => l.icp === 'ICP1').length;
  const aceleradoraICP2 = leadsAceleradora.filter(l => l.icp === 'ICP2').length;
  const aceleradoraICP3 = leadsAceleradora.filter(l => l.icp === 'ICP3').length;

  // Totais
  const totalConsultoria = leadsConsultoria.length;
  const totalAceleradora = leadsAceleradora.length;
  const totalNaoQualificado = leadsNaoQualificado.length;
  const totalMQLs = totalConsultoria + totalAceleradora;

  // Taxa de qualificação
  const taxaQualificacao = totalLeads > 0 ? (totalMQLs / totalLeads) * 100 : 0;

  // Agrupar por canal
  const porCanal: Record<string, number> = {};
  leadsPeriodo.forEach(lead => {
    // Considerar apenas MQLs para canais
    if (lead.bu !== 'Não Qualificado') {
      const canal = lead.origem || 'Desconhecido';
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
