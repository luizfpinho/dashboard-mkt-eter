import { MetaMensal, NivelBonificacao, StatusMeta, StatusRitmo, InfoMes } from '@/types/metas';

/**
 * Configuração de metas mensais baseada nas tabelas de bonificação
 */
export const METAS_MENSAIS: MetaMensal[] = [
  {
    bu: 'Consultoria',
    metaBase: 100,
    peso: 60,
    niveis: [
      { percentualMeta: 60, mqls: 60, percentualBonificacao: 60, cor: 'red' },
      { percentualMeta: 70, mqls: 70, percentualBonificacao: 70, cor: 'orange' },
      { percentualMeta: 80, mqls: 80, percentualBonificacao: 80, cor: 'yellow' },
      { percentualMeta: 90, mqls: 90, percentualBonificacao: 90, cor: 'lime' },
      { percentualMeta: 100, mqls: 100, percentualBonificacao: 100, cor: 'green' },
      { percentualMeta: 120, mqls: 120, percentualBonificacao: 120, cor: 'emerald' },
      { percentualMeta: 150, mqls: 150, percentualBonificacao: 150, cor: 'teal' }
    ]
  },
  {
    bu: 'Aceleradora',
    metaBase: 200,
    peso: 40,
    niveis: [
      { percentualMeta: 60, mqls: 120, percentualBonificacao: 60, cor: 'red' },
      { percentualMeta: 70, mqls: 140, percentualBonificacao: 70, cor: 'orange' },
      { percentualMeta: 80, mqls: 160, percentualBonificacao: 80, cor: 'yellow' },
      { percentualMeta: 90, mqls: 180, percentualBonificacao: 90, cor: 'lime' },
      { percentualMeta: 100, mqls: 200, percentualBonificacao: 100, cor: 'green' },
      { percentualMeta: 120, mqls: 240, percentualBonificacao: 120, cor: 'emerald' },
      { percentualMeta: 150, mqls: 300, percentualBonificacao: 150, cor: 'teal' }
    ]
  }
];

/**
 * Determina a cor do indicador baseado no percentual de atingimento
 */
function determinarCor(percentual: number): string {
  if (percentual >= 150) return 'teal';
  if (percentual >= 120) return 'emerald';
  if (percentual >= 100) return 'green';
  if (percentual >= 90) return 'lime';
  if (percentual >= 80) return 'yellow';
  if (percentual >= 70) return 'orange';
  return 'red';
}

/**
 * Calcula o status atual de uma meta
 */
export function calcularStatusMeta(
  mqls: number,
  metaMensal: MetaMensal
): StatusMeta {
  // 1. Encontrar nível atual atingido (maior nível onde mqls >= nivel.mqls)
  const niveisOrdenados = [...metaMensal.niveis].sort((a, b) => b.mqls - a.mqls);
  const nivelAtual = niveisOrdenados.find(n => mqls >= n.mqls) || null;

  // 2. Encontrar próximo nível (menor nível onde mqls < nivel.mqls)
  const niveisAscendentes = [...metaMensal.niveis].sort((a, b) => a.mqls - b.mqls);
  const proximoNivel = niveisAscendentes.find(n => mqls < n.mqls) || null;

  // 3. Calcular percentual atual em relação à meta base
  const percentualAtual = (mqls / metaMensal.metaBase) * 100;

  // 4. Calcular MQLs faltantes para próximo nível
  const faltamParaProximo = proximoNivel ? proximoNivel.mqls - mqls : 0;

  // 5. Calcular progresso na barra (0-100, limitado a 100)
  const progressoBarra = Math.min((mqls / metaMensal.metaBase) * 100, 100);

  // 6. Determinar cor baseada no percentual
  const cor = determinarCor(percentualAtual);

  return {
    bu: metaMensal.bu,
    mqls,
    metaBase: metaMensal.metaBase,
    percentualAtual: Number(percentualAtual.toFixed(1)),
    nivelAtual,
    proximoNivel,
    faltamParaProximo,
    progressoBarra: Number(progressoBarra.toFixed(1)),
    cor
  };
}

/**
 * Calcula o ritmo/pace de atingimento da meta
 */
export function calcularRitmo(
  mqlsAtuais: number,
  metaBase: number,
  infoMes: InfoMes
): StatusRitmo {
  const { diaAtual, diasNoMes } = infoMes;

  // Ritmo esperado: proporcional aos dias decorridos
  const ritmoEsperado = (diaAtual / diasNoMes) * metaBase;

  // Diferença entre o realizado e o esperado
  const diferenca = mqlsAtuais - ritmoEsperado;

  // Percentual de diferença
  const percentualDiferenca = ritmoEsperado > 0
    ? (diferenca / ritmoEsperado) * 100
    : 0;

  // Classificar status
  let status: 'adiantado' | 'no-prazo' | 'atrasado';
  if (percentualDiferenca > 10) {
    status = 'adiantado';
  } else if (percentualDiferenca < -10) {
    status = 'atrasado';
  } else {
    status = 'no-prazo';
  }

  return {
    status,
    diferenca: Number(diferenca.toFixed(1)),
    percentualDiferenca: Number(percentualDiferenca.toFixed(1))
  };
}

/**
 * Obtém o emoji do ícone baseado na BU
 */
export function getIconeBU(bu: 'Consultoria' | 'Aceleradora'): string {
  return bu === 'Consultoria' ? '🏛️' : '🚀';
}

/**
 * Obtém mensagem de ritmo baseada no status
 */
export function getMensagemRitmo(statusRitmo: StatusRitmo, infoMes: InfoMes): {
  texto: string;
  tipo: 'sucesso' | 'atencao' | 'critico';
  icone: string;
} {
  const { status, percentualDiferenca } = statusRitmo;
  const { diaAtual, diasNoMes } = infoMes;

  if (status === 'adiantado') {
    return {
      texto: `Desempenho excepcional! Ritmo ${Math.abs(percentualDiferenca).toFixed(0)}% acima do esperado`,
      tipo: 'sucesso',
      icone: '🎯'
    };
  }

  if (status === 'atrasado') {
    const diasRestantes = diasNoMes - diaAtual;
    return {
      texto: `Atenção: Ritmo ${Math.abs(percentualDiferenca).toFixed(0)}% abaixo do esperado (${diasRestantes} dias restantes)`,
      tipo: 'critico',
      icone: '⚠️'
    };
  }

  return {
    texto: `No ritmo para atingir 100% da meta até o fim do mês`,
    tipo: 'atencao',
    icone: '📊'
  };
}

/**
 * Formata nome do mês em português
 */
export function getNomeMes(mes: number): string {
  const meses = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  return meses[mes - 1] || 'Mês inválido';
}
