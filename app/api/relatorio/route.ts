import { NextRequest, NextResponse } from 'next/server';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { LeadClassificado, Metricas } from '@/types/lead';
import { filtrarLeads, classificarLead, deduplicarLeads } from '@/lib/classificacao';
import { calcularMetricas } from '@/lib/metricas';
import { fetchLeads, SPREADSHEET_ID } from '@/lib/csvParser';

interface MetricasRelatorio extends Metricas {
  leadsUnicos: number;
  duplicados: number;
  mediaPorDia: number;
  porBU: Record<string, number>;
  porICP: Record<string, number>;
  porOrigem: Record<string, number>;
  porDia: { data: string; quantidade: number }[];
}

interface FiltrosRelatorio {
  dataInicio?: string;
  dataFim?: string;
  origem?: string;
  bu?: string;
  icp?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const filtros: FiltrosRelatorio = body.filtros || {};
    const formato = body.formato || 'markdown'; // 'markdown' ou 'json'

    const leadsRaw = await fetchLeads();

    if (leadsRaw.length === 0) {
      return NextResponse.json({ error: 'Sem dados disponíveis' }, { status: 400 });
    }

    // Classificar leads
    const leadsClassificados = leadsRaw.map(lead => classificarLead(lead));

    // Deduplicar
    const todosLeads = deduplicarLeads(leadsClassificados);

    // Aplicar filtros - converter strings de data para Date
    const filtrosConvertidos = {
      ...filtros,
      dataInicio: filtros.dataInicio ? new Date(filtros.dataInicio) : undefined,
      dataFim: filtros.dataFim ? new Date(filtros.dataFim) : undefined,
      origens: filtros.origem ? [filtros.origem] : undefined,
      bus: filtros.bu ? [filtros.bu] : undefined,
      icps: filtros.icp ? [filtros.icp] : undefined,
    };
    const leadsFiltrados = filtrarLeads(todosLeads, filtrosConvertidos);

    // Calcular métricas básicas
    const metricasBasicas = calcularMetricas(leadsFiltrados);

    // Calcular métricas adicionais para o relatório
    const leadsUnicos = leadsFiltrados.length;
    const duplicados = leadsClassificados.length - todosLeads.length;

    // Distribuição por BU
    const porBU: Record<string, number> = {};
    leadsFiltrados.forEach(lead => {
      porBU[lead.bu] = (porBU[lead.bu] || 0) + 1;
    });

    // Distribuição por ICP
    const porICP: Record<string, number> = {};
    leadsFiltrados.forEach(lead => {
      if (lead.icp) {
        porICP[lead.icp] = (porICP[lead.icp] || 0) + 1;
      }
    });

    // Distribuição por Origem
    const porOrigem: Record<string, number> = {};
    leadsFiltrados.forEach(lead => {
      porOrigem[lead.canal] = (porOrigem[lead.canal] || 0) + 1;
    });

    // Evolução por dia
    const porDiaMap: Record<string, number> = {};
    leadsFiltrados.forEach(lead => {
      const dia = format(lead.dataHora, 'dd/MM/yyyy', { locale: ptBR });
      porDiaMap[dia] = (porDiaMap[dia] || 0) + 1;
    });
    const porDia = Object.entries(porDiaMap)
      .map(([data, quantidade]) => ({ data, quantidade }))
      .sort((a, b) => {
        const [diaA, mesA, anoA] = a.data.split('/');
        const [diaB, mesB, anoB] = b.data.split('/');
        return new Date(`${anoA}-${mesA}-${diaA}`).getTime() - new Date(`${anoB}-${mesB}-${diaB}`).getTime();
      });

    const diasUnicos = Object.keys(porDiaMap).length;
    const mediaPorDia = diasUnicos > 0 ? leadsUnicos / diasUnicos : 0;

    const metricas = {
      ...metricasBasicas,
      leadsUnicos,
      duplicados,
      mediaPorDia,
      porBU,
      porICP,
      porOrigem,
      porDia
    };

    // Gerar relatório
    const relatorio = gerarRelatorio(leadsFiltrados, metricas, filtros, formato);

    return NextResponse.json({
      success: true,
      relatorio,
      formato,
      totalLeads: leadsFiltrados.length,
      dataGeracao: new Date().toISOString()
    });
  } catch (error) {
    console.error('Erro ao gerar relatório:', error);
    return NextResponse.json(
      { error: 'Erro ao gerar relatório' },
      { status: 500 }
    );
  }
}

