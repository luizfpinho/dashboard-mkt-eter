'use client';

import dynamic from 'next/dynamic';
import { RefreshCw, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Metas } from '@/types/lead';
import { useLeadsFetch } from '@/lib/hooks/useLeadsFetch';
import { useMetrics } from '@/lib/hooks/useMetrics';

import { Filtros } from '@/components/Filtros';
import { FiltroMesAno } from '@/components/FiltroMesAno';
import { CardsResumo } from '@/components/CardsResumo';
import { TabelaMetas } from '@/components/TabelaMetas';
import { TabelaConsolidada } from '@/components/TabelaConsolidada';
import { MatrizCruzada } from '@/components/MatrizCruzada';
import { ComparativoSemanal } from '@/components/ComparativoSemanal';

// Lazy loading de componentes pesados com next/dynamic
const Graficos = dynamic(() => import('@/components/Graficos').then(mod => ({ default: mod.Graficos })), {
  loading: () => <div className="animate-pulse bg-muted h-96 rounded-lg" />,
});

const TabelaLeads = dynamic(() => import('@/components/TabelaLeads').then(mod => ({ default: mod.TabelaLeads })), {
  loading: () => <div className="animate-pulse bg-muted h-64 rounded-lg" />,
});

const AcompanhamentoMetas = dynamic(() => import('@/components/AcompanhamentoMetas'), {
  loading: () => <div className="animate-pulse bg-muted h-48 rounded-lg" />,
});

const GeradorRelatorio = dynamic(() => import('@/components/GeradorRelatorio'), {
  loading: () => <div className="animate-pulse bg-muted h-32 rounded-lg" />,
});

const GammaPresentationGenerator = dynamic(() => import('@/components/GammaPresentationGenerator'), {
  loading: () => <div className="animate-pulse bg-muted h-32 rounded-lg" />,
});

const METAS: Metas = {
  consultoriaTotal: 20,
  aceleradoraTotal: 38,
  total: 57
};

export default function Dashboard() {
  const {
    leadsOriginais,
    leadsFiltrados,
    carregando,
    ultimaAtualizacao,
    filtrosAtivos,
    temFiltrosAtivos,
    buscarDados,
    handleAplicarFiltros,
    handleLimparFiltros,
    handleFiltroMesAno,
  } = useLeadsFetch();

  const {
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
  } = useMetrics({
    leadsFiltrados,
    leadsOriginais,
    filtrosAtivos,
    temFiltrosAtivos,
  });

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
              <FiltroMesAno onAplicar={handleFiltroMesAno} />
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
              metricas={metricas}
              mesAtual={mesParaMetas}
              metricasFiltradas={metricasFiltradas}
              periodoFiltrado={periodoFiltradoLabel}
            />

            {/* Layout em Grid - Tabelas + Gráficos */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              {/* Coluna Esquerda - Tabelas */}
              <div className="lg:col-span-1 space-y-6">
                <TabelaMetas metricas={metricas} metas={METAS} />
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
