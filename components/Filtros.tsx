'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Filter, X } from 'lucide-react';
import { useState } from 'react';

interface FiltrosProps {
  onAplicarFiltros: (filtros: {
    dataInicio: Date | null;
    dataFim: Date | null;
    origens: string[];
    bus: string[];
    icps: string[];
    semana: number | null;
  }) => void;
  onLimparFiltros: () => void;
}

export function Filtros({ onAplicarFiltros, onLimparFiltros }: FiltrosProps) {
  const [dataInicio, setDataInicio] = useState<string>('');
  const [dataFim, setDataFim] = useState<string>('');
  const [origens, setOrigens] = useState<string[]>([]);
  const [bus, setBus] = useState<string[]>([]);
  const [icps, setIcps] = useState<string[]>([]);
  const [semana, setSemana] = useState<string>('');

  const opcoesOrigens = ['bio-eter', 'bio', 'fermento'];
  const opcoesBUs = ['Consultoria', 'Aceleradora', 'Não Qualificado'];
  const opcoesICPs = ['ICP1', 'ICP2', 'ICP3'];

  const handleAplicar = () => {
    // Converter string para Date em UTC (para compatibilidade com timestamps ISO da planilha)
    const converterParaDateUTC = (dataStr: string): Date | null => {
      if (!dataStr) return null;
      // Input: "2026-01-02" (formato do input type="date")
      // Output: Date representando 2026-01-02T00:00:00.000Z (UTC)
      return new Date(dataStr + 'T00:00:00.000Z');
    };

    onAplicarFiltros({
      dataInicio: converterParaDateUTC(dataInicio),
      dataFim: converterParaDateUTC(dataFim),
      origens,
      bus,
      icps,
      semana: semana ? parseInt(semana) : null
    });
  };

  const handleLimpar = () => {
    setDataInicio('');
    setDataFim('');
    setOrigens([]);
    setBus([]);
    setIcps([]);
    setSemana('');
    onLimparFiltros();
  };

  const handlePresetData = (preset: string) => {
    // Usar horário de Brasília (GMT-3) para todos os presets
    // Obter data atual em Brasília
    const agoraUTC = new Date();
    const horaBrasilia = new Date(agoraUTC.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }));

    const hoje = new Date(horaBrasilia.getFullYear(), horaBrasilia.getMonth(), horaBrasilia.getDate());
    let inicio = new Date(hoje);
    let fim = new Date(hoje);

    switch (preset) {
      case 'hoje':
        inicio = hoje;
        fim = hoje;
        break;
      case 'ultimos7':
        inicio = new Date(hoje.getTime() - 7 * 24 * 60 * 60 * 1000);
        fim = hoje;
        break;
      case 'estaSemana':
        const diaSemana = hoje.getDay();
        inicio = new Date(hoje.getTime() - diaSemana * 24 * 60 * 60 * 1000);
        fim = hoje;
        break;
      case 'esteMes':
        inicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
        fim = hoje;
        break;
      case 'ultimos30':
        inicio = new Date(hoje.getTime() - 30 * 24 * 60 * 60 * 1000);
        fim = hoje;
        break;
    }

    setDataInicio(inicio.toISOString().split('T')[0]);
    setDataFim(fim.toISOString().split('T')[0]);
  };

  const toggleOrigem = (origem: string) => {
    setOrigens(prev =>
      prev.includes(origem) ? prev.filter(o => o !== origem) : [...prev, origem]
    );
  };

  const toggleBU = (bu: string) => {
    setBus(prev => (prev.includes(bu) ? prev.filter(b => b !== bu) : [...prev, bu]));
  };

  const toggleICP = (icp: string) => {
    setIcps(prev => (prev.includes(icp) ? prev.filter(i => i !== icp) : [...prev, icp]));
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="w-5 h-5 text-gray-600" />
        <h2 className="text-lg font-semibold text-gray-800">Filtros</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {/* Filtro de Data */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Data Início</label>
          <Input
            type="date"
            value={dataInicio}
            onChange={e => setDataInicio(e.target.value)}
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Data Fim</label>
          <Input
            type="date"
            value={dataFim}
            onChange={e => setDataFim(e.target.value)}
            className="w-full"
          />
        </div>

        {/* Presets de Data */}
        <div className="col-span-1 md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Períodos Rápidos</label>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => handlePresetData('hoje')}>
              Hoje
            </Button>
            <Button variant="outline" size="sm" onClick={() => handlePresetData('ultimos7')}>
              Últimos 7 dias
            </Button>
            <Button variant="outline" size="sm" onClick={() => handlePresetData('estaSemana')}>
              Esta Semana
            </Button>
            <Button variant="outline" size="sm" onClick={() => handlePresetData('esteMes')}>
              Este Mês
            </Button>
            <Button variant="outline" size="sm" onClick={() => handlePresetData('ultimos30')}>
              Últimos 30 dias
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {/* Filtro de Semana */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Semana do Mês</label>
          <Select value={semana} onValueChange={setSemana}>
            <SelectTrigger>
              <SelectValue placeholder="Todas as semanas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">Mês inteiro</SelectItem>
              <SelectItem value="1">Semana 1 (dias 1-7)</SelectItem>
              <SelectItem value="2">Semana 2 (dias 8-14)</SelectItem>
              <SelectItem value="3">Semana 3 (dias 15-21)</SelectItem>
              <SelectItem value="4">Semana 4 (dias 22-28)</SelectItem>
              <SelectItem value="5">Semana 5 (dias 29-31)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Filtro de Origem */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Origem/Canal</label>
          <div className="flex flex-wrap gap-2">
            {opcoesOrigens.map(origem => (
              <Button
                key={origem}
                variant={origens.includes(origem) ? 'default' : 'outline'}
                size="sm"
                onClick={() => toggleOrigem(origem)}
              >
                {origem}
              </Button>
            ))}
          </div>
        </div>

        {/* Filtro de BU */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Business Unit</label>
          <div className="flex flex-wrap gap-2">
            {opcoesBUs.map(bu => (
              <Button
                key={bu}
                variant={bus.includes(bu) ? 'default' : 'outline'}
                size="sm"
                onClick={() => toggleBU(bu)}
              >
                {bu}
              </Button>
            ))}
          </div>
        </div>

        {/* Filtro de ICP */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">ICP</label>
          <div className="flex flex-wrap gap-2">
            {opcoesICPs.map(icp => (
              <Button
                key={icp}
                variant={icps.includes(icp) ? 'default' : 'outline'}
                size="sm"
                onClick={() => toggleICP(icp)}
              >
                {icp}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Botões de Ação */}
      <div className="flex gap-3 justify-end">
        <Button variant="outline" onClick={handleLimpar}>
          <X className="w-4 h-4 mr-2" />
          Limpar
        </Button>
        <Button onClick={handleAplicar}>
          <Filter className="w-4 h-4 mr-2" />
          Aplicar Filtros
        </Button>
      </div>
    </div>
  );
}
