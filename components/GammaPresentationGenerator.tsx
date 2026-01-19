'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Presentation, Loader2, Download, ExternalLink, Check, AlertCircle, Settings, ArrowLeftRight } from 'lucide-react';
import { GammaConfigPanel, GammaConfig, DEFAULT_GAMMA_CONFIG } from './GammaConfigPanel';
import { ComparativoConfig, PeriodoComparativo } from './ComparativoConfig';
import { gerarPromptComparativo } from '@/lib/gerarPromptComparativo';
import { calcularComparativo, DadosPeriodo } from '@/lib/comparativo';
import { processarLeadsPorPeriodo } from '@/lib/buscarDadosPeriodo';
import { LeadClassificado } from '@/types/lead';

interface DashboardData {
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
  metaMesInteiro?: {
    totalConsultoria: number;
    totalAceleradora: number;
    totalMQLs: number;
  };
}

interface GammaPresentationGeneratorProps {
  dashboardData: DashboardData;
  todosLeads: LeadClassificado[];
}

type GenerationStatus = 'idle' | 'loading_comparativo' | 'generating' | 'success' | 'error';

interface GenerationResult {
  gammaUrl?: string;
  pdfUrl?: string;
  pptxUrl?: string;
  config?: {
    numSlides: number;
    theme: string;
    format: string;
    exportAs: string;
  };
  isComparativo?: boolean;
  periodoAtual?: string;
  periodoAnterior?: string;
  error?: string;
}

