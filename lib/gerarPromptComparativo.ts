import { DadosComparativos, formatarVariacao } from './comparativo';
import { METAS_MENSAIS } from './metas';

export function gerarPromptComparativo(dados: DadosComparativos): string {
  const { atual, anterior, variacoes } = dados;

  // Calcular variações por canal
  const canaisAtual = Object.entries(atual.porCanal).sort((a, b) => b[1] - a[1]);
  const variacoesCanais = canaisAtual.map(([canal, qtdAtual]) => {
    const qtdAnterior = anterior.porCanal[canal] || 0;
    const diff = qtdAtual - qtdAnterior;
    const percentDiff = qtdAnterior === 0 ? 100 : ((diff / qtdAnterior) * 100);
    const sinal = diff >= 0 ? '+' : '';
    const emoji = diff > 0 ? '📈' : diff < 0 ? '📉' : '➡️';
    return `${canal}: ${qtdAtual} (${emoji} ${sinal}${diff}, ${sinal}${percentDiff.toFixed(0)}% vs anterior)`;
  }).join('\n');

  // Identificar destaques positivos
  const destaquesPositivos: string[] = [];
  if (variacoes.totalMQLs.percentual > 10) {
    destaquesPositivos.push(`MQLs cresceram ${variacoes.totalMQLs.percentual.toFixed(0)}%`);
  }
  if (variacoes.totalConsultoria.percentual > 15) {
    destaquesPositivos.push(`Consultoria cresceu ${variacoes.totalConsultoria.percentual.toFixed(0)}%`);
  }
  if (variacoes.taxaQualificacao.absoluta > 5) {
    destaquesPositivos.push(`Taxa de qualificação subiu ${variacoes.taxaQualificacao.absoluta.toFixed(1)}pp`);
  }

  // Identificar pontos de atenção
  const pontosAtencao: string[] = [];
  if (variacoes.totalMQLs.percentual < -10) {
    pontosAtencao.push(`MQLs caíram ${Math.abs(variacoes.totalMQLs.percentual).toFixed(0)}%`);
  }
  if (variacoes.totalConsultoria.percentual < -15) {
    pontosAtencao.push(`Consultoria caiu ${Math.abs(variacoes.totalConsultoria.percentual).toFixed(0)}%`);
  }
  if (variacoes.taxaQualificacao.absoluta < -5) {
    pontosAtencao.push(`Taxa de qualificação caiu ${Math.abs(variacoes.taxaQualificacao.absoluta).toFixed(1)}pp`);
  }
  if (atual.taxaQualificacao < 40) {
    pontosAtencao.push(`Taxa de qualificação crítica: ${atual.taxaQualificacao.toFixed(1)}%`);
  }

  // Calcular atingimento de metas (metas mensais) - usar valores de METAS_MENSAIS
  const metaConsultoria = METAS_MENSAIS.find(m => m.bu === 'Consultoria')?.metaBase ?? 100;
  const metaAceleradora = METAS_MENSAIS.find(m => m.bu === 'Aceleradora')?.metaBase ?? 200;
  const percConsultoriaAtual = ((atual.totalConsultoria / metaConsultoria) * 100).toFixed(1);
  const percAceleradoraAtual = ((atual.totalAceleradora / metaAceleradora) * 100).toFixed(1);
  const percConsultoriaAnterior = ((anterior.totalConsultoria / metaConsultoria) * 100).toFixed(1);
  const percAceleradoraAnterior = ((anterior.totalAceleradora / metaAceleradora) * 100).toFixed(1);

  return `
Crie uma apresentação COMPARATIVA de relatório de marketing para a ETER Company.

# ANÁLISE COMPARATIVA

## PERÍODOS ANALISADOS
- **PERÍODO ATUAL:** ${atual.periodoLabel}
- **PERÍODO ANTERIOR:** ${anterior.periodoLabel}

---

# RESUMO EXECUTIVO — COMPARATIVO

## VISÃO GERAL
| Métrica | Anterior | Atual | Variação |
|---------|----------|-------|----------|
| Total de Leads | ${anterior.totalLeads} | ${atual.totalLeads} | ${formatarVariacao(variacoes.totalLeads)} |
| Total de MQLs | ${anterior.totalMQLs} | ${atual.totalMQLs} | ${formatarVariacao(variacoes.totalMQLs)} |
| Taxa de Qualificação | ${anterior.taxaQualificacao.toFixed(1)}% | ${atual.taxaQualificacao.toFixed(1)}% | ${formatarVariacao(variacoes.taxaQualificacao)} |

---

# ACOMPANHAMENTO DE METAS MENSAIS — COMPARATIVO

## CONSULTORIA (Meta: ${metaConsultoria} MQLs/mês | Peso: 60%)

**Empresas com faturamento >= R$ 100k/mês**

| Métrica | Anterior | Atual | Variação |
|---------|----------|-------|----------|
| Total Consultoria | ${anterior.totalConsultoria} (${percConsultoriaAnterior}% da meta) | ${atual.totalConsultoria} (${percConsultoriaAtual}% da meta) | ${formatarVariacao(variacoes.totalConsultoria)} |
| ICP 1 (100-500k) | ${anterior.consultoriaICP1} | ${atual.consultoriaICP1} | ${atual.consultoriaICP1 - anterior.consultoriaICP1 >= 0 ? '+' : ''}${atual.consultoriaICP1 - anterior.consultoriaICP1} |
| ICP 2 (500k-1MM) | ${anterior.consultoriaICP2} | ${atual.consultoriaICP2} | ${atual.consultoriaICP2 - anterior.consultoriaICP2 >= 0 ? '+' : ''}${atual.consultoriaICP2 - anterior.consultoriaICP2} |
| ICP 3 (+1MM) | ${anterior.consultoriaICP3} | ${atual.consultoriaICP3} | ${atual.consultoriaICP3 - anterior.consultoriaICP3 >= 0 ? '+' : ''}${atual.consultoriaICP3 - anterior.consultoriaICP3} |

---

## ACELERADORA (Meta: ${metaAceleradora} MQLs/mês | Peso: 40%)

**Empresas com faturamento R$ 10k-100k/mês**

| Métrica | Anterior | Atual | Variação |
|---------|----------|-------|----------|
| Total Aceleradora | ${anterior.totalAceleradora} (${percAceleradoraAnterior}% da meta) | ${atual.totalAceleradora} (${percAceleradoraAtual}% da meta) | ${formatarVariacao(variacoes.totalAceleradora)} |
| ICP 1 (10-30k) | ${anterior.aceleradoraICP1} | ${atual.aceleradoraICP1} | ${atual.aceleradoraICP1 - anterior.aceleradoraICP1 >= 0 ? '+' : ''}${atual.aceleradoraICP1 - anterior.aceleradoraICP1} |
| ICP 2 (30-60k) | ${anterior.aceleradoraICP2} | ${atual.aceleradoraICP2} | ${atual.aceleradoraICP2 - anterior.aceleradoraICP2 >= 0 ? '+' : ''}${atual.aceleradoraICP2 - anterior.aceleradoraICP2} |
| ICP 3 (60-100k) | ${anterior.aceleradoraICP3} | ${atual.aceleradoraICP3} | ${atual.aceleradoraICP3 - anterior.aceleradoraICP3 >= 0 ? '+' : ''}${atual.aceleradoraICP3 - anterior.aceleradoraICP3} |

---

# CANAIS DE ORIGEM — COMPARATIVO

${variacoesCanais}

---

# ANÁLISE E INSIGHTS

## 🟢 DESTAQUES POSITIVOS
${destaquesPositivos.length > 0 ? destaquesPositivos.map(d => `- ${d}`).join('\n') : '- Nenhum destaque positivo significativo no período'}

## 🟡 PONTOS DE ATENÇÃO
${pontosAtencao.length > 0 ? pontosAtencao.map(p => `- ${p}`).join('\n') : '- Nenhum ponto crítico de atenção'}

---

# ESTRUTURA DA APRESENTAÇÃO

A apresentação deve ter a seguinte estrutura:

1. **CAPA** - Título "Relatório Comparativo de MQLs - ETER Company" + Períodos
2. **RESUMO EXECUTIVO** - Cards grandes com números principais e variações (usar setas verdes/vermelhas) + STATUS DE METAS
3. **EVOLUÇÃO VISUAL** - Gráfico de barras lado a lado comparando os dois períodos
4. **CONSULTORIA** - Detalhamento com variações, gráfico comparativo E BARRAS DE PROGRESSO MOSTRANDO META (100 MQLs)
5. **ACELERADORA** - Detalhamento com variações, gráfico comparativo E BARRAS DE PROGRESSO MOSTRANDO META (200 MQLs)
6. **ATINGIMENTO DE METAS** - Slide dedicado comparando % de atingimento anterior vs atual para cada BU
7. **CANAIS** - Comparativo de canais com barras empilhadas
8. **DESTAQUES** - Slide com ícones destacando conquistas e alertas
9. **CONCLUSÃO** - 3 números mais importantes + atingimento de metas + recomendações

## INSTRUÇÕES DE DESIGN

- Usar cores: 🟢 Verde (#22c55e) para variações positivas, 🔴 Vermelho (#ef4444) para negativas
- Incluir setas (↑ ↓) nos números comparativos
- Gráficos de barras lado a lado para comparação visual
- IMPORTANTE: Incluir barras de progresso mostrando meta vs realizado em AMBOS os períodos
- Números grandes e destacados
- Tom profissional e executivo
- Idioma: Português brasileiro

CRÍTICO: Incluir em TODOS os slides relevantes a informação de quanto foi atingido em relação às metas mensais (Consultoria: 100 MQLs/mês, Aceleradora: 200 MQLs/mês).
  `.trim();
}
