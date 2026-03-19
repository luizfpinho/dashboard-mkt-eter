import { useMemo } from 'react';
import { LeadClassificado, Filtros, Metricas, ComparativoSemanal as ComparativoSemanalType } from '@/types/lead';
import {
  calcularMetricas,
  calcularDistribuicaoPorCanal,
  calcularMatrizCruzada,
  calcularEvolucaoTemporal,
  calcularComparativoSemanal,
  obterLeadsDaSemana
} from '@/lib/metricas';
import { getMesAtualBrasilia, getInfoMesDaData } from '@/lib/timezone';

interface UseMetricsParams {
  leadsFiltrados: LeadClassificado[];
  leadsOriginais: LeadClassificado[];
  filtrosAtivos: Filtros;
  temFiltrosAtivos: boolean;
}

interface MesInfo {
  mes: number;
  ano: number;
  diasNoMes: number;
  diaAtual: number;
}

interface UseMetricsReturn {
  metricas: Metricas;
  mesParaMetas: MesInfo;
  metricasFiltradas: Metricas | null;
  periodoFiltradoLabel: string | null;
  evolucao: { data: string; total: number; consultoria: number; aceleradora: number }[];
  distribuicaoBU: { name: string; value: number }[];
  distribuicaoConsultoriaICP: { name: string; value: number }[];
  distribuicaoAceleradoraICP: { name: string; value: number }[];
  distribuicaoCanal: { name: string; value: number }[];
  matrizCruzada: Record<string, Record<string, number>>;
  comparativoSemanal: ComparativoSemanalType[];
  dashboardDataForGamma: {
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
    taxaConsultoria: number;
    taxaAceleradora: number;
    porCanal: Record<string, number>;
    periodoLabel: string;
    dataInicio: Date;
    dataFim: Date;
    metaMesInteiro: {
      totalConsultoria: number;
      totalAceleradora: number;
      totalMQLs: number;
    };
  };
}

