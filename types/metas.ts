/**
 * Interfaces para o sistema de acompanhamento de metas mensais
 */

export interface NivelBonificacao {
  percentualMeta: number;        // 60, 70, 80, 90, 100, 120, 150
  mqls: number;                  // Quantidade de MQLs necessária
  percentualBonificacao: number; // 60, 70, 80, 90, 100, 120, 150
  cor: string;                   // Nome da cor Tailwind
}

export interface MetaMensal {
  bu: 'Consultoria' | 'Aceleradora';
  metaBase: number;              // 100 para Consultoria, 200 para Aceleradora
  peso: number;                  // 60% ou 40%
  niveis: NivelBonificacao[];
}

export interface StatusMeta {
  bu: 'Consultoria' | 'Aceleradora';
  mqls: number;                  // MQLs atuais
  metaBase: number;              // Meta base (100 ou 200)
  percentualAtual: number;       // % atual em relação à meta base
  nivelAtual: NivelBonificacao | null;   // Nível atingido
  proximoNivel: NivelBonificacao | null; // Próximo nível a atingir
  faltamParaProximo: number;     // MQLs faltantes para próximo nível
  progressoBarra: number;        // 0-100 para a barra visual
  cor: string;                   // Cor atual do indicador
}

export interface StatusRitmo {
  status: 'adiantado' | 'no-prazo' | 'atrasado';
  diferenca: number;             // Diferença em MQLs
  percentualDiferenca: number;   // Diferença em %
}

export interface InfoMes {
  mes: number;                   // 1-12
  ano: number;
  diasNoMes: number;
  diaAtual: number;
}
