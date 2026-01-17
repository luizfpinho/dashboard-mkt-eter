export interface Lead {
  nome: string;
  email: string;
  telefone: string;
  faturamento: string;
  colaboradores: string;
  instagram: string;
  investimentoMarketing: string;
  origem: string;
  dataHora: Date;
}

export interface LeadClassificado extends Lead {
  bu: 'Consultoria' | 'Aceleradora' | 'Não Qualificado';
  icp: 'ICP1' | 'ICP2' | 'ICP3' | null;
  canal: string;
}

export interface Filtros {
  dataInicio: Date | null;
  dataFim: Date | null;
  origens: string[];
  bus: string[];
  icps: string[];
  semana: number | null;
}

export interface Metas {
  consultoriaTotal: number;
  aceleradoraTotal: number;
  total: number;
}

export interface Metricas {
  totalLeads: number;
  totalMQLs: number;
  consultoria: number;
  aceleradora: number;
  naoQualificado: number;
  taxaQualificacao: number;
  consultoriaICP1: number;
  consultoriaICP2: number;
  consultoriaICP3: number;
  aceleradoraICP1: number;
  aceleradoraICP2: number;
  aceleradoraICP3: number;
}

export interface ComparativoSemanal {
  metrica: string;
  semanaAnterior: number;
  semanaAtual: number;
  variacao: number;
  percentual: number;
}