function gerarRelatorio(
  leads: LeadClassificado[],
  metricas: MetricasRelatorio,
  filtros: FiltrosRelatorio,
  formato: string
): string {
  const dataAtual = format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });

  // Período filtrado
  let periodoTexto = 'Todo o período disponível';
  if (filtros.dataInicio && filtros.dataFim) {
    const inicio = format(new Date(filtros.dataInicio), 'dd/MM/yyyy', { locale: ptBR });
    const fim = format(new Date(filtros.dataFim), 'dd/MM/yyyy', { locale: ptBR });
    periodoTexto = `${inicio} até ${fim}`;
  }

  // Filtros aplicados
  const filtrosAplicados: string[] = [];
  if (filtros.dataInicio && filtros.dataFim) filtrosAplicados.push(`Período: ${periodoTexto}`);
  if (filtros.origem) filtrosAplicados.push(`Origem: ${filtros.origem}`);
  if (filtros.bu) filtrosAplicados.push(`Business Unit: ${filtros.bu}`);
  if (filtros.icp) filtrosAplicados.push(`ICP: ${filtros.icp}`);

  if (formato === 'json') {
    return JSON.stringify({
      titulo: 'Relatório de MQLs - ETER Company',
      dataGeracao: dataAtual,
      periodo: periodoTexto,
      filtros: filtrosAplicados,
      metricas,
      leads: leads
    }, null, 2);
  }

  // Formato Markdown
  let md = '';

  md += '# 📊 Relatório de MQLs - ETER Company\n\n';
  md += `**Data de geração:** ${dataAtual}\n\n`;
  md += '---\n\n';

  md += '## 🎯 Filtros Aplicados\n\n';
  if (filtrosAplicados.length === 0) {
    md += '- Nenhum filtro aplicado (dados completos)\n\n';
  } else {
    filtrosAplicados.forEach(filtro => {
      md += `- ${filtro}\n`;
    });
    md += '\n';
  }

  md += '---\n\n';
  md += '## 📈 Resumo Executivo\n\n';
  md += '| Métrica | Valor |\n';
  md += '|---------|-------|\n';
  md += `| **Total de MQLs** | **${metricas.totalLeads}** |\n`;
  md += `| **MQLs Únicos** | **${metricas.leadsUnicos}** |\n`;
  md += `| **Duplicados Removidos** | **${metricas.duplicados}** |\n`;
  md += `| **Média por Dia** | **${metricas.mediaPorDia.toFixed(1)}** |\n\n`;

  md += '---\n\n';
  md += '## 🏢 Distribuição por Business Unit\n\n';
  md += '| Business Unit | Quantidade | Percentual |\n';
  md += '|---------------|------------|------------|\n';

  Object.entries(metricas.porBU).forEach(([bu, qtd]) => {
    const percentual = ((qtd as number / metricas.totalLeads) * 100).toFixed(1);
    md += `| ${bu} | ${qtd} | ${percentual}% |\n`;
  });
  md += '\n';

  md += '---\n\n';
  md += '## 🎯 Distribuição por ICP\n\n';
  md += '| ICP | Quantidade | Percentual |\n';
  md += '|-----|------------|------------|\n';

  Object.entries(metricas.porICP).forEach(([icp, qtd]) => {
    const percentual = ((qtd as number / metricas.totalLeads) * 100).toFixed(1);
    md += `| ${icp} | ${qtd} | ${percentual}% |\n`;
  });
  md += '\n';

  md += '---\n\n';
  md += '## 📡 Distribuição por Origem\n\n';
  md += '| Origem | Quantidade | Percentual |\n';
  md += '|--------|------------|------------|\n';

  Object.entries(metricas.porOrigem).forEach(([origem, qtd]) => {
    const percentual = ((qtd as number / metricas.totalLeads) * 100).toFixed(1);
    md += `| ${origem} | ${qtd} | ${percentual}% |\n`;
  });
  md += '\n';

  md += '---\n\n';
  md += '## 📊 Top 10 MQLs por Faturamento\n\n';
  md += '| Nome | Email | Faturamento | BU | ICP | Data |\n';
  md += '|------|-------|-------------|----|----|------|\n';

  const leadsOrdenados = [...leads].sort((a, b) => {
    const fatA = parseFaturamento(a.faturamento);
    const fatB = parseFaturamento(b.faturamento);
    return fatB - fatA;
  }).slice(0, 10);

  leadsOrdenados.forEach(lead => {
    const data = format(lead.dataHora, 'dd/MM/yyyy', { locale: ptBR });
    md += `| ${lead.nome} | ${lead.email} | ${lead.faturamento} | ${lead.bu} | ${lead.icp || 'N/A'} | ${data} |\n`;
  });
  md += '\n';

  md += '---\n\n';
  md += '## 📅 Evolução Diária (Últimos 7 dias)\n\n';

  const ultimosDias = metricas.porDia?.slice(-7) || [];
  if (ultimosDias.length > 0) {
    md += '| Data | Quantidade |\n';
    md += '|------|------------|\n';
    ultimosDias.forEach((item) => {
      md += `| ${item.data} | ${item.quantidade} |\n`;
    });
    md += '\n';
  }

  md += '---\n\n';
  md += '## 💡 Insights\n\n';

  // Origem dominante
  const origemDominante = Object.entries(metricas.porOrigem)
    .sort(([, a], [, b]) => (b as number) - (a as number))[0];
  if (origemDominante) {
    const percentual = ((origemDominante[1] as number / metricas.totalLeads) * 100).toFixed(1);
    md += `- **Origem dominante:** ${origemDominante[0]} com ${percentual}% dos leads\n`;
  }

  // BU dominante
  const buDominante = Object.entries(metricas.porBU)
    .sort(([, a], [, b]) => (b as number) - (a as number))[0];
  if (buDominante) {
    const percentual = ((buDominante[1] as number / metricas.totalLeads) * 100).toFixed(1);
    md += `- **Business Unit dominante:** ${buDominante[0]} com ${percentual}% dos leads\n`;
  }

  // ICP dominante
  const icpDominante = Object.entries(metricas.porICP)
    .sort(([, a], [, b]) => (b as number) - (a as number))[0];
  if (icpDominante) {
    const percentual = ((icpDominante[1] as number / metricas.totalLeads) * 100).toFixed(1);
    md += `- **ICP dominante:** ${icpDominante[0]} com ${percentual}% dos leads\n`;
  }

  md += `- **Taxa de duplicação:** ${((metricas.duplicados / metricas.totalLeads) * 100).toFixed(1)}%\n`;

  md += '\n---\n\n';
  md += `**Relatório gerado automaticamente pelo Dashboard MQLs ETER**\n`;
  md += `**Fonte de dados:** Google Sheets (ID: ${SPREADSHEET_ID})\n`;

  return md;
}

function parseFaturamento(faturamento: string): number {
  const limpo = faturamento.toLowerCase().replace(/[^\d]/g, '');
  return parseInt(limpo, 10) || 0;
}