export function useMetrics({
  leadsFiltrados,
  leadsOriginais,
  filtrosAtivos,
  temFiltrosAtivos,
}: UseMetricsParams): UseMetricsReturn {
  const metricas = useMemo(
    () => calcularMetricas(leadsFiltrados),
    [leadsFiltrados]
  );

  const mesParaMetas = useMemo<MesInfo>(() => {
    return temFiltrosAtivos
      ? (filtrosAtivos.dataInicio ? getInfoMesDaData(filtrosAtivos.dataInicio) : getMesAtualBrasilia())
      : getMesAtualBrasilia();
  }, [temFiltrosAtivos, filtrosAtivos.dataInicio]);

  const temFiltroTemporal = !!(filtrosAtivos.dataInicio || filtrosAtivos.dataFim || filtrosAtivos.semana);
  const metricasFiltradas = temFiltroTemporal ? metricas : null;

  const periodoFiltradoLabel = useMemo((): string | null => {
    if (!temFiltroTemporal) return null;
    if (filtrosAtivos.semana) return `Semana ${filtrosAtivos.semana}`;
    if (filtrosAtivos.dataInicio && filtrosAtivos.dataFim) {
      const inicio = filtrosAtivos.dataInicio.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
      const fim = filtrosAtivos.dataFim.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
      return `${inicio} a ${fim}`;
    }
    return 'Período filtrado';
  }, [filtrosAtivos.dataInicio, filtrosAtivos.dataFim, filtrosAtivos.semana, temFiltroTemporal]);

  const evolucao = useMemo(
    () => calcularEvolucaoTemporal(leadsFiltrados),
    [leadsFiltrados]
  );

  const distribuicaoBU = useMemo(
    () => [
      { name: 'Consultoria', value: metricas.consultoria },
      { name: 'Aceleradora', value: metricas.aceleradora },
      { name: 'Não Qualificado', value: metricas.naoQualificado }
    ].filter(item => item.value > 0),
    [metricas.consultoria, metricas.aceleradora, metricas.naoQualificado]
  );

  const distribuicaoConsultoriaICP = useMemo(
    () => [
      { name: 'ICP 1', value: metricas.consultoriaICP1 },
      { name: 'ICP 2', value: metricas.consultoriaICP2 },
      { name: 'ICP 3', value: metricas.consultoriaICP3 }
    ],
    [metricas.consultoriaICP1, metricas.consultoriaICP2, metricas.consultoriaICP3]
  );

  const distribuicaoAceleradoraICP = useMemo(
    () => [
      { name: 'ICP 1', value: metricas.aceleradoraICP1 },
      { name: 'ICP 2', value: metricas.aceleradoraICP2 },
      { name: 'ICP 3', value: metricas.aceleradoraICP3 }
    ],
    [metricas.aceleradoraICP1, metricas.aceleradoraICP2, metricas.aceleradoraICP3]
  );

  // porCanal (raw) e distribuicaoCanal (array) compartilham o mesmo cálculo
  const porCanal = useMemo(
    () => calcularDistribuicaoPorCanal(leadsFiltrados),
    [leadsFiltrados]
  );

  const distribuicaoCanal = useMemo(
    () => Object.entries(porCanal).map(([name, value]) => ({ name, value })),
    [porCanal]
  );

  const matrizCruzada = useMemo(
    () => calcularMatrizCruzada(leadsFiltrados),
    [leadsFiltrados]
  );

  const comparativoSemanal = useMemo(() => {
    const mesInfo = getMesAtualBrasilia();
    const mesAtual = mesInfo.mes - 1; // getMonth() retorna 0-11, getMesAtualBrasilia retorna 1-12
    const anoAtual = mesInfo.ano;
    const semanaAtual = Math.ceil(mesInfo.diaAtual / 7);
    const semanaAnterior = semanaAtual - 1;

    const leadsEstaSemana = obterLeadsDaSemana(leadsOriginais, semanaAtual, mesAtual, anoAtual);
    const leadsSemanaPassada =
      semanaAnterior > 0
        ? obterLeadsDaSemana(leadsOriginais, semanaAnterior, mesAtual, anoAtual)
        : [];

    return leadsSemanaPassada.length > 0
      ? calcularComparativoSemanal(leadsEstaSemana, leadsSemanaPassada)
      : [];
  }, [leadsOriginais]);

  const dashboardDataForGamma = useMemo(() => {
    const periodoLabel = (() => {
      if (filtrosAtivos.dataInicio && filtrosAtivos.dataFim) {
        const inicio = filtrosAtivos.dataInicio.toLocaleDateString('pt-BR');
        const fim = filtrosAtivos.dataFim.toLocaleDateString('pt-BR');
        return `${inicio} até ${fim}`;
      }
      return 'Todo o período disponível';
    })();

    return {
      totalLeads: leadsFiltrados.length,
      totalMQLs: metricas.totalMQLs,
      totalConsultoria: metricas.consultoria,
      totalAceleradora: metricas.aceleradora,
      totalNaoQualificado: metricas.naoQualificado,
      taxaQualificacao: metricas.taxaQualificacao,
      consultoriaICP1: metricas.consultoriaICP1,
      consultoriaICP2: metricas.consultoriaICP2,
      consultoriaICP3: metricas.consultoriaICP3,
      aceleradoraICP1: metricas.aceleradoraICP1,
      aceleradoraICP2: metricas.aceleradoraICP2,
      aceleradoraICP3: metricas.aceleradoraICP3,
      taxaConsultoria: leadsFiltrados.length > 0 ? (metricas.consultoria / leadsFiltrados.length) * 100 : 0,
      taxaAceleradora: leadsFiltrados.length > 0 ? (metricas.aceleradora / leadsFiltrados.length) * 100 : 0,
      porCanal,
      periodoLabel,
      dataInicio: filtrosAtivos.dataInicio || new Date(0),
      dataFim: filtrosAtivos.dataFim || new Date(),
      metaMesInteiro: {
        totalConsultoria: metricas.consultoria,
        totalAceleradora: metricas.aceleradora,
        totalMQLs: metricas.totalMQLs,
      },
    };
  }, [leadsFiltrados, metricas, porCanal, filtrosAtivos.dataInicio, filtrosAtivos.dataFim]);

  return {
    metricas,
    mesParaMetas,
    metricasFiltradas,
    periodoFiltradoLabel,
    evolucao,
    distribuicaoBU,
    distribuicaoConsultoriaICP,
    distribuicaoAceleradoraICP,
    distribuicaoCanal,
    matrizCruzada,
    comparativoSemanal,
    dashboardDataForGamma,
  };
}
