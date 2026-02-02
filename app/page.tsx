'use client';

import { useEffect, useState } from 'react';
import { RefreshCw, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Lead, LeadClassificado, Filtros as FiltrosType, Metas } from '@/types/lead';
import { classificarLead, deduplicarLeads, filtrarLeads, filtrarLeadsPorMes } from '@/lib/classificacao';
import {
  calcularMetricas,
  calcularDistribuicaoPorCanal,
  calcularMatrizCruzada,
  calcularEvolucaoTemporal,
  calcularComparativoSemanal,
  obterLeadsDaSemana
} from '@/lib/metricas';

import { Filtros } from '@/components/Filtros';
import { FiltroMesAno } from '@/components/FiltroMesAno';
import { CardsResumo } from '@/components/CardsResumo';
import { TabelaMetas } from '@/components/TabelaMetas';
import { TabelaConsolidada } from '@/components/TabelaConsolidada';
import { Graficos } from '@/components/Graficos';
import { MatrizCruzada } from '@/components/MatrizCruzada';
import { TabelaLeads } from '@/components/TabelaLeads';
import AcompanhamentoMetas from '@/components/AcompanhamentoMetas';
import { getMesAtualBrasilia, getInfoMesDaData } from '@/lib/timezone';
import { ComparativoSemanal } from '@/components/ComparativoSemanal';
import GeradorRelatorio from '@/components/GeradorRelatorio';
import GammaPresentationGenerator from '@/components/GammaPresentationGenerator';

