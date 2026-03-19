import { useState, useEffect, useCallback, useRef } from 'react';
import { Lead, LeadClassificado, Filtros } from '@/types/lead';
import { classificarLead, deduplicarLeads, filtrarLeads, filtrarLeadsPorMes } from '@/lib/classificacao';
import { getMesAtualBrasilia } from '@/lib/timezone';

const FILTROS_INICIAIS: Filtros = {
  dataInicio: null,
  dataFim: null,
  origens: [],
  bus: [],
  icps: [],
  semana: null
};

function verificarFiltrosAtivos(filtros: Filtros): boolean {
  return !!(
    filtros.dataInicio ||
    filtros.dataFim ||
    filtros.semana ||
    (filtros.origens && filtros.origens.length > 0) ||
    (filtros.bus && filtros.bus.length > 0) ||
    (filtros.icps && filtros.icps.length > 0)
  );
}

interface UseLeadsFetchReturn {
  leadsOriginais: LeadClassificado[];
  leadsFiltrados: LeadClassificado[];
  carregando: boolean;
  ultimaAtualizacao: Date | null;
  filtrosAtivos: Filtros;
  temFiltrosAtivos: boolean;
  buscarDados: () => Promise<void>;
  handleAplicarFiltros: (filtros: Filtros) => void;
  handleLimparFiltros: () => void;
  handleFiltroMesAno: (inicio: Date, fim: Date, label: string) => void;
}

export function useLeadsFetch(): UseLeadsFetchReturn {
  const [leadsOriginais, setLeadsOriginais] = useState<LeadClassificado[]>([]);
  const [leadsFiltrados, setLeadsFiltrados] = useState<LeadClassificado[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [ultimaAtualizacao, setUltimaAtualizacao] = useState<Date | null>(null);
  const [filtrosAtivos, setFiltrosAtivos] = useState<Filtros>(FILTROS_INICIAIS);

  const temFiltrosAtivos = verificarFiltrosAtivos(filtrosAtivos);

  // Refs para acessar valores atualizados em callbacks estáveis (buscarDados no interval)
  const filtrosRef = useRef(filtrosAtivos);
  filtrosRef.current = filtrosAtivos;
  const temFiltrosRef = useRef(temFiltrosAtivos);
  temFiltrosRef.current = temFiltrosAtivos;
  const leadsOriginaisRef = useRef(leadsOriginais);
  leadsOriginaisRef.current = leadsOriginais;

  const buscarDados = useCallback(async () => {
    setCarregando(true);
    try {
      const response = await fetch('/api/leads');
      if (!response.ok) {
        throw new Error('Erro ao buscar dados');
      }

      const leads: Lead[] = await response.json();
      const leadsClassificados = leads.map(lead => classificarLead(lead));
      const leadsUnicos = deduplicarLeads(leadsClassificados);

      setLeadsOriginais(leadsUnicos);

      if (temFiltrosRef.current) {
        const leadsFiltradosNovos = filtrarLeads(leadsUnicos, filtrosRef.current);
        setLeadsFiltrados(leadsFiltradosNovos);
        console.log('🔄 Dados atualizados - Filtros preservados');
      } else {
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
  }, []);

  useEffect(() => {
    buscarDados();
    const interval = setInterval(buscarDados, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [buscarDados]);

  const handleAplicarFiltros = useCallback((filtros: Filtros) => {
    setFiltrosAtivos(filtros);
    const resultados = filtrarLeads(leadsOriginaisRef.current, filtros);
    setLeadsFiltrados(resultados);
  }, []);

  const handleLimparFiltros = useCallback(() => {
    setFiltrosAtivos(FILTROS_INICIAIS);
    const mesAtual = getMesAtualBrasilia();
    const leadsDoMesAtual = filtrarLeadsPorMes(leadsOriginaisRef.current, mesAtual.mes, mesAtual.ano);
    setLeadsFiltrados(leadsDoMesAtual);
    console.log(`📅 Filtros limpos - Aplicado filtro automático: ${mesAtual.mes}/${mesAtual.ano}`);
  }, []);

  const handleFiltroMesAno = useCallback((inicio: Date, fim: Date, _label: string) => {
    const novosFiltros: Filtros = {
      ...filtrosRef.current,
      dataInicio: inicio,
      dataFim: fim,
    };
    setFiltrosAtivos(novosFiltros);
    const resultados = filtrarLeads(leadsOriginaisRef.current, novosFiltros);
    setLeadsFiltrados(resultados);
  }, []);

  return {
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
  };
}