export default function GammaPresentationGenerator({ dashboardData, todosLeads }: GammaPresentationGeneratorProps) {
  const [status, setStatus] = useState<GenerationStatus>('idle');
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [config, setConfig] = useState<GammaConfig>(DEFAULT_GAMMA_CONFIG);
  const [activeTab, setActiveTab] = useState<'config' | 'comparativo' | 'preview'>('config');

  // Estados do comparativo
  const [comparativoHabilitado, setComparativoHabilitado] = useState(false);
  const [periodoComparativo, setPeriodoComparativo] = useState<PeriodoComparativo | null>(null);

  // Período atual - memoizado para evitar re-renders desnecessários
  const periodoAtual = useMemo(() => ({
    inicio: dashboardData.dataInicio,
    fim: dashboardData.dataFim,
    label: dashboardData.periodoLabel,
  }), [dashboardData.dataInicio, dashboardData.dataFim, dashboardData.periodoLabel]);

  // Gerar prompt simples (sem comparativo)
  const gerarPromptSimples = (): string => {
    const canaisOrdenados = Object.entries(dashboardData.porCanal)
      .sort((a, b) => b[1] - a[1])
      .map(([canal, qtd]) => `${canal}: ${qtd} (${((qtd / dashboardData.totalMQLs) * 100).toFixed(1)}%)`)
      .join(', ');

    const alertas: string[] = [];
    if (dashboardData.taxaQualificacao < 40) alertas.push('Taxa de qualificação crítica');
    if (!dashboardData.porCanal['Tráfego Pago']) alertas.push('Tráfego pago zerado');
    if (dashboardData.totalConsultoria < 5) alertas.push('Volume baixo de Consultoria');

    // Calcular atingimento de metas usando dados do MÊS INTEIRO (não apenas do período filtrado)
    const metaConsultoria = 100;
    const metaAceleradora = 200;

    // Usar dados do mês inteiro se disponível, senão usar dados filtrados (fallback)
    const consultoriaParaMeta = dashboardData.metaMesInteiro?.totalConsultoria ?? dashboardData.totalConsultoria;
    const aceleradoraParaMeta = dashboardData.metaMesInteiro?.totalAceleradora ?? dashboardData.totalAceleradora;

    const percConsultoria = ((consultoriaParaMeta / metaConsultoria) * 100).toFixed(1);
    const percAceleradora = ((aceleradoraParaMeta / metaAceleradora) * 100).toFixed(1);
    const statusConsultoria = consultoriaParaMeta >= metaConsultoria ? '✅ META ATINGIDA' :
      consultoriaParaMeta >= metaConsultoria * 0.9 ? '⚠️ PRÓXIMO DA META' : '🔴 ABAIXO DA META';
    const statusAceleradora = aceleradoraParaMeta >= metaAceleradora ? '✅ META ATINGIDA' :
      aceleradoraParaMeta >= metaAceleradora * 0.9 ? '⚠️ PRÓXIMO DA META' : '🔴 ABAIXO DA META';

    return `
Crie uma apresentação profissional de relatório de marketing para a ETER Company.

# PERÍODO: ${dashboardData.periodoLabel}

# DADOS PRINCIPAIS

## RESUMO EXECUTIVO
- Total de Leads: ${dashboardData.totalLeads}
- Total de MQLs: ${dashboardData.totalMQLs}
- Taxa de Qualificação: ${dashboardData.taxaQualificacao.toFixed(1)}%
- Não Qualificados: ${dashboardData.totalNaoQualificado}

## ACOMPANHAMENTO DE METAS MENSAIS (MÊS INTEIRO)

### CONSULTORIA (Meta: ${metaConsultoria} MQLs/mês | Peso: 60%)
- **Realizado no Mês:** ${consultoriaParaMeta} MQLs (${percConsultoria}% da meta)
- **Status:** ${statusConsultoria}
- **No período filtrado (${dashboardData.periodoLabel}):** ${dashboardData.totalConsultoria} MQLs
- Empresas com faturamento >= R$ 100k/mês
- ICP 1 (100-500k/mês): ${dashboardData.consultoriaICP1} leads
- ICP 2 (500k-1MM/mês): ${dashboardData.consultoriaICP2} leads
- ICP 3 (+1MM/mês): ${dashboardData.consultoriaICP3} leads
- Taxa: ${dashboardData.taxaConsultoria.toFixed(1)}%

### ACELERADORA (Meta: ${metaAceleradora} MQLs/mês | Peso: 40%)
- **Realizado no Mês:** ${aceleradoraParaMeta} MQLs (${percAceleradora}% da meta)
- **Status:** ${statusAceleradora}
- **No período filtrado (${dashboardData.periodoLabel}):** ${dashboardData.totalAceleradora} MQLs
- Empresas com faturamento R$ 10k-100k/mês
- ICP 1 (10-30k/mês): ${dashboardData.aceleradoraICP1} leads
- ICP 2 (30-60k/mês): ${dashboardData.aceleradoraICP2} leads
- ICP 3 (60-100k/mês): ${dashboardData.aceleradoraICP3} leads
- Taxa: ${dashboardData.taxaAceleradora.toFixed(1)}%

## CANAIS DE ORIGEM
${canaisOrdenados}

${alertas.length > 0 ? `## ALERTAS\n${alertas.join('\n')}` : ''}

# ESTRUTURA SUGERIDA
- Slide 1: Capa com título e período
- Slide 2: Resumo executivo com cards de números principais E STATUS DAS METAS (incluir % de atingimento)
- Slides seguintes: Detalhamento por BU com barras de progresso mostrando meta vs realizado
- Análise de canais e insights
- Slide final: Resumo com atingimento de metas e 3 números principais

IMPORTANTE: Incluir em TODOS os slides relevantes a informação de quanto foi atingido em relação às metas mensais.
    `.trim();
  };

  // Gerar apresentação
  const gerarApresentacao = async () => {
    setActiveTab('preview');
    setResult(null);

    try {
      let prompt: string;

      // Se comparativo está habilitado, buscar dados do período anterior
      if (comparativoHabilitado && periodoComparativo) {
        setStatus('loading_comparativo');

        // Buscar dados do período anterior
        const dadosAnterior = processarLeadsPorPeriodo(
          todosLeads,
          periodoComparativo.inicio,
          periodoComparativo.fim
        );
        dadosAnterior.periodoLabel = periodoComparativo.label;

        // Dados do período atual
        const dadosAtual: DadosPeriodo = {
          totalLeads: dashboardData.totalLeads,
          totalMQLs: dashboardData.totalMQLs,
          totalConsultoria: dashboardData.totalConsultoria,
          totalAceleradora: dashboardData.totalAceleradora,
          totalNaoQualificado: dashboardData.totalNaoQualificado,
          taxaQualificacao: dashboardData.taxaQualificacao,
          consultoriaICP1: dashboardData.consultoriaICP1,
          consultoriaICP2: dashboardData.consultoriaICP2,
          consultoriaICP3: dashboardData.consultoriaICP3,
          aceleradoraICP1: dashboardData.aceleradoraICP1,
          aceleradoraICP2: dashboardData.aceleradoraICP2,
          aceleradoraICP3: dashboardData.aceleradoraICP3,
          porCanal: dashboardData.porCanal,
          periodoLabel: dashboardData.periodoLabel,
        };

        // Calcular comparativo
        const comparativo = calcularComparativo(dadosAtual, dadosAnterior);
        prompt = gerarPromptComparativo(comparativo);
      } else {
        prompt = gerarPromptSimples();
      }

      setStatus('generating');

      const response = await fetch('/api/generate-presentation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          config: {
            ...config,
            numCards: comparativoHabilitado ? Math.min(config.numCards + 3, 15) : config.numCards,
          },
        }),
      });

      const data = await response.json();

      if (data.success) {
        setStatus('success');
        setResult({
          ...data,
          isComparativo: comparativoHabilitado,
          periodoAtual: periodoAtual.label,
          periodoAnterior: periodoComparativo?.label,
        });
      } else {
        setStatus('error');
        setResult({ error: data.error || 'Erro ao gerar apresentação' });
      }
    } catch (error) {
      setStatus('error');
      setResult({ error: 'Erro ao gerar apresentação' });
    }
  };

  return (
    <>
      <Button onClick={() => setShowModal(true)} className="gap-2" variant="outline">
        <Presentation className="h-4 w-4" />
        Gerar Apresentação
      </Button>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-3xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Presentation className="h-5 w-5" />
              Gerar Apresentação — {dashboardData.periodoLabel}
            </DialogTitle>
            <DialogDescription>
              Configure as opções da apresentação
            </DialogDescription>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="config" className="gap-2">
                <Settings className="h-4 w-4" />
                Configurações
              </TabsTrigger>
              <TabsTrigger value="comparativo" className="gap-2">
                <ArrowLeftRight className="h-4 w-4" />
                Comparativo
              </TabsTrigger>
              <TabsTrigger value="preview" className="gap-2">
                <Presentation className="h-4 w-4" />
                Resultado
              </TabsTrigger>
            </TabsList>

            {/* Aba Configurações */}
            <TabsContent value="config" className="mt-4">
              <ScrollArea className="h-[55vh] pr-4">
                <GammaConfigPanel config={config} onChange={setConfig} />
              </ScrollArea>

              <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
                <Button variant="outline" onClick={() => setActiveTab('comparativo')}>
                  Próximo: Comparativo
                </Button>
              </div>
            </TabsContent>

            {/* Aba Comparativo */}
            <TabsContent value="comparativo" className="mt-4">
              <ScrollArea className="h-[55vh] pr-4">
                <div className="space-y-4">
                  <ComparativoConfig
                    periodoAtual={periodoAtual}
                    habilitado={comparativoHabilitado}
                    onHabilitadoChange={setComparativoHabilitado}
                    periodoComparativo={periodoComparativo}
                    onPeriodoComparativoChange={setPeriodoComparativo}
                  />

                  {comparativoHabilitado && periodoComparativo && (
                    <div className="bg-muted p-4 rounded-lg space-y-2">
                      <p className="font-medium">📊 A apresentação incluirá:</p>
                      <ul className="text-sm space-y-1 text-muted-foreground">
                        <li>• Tabelas comparativas lado a lado</li>
                        <li>• Variações percentuais (↑ ↓) em cada métrica</li>
                        <li>• Gráficos de barras comparativos</li>
                        <li>• Análise de tendências por canal</li>
                        <li>• Destaques positivos e pontos de atenção</li>
                      </ul>
                    </div>
                  )}
                </div>
              </ScrollArea>

              <div className="flex justify-between gap-2 mt-4 pt-4 border-t">
                <Button variant="outline" onClick={() => setActiveTab('config')}>
                  Voltar
                </Button>
                <Button onClick={gerarApresentacao} disabled={status === 'generating' || status === 'loading_comparativo'}>
                  {status === 'loading_comparativo' ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Buscando dados...
                    </>
                  ) : status === 'generating' ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Gerando...
                    </>
                  ) : (
                    <>
                      <Presentation className="h-4 w-4 mr-2" />
                      {comparativoHabilitado ? 'Gerar Comparativo' : 'Gerar Apresentação'}
                    </>
                  )}
                </Button>
              </div>
            </TabsContent>

            {/* Aba Preview/Resultado */}
            <TabsContent value="preview" className="mt-4">
              <div className="min-h-[400px] flex items-center justify-center">
                {status === 'idle' && (
                  <div className="text-center text-muted-foreground">
                    <Presentation className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Configure as opções e clique em "Gerar"</p>
                  </div>
                )}

                {(status === 'loading_comparativo' || status === 'generating') && (
                  <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-16 w-16 animate-spin text-primary" />
                    <div className="text-center">
                      <p className="font-medium text-lg">
                        {status === 'loading_comparativo'
                          ? 'Buscando dados comparativos...'
                          : 'Gerando apresentação...'}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {comparativoHabilitado
                          ? 'Apresentação comparativa em preparação'
                          : 'Isso pode levar até 120 segundos'}
                      </p>
                      <div className="mt-4 space-y-1 text-xs text-muted-foreground">
                        <p>📊 Tema: {config.themeId}</p>
                        <p>📑 Slides: {config.numCards}</p>
                        <p>📁 Formato: {config.exportAs.toUpperCase()}</p>
                      </div>
                    </div>
                  </div>
                )}

                {status === 'success' && result && (
                  <div className="w-full space-y-6">
                    <div className="flex items-center justify-center gap-2 text-green-600">
                      <Check className="h-8 w-8" />
                      <span className="font-medium text-xl">
                        {result.isComparativo
                          ? 'Apresentação comparativa gerada!'
                          : 'Apresentação gerada com sucesso!'}
                      </span>
                    </div>

                    {result.isComparativo && (
                      <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg text-center">
                        <p className="text-sm text-blue-600 dark:text-blue-400">
                          📊 Comparando: <strong>{result.periodoAnterior}</strong> → <strong>{result.periodoAtual}</strong>
                        </p>
                      </div>
                    )}

                    <div className="bg-muted p-4 rounded-lg grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Slides</p>
                        <p className="font-medium">{result.config?.numSlides}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Tema</p>
                        <p className="font-medium">{result.config?.theme}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Formato</p>
                        <p className="font-medium">{result.config?.format}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Exportação</p>
                        <p className="font-medium">{result.config?.exportAs?.toUpperCase()}</p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3">
                      {result.gammaUrl && (
                        <Button asChild size="lg" className="w-full gap-2">
                          <a href={result.gammaUrl} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-5 w-5" />
                            Abrir no Gamma (Editar Online)
                          </a>
                        </Button>
                      )}

                      <div className="grid grid-cols-2 gap-3">
                        {result.pptxUrl && (
                          <Button variant="outline" asChild size="lg" className="gap-2">
                            <a href={result.pptxUrl} download>
                              <Download className="h-5 w-5" />
                              Download PPTX
                            </a>
                          </Button>
                        )}

                        {result.pdfUrl && (
                          <Button variant="outline" asChild size="lg" className="gap-2">
                            <a href={result.pdfUrl} download>
                              <Download className="h-5 w-5" />
                              Download PDF
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      onClick={() => { setStatus('idle'); setActiveTab('config'); }}
                      className="w-full"
                    >
                      Gerar Nova Apresentação
                    </Button>
                  </div>
                )}

                {status === 'error' && result?.error && (
                  <div className="w-full space-y-4">
                    <div className="flex items-center justify-center gap-2 text-red-600">
                      <AlertCircle className="h-8 w-8" />
                      <span className="font-medium text-xl">Erro na geração</span>
                    </div>
                    <p className="text-center text-muted-foreground">{result.error}</p>
                    <div className="flex gap-2 justify-center">
                      <Button variant="outline" onClick={() => setActiveTab('config')}>
                        Ajustar Configurações
                      </Button>
                      <Button onClick={gerarApresentacao}>
                        Tentar Novamente
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </>
  );
}