export default function Dashboard() {
  const [leadsOriginais, setLeadsOriginais] = useState<LeadClassificado[]>([]);
  const [leadsFiltrados, setLeadsFiltrados] = useState<LeadClassificado[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [ultimaAtualizacao, setUltimaAtualizacao] = useState<Date | null>(null);
  const [filtrosAtivos, setFiltrosAtivos] = useState<FiltrosType>({
    dataInicio: null,
    dataFim: null,
    origens: [],
    bus: [],
    icps: [],
    semana: null
  });

  const metas: Metas = {
    consultoriaTotal: 20,
    aceleradoraTotal: 38,
    total: 57
  };

  /**
   * Verifica se há QUALQUER filtro ativo
   * Inclui: data, semana, origem, BU, ICP
   */
  const temFiltrosAtivos = (): boolean => {
    return !!(
      filtrosAtivos.dataInicio ||
      filtrosAtivos.dataFim ||
      filtrosAtivos.semana ||
      (filtrosAtivos.origens && filtrosAtivos.origens.length > 0) ||
      (filtrosAtivos.bus && filtrosAtivos.bus.length > 0) ||
      (filtrosAtivos.icps && filtrosAtivos.icps.length > 0)
    );
  };

  // Buscar dados da planilha
  const buscarDados = async () => {
    setCarregando(true);
    try {
      const response = await fetch('/api/leads');
      if (!response.ok) {
        throw new Error('Erro ao buscar dados');
      }

      const leads: Lead[] = await response.json();

      // Classificar todos os leads
      const leadsClassificados = leads.map(lead => classificarLead(lead));

      // Deduplicar
      const leadsUnicos = deduplicarLeads(leadsClassificados);

      setLeadsOriginais(leadsUnicos);

      // IMPORTANTE: Reaplicar filtros existentes aos novos dados
      // Se há filtros ativos, aplicá-los; senão, filtrar automaticamente pelo mês atual
      if (temFiltrosAtivos()) {
        // ✅ Reaplica TODOS os filtros ativos (incluindo semana)
        const leadsFiltradosNovos = filtrarLeads(leadsUnicos, filtrosAtivos);
        setLeadsFiltrados(leadsFiltradosNovos);
        console.log('🔄 Dados atualizados - Filtros preservados');
      } else {
        // ✅ Só volta para mês atual se NÃO houver filtros
        const mesAtual = getMesAtualBrasilia();
        const leadsDoMesAtual = filtrarLeadsPorMes(leadsUnicos, mesAtual.mes, mesAtual.ano);
        setLeadsFiltrados(leadsDoMesAtual);
        console.log(`📅 Filtro automático: ${mesAtual.mes}/${mesAtual.ano} (${leadsDoMesAtual.length} leads)`);
      }

      setUltimaAtualizacao(new Date());
    } catch (error) {
      console.error('Erro ao buscar leads:', error);
      alert('Erro ao carregar dados da planilha. Verifique a conexão.');
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    buscarDados();

    // Atualização automática a cada 5 minutos
    const interval = setInterval(buscarDados, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const handleAplicarFiltros = (filtros: FiltrosType) => {
    setFiltrosAtivos(filtros);
    const resultados = filtrarLeads(leadsOriginais, filtros);
    setLeadsFiltrados(resultados);
  };

  const handleLimparFiltros = () => {
    setFiltrosAtivos({
      dataInicio: null,
      dataFim: null,
      origens: [],
      bus: [],
      icps: [],
      semana: null
    });
    // Ao limpar filtros, aplicar filtro automático do mês atual
    const mesAtual = getMesAtualBrasilia();
    const leadsDoMesAtual = filtrarLeadsPorMes(leadsOriginais, mesAtual.mes, mesAtual.ano);
    setLeadsFiltrados(leadsDoMesAtual);
    console.log(`📅 Filtros limpos - Aplicado filtro automático: ${mesAtual.mes}/${mesAtual.ano}`);
  };

  // Calcular métricas dos leads filtrados (para cards, gráficos, etc.)
  const metricas = calcularMetricas(leadsFiltrados);

  // IMPORTANTE: Métricas de META seguem o MÊS DO FILTRO (se houver) ou mês atual
  // Detectar se há filtro de mês ativo (via FiltroMesAno)
  const temFiltroMes = filtrosAtivos.dataInicio && filtrosAtivos.dataFim;

  // Se há filtro de mês, usar o mês do filtro; senão, usar mês atual
  const mesParaMetas = temFiltroMes
    ? getInfoMesDaData(filtrosAtivos.dataInicio!)
    : getMesAtualBrasilia();

  // Filtrar leads do mês correto (do filtro ou atual)
  const leadsDoMesInteiro = filtrarLeadsPorMes(leadsOriginais, mesParaMetas.mes, mesParaMetas.ano);
  const metricasParaMetas = calcularMetricas(leadsDoMesInteiro);

  // Calcular contribuição do período filtrado (se houver filtro de data/semana)
  const temFiltroTemporal = filtrosAtivos.dataInicio || filtrosAtivos.dataFim || filtrosAtivos.semana;
  const metricasFiltradas = temFiltroTemporal ? metricas : null;

  // Gerar label do período filtrado
  const getPeriodoFiltradoLabel = (): string | null => {
    if (!temFiltroTemporal) return null;

    if (filtrosAtivos.semana) {
      return `Semana ${filtrosAtivos.semana}`;
    }

    if (filtrosAtivos.dataInicio && filtrosAtivos.dataFim) {
      const inicio = filtrosAtivos.dataInicio.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
      const fim = filtrosAtivos.dataFim.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
      return `${inicio} a ${fim}`;
    }

    return 'Período filtrado';
  };

  const periodoFiltradoLabel = getPeriodoFiltradoLabel();

  // Preparar dados para gráficos
  const evolucao = calcularEvolucaoTemporal(leadsFiltrados);

  const distribuicaoBU = [
    { name: 'Consultoria', value: metricas.consultoria },
    { name: 'Aceleradora', value: metricas.aceleradora },
    { name: 'Não Qualificado', value: metricas.naoQualificado }
  ].filter(item => item.value > 0);

  const distribuicaoConsultoriaICP = [
    { name: 'ICP 1', value: metricas.consultoriaICP1 },
    { name: 'ICP 2', value: metricas.consultoriaICP2 },
    { name: 'ICP 3', value: metricas.consultoriaICP3 }
  ];

  const distribuicaoAceleradoraICP = [
    { name: 'ICP 1', value: metricas.aceleradoraICP1 },
    { name: 'ICP 2', value: metricas.aceleradoraICP2 },
    { name: 'ICP 3', value: metricas.aceleradoraICP3 }
  ];

  const distribuicaoCanal = Object.entries(calcularDistribuicaoPorCanal(leadsFiltrados)).map(
    ([name, value]) => ({ name, value })
  );

  const matrizCruzada = calcularMatrizCruzada(leadsFiltrados);

  // Comparativo semanal (última semana vs penúltima)
  const hoje = new Date();
  const mesAtual = hoje.getMonth();
  const anoAtual = hoje.getFullYear();
  const semanaAtual = Math.ceil(hoje.getDate() / 7);
  const semanaAnterior = semanaAtual - 1;

  const leadsEstaSemana = obterLeadsDaSemana(leadsOriginais, semanaAtual, mesAtual, anoAtual);
  const leadsSemanaPassada =
    semanaAnterior > 0
      ? obterLeadsDaSemana(leadsOriginais, semanaAnterior, mesAtual, anoAtual)
      : [];

  const comparativoSemanal =
    leadsSemanaPassada.length > 0
      ? calcularComparativoSemanal(leadsEstaSemana, leadsSemanaPassada)
      : [];

  // Preparar dados para Gamma Presentation Generator
  const porCanal = calcularDistribuicaoPorCanal(leadsFiltrados);

  const getPeriodoLabel = (): string => {
    if (filtrosAtivos.dataInicio && filtrosAtivos.dataFim) {
      const inicio = filtrosAtivos.dataInicio.toLocaleDateString('pt-BR');
      const fim = filtrosAtivos.dataFim.toLocaleDateString('pt-BR');
      return `${inicio} até ${fim}`;
    }
    return 'Todo o período disponível';
  };

  const dashboardDataForGamma = {
    // Dados do período filtrado (para análise semanal, etc.)
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
    periodoLabel: getPeriodoLabel(),
    dataInicio: filtrosAtivos.dataInicio || new Date(0),
    dataFim: filtrosAtivos.dataFim || new Date(),
    // Dados do MÊS INTEIRO para cálculo de metas (independente de filtros)
    metaMesInteiro: {
      totalConsultoria: metricasParaMetas.consultoria,
      totalAceleradora: metricasParaMetas.aceleradora,
      totalMQLs: metricasParaMetas.totalMQLs,
    },
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Dashboard de Análise de MQLs - ETER Company
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Análise automática de leads qualificados por Business Unit e ICP
              </p>
            </div>
            <div className="flex items-center gap-4">
              {ultimaAtualizacao && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>
                    Última atualização:{' '}
                    {ultimaAtualizacao.toLocaleTimeString('pt-BR', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              )}
              <Button onClick={buscarDados} disabled={carregando} variant="outline">
                <RefreshCw className={`w-4 h-4 mr-2 ${carregando ? 'animate-spin' : ''}`} />
                Atualizar
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {carregando && leadsOriginais.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <RefreshCw className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600">Carregando dados da planilha...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Filtro Mês/Ano */}
            <div className="mb-4">
              <FiltroMesAno
                onAplicar={(inicio, fim, label) => {
                  setFiltrosAtivos({
                    ...filtrosAtivos,
                    dataInicio: inicio,
                    dataFim: fim,
                  });
                  const resultados = filtrarLeads(leadsOriginais, {
                    ...filtrosAtivos,
                    dataInicio: inicio,
                    dataFim: fim,
                  });
                  setLeadsFiltrados(resultados);
                }}
              />
            </div>

            {/* Separador "ou" */}
            <div className="flex items-center gap-4 mb-4">
              <div className="flex-1 border-t border-gray-300"></div>
              <span className="text-sm text-gray-500 font-medium">ou</span>
              <div className="flex-1 border-t border-gray-300"></div>
            </div>

            {/* Filtros */}
            <Filtros onAplicarFiltros={handleAplicarFiltros} onLimparFiltros={handleLimparFiltros} />

            {/* Cards de Resumo */}
            <CardsResumo metricas={metricas} />

            {/* Acompanhamento de Metas Mensais */}
            <AcompanhamentoMetas
              metricas={metricasParaMetas}
              mesAtual={mesParaMetas}
              metricasFiltradas={metricasFiltradas}
              periodoFiltrado={periodoFiltradoLabel}
            />

            {/* Layout em Grid - Tabelas + Gráficos */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              {/* Coluna Esquerda - Tabelas */}
              <div className="lg:col-span-1 space-y-6">
                <TabelaMetas metricas={metricas} metas={metas} />
                <TabelaConsolidada metricas={metricas} />
              </div>

              {/* Coluna Direita - Gráficos */}
              <div className="lg:col-span-2">
                <Graficos
                  evolucao={evolucao}
                  distribuicaoBU={distribuicaoBU}
                  distribuicaoConsultoriaICP={distribuicaoConsultoriaICP}
                  distribuicaoAceleradoraICP={distribuicaoAceleradoraICP}
                  distribuicaoCanal={distribuicaoCanal}
                />
              </div>
            </div>

            {/* Comparativo Semanal */}
            {comparativoSemanal.length > 0 && (
              <ComparativoSemanal comparativo={comparativoSemanal} />
            )}

            {/* Matriz Cruzada */}
            <MatrizCruzada matriz={matrizCruzada} />

            {/* Gerador de Relatórios e Apresentações */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Relatório Markdown/JSON */}
              <GeradorRelatorio filtros={filtrosAtivos} />

              {/* Apresentação Gamma */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <span>Gerador de Apresentações</span>
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Crie apresentações profissionais automaticamente com base nos dados filtrados.
                  O número de slides é calculado dinamicamente (máx. 15 slides).
                </p>
                <GammaPresentationGenerator
                  dashboardData={dashboardDataForGamma}
                  todosLeads={leadsOriginais}
                />
              </div>
            </div>

            {/* Tabela de Leads Detalhada */}
            <TabelaLeads leads={leadsFiltrados} />
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="container mx-auto px-4 py-6">
          <p className="text-center text-sm text-gray-600">
            Dashboard ETER Company - Marketing Analytics | Desenvolvido com Next.js + TypeScript
          </p>
        </div>
      </footer>
    </div>
  );
}
