'use client';

import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Calendar } from 'lucide-react';

const MESES = [
  { value: 0, label: 'Janeiro' },
  { value: 1, label: 'Fevereiro' },
  { value: 2, label: 'Março' },
  { value: 3, label: 'Abril' },
  { value: 4, label: 'Maio' },
  { value: 5, label: 'Junho' },
  { value: 6, label: 'Julho' },
  { value: 7, label: 'Agosto' },
  { value: 8, label: 'Setembro' },
  { value: 9, label: 'Outubro' },
  { value: 10, label: 'Novembro' },
  { value: 11, label: 'Dezembro' },
];

// Anos disponíveis (do atual até 2 anos atrás)
const getAnosDisponiveis = () => {
  const anoAtual = new Date().getFullYear();
  return [anoAtual, anoAtual - 1, anoAtual - 2];
};

interface FiltroMesAnoProps {
  onAplicar: (dataInicio: Date, dataFim: Date, label: string) => void;
}

export function FiltroMesAno({ onAplicar }: FiltroMesAnoProps) {
  const [mesSelecionado, setMesSelecionado] = useState<number | null>(null);
  const [anoSelecionado, setAnoSelecionado] = useState<number | null>(null);
  const anos = getAnosDisponiveis();

  const aplicarFiltro = () => {
    if (mesSelecionado === null || anoSelecionado === null) return;

    // Primeiro dia do mês
    const dataInicio = new Date(anoSelecionado, mesSelecionado, 1);

    // Último dia do mês (dia 0 do próximo mês = último dia do mês atual)
    const dataFim = new Date(anoSelecionado, mesSelecionado + 1, 0);

    // Label para exibição
    const nomeMes = MESES.find(m => m.value === mesSelecionado)?.label;
    const label = `${nomeMes} ${anoSelecionado}`;

    onAplicar(dataInicio, dataFim, label);
  };

  const limparSelecao = () => {
    setMesSelecionado(null);
    setAnoSelecionado(null);
  };

  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-2 text-sm font-medium">
        <Calendar className="h-4 w-4" />
        Filtrar por Mês
      </Label>
      <div className="flex gap-2 items-end">
        <div className="flex-1">
          <Select
            value={mesSelecionado?.toString() ?? ''}
            onValueChange={(v) => setMesSelecionado(parseInt(v))}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Mês" />
            </SelectTrigger>
            <SelectContent>
              {MESES.map((mes) => (
                <SelectItem key={mes.value} value={mes.value.toString()}>
                  {mes.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="w-24">
          <Select
            value={anoSelecionado?.toString() ?? ''}
            onValueChange={(v) => setAnoSelecionado(parseInt(v))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Ano" />
            </SelectTrigger>
            <SelectContent>
              {anos.map((ano) => (
                <SelectItem key={ano} value={ano.toString()}>
                  {ano}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          onClick={aplicarFiltro}
          disabled={mesSelecionado === null || anoSelecionado === null}
          size="sm"
        >
          Aplicar
        </Button>

        {(mesSelecionado !== null || anoSelecionado !== null) && (
          <Button
            onClick={limparSelecao}
            variant="ghost"
            size="sm"
          >
            Limpar
          </Button>
        )}
      </div>
    </div>
  );
}
